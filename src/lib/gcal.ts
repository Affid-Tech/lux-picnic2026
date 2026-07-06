import type { CalEntry } from './calendar'

/**
 * A Google Calendar "template" URL, prefilled from a CalEntry. Times are passed
 * as local wall-clock stamps together with `ctz` (the IANA zone) so Google
 * interprets them in the event's timezone regardless of the visitor's own.
 */
export function googleCalendarUrl(entry: CalEntry): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: entry.title,
    dates: `${entry.start}/${entry.end}`,
    details: entry.description,
    location: entry.location,
    ctz: entry.tzid,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
