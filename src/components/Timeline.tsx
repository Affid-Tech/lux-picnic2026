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
}: {
  events: SubEvent[]
  groups: Group[]
  strings: Strings
  onOpen: (id: string) => void
}) {
  const [filter, setFilter] = useState<FilterState>({ group: 'all', audience: 'all' })

  const audiences = useMemo(() => deriveAudienceBuckets(events), [events])
  const filtered = useMemo(() => filterEvents(events, filter), [events, filter])

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
      </div>

      <Agenda events={filtered} groups={groups} strings={strings} onOpen={onOpen} />
    </section>
  )
}
