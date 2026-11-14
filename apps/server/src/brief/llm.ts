import { z } from "zod";

/** Where and how to reach the model. Passed in by the caller, so this module reads no environment. */
export interface LlmConfig {
  /** Unset when the server has no key. Every call then fails and the caller's fallback is used. */
  apiKey: string | undefined;
  model: string;
  /** OpenRouter-compatible API root, without a trailing slash. */
  baseUrl: string;
}

/** However long tokens keep arriving, one call never runs longer than this many silence deadlines. */
const MAX_CALL_FACTOR = 4;

class LlmError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

function extractJson(text: string): unknown {
  const stripped = text.replace(/```(?:json)?/gi, "");
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start < 0 || end <= start) throw new LlmError("reply contained no JSON object", true);
  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch (e) {
    throw new LlmError(`reply was not valid JSON (${(e as Error).message})`, true);
  }
}

interface Reply {
  content: string;
  model?: string;
  usage?: unknown;
}

/** What one chat completion returns once read to the end, streamed or not. */
interface Completion {
  content: string;
  finishReason?: string;
  model?: string;
  usage?: unknown;
  error?: string;
}

/**
 * Reads an OpenRouter server-sent event stream into one completion. Calls `onProgress` for every
 * event, including the keep-alive comments OpenRouter sends while a model is still thinking.
 */
async function readStream(body: ReadableStream<Uint8Array>, onProgress: () => void) {
  const out: Completion = { content: "" };
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    onProgress();
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return out;
      let chunk: {
        choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[];
        error?: { message?: string };
        model?: string;
        usage?: unknown;
      };
      try {
        chunk = JSON.parse(data);
      } catch {
        continue;
      }
      if (chunk.error) out.error = chunk.error.message ?? "the provider reported an error";
      const choice = chunk.choices?.[0];
      out.content += choice?.delta?.content ?? "";
      out.finishReason = choice?.finish_reason ?? out.finishReason;
      out.model = chunk.model ?? out.model;
      out.usage = chunk.usage ?? out.usage;
    }
  }
  return out;
}

async function callOnce(
  llm: LlmConfig,
  messages: { role: "system" | "user"; content: string }[],
  timeoutMs: number,
  maxTokens: number,
): Promise<Reply> {
  if (!llm.apiKey) throw new LlmError("OPENROUTER_API_KEY is not set on the server", false);
  // The reply is streamed, so the deadline is for silence, not for the whole reply: a long brief
  // from a slow model keeps going as long as tokens keep arriving. A hard cap stops a runaway reply.
  const controller = new AbortController();
  let silence: ReturnType<typeof setTimeout> | undefined;
  let capped = false;
  const heard = () => {
    clearTimeout(silence);
    silence = setTimeout(() => controller.abort(), timeoutMs);
  };
  const cap = setTimeout(() => {
    capped = true;
    controller.abort();
  }, timeoutMs * MAX_CALL_FACTOR);
  const seconds = (ms: number) => Math.round(ms / 1000);
  const noReply = () =>
    new LlmError(
      capped
        ? `the reply was still unfinished after ${seconds(timeoutMs * MAX_CALL_FACTOR)} seconds`
        : `no reply within ${seconds(timeoutMs)} seconds`,
      false,
    );
  heard();
  try {
    let res: Response;
    try {
      res = await fetch(`${llm.baseUrl}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${llm.apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "Vayu",
        },
        body: JSON.stringify({
          model: llm.model,
          messages,
          temperature: 0.2,
          max_tokens: maxTokens,
          stream: true,
          // Long hidden reasoning is what made replies miss the deadline; these tasks need little.
          reasoning: { effort: "low", exclude: true },
        }),
      });
    } catch (e) {
      throw controller.signal.aborted
        ? noReply()
        : new LlmError(`network error: ${(e as Error).message}`, false);
    }
    if (!res.ok) {
      const body = (await res.text().catch(() => "")).slice(0, 200);
      throw new LlmError(
        `OpenRouter returned ${res.status}${body ? `: ${body}` : ""}`,
        res.status >= 500,
      );
    }
    heard();

    let reply: Completion | null;
    try {
      if (res.body && res.headers.get("content-type")?.includes("text/event-stream")) {
        reply = await readStream(res.body, heard);
      } else {
        // A provider or stub that ignores `stream` and answers with one JSON body.
        const json = (await res.json()) as {
          choices?: { message?: { content?: string | null }; finish_reason?: string }[];
          error?: { message?: string };
          model?: string;
          usage?: unknown;
        } | null;
        reply = {
          content: json?.choices?.[0]?.message?.content ?? "",
          finishReason: json?.choices?.[0]?.finish_reason,
          model: json?.model,
          usage: json?.usage,
          error: json?.error?.message,
        };
      }
    } catch (e) {
      if (controller.signal.aborted) throw noReply();
      if (e instanceof SyntaxError) reply = null;
      else throw new LlmError(`network error: ${(e as Error).message}`, true);
    }
    if (!reply?.content)
      throw new LlmError(`empty reply${reply?.error ? `: ${reply.error}` : ""}`, true);
    if (reply.finishReason === "length") {
      throw new LlmError("reply was cut off before the JSON finished", true);
    }
    return { content: reply.content, model: reply.model, usage: reply.usage };
  } finally {
    clearTimeout(silence);
    clearTimeout(cap);
  }
}

function log(
  purpose: string,
  attempt: number,
  started: number,
  outcome: string,
  model?: string,
  usage?: unknown,
) {
  console.info(
    JSON.stringify({
      evt: "llm_call",
      purpose,
      attempt: attempt + 1,
      ms: Date.now() - started,
      outcome,
      model,
      usage,
    }),
  );
}

/** Asks for one JSON object and validates it. Retries once when the reply is malformed or the provider fails with a 5xx. */
export async function chatJson<T>(opts: {
  llm: LlmConfig;
  purpose: string;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  timeoutMs: number;
  maxTokens: number;
}): Promise<T> {
  let lastError: unknown;
  let user = opts.user;
  for (let attempt = 0; attempt < 2; attempt++) {
    const started = Date.now();
    try {
      const reply = await callOnce(
        opts.llm,
        [
          { role: "system", content: opts.system },
          { role: "user", content: user },
        ],
        opts.timeoutMs,
        opts.maxTokens,
      );
      const parsed = opts.schema.safeParse(extractJson(reply.content));
      if (parsed.success) {
        log(opts.purpose, attempt, started, "ok", reply.model, reply.usage);
        return parsed.data;
      }
      const issue = parsed.error.issues[0];
      throw new LlmError(
        `reply did not match the schema at ${issue?.path.join(".") || "root"}: ${issue?.message}`,
        true,
      );
    } catch (e) {
      lastError = e;
      log(opts.purpose, attempt, started, (e as Error).message);
      if (!(e instanceof LlmError) || !e.retryable) break;
      user = `${opts.user}\n\nYour previous reply was rejected: ${e.message}. Reply again with one valid JSON object that follows the schema exactly, and nothing else.`;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
