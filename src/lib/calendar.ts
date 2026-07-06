import type { EventInfo, Strings, SubEvent } from '../types'
import { fromMinutes, toMinutes } from './time'

const DAY_END = 24 * 60 - 1 // 23:59 — keep entries on the event's own date

/** The configured point-event fallback duration (minutes), defaulting to 30. */
export function pointDuration(strings: Strings): number {
  return Number(strings.calendar.defaultPointDurationMin) || 30
}

// Neutral calendar model shared by the .ics and Google Calendar builders. Times
// are kept as local wall-clock stamps paired with an IANA `tzid`, so neither
// builder needs to know the UTC offset — the calendar client resolves the zone.

export interface CalEntry {
  uid: string
  title: string
  description: string
  location: string
  /** IANA timezone id, e.g. "Europe/Luxembourg" */
  tzid: string
  /** local wall-clock "YYYYMMDDTHHMMSS" (no timezone suffix) */
  start: string
  /** local wall-clock "YYYYMMDDTHHMMSS" (no timezone suffix) */
  end: string
}

/** "2026-07-12" + minutes-since-midnight → "20260712T170000" (local wall clock). */
export function formatLocalDT(dateIso: string, minutes: number): string {
  const [y, m, d] = dateIso.split('-')
  const hhmm = fromMinutes(minutes)
  return `${y}${m}${d}T${hhmm.slice(0, 2)}${hhmm.slice(3, 5)}00`
}

/**
 * Effective [startMin, endMin] for a calendar entry. Point events (no `end`)
 * get the default duration so they still occupy a real block.
 */
export function calTimes(
  sub: SubEvent,
  pointDurationMin: number,
): { startMin: number; endMin: number } {
  const startMin = toMinutes(sub.start)
  // Point events get the default duration, clamped so a late start can't roll
  // the end past midnight into an invalid same-date stamp.
  const endMin = sub.end ? toMinutes(sub.end) : Math.min(startMin + pointDurationMin, DAY_END)
  return { startMin, endMin }
}

/** Build a single calendar entry from a sub-event + the headline event context. */
export function toCalEntry(
  sub: SubEvent,
  eventInfo: EventInfo,
  pointDurationMin: number,
): CalEntry {
  const { startMin, endMin } = calTimes(sub, pointDurationMin)
  return {
    uid: `${sub.id}@piknik-2026`,
    title: sub.title,
    description: sub.description,
    location: eventInfo.location.name || '',
    tzid: eventInfo.timezone,
    start: formatLocalDT(eventInfo.date, startMin),
    end: formatLocalDT(eventInfo.date, endMin),
  }
}

/** Every sub-event as calendar entries, for the whole-day export. */
export function toCalEntries(
  events: SubEvent[],
  eventInfo: EventInfo,
  pointDurationMin: number,
): CalEntry[] {
  return events.map((e) => toCalEntry(e, eventInfo, pointDurationMin))
}
