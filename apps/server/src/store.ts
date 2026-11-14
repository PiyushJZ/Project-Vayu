import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { Brief } from "./brief/types";

/** Each brief is kept whole as JSON. Only the columns needed to find the latest one are separate. */
export function openStore(databaseUrl: string) {
  const file = databaseUrl.replace(/^file:/, "");
  const location = file === ":memory:" ? file : path.resolve(process.cwd(), file);
  if (location !== ":memory:") mkdirSync(path.dirname(location), { recursive: true });

  const db = new DatabaseSync(location);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS briefs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      audience TEXT NOT NULL,
      data TEXT NOT NULL
    );
  `);

  const insertRow = db.prepare("INSERT INTO briefs (created_at, audience, data) VALUES (?, ?, ?)");
  const updateRow = db.prepare("UPDATE briefs SET data = ? WHERE id = ?");
  const getRow = db.prepare("SELECT data FROM briefs WHERE id = ?");
  const latestRow = db.prepare("SELECT data FROM briefs ORDER BY id DESC LIMIT 1");

  const parse = (row: Record<string, unknown> | undefined): Brief | null =>
    row ? (JSON.parse(row.data as string) as Brief) : null;

  return {
    /** Saves a new brief and returns it with its id set. */
    insert(brief: Omit<Brief, "id">): Brief {
      const { lastInsertRowid } = insertRow.run(brief.createdAt, brief.audience, "{}");
      const saved = { ...brief, id: Number(lastInsertRowid) } as Brief;
      updateRow.run(JSON.stringify(saved), saved.id);
      return saved;
    },
    update(brief: Brief): void {
      updateRow.run(JSON.stringify(brief), brief.id);
    },
    get(id: number): Brief | null {
      return parse(getRow.get(id));
    },
    latest(): Brief | null {
      return parse(latestRow.get());
    },
    close() {
      db.close();
    },
  };
}

export type Store = ReturnType<typeof openStore>;
