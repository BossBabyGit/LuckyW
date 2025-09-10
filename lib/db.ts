// lib/db.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Create table (idempotent) — one statement per call
export async function ensureSchema() {
  await sql/* sql */`
    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id SERIAL PRIMARY KEY,
      period_start TIMESTAMPTZ NOT NULL,
      period_end   TIMESTAMPTZ NOT NULL,
      uid          TEXT NOT NULL,
      username     TEXT NOT NULL,
      wagered      NUMERIC NOT NULL,
      rank         INT NOT NULL,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (period_start, period_end, uid)
    )
  `;

  await sql/* sql */`
    CREATE INDEX IF NOT EXISTS idx_leaderboard_period_rank
    ON leaderboard_entries (period_start, period_end, rank)
  `;
}

export async function upsertEntry(row: {
  period_start: string;
  period_end: string;
  uid: string;
  username: string;
  wagered: number;
  rank: number;
}) {
  const { period_start, period_end, uid, username, wagered, rank } = row;
  await sql/* sql */`
    INSERT INTO leaderboard_entries
      (period_start, period_end, uid, username, wagered, rank)
    VALUES (${period_start}, ${period_end}, ${uid}, ${username}, ${wagered}, ${rank})
    ON CONFLICT (period_start, period_end, uid)
    DO UPDATE SET
      username = EXCLUDED.username,
      wagered  = EXCLUDED.wagered,
      rank     = EXCLUDED.rank,
      updated_at = NOW()
  `;
}

export async function getTop15ForCurrentPeriod() {
  const now = new Date().toISOString();
  const rows = await sql/* sql */`
    SELECT username, (wagered)::float AS wagered, rank
    FROM leaderboard_entries
    WHERE period_start <= ${now} AND period_end > ${now}
    ORDER BY rank ASC
    LIMIT 15
  `;
  return rows; // array of rows
}

export async function getTop15ForPreviousPeriod() {
  const now = new Date().toISOString();
  const period = await sql/* sql */`
    SELECT period_start, period_end
    FROM leaderboard_entries
    WHERE period_end <= ${now}
    ORDER BY period_end DESC
    LIMIT 1
  `;
  if (period.length === 0) return { period_start: null, period_end: null, rows: [] };
  const { period_start, period_end } = period[0] as { period_start: string; period_end: string };
  const rows = await sql/* sql */`
    SELECT username, (wagered)::float AS wagered, rank
    FROM leaderboard_entries
    WHERE period_start = ${period_start} AND period_end = ${period_end}
    ORDER BY rank ASC
    LIMIT 15
  `;
  return { period_start, period_end, rows };
}
