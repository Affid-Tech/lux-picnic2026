import { describe, it, expect } from 'vitest'
import { parseHash, routeToHash } from './router'

describe('parseHash', () => {
  it('parses an event deep link', () => {
    expect(parseHash('#/event/beseda-ai')).toEqual({ name: 'event', id: 'beseda-ai' })
  })

  it('tolerates a missing leading slash', () => {
    expect(parseHash('#event/lottery')).toEqual({ name: 'event', id: 'lottery' })
  })

  it('decodes percent-encoded ids', () => {
    expect(parseHash('#/event/a%2Fb')).toEqual({ name: 'event', id: 'a/b' })
  })

  it('falls back to home for an empty or unknown hash', () => {
    expect(parseHash('')).toEqual({ name: 'home' })
    expect(parseHash('#/')).toEqual({ name: 'home' })
    expect(parseHash('#/partners')).toEqual({ name: 'home' })
    expect(parseHash('#/event/')).toEqual({ name: 'home' })
  })
})

describe('routeToHash', () => {
  it('is the inverse of parseHash for event routes', () => {
    const hash = routeToHash({ name: 'event', id: 'beseda-ai' })
    expect(hash).toBe('#/event/beseda-ai')
    expect(parseHash(hash)).toEqual({ name: 'event', id: 'beseda-ai' })
  })

  it('round-trips ids that need encoding', () => {
    const route = { name: 'event', id: 'a/b' } as const
    expect(parseHash(routeToHash(route))).toEqual(route)
  })

  it('maps the home route to #/', () => {
    expect(routeToHash({ name: 'home' })).toBe('#/')
  })
})
