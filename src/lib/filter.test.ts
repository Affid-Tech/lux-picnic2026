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
  const noFilter = () => ({ groups: new Set<string>(), audiences: new Set<'Дети' | 'Подростки' | 'Взрослые'>() })

  it('returns everything when both sets are empty', () => {
    expect(filterEvents(events, noFilter())).toHaveLength(4)
  })

  it('filters by a single selected group', () => {
    const out = filterEvents(events, { ...noFilter(), groups: new Set(['kids']) })
    expect(out.map((e) => e.id)).toEqual(['kids'])
  })

  it('ORs multiple selected groups together', () => {
    const out = filterEvents(events, { ...noFilter(), groups: new Set(['games', 'kids']) })
    expect(out.map((e) => e.id).sort()).toEqual(['kids', 'teens'])
  })

  it('filters by a single selected audience bucket', () => {
    const out = filterEvents(events, { ...noFilter(), audiences: new Set(['Подростки']) })
    // The teens event plus the "Все" event, which is for everyone.
    expect(out.map((e) => e.id).sort()).toEqual(['general', 'teens'])
  })

  it('applies selected groups AND selected audiences together', () => {
    const out = filterEvents(events, { groups: new Set(['games']), audiences: new Set(['Подростки']) })
    expect(out.map((e) => e.id)).toEqual(['teens'])
  })

  it('an all-audience ("Все") event matches even when specific audience buckets are selected', () => {
    const out = filterEvents(events, { ...noFilter(), audiences: new Set(['Взрослые']) })
    expect(out.map((e) => e.id).sort()).toEqual(['general', 'it'])
  })

  it('returns an empty list when the selected group and audience never co-occur', () => {
    expect(filterEvents(events, { groups: new Set(['it']), audiences: new Set(['Дети']) })).toEqual([])
  })

  it('does not mutate the input array', () => {
    const copy = [...events]
    filterEvents(events, { ...noFilter(), groups: new Set(['kids']) })
    expect(events).toEqual(copy)
  })

  it('does not mutate the input Sets', () => {
    const state = { groups: new Set(['kids']), audiences: new Set<'Дети' | 'Подростки' | 'Взрослые'>() }
    const groupsCopy = new Set(state.groups)
    const audiencesCopy = new Set(state.audiences)
    filterEvents(events, state)
    expect(state.groups).toEqual(groupsCopy)
    expect(state.audiences).toEqual(audiencesCopy)
  })
})
