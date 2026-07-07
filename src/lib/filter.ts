import type { SubEvent } from '../types'

// Coarse audience buckets for the optional audience chips. The data carries
// granular strings ("Дети 4–8", "Подростки 12–18", …); these fold into three
// buckets for filtering. "Все" is not a bucket — it means "for everyone" and
// so matches every bucket filter.
export type AudienceBucket = 'Дети' | 'Подростки' | 'Взрослые'

const AUDIENCE_ORDER: AudienceBucket[] = ['Дети', 'Подростки', 'Взрослые']

/** Fold a granular audience string into a coarse bucket, or null if none. */
export function audienceBucket(audience: string): AudienceBucket | null {
  const s = audience.toLowerCase()
  if (s.includes('дет')) return 'Дети'
  if (s.includes('подрост')) return 'Подростки'
  if (s.includes('взросл')) return 'Взрослые'
  return null
}

/** True when the event is open to everyone (its audience list contains "Все"). */
function isForEveryone(event: SubEvent): boolean {
  return event.audience.some((a) => a.trim().toLowerCase() === 'все')
}

/** The buckets that actually occur in the data, in canonical chip order. */
export function deriveAudienceBuckets(events: SubEvent[]): AudienceBucket[] {
  const present = new Set<AudienceBucket>()
  for (const e of events) {
    for (const a of e.audience) {
      const bucket = audienceBucket(a)
      if (bucket) present.add(bucket)
    }
  }
  return AUDIENCE_ORDER.filter((b) => present.has(b))
}

export interface FilterState {
  /** selected group ids; empty means "show all" */
  groups: Set<string>
  /** selected audience buckets; empty means "show all" */
  audiences: Set<AudienceBucket>
}

function matchesAudience(event: SubEvent, audiences: Set<AudienceBucket>): boolean {
  if (isForEveryone(event)) return true
  return event.audience.some((a) => {
    const bucket = audienceBucket(a)
    return bucket !== null && audiences.has(bucket)
  })
}

/**
 * Filter events by selected groups and audiences. Within a dimension,
 * multiple selected chips are OR'd (union); the two dimensions are AND'd
 * together. An empty Set means "no chip selected" = show all. Never mutates
 * input (array or Sets).
 */
export function filterEvents(events: SubEvent[], state: FilterState): SubEvent[] {
  return events.filter((e) => {
    const groupOk = state.groups.size === 0 || state.groups.has(e.group)
    const audienceOk = state.audiences.size === 0 || matchesAudience(e, state.audiences)
    return groupOk && audienceOk
  })
}
