import type { EventInfo, Group, Strings, SubEvent } from '../types'
import { Agenda } from './Agenda'

/**
 * Timeline section shell (phase 2 skeleton). Hosts the sticky filter-bar
 * scaffold and the vertical agenda. Phase 3 fills the sticky bar with filter
 * chips and adds the "Обзор дня" mini-Gantt above the agenda.
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
  // `event` is threaded through now so phase 3's Gantt can read the day window;
  // referenced here to keep it in the contract without an unused-var warning.
  void event

  return (
    <section style={{ background: 'var(--surface-panel)' }}>
      {/* Sticky filter-bar scaffold — phase 3 mounts FilterChips here. */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--surface-panel)',
          borderBottom: 'var(--border-hairline) solid var(--border-card)',
          padding: 'var(--space-3) var(--gutter)',
          minHeight: 44,
        }}
      />

      <Agenda events={events} groups={groups} strings={strings} onOpen={onOpen} />
    </section>
  )
}
