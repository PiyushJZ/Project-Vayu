import { z } from "zod";

/** Where and how to reach the model. Passed in by the caller, so this module reads no environment. */
export interface LlmConfig {
  /** Unset when the server has no key. Every call then fails and the caller's fallback is used. */
  apiKey: string | undefined;
  model: string;
  /** OpenRouter-compatible API root, without a trailing slash. */
  baseUrl: string;
}

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

async function callOnce(
  llm: LlmConfig,
  messages: { role: "system" | "user"; content: string }[],
  timeoutMs: number,
  maxTokens: number,
): Promise<Reply> {
  if (!llm.apiKey) throw new LlmError("OPENROUTER_API_KEY is not set on the server", false);
  // One deadline for the whole call. OpenRouter sends its headers early and the reply later,
  // so the deadline can pass while the body is still being read.
  const signal = AbortSignal.timeout(timeoutMs);
  const noReply = () =>
    new LlmError(`no reply within ${Math.round(timeoutMs / 1000)} seconds`, false);
  let res: Response;
  try {
    res = await fetch(`${llm.baseUrl}/chat/completions`, {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${llm.apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Civic Air Quality Briefing Studio",
      },
      body: JSON.stringify({
        model: llm.model,
        messages,
        temperature: 0.2,
        max_tokens: maxTokens,
      }),
    });
  } catch (e) {
    throw signal.aborted
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
  const json = (await res.json().catch(() => {
    if (signal.aborted) throw noReply();
    return null;
  })) as {
    choices?: { message?: { content?: string | null }; finish_reason?: string }[];
    error?: { message?: string };
    model?: string;
    usage?: unknown;
  } | null;
  const content = json?.choices?.[0]?.message?.content;
  if (!content)
    throw new LlmError(`empty reply${json?.error?.message ? `: ${json.error.message}` : ""}`, true);
  if (json?.choices?.[0]?.finish_reason === "length") {
    throw new LlmError("reply was cut off before the JSON finished", true);
  }
  return { content, model: json?.model, usage: json?.usage };
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
