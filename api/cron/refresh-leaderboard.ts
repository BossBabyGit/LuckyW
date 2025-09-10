import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, upsertEntry } from '../../lib/db';
function currentMonthRange() {
  // Anchor start of cycle (adjust if needed):
  const anchorStartUTC = Date.UTC(2025, 8, 26, 0, 0, 0); // Aug 26, 2025 (month is 0-based)
  const PERIOD_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

  const now = new Date();
  // Use *midnight UTC* to avoid timezone drift
  const nowMidnightUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0
  );

  // Which 14-day bucket are we in?
  const k = Math.floor((nowMidnightUTC - anchorStartUTC) / PERIOD_MS);

  const startMs = anchorStartUTC + k * PERIOD_MS;     // inclusive
  const endMs   = startMs + PERIOD_MS;                // exclusive ("until")

  const start = new Date(startMs);
  const end   = new Date(endMs);

  console.log("Fetching stats between:", start.toISOString(), "and", end.toISOString());
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await ensureSchema();

    const base = process.env.ROOBET_BASE_URL!;
    const token = process.env.ROOBET_BEARER!;
    const userId = process.env.ROOBET_USER_ID!;
    if (!base || !token || !userId) throw new Error('Missing env vars');

    const { startISO, endISO } = currentMonthRange();

    const url = new URL('/affiliate/v2/stats', base);
    url.searchParams.set('userId', userId);
    url.searchParams.set('startDate', startISO);
    url.searchParams.set('endDate', endISO);

    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: `Upstream error: ${t}` });
    }

    const data: Array<{ uid: string; username: string; wagered: number }> = await r.json();

    const top = (data ?? [])
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 15);

    let rank = 1;
    for (const row of top) {
      await upsertEntry({
        period_start: startISO,
        period_end: endISO,
        uid: row.uid,
        username: row.username,
        wagered: Number(row.wagered || 0),
        rank,
      });
      rank++;
    }

    return res.status(200).json({ ok: true, saved: top.length });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
