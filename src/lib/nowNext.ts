import type { SubEvent } from '../types'
import { isSameLocalDate } from './date'
import { calTimes } from './calendar'

// Pure "Сейчас / Далее" selection: given a clock and the schedule, decide what
// is on now and what is next. Only meaningful on the event date — any other day
// returns `off` so the banner stays hidden. Kept pure for unit testing.

export type NowNextPhase = 'off' | 'before' | 'live' | 'after'

export interface NowNext {
  phase: NowNextPhase
  /** events currently running, earliest-start first */
  now: SubEvent[]
  /** the next event to start, if any */
  next: SubEvent | null
}

const OFF: NowNext = { phase: 'off', now: [], next: null }

export function selectNowNext(
  now: Date,
  events: SubEvent[],
  dateIso: string,
  pointDurationMin: number,
): NowNext {
  if (!isSameLocalDate(now, dateIso) || events.length === 0) return OFF

  const nowMin = now.getHours() * 60 + now.getMinutes()
  const windows = events
    .map((e) => ({ e, ...calTimes(e, pointDurationMin) }))
    .sort((a, b) => a.startMin - b.startMin)

  const firstStart = windows[0].startMin
  const lastEnd = Math.max(...windows.map((w) => w.endMin))

  if (nowMin < firstStart) return { phase: 'before', now: [], next: windows[0].e }
  if (nowMin >= lastEnd) return { phase: 'after', now: [], next: null }

  const live = windows.filter((w) => w.startMin <= nowMin && nowMin < w.endMin).map((w) => w.e)
  const upcoming = windows.find((w) => w.startMin > nowMin)
  return { phase: 'live', now: live, next: upcoming ? upcoming.e : null }
}
