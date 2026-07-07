import { useMemo, type ReactNode } from 'react'
import type { CalEntry, CalendarMethod } from '../lib/calendar'
import type { Organizer, Partner, Signup, Strings, SubEvent, Group, EventInfo } from '../types'
import { Sheet } from './Sheet'
import { CategoryTag } from './CategoryTag'
import { CalendarMenu, type CalendarMenuItem } from './CalendarMenu'
import { formatDuration, formatTimeRange, toMinutes } from '../lib/time'
import { pointDuration, toCalEntry } from '../lib/calendar'
import { buildIcs } from '../lib/ics'
import { googleCalendarUrl } from '../lib/gcal'
import { outlookCalendarUrl } from '../lib/outlookCal'
import { downloadTextFile, icsFilename } from '../lib/download'

const TITLE_ID = 'event-sheet-title'

type CalendarAdd = (id: string, method: CalendarMethod) => void

/**
 * Full event detail, presented in the accessible bottom sheet. Every field is
 * data-driven (§5.3): time, category, audience, description, area, organizers,
 * related partners and the calendar/signup actions all come from JSON.
 */
export function EventSheet({
  event,
  eventInfo,
  group,
  relatedPartners,
  strings,
  onClose,
  onOpenPartner,
  onCalendarAdd,
}: {
  event: SubEvent
  eventInfo: EventInfo
  group: Group | undefined
  relatedPartners: Partner[]
  strings: Strings
  onClose: () => void
  onOpenPartner?: (id: string) => void
  onCalendarAdd?: CalendarAdd
}) {
  const s = strings.eventCard
  const entry = useMemo(
    () => toCalEntry(event, eventInfo, pointDuration(strings)),
    [event, eventInfo, strings],
  )
  const durationLabel = event.end
    ? formatDuration(toMinutes(event.end) - toMinutes(event.start))
    : s.pointEvent

  return (
    <Sheet labelledById={TITLE_ID} closeLabel={s.close} onClose={onClose}>
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
        {group ? <CategoryTag group={group} /> : null}
        <span style={{ ...META, alignSelf: 'center' }}>
          {formatTimeRange(event.start, event.end)} · {durationLabel}
        </span>
      </div>

      <h2 id={TITLE_ID} style={SHEET_TITLE}>
        {event.title}
      </h2>

      <AudiencePills audience={event.audience} label={s.audienceLabel} />

      {event.description ? <p style={BODY}>{event.description}</p> : null}

      {event.area ? (
        <Section title={s.areaTitle}>
          <p style={{ ...BODY, margin: 0 }}>{event.area}</p>
        </Section>
      ) : null}

      {event.organizers.length > 0 ? (
        <Section title={s.organizersTitle}>
          <List gap="var(--space-3)">
            {event.organizers.map((o, i) => (
              <OrganizerItem key={`${o.name}-${i}`} organizer={o} strings={strings} />
            ))}
          </List>
        </Section>
      ) : null}

      {relatedPartners.length > 0 ? (
        <Section title={s.partnersTitle}>
          <List gap="var(--space-2)">
            {relatedPartners.map((p) => (
              <li key={p.id}>
                <PartnerLink partner={p} label={strings.partners.visitSite} onOpenPartner={onOpenPartner} />
              </li>
            ))}
          </List>
        </Section>
      ) : null}

      <Section title={s.addToCalendar}>
        <CalendarActions entry={entry} eventId={event.id} strings={strings} onCalendarAdd={onCalendarAdd} />
      </Section>

      <SignupCta signup={event.signup} strings={strings} />
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 'var(--space-5)' }}>
      <h3 style={SUBHEAD}>{title}</h3>
      {children}
    </section>
  )
}

function List({ gap, children }: { gap: string; children: ReactNode }) {
  return <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap }}>{children}</ul>
}

function AudiencePills({ audience, label }: { audience: string[]; label: string }) {
  if (audience.length === 0) return null
  return (
    <ul style={PILL_ROW} aria-label={label}>
      {audience.map((a) => (
        <li key={a} style={PILL}>
          {a}
        </li>
      ))}
    </ul>
  )
}

function CalendarActions({
  entry,
  eventId,
  strings,
  onCalendarAdd,
}: {
  entry: CalEntry
  eventId: string
  strings: Strings
  onCalendarAdd?: CalendarAdd
}) {
  const s = strings.eventCard
  const items: CalendarMenuItem[] = [
    {
      key: 'gcal',
      label: s.googleCalendar,
      action: { kind: 'link', href: googleCalendarUrl(entry) },
      onSelect: () => onCalendarAdd?.(eventId, 'gcal'),
    },
    {
      key: 'outlook',
      label: s.outlookCalendar,
      action: { kind: 'link', href: outlookCalendarUrl(entry) },
      onSelect: () => onCalendarAdd?.(eventId, 'outlook'),
    },
    {
      key: 'ics',
      label: s.appleCalendar,
      action: {
        kind: 'button',
        onClick: () => downloadTextFile(icsFilename(eventId), buildIcs([entry], new Date())),
      },
      onSelect: () => onCalendarAdd?.(eventId, 'ics'),
    },
  ]
  return (
    <CalendarMenu triggerLabel={s.addToCalendar} menuLabel={s.calendarMenuLabel} triggerStyle={ACTION_SECONDARY} items={items} />
  )
}

