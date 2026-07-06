import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Tracks the user's `prefers-reduced-motion` setting, updating live if it
 * changes. Defaults to `true` (motion off) during SSR / before mount so the
 * safe, non-animated path is the default.
 */
export function usePrefersReducedMotion(): boolean {
  // Read synchronously on the first client render so the correct (non-animated)
  // path is chosen immediately; SSR falls back to the safe `true`.
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(QUERY)
    const update = () => setReduced(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return reduced
}
