import { useEffect, useState } from 'react'
import { isSameLocalDate } from '../lib/date'

/**
 * Returns the current Date, re-rendering on an interval — but only when
 * `activeDateIso` is today. Off-day there is no live clock to track, so we
 * skip the timer entirely (the "сейчас" marker only shows on the event date).
 */
export function useNow(activeDateIso: string, intervalMs = 30_000): Date {
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    // Assumption (fine for a single-day microsite): a tab left open across
    // midnight into the event day won't start ticking, since activeDateIso
    // never changes. A same-day visit arms the interval as expected.
    if (!isSameLocalDate(new Date(), activeDateIso)) return
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, intervalMs)
    return () => window.clearInterval(id)
  }, [activeDateIso, intervalMs])

  return now
}
