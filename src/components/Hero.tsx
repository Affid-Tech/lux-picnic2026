import type { EventInfo, Strings } from '../types'
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
}: {
  event: EventInfo
  strings: Strings
  onAddWholeDay: () => void
}) {
  const hasMap = Boolean(event.location.mapUrl)
  const locationText = event.location.name || strings.hero.locationTbd

  return (
    <header
      style={{
        padding: 'var(--space-8) var(--gutter) var(--space-7)',
        background: 'var(--surface-page)',
      }}
    >
      <p
        style={{
          margin: '0 0 var(--space-4)',
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--fw-semibold)',
          fontSize: 'var(--fs-caption)',
          letterSpacing: 'var(--ls-eyebrow)',
          textTransform: 'uppercase',
          color: 'var(--accent-text)',
        }}
      >
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
        <MetaRow
          label="Где"
          value={
            hasMap ? (
              <a
                href={event.location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 'var(--fw-semibold)' }}
              >
                {locationText} · {strings.hero.openMap} ↗
              </a>
            ) : (
              locationText
            )
          }
        />
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
    </header>
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
