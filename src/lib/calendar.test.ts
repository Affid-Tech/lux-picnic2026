import { describe, it, expect } from 'vitest'
import type { EventInfo, Strings, SubEvent } from '../types'
import { calTimes, formatLocalDT, toCalEntry, wholeDayCalEntry } from './calendar'

const eventInfo = {
  date: '2026-07-12',
  timezone: 'Europe/Luxembourg',
  location: { name: 'Главная поляна', address: '', mapUrl: '' },
  startTime: '10:00',
  endTime: '19:00',
  description: 'Целый день на свежем воздухе для всей семьи.',
} as EventInfo

const strings = {
  calendar: { wholeDayTitle: 'Большой русскоязычный пикник — весь день' },
} as unknown as Strings

const ranged: SubEvent = {
  id: 'chgk',
  title: '«Что? Где? Когда?»',
  group: 'games',
  audience: ['Взрослые'],
  start: '17:00',
  end: '19:00',
  area: '',
  shortDescription: '',
  description: 'Викторина, приходи',
  organizers: [],
  partnerIds: [],
  tags: [],
  signup: { mode: 'none', url: null, capacity: null },
}

const point: SubEvent = { ...ranged, id: 'lottery', title: 'Лотерея', start: '17:00', end: null }

describe('formatLocalDT', () => {
  it('formats a local wall-clock stamp with no timezone suffix', () => {
    expect(formatLocalDT('2026-07-12', 17 * 60)).toBe('20260712T170000')
    expect(formatLocalDT('2026-07-12', 9 * 60 + 5)).toBe('20260712T090500')
  })
})

describe('calTimes', () => {
  it('uses the real end for ranged events', () => {
    expect(calTimes(ranged, 30)).toEqual({ startMin: 1020, endMin: 1140 })
  })

  it('applies the default duration to point events', () => {
    expect(calTimes(point, 30)).toEqual({ startMin: 1020, endMin: 1050 })
  })

  it('clamps a late point event so the end stays on the same day', () => {
    const late = { ...point, start: '23:50' }
    expect(calTimes(late, 30)).toEqual({ startMin: 1430, endMin: 1439 })
  })
})

describe('toCalEntry', () => {
  it('builds a neutral entry with wall-clock times and the venue location', () => {
    const entry = toCalEntry(ranged, eventInfo, 30, '')
    expect(entry).toMatchObject({
      uid: 'chgk@piknik-2026',
      title: '«Что? Где? Когда?»',
      location: 'Главная поляна',
      tzid: 'Europe/Luxembourg',
      start: '20260712T170000',
      end: '20260712T190000',
    })
  })

  it('extends point events by the default duration', () => {
    const entry = toCalEntry(point, eventInfo, 30, '')
    expect(entry.start).toBe('20260712T170000')
    expect(entry.end).toBe('20260712T173000')
  })

  it('leaves the description untouched when no site URL is given', () => {
    expect(toCalEntry(ranged, eventInfo, 30, '').description).toBe(ranged.description)
  })

  it('appends a link back to the event page when a site URL is given', () => {
    const entry = toCalEntry(ranged, eventInfo, 30, 'https://piknik.example/#/event/chgk')
    expect(entry.description).toBe(`${ranged.description}\n\nПодробнее: https://piknik.example/#/event/chgk`)
  })
})

describe('wholeDayCalEntry', () => {
  it('spans the event start/end, not any single sub-event', () => {
    const entry = wholeDayCalEntry(eventInfo, strings, '')
    expect(entry.start).toBe('20260712T100000')
    expect(entry.end).toBe('20260712T190000')
    expect(entry.title).toBe(strings.calendar.wholeDayTitle)
    expect(entry.location).toBe('Главная поляна')
    expect(entry.tzid).toBe('Europe/Luxembourg')
  })

  it('appends a link back to the programme when a site URL is given', () => {
    const entry = wholeDayCalEntry(eventInfo, strings, 'https://piknik.example/')
    expect(entry.description).toBe(`${eventInfo.description}\n\nПодробнее: https://piknik.example/`)
  })
})