function SignupCta({ signup, strings }: { signup: Signup; strings: Strings }) {
  const s = strings.eventCard
  const hasSignup = signup.mode !== 'none' && Boolean(signup.url)
  return (
    <div style={{ marginTop: 'var(--space-5)' }}>
      {hasSignup ? (
        <a href={signup.url as string} target="_blank" rel="noopener noreferrer" style={ACTION_PRIMARY}>
          {s.signup} ↗
        </a>
      ) : (
        <p style={{ ...META, margin: 0 }}>{s.dropIn}</p>
      )}
    </div>
  )
}

function OrganizerItem({ organizer, strings }: { organizer: Organizer; strings: Strings }) {
  const meta = [organizer.role, organizerTypeLabel(organizer.type, strings)].filter(Boolean).join(' · ')
  return (
    <li>
      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)' }}>
        {organizer.name}
      </div>
      {meta ? <div style={{ ...META, marginTop: 2 }}>{meta}</div> : null}
      {organizer.url ? (
        <a href={organizer.url} target="_blank" rel="noopener noreferrer" style={LINK}>
          {strings.partners.visitSite} ↗
        </a>
      ) : null}
    </li>
  )
}

function PartnerLink({
  partner,
  label,
  onOpenPartner,
}: {
  partner: Partner
  label: string
  onOpenPartner?: (id: string) => void
}) {
  const content = (
    <>
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)' }}>
        {partner.name}
      </span>
      <span style={{ ...META, marginLeft: 8 }}>{partner.category}</span>
    </>
  )
  if (onOpenPartner) {
    return (
      <button type="button" onClick={() => onOpenPartner(partner.id)} style={{ ...PARTNER_ROW, cursor: 'pointer' }}>
        {content}
        <span aria-hidden style={{ color: 'var(--accent)' }}>›</span>
      </button>
    )
  }
  return partner.url ? (
    <a href={partner.url} target="_blank" rel="noopener noreferrer" style={PARTNER_ROW}>
      {content}
      <span aria-hidden style={{ color: 'var(--accent)' }}>↗</span>
    </a>
  ) : (
    <div style={PARTNER_ROW} aria-label={`${partner.name} · ${label}`}>
      {content}
    </div>
  )
}

function organizerTypeLabel(type: Organizer['type'], strings: Strings): string {
  const map: Record<Organizer['type'], string> = {
    person: strings.eventCard.typePerson,
    community: strings.eventCard.typeCommunity,
    org: strings.eventCard.typeOrg,
  }
  return map[type] ?? ''
}

const META = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-muted)',
}

const SHEET_TITLE = {
  margin: '0 0 var(--space-3)',
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-title)',
  lineHeight: 'var(--lh-snug)',
  color: 'var(--text-strong)',
}

const BODY = {
  margin: 'var(--space-3) 0 0',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--fs-body)',
  lineHeight: 'var(--lh-normal)',
  color: 'var(--text-body)',
}

const SUBHEAD = {
  margin: '0 0 var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-caption)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase' as const,
  color: 'var(--text-muted)',
}

const PILL_ROW = {
  listStyle: 'none',
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 'var(--space-2)',
  margin: '0 0 var(--space-2)',
  padding: 0,
}

const PILL = {
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-medium)',
  fontSize: 'var(--fs-caption)',
  color: 'var(--text-body)',
  background: 'var(--surface-card)',
  border: 'var(--border-hairline) solid var(--border-card)',
  borderRadius: 'var(--radius-pill)',
  padding: '4px 10px',
}

const PARTNER_ROW = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  width: '100%',
  minHeight: 44,
  textAlign: 'left' as const,
  padding: '10px 14px',
  background: 'var(--surface-card)',
  border: 'var(--border-hairline) solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-card)',
  textDecoration: 'none',
  font: 'inherit',
}

const LINK = {
  display: 'inline-block',
  marginTop: 4,
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--fs-body-sm)',
  fontWeight: 'var(--fw-semibold)',
  color: 'var(--accent-text)',
  textDecoration: 'none',
}

const ACTION_SECONDARY = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
  padding: '10px 16px',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-strong)',
  background: 'var(--surface-card)',
  border: 'var(--border-sticker) solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  textDecoration: 'none',
}

const ACTION_PRIMARY = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 48,
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-bold)',
  fontSize: '15px',
  color: 'var(--accent-on)',
  background: 'var(--accent-strong)',
  borderRadius: 'var(--radius-md)',
  textDecoration: 'none',
}
