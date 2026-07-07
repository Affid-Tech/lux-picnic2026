import type { CalEntry } from './calendar'

/** "20260712T170000" (local wall-clock, no separators) → "2026-07-12T17:00:00". */
function toIsoLocal(stamp: string): string {
  return `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T${stamp.slice(9, 11)}:${stamp.slice(11, 13)}:${stamp.slice(13, 15)}`
}

/**
 * An Outlook.com "compose event" deeplink, prefilled from a CalEntry. Unlike
 * Google's template link, Outlook's compose link has no timezone parameter —
 * it interprets `startdt`/`enddt` in the visitor's own local timezone, so the
 * zone is appended to the description as a plain-text hint instead.
 */
export function outlookCalendarUrl(entry: CalEntry): string {
  const params = new URLSearchParams({
    rru: 'addevent',
    startdt: toIsoLocal(entry.start),
    enddt: toIsoLocal(entry.end),
    subject: entry.title,
    body: `${entry.description} (Время: ${entry.tzid})`,
    location: entry.location,
  })
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`
}
