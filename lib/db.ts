// lib/db.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Create table (idempotent)
export async function ensureSchema() {
  await sql(`
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
    );
    CREATE INDEX IF NOT EXISTS idx_leaderboard_period_rank
      ON leaderboard_entries (period_start, period_end, rank);
  `);
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
  await sql(
    `
    INSERT INTO leaderboard_entries
      (period_start, period_end, uid, username, wagered, rank)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (period_start, period_end, uid)
    DO UPDATE SET
      username = EXCLUDED.username,
      wagered  = EXCLUDED.wagered,
      rank     = EXCLUDED.rank,
      updated_at = NOW();
    `,
    [period_start, period_end, uid, username, wagered, rank]
  );
}

export async function getTop15ForCurrentMonth() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const end   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  const { rows } = await sql(
    `
    SELECT username, (wagered)::float AS wagered, rank
    FROM leaderboard_entries
    WHERE period_start = $1 AND period_end = $2
    ORDER BY rank ASC
    LIMIT 15
    `,
    [start.toISOString(), end.toISOString()]
  );
  return rows;
}
