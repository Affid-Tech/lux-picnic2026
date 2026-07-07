// Shapes for the JSON content files under /public/data.
// These mirror PRD §7. Nothing about content, groups, colours, or UI copy is
// hardcoded in components — it all flows through these types.

export interface Group {
  id: string
  label: string
  short?: string
  color: string
  order: number
}

export interface EventLocation {
  name: string
  address: string
  mapUrl: string
}

export interface BesedaTechCta {
  ctaText: string
  ctaLabel: string
  ctaUrl: string
}

/** The headline event's main organizer (distinct from per-event hosts). */
export interface EventOrganizer {
  name: string
  url?: string
}

export interface EventInfo {
  name: string
  tagline: string
  /** ISO date, e.g. "2026-07-12" */
  date: string
  /** "HH:MM" 24h */
  startTime: string
  /** "HH:MM" 24h */
  endTime: string
  timezone: string
  location: EventLocation
  heroImage: string | null
  heroCaption?: string
  description: string
  note?: string
  /** Main organizer of the whole event (Monde des Arts). Optional for older data. */
  organizer?: EventOrganizer
  besedatech: BesedaTechCta
}

export type OrganizerType = 'person' | 'community' | 'org'

export interface Organizer {
  name: string
  type: OrganizerType
  role?: string
  url?: string
}

export type SignupMode = 'none' | 'external' | 'internal'

export interface Signup {
  mode: SignupMode
  url: string | null
  capacity: number | null
}

export interface SubEvent {
  id: string
  title: string
  /** references Group.id */
  group: string
  audience: string[]
  /** "HH:MM" 24h */
  start: string
  /** "HH:MM" 24h, or null for start-only point events */
  end: string | null
  area: string
  shortDescription: string
  description: string
  organizers: Organizer[]
  /** references Partner.id — only featured partners, usually empty */
  partnerIds: string[]
  tags: string[]
  signup: Signup
}

export interface Partner {
  id: string
  name: string
  logo: string | null
  category: string
  url: string
  description: string
  relatedEventIds: string[]
  featured: boolean
}

// strings.json — user-facing UI copy (see PRD §7). Loosely typed as nested
// string maps so copy can be edited freely without touching code.
export interface Strings {
  hero: Record<string, string>
  nowNext: Record<string, string>
  timeline: Record<string, string>
  eventCard: Record<string, string>
  partners: Record<string, string>
  footer: Record<string, string>
  calendar: Record<string, string | number>
}

export interface AppData {
  event: EventInfo
  groups: Group[]
  events: SubEvent[]
  partners: Partner[]
  strings: Strings
}
