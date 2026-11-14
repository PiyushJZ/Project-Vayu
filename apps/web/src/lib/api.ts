import type { Audience, Brief } from "../../../server/src/brief/types";

export interface SampleTable {
  id: string;
  label: string;
  text: string;
}

/** The API shares the page's origin: the Worker serves both in production, and Vite proxies /api in development. */
const base = "/api";

async function request<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }
  const json = (await res.json().catch(() => null)) as
    | { error?: string; message?: string }
    | T
    | null;
  if (!res.ok) {
    const msg =
      json && typeof json === "object"
        ? ((json as { error?: string }).error ?? (json as { message?: string }).message)
        : null;
    throw new Error(msg ?? `The server returned ${res.status}.`);
  }
  return json as T;
}

export const api = {
  samples: () => request<SampleTable[]>("/samples"),
  createBrief: (text: string, audience: Audience) => request<Brief>("/briefs", { text, audience }),
  writeBrief: (id: number) => request<Brief>(`/briefs/${id}/write`, {}),
};
