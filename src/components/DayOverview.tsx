import { useMemo } from 'react'
import type { EventInfo, Group, Strings, SubEvent } from '../types'
import { ganttDomain, hourTicks, laneSegments, nowMarkerPct, type Segment } from '../lib/gantt'
import { fromMinutes } from '../lib/time'
import { useNow } from '../hooks/useNow'

const LANE_H = 48 // px per lane row (roomy enough for ≥44px tap targets)
const BLOCK_H = 40 // px ranged-block height
const MIN_W = 28 // px min block width (holds the dot when very short)
const POINT_HIT = 44 // px transparent tap area around a point sticker
const POINT_DOT = 30 // px visible circular sticker for a point event
const TITLE_MIN_WIDTH_PCT = 15 // below this a ranged block shows the dot only (a
// ~1h block is too narrow for a legible label — better a clean dot than a stub)

/**
 * Collapsible "Обзор дня" mini-Gantt. Lanes are packed by concurrency (not by
 * group); each block is a sticker (cream fill, coloured outline + dot, ink
 * title) so the title stays legible at AA contrast while colour still carries
 * the group. Blocks are click-ready (open the event, phase 4). A day-of
 * "сейчас" marker tracks the client clock only on the event date.
 *
 * Reduced-motion safe by construction: the overview expands instantly (no
 * height/scroll animation), so there is no motion to disable.
 */
export function DayOverview({
  event,
  events,
  groups,
  strings,
  open,
  onToggle,
  onOpen,
}: {
  event: EventInfo
  events: SubEvent[]
  groups: Group[]
  strings: Strings
  open: boolean
  onToggle: () => void
  onOpen: (id: string) => void
}) {
  const groupById = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups])
  const domain = useMemo(() => ganttDomain(events, event), [events, event])
  const segments = useMemo(() => laneSegments(events, groupById, domain), [events, groupById, domain])
  const ticks = useMemo(() => hourTicks(domain), [domain])
  const laneCount = useMemo(() => segments.reduce((n, s) => Math.max(n, s.lane + 1), 1), [segments])

  const now = useNow(event.date)
  const nowPct = nowMarkerPct(now, event.date, domain)
  const span = domain.endMin - domain.startMin
  const pctOf = (min: number) => ((min - domain.startMin) / span) * 100

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: 'var(--border-hairline) solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}
    >
      {/* Heading for the document outline; the visible control below is the
          disclosure button. */}
      <h2 className="sr-only">{strings.timeline.overviewTitle}</h2>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="day-overview-body"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 44,
          padding: '10px var(--space-4)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-semibold)',
          fontSize: 'var(--fs-heading)',
          color: 'var(--text-strong)',
        }}
      >
        {strings.timeline.overviewTitle}
        <span aria-hidden style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open ? (
        <div id="day-overview-body" style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <HourAxis ticks={ticks} pctOf={pctOf} />
          <div style={{ position: 'relative', height: laneCount * LANE_H, marginTop: 4 }}>
            <Gridlines ticks={ticks} pctOf={pctOf} />
            {segments.map((s) => (
              <GanttBlock key={s.id} seg={s} onOpen={onOpen} />
            ))}
            {nowPct !== null ? <NowMarker pct={nowPct} label={strings.timeline.nowMarker} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function HourAxis({ ticks, pctOf }: { ticks: number[]; pctOf: (min: number) => number }) {
  return (
    <div style={{ position: 'relative', height: 14 }} aria-hidden>
      {ticks.map((t) => (
        <span
          key={t}
          style={{
            position: 'absolute',
            left: `${pctOf(t)}%`,
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-mono)',
          }}
        >
          {fromMinutes(t).slice(0, 2)}
        </span>
      ))}
    </div>
  )
}

function Gridlines({ ticks, pctOf }: { ticks: number[]; pctOf: (min: number) => number }) {
  return (
    <>
      {ticks.map((t) => (
        <div
          key={t}
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${pctOf(t)}%`,
            borderLeft: 'var(--border-hairline) solid var(--border-soft)',
          }}
        />
      ))}
    </>
  )
}

function GanttBlock({ seg, onOpen }: { seg: Segment; onOpen: (id: string) => void }) {
  const range = seg.end ? `${seg.start}–${seg.end}` : seg.start
  const ariaLabel = [seg.title, seg.groupLabel, range].filter(Boolean).join(', ')
  // Shared positioning only; each branch adds its own visible sticker styling.
  const base = {
    position: 'absolute' as const,
    left: `${seg.leftPct}%`,
    cursor: 'pointer',
    padding: 0,
  }

  if (seg.point) {
    // Point event: a 44px transparent hit area around a compact circular
    // sticker (cream fill, coloured outline, filled dot).
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => onOpen(seg.id)}
        style={{
          ...base,
          top: seg.lane * LANE_H + (LANE_H - POINT_HIT) / 2,
          height: POINT_HIT,
          width: POINT_HIT,
          transform: 'translateX(-50%)',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: POINT_DOT,
            height: POINT_DOT,
            borderRadius: '50%',
            background: 'var(--surface-card)',
            border: `var(--border-sticker) solid ${seg.color}`,
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onOpen(seg.id)}
      style={{
        ...base,
        top: seg.lane * LANE_H + (LANE_H - BLOCK_H) / 2,
        height: BLOCK_H,
        width: `${seg.widthPct}%`,
        minWidth: MIN_W,
        background: 'var(--surface-card)',
        border: `var(--border-sticker) solid ${seg.color}`,
        boxShadow: 'var(--shadow-card)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 6px',
        overflow: 'hidden',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: seg.color, flex: 'none' }} />
      {/* Only show the title when the block is wide enough to hold something
          legible; narrow blocks stay a clean dot chip (aria-label still names
          the event for assistive tech). */}
      {seg.widthPct >= TITLE_MIN_WIDTH_PCT ? (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--fw-semibold)',
            fontSize: '11px',
            lineHeight: 1,
            color: 'var(--text-strong)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {seg.title}
        </span>
      ) : null}
    </button>
  )
}

function NowMarker({ pct, label }: { pct: number; label: string }) {
  return (
    <div
      style={{ position: 'absolute', top: -14, bottom: 0, left: `${pct}%`, pointerEvents: 'none' }}
    >
      <div style={{ position: 'absolute', top: 0, bottom: 0, borderLeft: '2px solid var(--accent)' }} />
      <span
        style={{
          position: 'absolute',
          top: -4,
          left: 3,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-caption)',
          fontWeight: 'var(--fw-semibold)',
          color: 'var(--accent-hover)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  )
}
