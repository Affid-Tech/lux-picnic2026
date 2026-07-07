import { useEffect, useState } from 'react'
import { isSameLocalDate } from '../lib/date'

/**
 * Dev-only escape hatch for manually testing the event-day view before the
 * event: `?now=2026-07-12T11:00` freezes the clock there instead of using
 * the real system time. Gated on DEV so it can't affect the production build.
 */
function parseDebugNow(): Date | null {
  if (!import.meta.env.DEV) return null
  const raw = new URLSearchParams(window.location.search).get('now')
  if (!raw) return null
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Returns the current Date, re-rendering on an interval — but only when
 * `activeDateIso` is today. Off-day there is no live clock to track, so we
 * skip the timer entirely (the "сейчас" marker only shows on the event date).
 */
export function useNow(activeDateIso: string, intervalMs = 30_000): Date {
  const [debugNow] = useState<Date | null>(parseDebugNow)
  const [now, setNow] = useState<Date>(() => debugNow ?? new Date())

  useEffect(() => {
    if (debugNow) return
    // Assumption (fine for a single-day microsite): a tab left open across
    // midnight into the event day won't start ticking, since activeDateIso
    // never changes. A same-day visit arms the interval as expected.
    if (!isSameLocalDate(new Date(), activeDateIso)) return
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, intervalMs)
    return () => window.clearInterval(id)
  }, [debugNow, activeDateIso, intervalMs])

  return now
}
