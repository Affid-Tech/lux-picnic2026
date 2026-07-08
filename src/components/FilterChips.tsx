import type { CSSProperties } from 'react'
import type { Group, Strings } from '../types'
import type { AudienceBucket, FilterState } from '../lib/filter'

/**
 * Sticky filter chips, built entirely from data. Group chips come from
 * groups.json; audience chips are the coarse buckets derived from the events.
 * Each chip is an independent on/off toggle (multi-select, no "Все" chip) —
 * clicking a chip adds or removes it from the selection; when nothing is
 * selected in a row, every event matches that row (see filterEvents). The
 * active chip flips to the dark-brown fill (per the design invariants); every
 * group chip pairs its colour with a dot + label so colour is never the only
 * signal.
 */
export function FilterChips({
  groups,
  audiences,
  state,
  onChange,
  strings,
}: {
  groups: Group[]
  audiences: AudienceBucket[]
  state: FilterState
  onChange: (next: FilterState) => void
  strings: Strings
}) {
  const toggleGroup = (id: string) => {
    const next = new Set(state.groups)
    next.has(id) ? next.delete(id) : next.add(id)
    onChange({ ...state, groups: next })
  }
  const toggleAudience = (a: AudienceBucket) => {
    const next = new Set(state.audiences)
    next.has(a) ? next.delete(a) : next.add(a)
    onChange({ ...state, audiences: next })
  }

  return (
    // minWidth: 0 so this grid item can shrink inside the sticky bar's track
    // instead of growing to its max-content width; gridTemplateColumns keeps
    // its own single column from doing the same to the chip rows below it.
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--space-2)', minWidth: 0 }}>
      <ChipRow ariaLabel="Фильтр по программе" label={strings.timeline.filterGroupLabel}>
        {groups.map((g) => (
          <Chip
            key={g.id}
            label={g.short || g.label}
            ariaLabel={g.label}
            dotColor={g.color}
            active={state.groups.has(g.id)}
            onClick={() => toggleGroup(g.id)}
          />
        ))}
      </ChipRow>

      {audiences.length > 0 ? (
        <ChipRow ariaLabel="Фильтр по аудитории" label={strings.timeline.filterAudienceLabel}>
          {audiences.map((a) => (
            <Chip
              key={a}
              label={a}
              active={state.audiences.has(a)}
              onClick={() => toggleAudience(a)}
            />
          ))}
        </ChipRow>
      ) : null}
    </div>
  )
}

function ChipRow({
  children,
  ariaLabel,
  label,
}: {
  children: React.ReactNode
  ariaLabel: string
  label?: string
}) {
  return (
    // Label stacks above its chips (rather than sitting beside them) so the
    // chip row gets the sticky bar's full width — with a left-hand label
    // column, four group chips didn't fit without horizontal scroll.
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', minWidth: 0 }}>
      {label ? <span style={ROW_LABEL}>{label}</span> : null}
      <div
        role="group"
        aria-label={ariaLabel}
        className="pk-chip-row"
        style={{
          display: 'flex',
          // Row of scrolling pills on mobile/tablet; desktop.css flips this
          // to a stretched vertical list in the sidebar (see Timeline.tsx).
          flexDirection: 'var(--chip-row-dir, row)' as CSSProperties['flexDirection'],
          minWidth: 0,
          gap: 'var(--space-1)',
          overflowX: 'var(--chip-row-overflow, auto)' as CSSProperties['overflowX'],
          paddingBottom: 2,
          scrollbarWidth: 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}

const ROW_LABEL: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-caption)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
}

function Chip({
  label,
  active,
  onClick,
  dotColor,
  ariaLabel,
}: {
  label: string
  active: boolean
  onClick: () => void
  dotColor?: string
  ariaLabel?: string
}) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    flex: 'none',
    minHeight: 44,
    padding: '0 12px',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-semibold)',
    fontSize: 'var(--fs-body-sm)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    borderRadius: 'var(--radius-pill)',
    border: 'var(--border-sticker) solid',
    borderColor: active ? 'transparent' : 'var(--border-card)',
    background: active ? 'var(--surface-inverse)' : 'var(--surface-card)',
    color: active ? 'var(--text-on-inverse)' : 'var(--text-body)',
    boxShadow: active ? 'var(--shadow-card)' : 'none',
  }
  return (
    <button type="button" aria-pressed={active} aria-label={ariaLabel} onClick={onClick} style={style}>
      {dotColor ? (
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flex: 'none' }} />
      ) : null}
      {label}
    </button>
  )
}
