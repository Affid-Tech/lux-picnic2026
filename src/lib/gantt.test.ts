import { describe, it, expect } from 'vitest'
import type { EventInfo, Group, SubEvent } from '../types'
import { ganttDomain, hourTicks, packLanes, laneSegments, nowMarkerPct } from './gantt'
import { toMinutes } from './time'

function ev(id: string, start: string, end: string | null, group = 'obshee'): SubEvent {
  return {
    id,
    title: id,
    group,
    audience: ['Все'],
    start,
    end,
    area: '',
    shortDescription: '',
    description: '',
    organizers: [],
    partnerIds: [],
    tags: [],
    signup: { mode: 'none', url: null, capacity: null },
  }
}

const groups: Group[] = [
  { id: 'obshee', label: 'Общее', short: 'Общее', color: '#888780', order: 1 },
  { id: 'games', label: 'Игры', short: 'Игры', color: '#6B62C0', order: 4 },
]
const groupById = new Map(groups.map((g) => [g.id, g]))

const eventInfo = { startTime: '10:00', endTime: '19:00' } as EventInfo

describe('ganttDomain', () => {
  it('floors the start and ceils the end to whole hours', () => {
    const events = [ev('a', '10:30', '12:30'), ev('b', '13:00', '18:00')]
    const d = ganttDomain(events, eventInfo)
    expect(d.startMin).toBe(toMinutes('10:00'))
    expect(d.endMin).toBe(toMinutes('19:00'))
  })

  it('covers a point event that starts before every ranged event', () => {
    const events = [ev('p', '09:15', null), ev('b', '13:00', '18:00')]
    const d = ganttDomain(events, { startTime: '09:15', endTime: '18:00' } as EventInfo)
    expect(d.startMin).toBe(toMinutes('09:00'))
    expect(d.endMin).toBe(toMinutes('18:00'))
  })

  it('guards against a zero-or-negative span', () => {
    const events = [ev('a', '10:00', '10:00')]
    const d = ganttDomain(events, { startTime: '10:00', endTime: '10:00' } as EventInfo)
    expect(d.endMin).toBeGreaterThan(d.startMin)
  })
})

describe('hourTicks', () => {
  it('produces one mark per hour, inclusive of both ends', () => {
    const ticks = hourTicks({ startMin: toMinutes('10:00'), endMin: toMinutes('13:00') })
    expect(ticks).toEqual([600, 660, 720, 780])
  })
})

describe('packLanes', () => {
  it('places non-overlapping events in a single lane', () => {
    const events = [ev('a', '10:00', '11:00'), ev('b', '11:00', '12:00')]
    const { assignments, laneCount } = packLanes(events)
    expect(laneCount).toBe(1)
    expect(assignments.every((a) => a.lane === 0)).toBe(true)
  })

  it('lane count equals the peak concurrency', () => {
    // Three events all overlapping 13:00–13:30.
    const events = [
      ev('a', '13:00', '14:00'),
      ev('b', '13:00', '13:30'),
      ev('c', '13:15', '13:45'),
    ]
    expect(packLanes(events).laneCount).toBe(3)
  })

  it('reuses a freed lane once an event has ended', () => {
    const events = [
      ev('a', '10:00', '11:00'),
      ev('b', '10:30', '11:30'),
      ev('c', '11:00', '12:00'), // can reuse lane of 'a' (ended at 11:00)
    ]
    const { laneCount } = packLanes(events)
    expect(laneCount).toBe(2)
  })

  it('treats a point event as an instant (end = start)', () => {
    const events = [ev('range', '10:00', '11:00'), ev('point', '11:00', null)]
    expect(packLanes(events).laneCount).toBe(1)
  })

  it('assigns every event exactly once', () => {
    const events = [ev('a', '10:00', '12:00'), ev('b', '11:00', '13:00')]
    const ids = packLanes(events).assignments.map((a) => a.id).sort()
    expect(ids).toEqual(['a', 'b'])
  })
})

describe('laneSegments', () => {
  const domain = { startMin: toMinutes('10:00'), endMin: toMinutes('12:00') } // 120 min span

  it('computes left and width as percentages of the domain span', () => {
    const events = [ev('a', '10:30', '11:30', 'games')]
    const [seg] = laneSegments(events, groupById, domain)
    expect(seg.leftPct).toBeCloseTo(25) // 30 / 120
    expect(seg.widthPct).toBeCloseTo(50) // 60 / 120
    expect(seg.color).toBe('#6B62C0')
    expect(seg.groupLabel).toBe('Игры')
    expect(seg.point).toBe(false)
  })

  it('flags point events and gives them a zero base width', () => {
    const events = [ev('p', '11:00', null)]
    const [seg] = laneSegments(events, groupById, domain)
    expect(seg.point).toBe(true)
    expect(seg.leftPct).toBeCloseTo(50) // 60 / 120
    expect(seg.widthPct).toBe(0)
  })

  it('falls back to a neutral colour for an unknown group', () => {
    const events = [ev('x', '10:00', '11:00', 'ghost')]
    const [seg] = laneSegments(events, groupById, domain)
    expect(seg.color).toBe('var(--cat-general)')
    expect(seg.groupLabel).toBe('')
  })
})

describe('nowMarkerPct', () => {
  const domain = { startMin: toMinutes('10:00'), endMin: toMinutes('19:00') }
  const dateIso = '2026-07-12'

  it('returns a percentage when now is on the event day and inside the window', () => {
    const now = new Date(2026, 6, 12, 13, 0, 0) // 13:00 local
    expect(nowMarkerPct(now, dateIso, domain)).toBeCloseTo(((780 - 600) / 540) * 100)
  })

  it('returns null on any other calendar day', () => {
    const now = new Date(2026, 6, 6, 13, 0, 0)
    expect(nowMarkerPct(now, dateIso, domain)).toBeNull()
  })

  it('returns null before the window opens or after it closes', () => {
    expect(nowMarkerPct(new Date(2026, 6, 12, 8, 0, 0), dateIso, domain)).toBeNull()
    expect(nowMarkerPct(new Date(2026, 6, 12, 20, 0, 0), dateIso, domain)).toBeNull()
  })
})
