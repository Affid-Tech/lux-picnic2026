import type { CSSProperties } from 'react'
import type { Group, Strings } from '../types'
import type { AudienceBucket, FilterState } from '../lib/filter'

/**
 * Sticky filter chips, built entirely from data. Group chips come from
 * groups.json; audience chips are the coarse buckets derived from the events.
 * The active chip flips to the dark-brown fill (per the design invariants);
 * every group chip pairs its colour with a dot + label so colour is never the
 * only signal.
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
  const allLabel = strings.timeline.filterAll

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <ChipRow ariaLabel="Фильтр по программе" label={strings.timeline.filterGroupLabel}>
        <Chip
          label={allLabel}
          active={state.group === 'all'}
          onClick={() => onChange({ ...state, group: 'all' })}
        />
        {groups.map((g) => (
          <Chip
            key={g.id}
            label={g.short || g.label}
            ariaLabel={g.label}
            dotColor={g.color}
            active={state.group === g.id}
            onClick={() => onChange({ ...state, group: g.id })}
          />
        ))}
      </ChipRow>

      {audiences.length > 0 ? (
        <ChipRow ariaLabel="Фильтр по аудитории" label={strings.timeline.filterAudienceLabel}>
          <Chip
            label={allLabel}
            active={state.audience === 'all'}
            onClick={() => onChange({ ...state, audience: 'all' })}
          />
          {audiences.map((a) => (
            <Chip
              key={a}
              label={a}
              active={state.audience === a}
              onClick={() => onChange({ ...state, audience: a })}
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      {/* Fixed-width row caption so the two filter dimensions read distinctly
          (they both start with a "Все" chip) and the chips align across rows. */}
      {label ? <span style={ROW_LABEL}>{label}</span> : null}
      <div
        role="group"
        aria-label={ariaLabel}
        style={{
          display: 'flex',
          flex: 1,
          minWidth: 0,
          gap: 'var(--space-2)',
          overflowX: 'auto',
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
  flex: 'none',
  width: 74,
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
    padding: '0 14px',
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
