import { pool } from "@workspace/db";

type QueryExecutor = {
  query: (text: string, params: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;
};

/**
 * Returns the next integer for sequential document numbers of the form
 * `<prefix><trailing-digits>` (e.g. "PO/2026-27/0004", "ITM0004", "PL-2026-0004").
 *
 * It takes the MAX of the trailing numeric segment of existing numbers — NOT
 * `COUNT(*)` — so deleting a record never makes the generator reproduce a number
 * that still exists (which violated the UNIQUE constraint). Soft-deleted rows are
 * intentionally included so their numbers stay permanently reserved.
 *
 * `table`/`column` are hard-coded constants from our own code (never user input),
 * so interpolating them into the SQL is safe. The LIKE value is parameterised.
 *
 * The regex strips everything up to and including the last non-digit character,
 * leaving only the trailing run of digits to cast (handles prefixes that contain
 * their own digits, e.g. years).
 */
export async function nextSequenceNumber(
  table: string,
  column: string,
  likePattern: string,
  executor: QueryExecutor = pool,
): Promise<number> {
  const r = await executor.query(
    `SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(${column}, '^.*[^0-9]', ''), '') AS INTEGER)), 0) + 1 AS next
       FROM ${table}
      WHERE ${column} LIKE $1`,
    [likePattern],
  );
  return Number(r.rows[0].next);
}
