import type { Group, SubEvent } from '../types'

/** "HH:MM" → minutes since midnight. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** minutes since midnight → "HH:MM". */
export function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Human duration, e.g. 90 → "1.5 ч", 60 → "1 ч", 30 → "30 мин". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const hours = minutes / 60
  const rounded = Math.round(hours * 10) / 10
  const label = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${label} ч`
}

/** Time label for an agenda row: a range with en-dash, or a single start. */
export function formatTimeRange(start: string, end: string | null): string {
  return end ? `${start} – ${end}` : start
}

export function isPointEvent(e: SubEvent): boolean {
  return e.end === null
}

export type Daypart = 'morning' | 'day' | 'evening'

/** Coarse part-of-day bucket for an event's start time: утро ≤12:00, день ≤15:00, вечер ≥16:00. */
export function getDaypart(start: string): Daypart {
  const mins = toMinutes(start)
  if (mins <= 12 * 60) return 'morning'
  if (mins <= 15 * 60) return 'day'
  return 'evening'
}

/** Sort by start time, then by group order, then title. */
export function sortEvents(events: SubEvent[], groups: Group[]): SubEvent[] {
  const order = new Map(groups.map((g) => [g.id, g.order]))
  return [...events].sort((a, b) => {
    const byStart = toMinutes(a.start) - toMinutes(b.start)
    if (byStart !== 0) return byStart
    const byGroup = (order.get(a.group) ?? 99) - (order.get(b.group) ?? 99)
    if (byGroup !== 0) return byGroup
    return a.title.localeCompare(b.title, 'ru')
  })
}
