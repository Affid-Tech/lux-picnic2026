import { useMemo, useState } from 'react'
import type { EventInfo, Group, Strings, SubEvent } from '../types'
import { deriveAudienceBuckets, filterEvents, type FilterState } from '../lib/filter'
import { FilterChips } from './FilterChips'
import { DayOverview } from './DayOverview'
import { Agenda } from './Agenda'

/**
 * Timeline section. Owns the filter and overview-open state, hosts the sticky
 * filter chips, the collapsible "Обзор дня" mini-Gantt, and the filtered
 * vertical agenda. Everything below is driven by the JSON data.
 */
export function Timeline({
  event,
  events,
  groups,
  strings,
  onOpen,
}: {
  event: EventInfo
  events: SubEvent[]
  groups: Group[]
  strings: Strings
  onOpen: (id: string) => void
}) {
  const [filter, setFilter] = useState<FilterState>({ group: 'all', audience: 'all' })
  // Collapsed by default (mobile-first): the overview expands on demand.
  const [overviewOpen, setOverviewOpen] = useState(false)

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

      {/* Обзор дня mini-Gantt — always shows the full day, independent of the
          agenda filter, so parallelism stays glanceable. */}
      <div style={{ padding: 'var(--space-5) var(--gutter) 0' }}>
        <DayOverview
          event={event}
          events={events}
          groups={groups}
          strings={strings}
          open={overviewOpen}
          onToggle={() => setOverviewOpen((v) => !v)}
          onOpen={onOpen}
        />
      </div>

      <Agenda events={filtered} groups={groups} strings={strings} onOpen={onOpen} />
    </section>
  )
}
