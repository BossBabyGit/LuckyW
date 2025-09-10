// api/leaderboard/top.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, getTop15ForCurrentMonth } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema(); // <-- make sure the table exists
    const rows = await getTop15ForCurrentMonth();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600');
    return res.status(200).json({ items: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
