import type { Brief } from "./brief/types";

/** The part of Cloudflare's `D1Database` that the store uses. The tests back it with `node:sqlite`. */
export interface SqlDatabase {
  prepare(sql: string): SqlStatement;
}

export interface SqlStatement {
  bind(...values: unknown[]): SqlStatement;
  run(): Promise<unknown>;
  first<T>(): Promise<T | null>;
}

interface Row {
  id: number;
  data: string;
}

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS briefs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  audience TEXT NOT NULL,
  data TEXT NOT NULL
)`;

/** One pending or finished table creation per database, so it runs once per Worker isolate. */
const ready = new WeakMap<SqlDatabase, Promise<unknown>>();

function ensureTable(db: SqlDatabase): Promise<unknown> {
  let pending = ready.get(db);
  if (!pending) {
    pending = db.prepare(CREATE_TABLE).run();
    ready.set(db, pending);
    // A failed attempt must not be remembered, or every later request would fail too.
    pending.catch(() => ready.delete(db));
  }
  return pending;
}

/** The id column is the source of truth, so it replaces whatever id the stored JSON carries. */
const parse = (row: Row | null): Brief | null =>
  row ? { ...(JSON.parse(row.data) as Brief), id: row.id } : null;

/** Each brief is kept whole as JSON. Only the columns needed to find the latest one are separate. */
export function openStore(db: SqlDatabase) {
  return {
    /** Saves a new brief and returns it with its id set. */
    async insert(brief: Omit<Brief, "id">): Promise<Brief> {
      await ensureTable(db);
      const row = await db
        .prepare("INSERT INTO briefs (created_at, audience, data) VALUES (?, ?, ?) RETURNING id")
        .bind(brief.createdAt, brief.audience, JSON.stringify(brief))
        .first<{ id: number }>();
      if (!row) throw new Error("The database did not return an id for the new brief.");
      return { ...brief, id: row.id } as Brief;
    },
    async update(brief: Brief): Promise<void> {
      await ensureTable(db);
      await db
        .prepare("UPDATE briefs SET data = ? WHERE id = ?")
        .bind(JSON.stringify(brief), brief.id)
        .run();
    },
    async get(id: number): Promise<Brief | null> {
      await ensureTable(db);
      return parse(
        await db.prepare("SELECT id, data FROM briefs WHERE id = ?").bind(id).first<Row>(),
      );
    },
    async latest(): Promise<Brief | null> {
      await ensureTable(db);
      return parse(
        await db.prepare("SELECT id, data FROM briefs ORDER BY id DESC LIMIT 1").first<Row>(),
      );
    },
  };
}

export type Store = ReturnType<typeof openStore>;
