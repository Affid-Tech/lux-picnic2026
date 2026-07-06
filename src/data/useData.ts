import { useEffect, useState } from 'react'
import type { AppData, EventInfo, Group, Partner, SubEvent, Strings } from '../types'
import { validateEvent, validateEvents, validateGroups, validatePartners } from './schema'

// Resolve data URLs against Vite's base so it works from a domain root or a
// GitHub Pages sub-path without code changes.
const base = import.meta.env.BASE_URL
const url = (file: string) => `${base}data/${file}`.replace(/\/{2,}/g, '/')

type LoadState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: AppData; error: null }
  | { status: 'error'; data: null; error: string }

async function fetchJson<T>(file: string): Promise<T> {
  const res = await fetch(url(file))
  if (!res.ok) throw new Error(`Не удалось загрузить ${file} (${res.status})`)
  return (await res.json()) as T
}

/**
 * Loads all content JSON in parallel. Everything the app renders comes from
 * here — content, groups, colours, and UI copy are never hardcoded.
 */
export function useData(): LoadState {
  const [state, setState] = useState<LoadState>({
    status: 'loading',
    data: null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetchJson<EventInfo>('event.json'),
      fetchJson<Group[]>('groups.json'),
      fetchJson<SubEvent[]>('events.json'),
      fetchJson<Partner[]>('partners.json'),
      fetchJson<Strings>('strings.json'),
    ])
      .then(([event, groups, events, partners, strings]) => {
        if (cancelled) return
        // Validate shape + security-sensitive fields (colours, URLs, timezone,
        // ids) at the boundary before any of it reaches the DOM.
        const sortedGroups = [...validateGroups(groups)].sort((a, b) => a.order - b.order)
        setState({
          status: 'ready',
          data: {
            event: validateEvent(event),
            groups: sortedGroups,
            events: validateEvents(events),
            partners: validatePartners(partners),
            strings,
          },
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Ошибка загрузки данных'
        setState({ status: 'error', data: null, error: message })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
