import { z } from 'zod'
import type { EventInfo, Group, Partner, SubEvent } from '../types'

// Runtime validation at the JSON boundary. Everything the app renders enters
// here, so this is the single choke point that pins the shapes and — crucially —
// the security-sensitive fields before they reach the DOM:
//   • group colours flow into inline `style` (category tag outlines);
//   • organizer/partner/signup URLs flow into `href`;
//   • event id and timezone flow into `.ics` property lines.
// A malformed value must fail loudly at load, never silently reach the DOM.

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const ID = /^[a-zA-Z0-9_-]+$/
// IANA-style zone: no CRLF / ';' / ':' so it can't break out of a TZID param.
const TIMEZONE = /^[A-Za-z0-9_+\-/]+$/

/** An http(s) URL or the empty string (many optional links are left blank). */
const urlOrEmpty = z
  .string()
  .refine((v) => v === '' || /^https?:\/\//i.test(v), {
    message: 'ожидался http(s)-URL или пустая строка',
  })

/**
 * A local asset path (logo / hero image), or null. No URL scheme and no
 * protocol-relative `//host` prefix — images are bundled assets, not arbitrary
 * remote fetches (avoids referer/privacy leaks and mixed content).
 */
const localAssetOrNull = z
  .string()
  .refine((v) => !v.includes(':') && !v.startsWith('//'), {
    message: 'ожидался локальный путь к файлу (без схемы)',
  })
  .nullable()

const GroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  short: z.string().optional(),
  color: z.string().regex(HEX_COLOR, 'ожидался hex-цвет вида #2A78D6'),
  order: z.number(),
})
const GroupsSchema = z.array(GroupSchema).min(1)

const OrganizerSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['person', 'community', 'org']),
  role: z.string().optional(),
  url: urlOrEmpty.optional(),
})

const SignupSchema = z.object({
  mode: z.enum(['none', 'external', 'internal']),
  url: z
    .string()
    .nullable()
    .refine((v) => v === null || v === '' || /^https?:\/\//i.test(v), {
      message: 'ожидался http(s)-URL',
    }),
  capacity: z.number().nullable(),
})

const SubEventSchema = z.object({
  id: z.string().regex(ID),
  title: z.string().min(1),
  group: z.string().min(1),
  audience: z.array(z.string()),
  start: z.string(),
  end: z.string().nullable(),
  area: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  organizers: z.array(OrganizerSchema),
  partnerIds: z.array(z.string()),
  tags: z.array(z.string()),
  signup: SignupSchema,
})

const EventSchema = z.object({
  name: z.string().min(1),
  tagline: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string().regex(TIMEZONE, 'ожидалась IANA-таймзона'),
  location: z.object({ name: z.string(), address: z.string(), mapUrl: urlOrEmpty }),
  heroImage: localAssetOrNull,
  heroCaption: z.string().optional(),
  description: z.string(),
  note: z.string().optional(),
  organizer: z
    .object({
      name: z.string().min(1),
      url: urlOrEmpty.optional(),
      logo: localAssetOrNull.optional(),
    })
    .optional(),
  besedatech: z.object({
    ctaText: z.string(),
    ctaLabel: z.string(),
    ctaUrl: urlOrEmpty,
  }),
})

const PartnerSchema = z.object({
  id: z.string().regex(ID),
  name: z.string().min(1),
  logo: localAssetOrNull,
  category: z.string(),
  url: urlOrEmpty,
  description: z.string(),
  relatedEventIds: z.array(z.string()),
})

function parseOrThrow<T>(schema: z.ZodType, raw: unknown, file: string): T {
  const result = schema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    const where = issue?.path.join('.') || '?'
    throw new Error(`${file} (${where}): ${issue?.message ?? 'некорректные данные'}`)
  }
  return result.data as T
}

export const validateGroups = (raw: unknown): Group[] =>
  parseOrThrow<Group[]>(GroupsSchema, raw, 'groups.json')
export const validateEvent = (raw: unknown): EventInfo =>
  parseOrThrow<EventInfo>(EventSchema, raw, 'event.json')
export const validateEvents = (raw: unknown): SubEvent[] =>
  parseOrThrow<SubEvent[]>(z.array(SubEventSchema), raw, 'events.json')
export const validatePartners = (raw: unknown): Partner[] =>
  parseOrThrow<Partner[]>(z.array(PartnerSchema), raw, 'partners.json')
