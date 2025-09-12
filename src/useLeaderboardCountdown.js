import { useEffect, useState } from "react";

// Determine the current and previous 14-day periods
export function getPeriods() {
  // Anchor start of cycle (adjust if needed)
  const anchorStartUTC = Date.UTC(2025, 8, 10, 0, 0, 0); // Sep 10, 2025 (month is 0-based)
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
      start: new Date(currentStartMs),
      end: new Date(currentEndMs),
    },
    previous: {
      start: new Date(previousStartMs),
      end: new Date(previousEndMs),
    },
  };
}

export default function useLeaderboardCountdown() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { current } = getPeriods();
  const targetMs = current.end.getTime();
  const diff = Math.max(0, targetMs - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}
