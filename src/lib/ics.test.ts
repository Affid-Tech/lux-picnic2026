import { describe, it, expect } from 'vitest'
import type { CalEntry } from './calendar'
import { buildIcs, buildVEvent, escapeIcsText, foldLine, formatUtcStamp } from './ics'

const entry: CalEntry = {
  uid: 'chgk@piknik-2026',
  title: '«Что? Где? Когда?»',
  description: 'Викторина; собери команду, или приходи один',
  location: 'Главная поляна',
  tzid: 'Europe/Luxembourg',
  start: '20260712T170000',
  end: '20260712T190000',
}

describe('escapeIcsText', () => {
  it('escapes backslash, semicolon, comma and newlines per RFC 5545', () => {
    expect(escapeIcsText('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne')
  })

  it('does not double-escape after the backslash pass', () => {
    expect(escapeIcsText(';')).toBe('\\;')
  })
})

describe('foldLine', () => {
  const byteLen = (s: string) => new TextEncoder().encode(s).length

  it('leaves short lines untouched', () => {
    expect(foldLine('SUMMARY:hi')).toBe('SUMMARY:hi')
  })

  it('folds long ASCII lines so every physical line is ≤75 octets', () => {
    const folded = foldLine('X'.repeat(200))
    for (const physical of folded.split('\r\n')) {
      expect(byteLen(physical)).toBeLessThanOrEqual(75)
    }
    // Continuation lines start with a single space.
    const parts = folded.split('\r\n')
    expect(parts.slice(1).every((p) => p.startsWith(' '))).toBe(true)
  })

  it('folds multi-byte Cyrillic without splitting the octet budget', () => {
    const folded = foldLine('Я'.repeat(80)) // 2 bytes each = 160 octets
    for (const physical of folded.split('\r\n')) {
      expect(byteLen(physical)).toBeLessThanOrEqual(75)
    }
    // No character is lost or split — recombining drops the fold markers.
    expect(folded.replace(/\r\n /g, '')).toBe('Я'.repeat(80))
  })
})

describe('formatUtcStamp', () => {
  it('formats a UTC DTSTAMP with the trailing Z', () => {
    expect(formatUtcStamp(new Date(Date.UTC(2026, 6, 1, 9, 5, 3)))).toBe('20260701T090503Z')
  })
})

describe('buildVEvent', () => {
  it('emits TZID-qualified DTSTART/DTEND and escaped text fields', () => {
    const v = buildVEvent(entry, '20260701T090000Z')
    expect(v).toContain('BEGIN:VEVENT')
    expect(v).toContain('DTSTART;TZID=Europe/Luxembourg:20260712T170000')
    expect(v).toContain('DTEND;TZID=Europe/Luxembourg:20260712T190000')
    expect(v).toContain('UID:chgk@piknik-2026')
    expect(v).toContain('DTSTAMP:20260701T090000Z')
    // The semicolon in the description is escaped.
    expect(v).toContain('DESCRIPTION:Викторина\\; собери')
    expect(v).toContain('END:VEVENT')
  })
})

describe('buildIcs', () => {
  const ics = buildIcs([entry, { ...entry, uid: 'x@piknik-2026' }], new Date(Date.UTC(2026, 6, 1)))

  it('wraps entries in a single VCALENDAR with CRLF line endings', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:-//BesedaTech//Piknik 2026//RU')
  })

  it('contains one VEVENT per entry', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics.endsWith('\r\n')).toBe(true)
  })
})
