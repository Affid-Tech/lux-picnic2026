import type { EventInfo, EventOrganizer, Strings } from '../types'
import { formatDateLong, formatWeekday } from '../lib/date'

/**
 * Hero / event header — name, tagline, date, start time, location (+ map link)
 * and the primary "add the whole day to calendar" action. All copy is driven
 * by event.json / strings.json.
 */
export function Hero({
  event,
  strings,
  onAddWholeDay,
  compact = false,
}: {
  event: EventInfo
  strings: Strings
  onAddWholeDay: () => void
  /** Day-of variant: a slim strip (name · date · where · calendar link) so the
   *  live "Сейчас / Далее" block owns the top of the screen on the event date. */
  compact?: boolean
}) {
  const hasMap = Boolean(event.location.mapUrl)

  if (compact) {
    return (
      <header style={{ padding: 'var(--space-6) var(--gutter) var(--space-5)', background: 'var(--surface-page)' }}>
        <p style={EYEBROW}>
          {formatDateLong(event.date)} · {formatWeekday(event.date)}
        </p>
        <h1
          style={{
            margin: '0 0 var(--space-3)',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-bold)',
            fontSize: 'var(--fs-title)',
            lineHeight: 'var(--lh-snug)',
            letterSpacing: 'var(--ls-display)',
            color: 'var(--text-strong)',
          }}
        >
          {event.name}
        </h1>
        <dl style={{ margin: 0 }}>
          <MetaRow label="Где" value={locationValue(event, strings, hasMap)} />
        </dl>
        <button type="button" onClick={onAddWholeDay} style={COMPACT_CAL_BTN}>
          {strings.hero.addWholeDay} ↓
        </button>
      </header>
    )
  }

  return (
    <header
      style={{
        padding: 'var(--space-8) var(--gutter) var(--space-7)',
        background: 'var(--surface-page)',
      }}
    >
      <p style={EYEBROW}>
        {formatDateLong(event.date)} · {formatWeekday(event.date)}
      </p>

      <h1
        style={{
          margin: '0 0 var(--space-3)',
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--fs-hero)',
          lineHeight: 'var(--lh-hero)',
          letterSpacing: 'var(--ls-display)',
          color: 'var(--text-strong)',
        }}
      >
        {event.name}
      </h1>

      <p
        style={{
          margin: '0 0 var(--space-5)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-body)',
          lineHeight: 'var(--lh-normal)',
          color: 'var(--text-body)',
          maxWidth: '34ch',
        }}
      >
        {event.tagline}
      </p>

      {/* Hero media — real photo in a rounded frame, or the diagonal-stripe
          placeholder with a mono caption chip until one is supplied. */}
      <HeroMedia event={event} />

      <dl style={{ margin: '0 0 var(--space-5)' }}>
        <MetaRow label="Начало" value={event.startTime} />
        <MetaRow label="Где" value={locationValue(event, strings, hasMap)} />
        {event.organizer ? <MetaRow label="Кто" value={organizerValue(event.organizer)} /> : null}
      </dl>

      <button
        type="button"
        onClick={onAddWholeDay}
        style={{
          width: '100%',
          minHeight: 48,
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--fw-bold)',
          fontSize: '15px',
          color: 'var(--accent-on)',
          background: 'var(--accent-strong)',
          border: 'var(--border-sticker) solid transparent',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          padding: '14px 18px',
        }}
      >
        {strings.hero.addWholeDay}
      </button>

      {event.note ? (
        <p
          style={{
            margin: 'var(--space-3) 0 0',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-body-sm)',
            color: 'var(--text-muted)',
          }}
        >
          {event.note}
        </p>
      ) : null}

      {strings.hero.scrollHint ? (
        <p
          style={{
            margin: 'var(--space-4) 0 0',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-caption)',
            letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {strings.hero.scrollHint}
        </p>
      ) : null}
    </header>
  )
}

/** "Где" value — a map link when a URL is present, otherwise plain text. */
function locationValue(event: EventInfo, strings: Strings, hasMap: boolean): React.ReactNode {
  const text = event.location.name || strings.hero.locationTbd
  if (!hasMap) return text
  return (
    <a href={event.location.mapUrl} target="_blank" rel="noopener noreferrer" style={HERO_LINK}>
      {text} · {strings.hero.openMap} ↗
    </a>
  )
}

/** "Кто" value — the main organizer, linked to its site when available. */
function organizerValue(organizer: EventOrganizer): React.ReactNode {
  if (!organizer.url) return organizer.name
  return (
    <a href={organizer.url} target="_blank" rel="noopener noreferrer" style={HERO_LINK}>
      {organizer.name} ↗
    </a>
  )
}

function HeroMedia({ event }: { event: EventInfo }) {
  const frame = {
    position: 'relative' as const,
    height: 180,
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    marginBottom: 'var(--space-6)',
    border: 'var(--border-hairline) solid var(--border-card)',
  }

  if (event.heroImage) {
    return (
      <div style={frame}>
        <img
          src={event.heroImage}
          alt={event.name}
          loading="eager"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        ...frame,
        background:
          'repeating-linear-gradient(45deg, var(--cream-300) 0 14px, var(--cream-400) 14px 28px)',
        display: 'flex',
        alignItems: 'flex-end',
        padding: 'var(--space-3)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono)',
          color: 'var(--text-mono)',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 10px',
          border: 'var(--border-hairline) solid var(--border-card)',
        }}
      >
        {event.heroCaption || 'фото · главная поляна'}
      </span>
    </div>
  )
}

const EYEBROW = {
  margin: '0 0 var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)' as const,
  fontSize: 'var(--fs-caption)',
  letterSpacing: 'var(--ls-eyebrow)',
  textTransform: 'uppercase' as const,
  color: 'var(--accent-text)',
}

const HERO_LINK = {
  color: 'var(--accent-text)',
  textDecoration: 'none',
  fontWeight: 'var(--fw-semibold)' as const,
}

const COMPACT_CAL_BTN = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
  marginTop: 'var(--space-4)',
  padding: '0 2px',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)' as const,
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--accent-text)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', padding: '6px 0' }}>
      <dt
        style={{
          flex: 'none',
          width: 56,
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--fw-semibold)',
          fontSize: 'var(--fs-caption)',
          letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          paddingTop: 2,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-body)',
          color: 'var(--text-body)',
        }}
      >
        {value}
      </dd>
    </div>
  )
}
