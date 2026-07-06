import { describe, it, expect, afterEach } from 'vitest'
import { configureAnalytics, track, type AnalyticsEvent, type AnalyticsProps } from './analytics'

afterEach(() => configureAnalytics(null))

describe('analytics', () => {
  it('is a no-op with no provider (does not throw)', () => {
    expect(() => track('cta_click')).not.toThrow()
  })

  it('forwards event + props to a configured provider', () => {
    const calls: Array<[AnalyticsEvent, AnalyticsProps | undefined]> = []
    configureAnalytics({ track: (e, p) => calls.push([e, p]) })
    track('calendar_add_event', { id: 'chgk', method: 'ics' })
    expect(calls).toEqual([['calendar_add_event', { id: 'chgk', method: 'ics' }]])
  })

  it('stops forwarding once the provider is cleared', () => {
    let count = 0
    configureAnalytics({ track: () => (count += 1) })
    track('cta_click')
    configureAnalytics(null)
    track('cta_click')
    expect(count).toBe(1)
  })

  it('swallows a throwing provider so it never breaks the app', () => {
    configureAnalytics({
      track: () => {
        throw new Error('provider down')
      },
    })
    expect(() => track('partner_outbound', { id: 'x' })).not.toThrow()
  })
})
