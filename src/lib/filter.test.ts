import { describe, it, expect } from 'vitest'
import type { SubEvent } from '../types'
import { audienceBucket, deriveAudienceBuckets, filterEvents } from './filter'

// Minimal SubEvent factory — only the fields the filter reads matter.
function ev(partial: Partial<SubEvent> & Pick<SubEvent, 'id' | 'group' | 'audience'>): SubEvent {
  return {
    title: partial.id,
    start: '10:00',
    end: '11:00',
    area: '',
    shortDescription: '',
    description: '',
    organizers: [],
    partnerIds: [],
    tags: [],
    signup: { mode: 'none', url: null, capacity: null },
    ...partial,
  } as SubEvent
}

describe('audienceBucket', () => {
  it('maps granular kids strings to Дети', () => {
    expect(audienceBucket('Дети 4–8')).toBe('Дети')
    expect(audienceBucket('Дети 8–12')).toBe('Дети')
  })

  it('maps teen strings to Подростки', () => {
    expect(audienceBucket('Подростки')).toBe('Подростки')
    expect(audienceBucket('Подростки 12–18')).toBe('Подростки')
  })

  it('maps adult strings to Взрослые', () => {
    expect(audienceBucket('Взрослые')).toBe('Взрослые')
  })

  it('returns null for the everyone tag', () => {
    expect(audienceBucket('Все')).toBeNull()
  })

  it('returns null for anything unrecognized', () => {
    expect(audienceBucket('Пенсионеры')).toBeNull()
  })
})

describe('deriveAudienceBuckets', () => {
  it('lists present buckets in canonical order, no duplicates', () => {
    const events = [
      ev({ id: 'a', group: 'games', audience: ['Взрослые'] }),
      ev({ id: 'b', group: 'kids', audience: ['Дети 4–8'] }),
      ev({ id: 'c', group: 'games', audience: ['Подростки 12–18'] }),
      ev({ id: 'd', group: 'kids', audience: ['Дети 8–12'] }),
    ]
    expect(deriveAudienceBuckets(events)).toEqual(['Дети', 'Подростки', 'Взрослые'])
  })

  it('omits buckets that never appear', () => {
    const events = [ev({ id: 'a', group: 'obshee', audience: ['Все'] })]
    expect(deriveAudienceBuckets(events)).toEqual([])
  })
})

describe('filterEvents', () => {
  const events = [
    ev({ id: 'general', group: 'obshee', audience: ['Все'] }),
    ev({ id: 'it', group: 'it', audience: ['Взрослые'] }),
    ev({ id: 'kids', group: 'kids', audience: ['Дети 4–8'] }),
    ev({ id: 'teens', group: 'games', audience: ['Подростки'] }),
  ]

  it('returns everything when both filters are "all"', () => {
    expect(filterEvents(events, { group: 'all', audience: 'all' })).toHaveLength(4)
  })

  it('filters by group id', () => {
    const out = filterEvents(events, { group: 'kids', audience: 'all' })
    expect(out.map((e) => e.id)).toEqual(['kids'])
  })

  it('filters by audience bucket', () => {
    const out = filterEvents(events, { group: 'all', audience: 'Подростки' })
    // The teens event plus the "Все" event, which is for everyone.
    expect(out.map((e) => e.id).sort()).toEqual(['general', 'teens'])
  })

  it('applies group AND audience together', () => {
    const out = filterEvents(events, { group: 'games', audience: 'Подростки' })
    expect(out.map((e) => e.id)).toEqual(['teens'])
  })

  it('an all-audience ("Все") event matches every audience bucket', () => {
    const out = filterEvents(events, { group: 'all', audience: 'Взрослые' })
    expect(out.map((e) => e.id).sort()).toEqual(['general', 'it'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterEvents(events, { group: 'it', audience: 'Дети' })).toEqual([])
  })

  it('does not mutate the input array', () => {
    const copy = [...events]
    filterEvents(events, { group: 'kids', audience: 'all' })
    expect(events).toEqual(copy)
  })
})
