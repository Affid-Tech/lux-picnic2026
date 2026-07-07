import { useMemo, useState } from 'react'
import type { Group, Strings, SubEvent } from '../types'
import { deriveAudienceBuckets, filterEvents, type FilterState } from '../lib/filter'
import { FilterChips } from './FilterChips'
import { Agenda } from './Agenda'

/**
 * Timeline section. Owns the filter state, hosts the sticky filter chips and the
 * filtered vertical agenda. Everything below is driven by the JSON data.
 */
export function Timeline({
  events,
  groups,
  strings,
  onOpen,
  liveIds,
  onJumpToNow,
}: {
  events: SubEvent[]
  groups: Group[]
  strings: Strings
  onOpen: (id: string) => void
  /** Ids of currently-running events (day-of only). */
  liveIds?: Set<string>
  /** Scroll the agenda to the first live row. Shown only when something is live. */
  onJumpToNow?: () => void
}) {
  const [filter, setFilter] = useState<FilterState>({ group: 'all', audience: 'all' })

  const audiences = useMemo(() => deriveAudienceBuckets(events), [events])
  const filtered = useMemo(() => filterEvents(events, filter), [events, filter])
  const showJump = Boolean(onJumpToNow && liveIds && liveIds.size > 0)

  return (
    <section style={{ background: 'var(--surface-panel)' }}>
      {/* Sticky filter bar. */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--surface-panel)',
          borderBottom: 'var(--border-hairline) solid var(--border-card)',
          padding: 'var(--space-3) var(--gutter)',
          display: 'grid',
          // Explicit minmax(0, 1fr) keeps the track pinned to the available
          // width; a bare 'auto' track sizes to the max-content width of its
          // item (the chip rows), blowing out past the frame instead of
          // letting FilterChips' own overflow-x:auto scroll internally.
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'var(--space-2)',
        }}
      >
        <FilterChips
          groups={groups}
          audiences={audiences}
          state={filter}
          onChange={setFilter}
          strings={strings}
        />
        {showJump ? (
          <button type="button" onClick={onJumpToNow} style={JUMP_BTN}>
            <span aria-hidden style={JUMP_DOT} />
            {strings.timeline.jumpToNow} ↓
          </button>
        ) : null}
      </div>

      <Agenda events={filtered} groups={groups} strings={strings} onOpen={onOpen} liveIds={liveIds} />
    </section>
  )
}

const JUMP_BTN = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 44,
  padding: '0 14px',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)' as const,
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--accent-text)',
  background: 'var(--surface-card)',
  border: 'var(--border-sticker) solid var(--accent)',
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
}

const JUMP_DOT = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: 'var(--accent)',
  flex: 'none' as const,
}
