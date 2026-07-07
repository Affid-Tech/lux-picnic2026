import { describe, it, expect } from 'vitest'
import { absoluteRouteUrl, parseHash, routeToHash } from './router'

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

  it('parses a partner deep link', () => {
    expect(parseHash('#/partner/lux-mafia')).toEqual({ name: 'partner', id: 'lux-mafia' })
  })

  it('falls back to home on a malformed percent-encoded id (no throw)', () => {
    expect(parseHash('#/event/%')).toEqual({ name: 'home' })
    expect(parseHash('#/partner/%E0%')).toEqual({ name: 'home' })
  })

  it('falls back to home for an empty or unknown hash', () => {
    expect(parseHash('')).toEqual({ name: 'home' })
    expect(parseHash('#/')).toEqual({ name: 'home' })
    expect(parseHash('#/partners')).toEqual({ name: 'home' })
    expect(parseHash('#/event/')).toEqual({ name: 'home' })
    expect(parseHash('#/partner/')).toEqual({ name: 'home' })
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

  it('is the inverse of parseHash for partner routes', () => {
    const hash = routeToHash({ name: 'partner', id: 'lux-mafia' })
    expect(hash).toBe('#/partner/lux-mafia')
    expect(parseHash(hash)).toEqual({ name: 'partner', id: 'lux-mafia' })
  })

  it('maps the home route to #/', () => {
    expect(routeToHash({ name: 'home' })).toBe('#/')
  })
})

describe('absoluteRouteUrl', () => {
  it('is empty outside a browser (no window to derive an origin from)', () => {
    expect(absoluteRouteUrl({ name: 'home' })).toBe('')
    expect(absoluteRouteUrl({ name: 'event', id: 'chgk' })).toBe('')
  })
})
