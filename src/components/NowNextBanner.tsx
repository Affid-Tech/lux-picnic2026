import { useState } from 'react'
import type { Strings, SubEvent } from '../types'
import { selectNowNext, type NowNext } from '../lib/nowNext'
import { formatTimeRange } from '../lib/time'

const DISMISS_KEY = 'piknik-nownext-dismissed'

/**
 * Day-of "Сейчас / Далее" banner. Pure presentational: given the client clock
 * (`now`, from useNow) it surfaces what's on now and what's next, each linking
 * to its card. Shows only on the event date (selectNowNext returns `off`
 * otherwise). Dismissible, persisted for the session. No motion — nothing to
 * disable under reduced-motion.
 */
/** Max live events listed before collapsing the rest into a "+N ещё" jump. */
const MAX_LIVE = 3

export function NowNextBanner({
  now,
  events,
  dateIso,
  pointDurationMin,
  strings,
  onOpen,
  onSeeAll,
}: {
  now: Date
  events: SubEvent[]
  dateIso: string
  pointDurationMin: number
  strings: Strings
  onOpen: (id: string) => void
  /** Jump to the live rows in the agenda (used by the "+N ещё" affordance). */
  onSeeAll?: () => void
}) {
  const [dismissed, setDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === '1',
  )
  const state = selectNowNext(now, events, dateIso, pointDurationMin)
  if (state.phase === 'off' || dismissed) return null

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Private mode etc. — dismissal just won't persist.
    }
    setDismissed(true)
  }

  const s = strings.nowNext
  return (
    <aside aria-label={s.regionLabel} style={BANNER}>
      <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 'var(--space-2)' }}>
        <BannerBody state={state} strings={strings} onOpen={onOpen} onSeeAll={onSeeAll} />
      </div>
      <button type="button" onClick={dismiss} aria-label={s.dismiss} style={DISMISS_BTN}>
        <span aria-hidden>✕</span>
      </button>
    </aside>
  )
}

function BannerBody({
  state,
  strings,
  onOpen,
  onSeeAll,
}: {
  state: NowNext
  strings: Strings
  onOpen: (id: string) => void
  onSeeAll?: () => void
}) {
  const s = strings.nowNext
  if (state.phase === 'before') {
    return (
      <>
        <Line label={s.nowLabel}>{s.notStarted}</Line>
        {state.next ? <NextLine event={state.next} label={s.nextLabel} onOpen={onOpen} /> : null}
      </>
    )
  }
  if (state.phase === 'after') {
    return <Line label={s.nowLabel}>{s.endedToday}</Line>
  }
  const shown = state.now.slice(0, MAX_LIVE)
  const extra = state.now.length - shown.length
  return (
    <>
      <Line label={s.nowLabel}>
        {state.now.length > 0 ? (
          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'baseline' }}>
            {shown.map((e, i) => (
              <EventLink key={e.id} event={e} onOpen={onOpen} trailing={i < shown.length - 1 || extra > 0} />
            ))}
            {extra > 0 ? (
              <button type="button" onClick={onSeeAll} style={MORE_BTN}>
                +{extra} {s.moreSuffix} ↓
              </button>
            ) : null}
          </span>
        ) : (
          s.betweenEvents
        )}
      </Line>
      {state.next ? <NextLine event={state.next} label={s.nextLabel} onOpen={onOpen} /> : null}
    </>
  )
}

function NextLine({
  event,
  label,
  onOpen,
}: {
  event: SubEvent
  label: string
  onOpen: (id: string) => void
}) {
  return (
    <Line label={label}>
      <EventLink event={event} onOpen={onOpen} withTime />
    </Line>
  )
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline' }}>
      <span style={LABEL}>{label}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-body)', minWidth: 0 }}>
        {children}
      </span>
    </p>
  )
}

function EventLink({
  event,
  onOpen,
  withTime = false,
  trailing = false,
}: {
  event: SubEvent
  onOpen: (id: string) => void
  withTime?: boolean
  trailing?: boolean
}) {
  return (
    <button type="button" onClick={() => onOpen(event.id)} style={LINK}>
      {event.title}
      {withTime ? <span style={{ color: 'var(--text-mono)' }}> · {formatTimeRange(event.start, event.end)}</span> : null}
      {trailing ? <span aria-hidden style={{ color: 'var(--text-mono)' }}> ·</span> : null}
    </button>
  )
}

const BANNER = {
  display: 'flex',
  gap: 'var(--space-3)',
  alignItems: 'flex-start',
  margin: 'var(--space-4) var(--gutter) 0',
  padding: 'var(--space-3) var(--space-4)',
  background: 'var(--surface-card)',
  border: 'var(--border-sticker) solid var(--accent)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}

const LABEL = {
  flex: 'none',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-caption)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase' as const,
  color: 'var(--accent-text)',
}

const LINK = {
  padding: 0,
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-strong)',
  background: 'none',
  border: 'none',
  textAlign: 'left' as const,
  textDecoration: 'underline',
  textDecorationColor: 'var(--accent)',
  cursor: 'pointer',
}

const MORE_BTN = {
  padding: 0,
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)' as const,
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--accent-text)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
}

const DISMISS_BTN = {
  flex: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  margin: 'calc(-1 * var(--space-2)) calc(-1 * var(--space-2)) 0 0',
  fontSize: '15px',
  color: 'var(--text-muted)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
}
