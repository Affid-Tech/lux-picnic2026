import type { Strings, SubEvent } from '../types'
import { selectNowNext, liveEvents, type NowNextPhase } from '../lib/nowNext'

/**
 * Day-of status pill: names the earliest-started event currently running
 * (+N for the rest), or a short phase message before/after the event. Tapping
 * it scrolls to that event's row in the agenda. Sized to sit above the Hero
 * without competing with it for space. Shows only on the event date
 * (`selectNowNext` returns `off` otherwise).
 */
export function NowNextBanner({
  now,
  events,
  dateIso,
  pointDurationMin,
  strings,
  onSeeAll,
}: {
  now: Date
  events: SubEvent[]
  dateIso: string
  pointDurationMin: number
  strings: Strings
  onSeeAll: () => void
}) {
  const state = selectNowNext(now, events, dateIso, pointDurationMin)
  if (state.phase === 'off') return null

  const s = strings.nowNext
  // Earliest-started first (not selectNowNext's soonest-ending order) so the
  // name shown here always matches the row `onSeeAll` scrolls to.
  const live = state.phase === 'live' ? liveEvents(now, events, dateIso, pointDurationMin) : []
  const { isLive, label } = pillContent(state.phase, live, s)

  return (
    <div style={WRAP}>
      <button type="button" onClick={onSeeAll} aria-label={`${s.regionLabel}: ${label}`} style={PILL}>
        <span
          aria-hidden
          style={{ ...DOT, background: isLive ? 'var(--accent)' : 'var(--text-muted)', opacity: isLive ? 1 : 0.55 }}
        />
        <span style={LABEL_TEXT}>{label}</span>
        <span aria-hidden style={ARROW}>
          ↓
        </span>
      </button>
    </div>
  )
}

function pillContent(
  phase: Exclude<NowNextPhase, 'off'>,
  live: SubEvent[],
  s: Strings['nowNext'],
): { isLive: boolean; label: string } {
  if (phase === 'before') return { isLive: false, label: s.notStarted }
  if (phase === 'after') return { isLive: false, label: s.endedToday }
  if (live.length === 0) return { isLive: true, label: `${s.nowLabel}: ${s.betweenEvents}` }
  const extra = live.length - 1
  const names = extra > 0 ? `${live[0].title} +${extra} ${s.moreSuffix}` : live[0].title
  return { isLive: true, label: `${s.nowLabel}: ${names}` }
}

const WRAP = {
  padding: 'var(--space-4) var(--gutter) 0',
}

const PILL = {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: 8,
  minHeight: 44,
  padding: '0 14px',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)' as const,
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-strong)',
  background: 'var(--surface-card)',
  border: 'var(--border-sticker) solid var(--accent)',
  borderRadius: 'var(--radius-pill)',
  boxShadow: 'var(--shadow-card)',
  cursor: 'pointer',
}

const DOT = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  flex: 'none' as const,
}

const LABEL_TEXT = {
  flex: '1 1 auto',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
  textAlign: 'left' as const,
}

const ARROW = {
  flex: 'none' as const,
  color: 'var(--accent-text)',
}
