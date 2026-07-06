import { describe, it, expect } from 'vitest'
import type { CalEntry } from './calendar'
import { googleCalendarUrl } from './gcal'

const entry: CalEntry = {
  uid: 'chgk@piknik-2026',
  title: '«Что? Где? Когда?»',
  description: 'Викторина, приходи',
  location: 'Главная поляна',
  tzid: 'Europe/Luxembourg',
  start: '20260712T170000',
  end: '20260712T190000',
}

describe('googleCalendarUrl', () => {
  const url = googleCalendarUrl(entry)
  const params = new URL(url).searchParams

  it('points at the Google Calendar render endpoint in TEMPLATE mode', () => {
    expect(url.startsWith('https://calendar.google.com/calendar/render?')).toBe(true)
    expect(params.get('action')).toBe('TEMPLATE')
  })

  it('prefills title, dates, details, location and timezone', () => {
    expect(params.get('text')).toBe('«Что? Где? Когда?»')
    expect(params.get('dates')).toBe('20260712T170000/20260712T190000')
    expect(params.get('details')).toBe('Викторина, приходи')
    expect(params.get('location')).toBe('Главная поляна')
    expect(params.get('ctz')).toBe('Europe/Luxembourg')
  })
})
