import { useEffect, useState } from 'react'

// A tiny hash router — no dependency. Deep links are shareable as
// `/#/event/:id`; anything else is treated as the home route. Hash routing
// keeps the app deployable under any static base (see vite.config `base`).

export type Route = { name: 'home' } | { name: 'event'; id: string }

/** Parse a raw `location.hash` string into a Route. Pure — safe to unit-test. */
export function parseHash(hash: string): Route {
  // Strip a leading '#', then a leading '/', so both "#/event/x" and
  // "#event/x" resolve the same way.
  const path = hash.replace(/^#/, '').replace(/^\//, '')
  const match = /^event\/(.+)$/.exec(path)
  if (match) {
    const id = decodeURIComponent(match[1])
    if (id) return { name: 'event', id }
  }
  return { name: 'home' }
}

/** Build the canonical hash for a route (inverse of parseHash). */
export function routeToHash(route: Route): string {
  if (route.name === 'event') return `#/event/${encodeURIComponent(route.id)}`
  return '#/'
}

const currentHash = (): string =>
  typeof window === 'undefined' ? '' : window.location.hash

/**
 * Subscribe to the URL hash. Returns the parsed route plus a `navigate` that
 * updates `location.hash` (which in turn re-runs every subscriber).
 */
export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(currentHash()))

  useEffect(() => {
    const onChange = () => setRoute(parseHash(currentHash()))
    window.addEventListener('hashchange', onChange)
    // Re-sync in case the hash changed between the initial render and mount.
    onChange()
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = (next: Route) => {
    window.location.hash = routeToHash(next)
  }

  return [route, navigate]
}
