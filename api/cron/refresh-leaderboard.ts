import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, upsertEntry } from '../../lib/db';

// Determine the current and previous 14-day periods
function getPeriods() {
  // Anchor start of cycle (adjust if needed)
  const anchorStartUTC = Date.UTC(2025, 7, 26, 0, 0, 0); // Aug 26, 2025 (month is 0-based)
  const PERIOD_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

  const now = new Date();
  // Use midnight UTC to avoid timezone drift
  const nowMidnightUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0
  );

  // Which 14-day bucket are we in?
  const k = Math.floor((nowMidnightUTC - anchorStartUTC) / PERIOD_MS);

  const currentStartMs = anchorStartUTC + k * PERIOD_MS; // inclusive
  const currentEndMs = currentStartMs + PERIOD_MS; // exclusive

  const previousStartMs = currentStartMs - PERIOD_MS;
  const previousEndMs = currentStartMs;

  return {
    current: {
      startISO: new Date(currentStartMs).toISOString(),
      endISO: new Date(currentEndMs).toISOString(),
    },
    previous: {
      startISO: new Date(previousStartMs).toISOString(),
      endISO: new Date(previousEndMs).toISOString(),
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await ensureSchema();

    const base = process.env.ROOBET_BASE_URL!;
    const token = process.env.ROOBET_BEARER!;
    const userId = process.env.ROOBET_USER_ID!;
    if (!base || !token || !userId) throw new Error('Missing env vars');

    const { current, previous } = getPeriods();

    async function fetchAndSave(range: { startISO: string; endISO: string }) {
      const url = new URL('/affiliate/v2/stats', base);
      url.searchParams.set('userId', userId);
      url.searchParams.set('startDate', range.startISO);
      url.searchParams.set('endDate', range.endISO);

      const r = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(`Upstream error: ${t}`);
      }

      const data: Array<{ uid: string; username: string; wagered: number }> = await r.json();

      const top = (data ?? [])
        .sort((a, b) => b.wagered - a.wagered)
        .slice(0, 15);

      let rank = 1;
      for (const row of top) {
        await upsertEntry({
          period_start: range.startISO,
          period_end: range.endISO,
          uid: row.uid,
          username: row.username,
          wagered: Number(row.wagered || 0),
          rank,
        });
        rank++;
      }
      return top.length;
    }

    const savedCurrent = await fetchAndSave(current);
    const savedPrevious = await fetchAndSave(previous);

    return res.status(200).json({ ok: true, savedCurrent, savedPrevious });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
