import { useEffect, useState } from 'react'

/**
 * Tracks an arbitrary media query, updating live on resize/orientation
 * change. Defaults to `false` during SSR / before mount, matching this
 * app's mobile-first default (assume the narrower case until proven
 * otherwise) — mirrors usePrefersReducedMotion's read-synchronously shape.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const update = () => setMatches(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [query])

  return matches
}
