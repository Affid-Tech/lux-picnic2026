import { describe, it, expect } from 'vitest'
import type { SubEvent } from '../types'
import { selectNowNext } from './nowNext'

const DATE = '2026-07-12'
const base: Omit<SubEvent, 'id' | 'start' | 'end'> = {
  title: '',
  group: 'games',
  audience: [],
  area: '',
  shortDescription: '',
  description: '',
  organizers: [],
  partnerIds: [],
  tags: [],
  signup: { mode: 'none', url: null, capacity: null },
}
const ev = (id: string, start: string, end: string | null): SubEvent => ({ ...base, id, start, end })

// Local Date on the event day at HH:MM.
const at = (hh: number, mm = 0) => new Date(2026, 6, 12, hh, mm)

const schedule = [ev('a', '10:00', '12:00'), ev('b', '13:00', '15:00'), ev('c', '14:00', '18:00'), ev('lot', '17:00', null)]

describe('selectNowNext', () => {
  it('is off on any day other than the event date', () => {
    expect(selectNowNext(new Date(2026, 6, 11, 13, 0), schedule, DATE, 30)).toEqual({
      phase: 'off',
      now: [],
      next: null,
    })
  })

  it('is off when there are no events', () => {
    expect(selectNowNext(at(13), [], DATE, 30).phase).toBe('off')
  })

  it('before the first start: phase "before" with the earliest event as next', () => {
    const r = selectNowNext(at(9), schedule, DATE, 30)
    expect(r.phase).toBe('before')
    expect(r.now).toEqual([])
    expect(r.next?.id).toBe('a')
  })

  it('during the day: running events as now, earliest upcoming as next', () => {
    const r = selectNowNext(at(13, 30), schedule, DATE, 30)
    expect(r.phase).toBe('live')
    expect(r.now.map((e) => e.id)).toEqual(['b']) // 13:00–15:00 is running; c starts 14:00
    expect(r.next?.id).toBe('c')
  })

  it('reports multiple parallel events as now', () => {
    const r = selectNowNext(at(14, 30), schedule, DATE, 30)
    expect(r.phase).toBe('live')
    expect(r.now.map((e) => e.id)).toEqual(['b', 'c']) // both running at 14:30
    expect(r.next?.id).toBe('lot') // 17:00 point event
  })

  it('applies the point-event duration to the window (lottery 17:00 + 30m)', () => {
    expect(selectNowNext(at(17, 10), schedule, DATE, 30).now.map((e) => e.id)).toContain('lot')
    expect(selectNowNext(at(17, 40), schedule, DATE, 30).now.map((e) => e.id)).not.toContain('lot')
  })

  it('after the last end: phase "after" with no now/next', () => {
    const r = selectNowNext(at(18, 30), schedule, DATE, 30)
    expect(r.phase).toBe('after')
    expect(r.now).toEqual([])
    expect(r.next).toBeNull()
  })
})
