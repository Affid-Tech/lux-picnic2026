import type { CalEntry } from './calendar'

// Client-side iCalendar (RFC 5545) generation. All functions are pure so the
// escaping and line-folding rules can be unit-tested without a DOM.

const encoder = new TextEncoder()
const CRLF = '\r\n'

/**
 * Escape a text value per RFC 5545 §3.3.11: backslash, semicolon and comma are
 * backslash-escaped, and any newline becomes a literal "\n". Order matters —
 * the backslash rule runs first so it does not double-escape the others.
 */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

/**
 * Fold a content line to ≤75 octets per RFC 5545 §3.1. Continuation lines are
 * delimited by CRLF + a single leading space (which counts toward the 75-octet
 * budget). Octet-aware so multi-byte Cyrillic folds correctly.
 */
export function foldLine(line: string): string {
  const pieces: string[] = []
  let buf = ''
  let bytes = 0
  // First physical line gets the full 75 octets; each continuation reserves one
  // octet for its leading space.
  let max = 75
  for (const ch of Array.from(line)) {
    const chBytes = encoder.encode(ch).length
    if (bytes + chBytes > max) {
      pieces.push(buf)
      buf = ch
      bytes = chBytes
      max = 74
    } else {
      buf += ch
      bytes += chBytes
    }
  }
  pieces.push(buf)
  return pieces.join(`${CRLF} `)
}

/** UTC timestamp "YYYYMMDDTHHMMSSZ" for DTSTAMP, derived from a clock. */
export function formatUtcStamp(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}` +
    `T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`
  )
}

const prop = (name: string, value: string): string => foldLine(`${name}:${escapeIcsText(value)}`)

/** A single VEVENT block. `dtstamp` is a shared UTC stamp for the export. */
export function buildVEvent(entry: CalEntry, dtstamp: string): string {
  return [
    'BEGIN:VEVENT',
    prop('UID', entry.uid),
    `DTSTAMP:${dtstamp}`,
    foldLine(`DTSTART;TZID=${entry.tzid}:${entry.start}`),
    foldLine(`DTEND;TZID=${entry.tzid}:${entry.end}`),
    prop('SUMMARY', entry.title),
    prop('DESCRIPTION', entry.description),
    prop('LOCATION', entry.location),
    'END:VEVENT',
  ].join(CRLF)
}

/**
 * A complete VCALENDAR wrapping one or more entries. `calName` (optional) names
 * the calendar for the whole-day export via X-WR-CALNAME / NAME.
 */
export function buildIcs(entries: CalEntry[], now: Date, calName?: string): string {
  const dtstamp = formatUtcStamp(now)
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BesedaTech//Piknik 2026//RU',
    'CALSCALE:GREGORIAN',
  ]
  if (calName) {
    header.push(prop('X-WR-CALNAME', calName), prop('NAME', calName))
  }
  return (
    [...header, ...entries.map((e) => buildVEvent(e, dtstamp)), 'END:VCALENDAR'].join(CRLF) + CRLF
  )
}
