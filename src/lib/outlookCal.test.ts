import { describe, it, expect } from 'vitest'
import type { CalEntry } from './calendar'
import { outlookCalendarUrl } from './outlookCal'

const entry: CalEntry = {
  uid: 'chgk@piknik-2026',
  title: '«Что? Где? Когда?»',
  description: 'Викторина, приходи',
  location: 'Главная поляна',
  tzid: 'Europe/Luxembourg',
  start: '20260712T170000',
  end: '20260712T190000',
}

describe('outlookCalendarUrl', () => {
  const url = outlookCalendarUrl(entry)
  const params = new URL(url).searchParams

  it('points at the Outlook.com compose endpoint in addevent mode', () => {
    expect(url.startsWith('https://outlook.live.com/calendar/0/action/compose?')).toBe(true)
    expect(params.get('rru')).toBe('addevent')
  })

  it('reformats the wall-clock stamps into dashed/colon ISO 8601', () => {
    expect(params.get('startdt')).toBe('2026-07-12T17:00:00')
    expect(params.get('enddt')).toBe('2026-07-12T19:00:00')
  })

  it('prefills subject, location and a body that names the timezone', () => {
    expect(params.get('subject')).toBe('«Что? Где? Когда?»')
    expect(params.get('location')).toBe('Главная поляна')
    expect(params.get('body')).toContain('Викторина, приходи')
    expect(params.get('body')).toContain('Europe/Luxembourg')
  })
})
