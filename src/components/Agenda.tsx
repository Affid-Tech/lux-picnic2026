import { useMemo } from 'react'
import type { Group, Strings, SubEvent } from '../types'
import { CategoryTag } from './CategoryTag'
import { SectionHeading } from './SectionHeading'
import { formatDuration, formatTimeRange, isPointEvent, parallelCount, sortEvents, toMinutes } from '../lib/time'

/**
 * Vertical agenda: a time rail on the left, category-tagged event rows on the
 * right. Point events render as slim markers; overlapping events show an
 * "идёт параллельно" hint. Receives an already-filtered list; parallel counts
 * are computed within the visible set. Rows carry `id="event-:id"` anchors and
 * are the primary ≥44px tap target for opening an event.
 *
 * The Timeline section provides the surrounding band; this renders the heading,
 * list and empty state only.
 */
export function Agenda({
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
  const groupById = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups])
  const ordered = useMemo(() => sortEvents(events, groups), [events, groups])
  const t = strings.timeline
  const countLabel = `${events.length} ${plural(events.length, t.eventsOne, t.eventsFew, t.eventsMany)}`

  return (
    <div style={{ padding: 'var(--space-6) var(--gutter) var(--space-7)' }}>
      <SectionHeading meta={countLabel}>{strings.timeline.agendaTitle}</SectionHeading>

      {ordered.length === 0 ? (
        <p
          style={{
            margin: 'var(--space-5) 0 0',
            padding: 'var(--space-5)',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-body-sm)',
            color: 'var(--text-muted)',
            background: 'var(--surface-card)',
            border: 'var(--border-hairline) dashed var(--border-dashed)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {strings.timeline.empty}
        </p>
      ) : (
        <ol style={{ listStyle: 'none', margin: 'var(--space-5) 0 0', padding: 0, display: 'grid', gap: 'var(--space-3)' }}>
          {ordered.map((e) => {
            const group = groupById.get(e.group)
            const parallel = parallelCount(e, events)
            const point = isPointEvent(e)
            const durMin = point ? null : toMinutes(e.end as string) - toMinutes(e.start)
            return (
              <li key={e.id} id={`event-${e.id}`}>
                <AgendaRow
                  event={e}
                  group={group}
                  point={point}
                  durationLabel={durMin ? formatDuration(durMin) : strings.eventCard.pointEvent}
                  pointShort={t.pointShort}
                  parallel={parallel}
                  parallelHint={t.parallelHint}
                  onOpen={() => onOpen(e.id)}
                />
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

/** Russian plural selector: (1) событие, (2–4) события, (5+) событий. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function AgendaRow({
  event,
  group,
  point,
  durationLabel,
  pointShort,
  parallel,
  parallelHint,
  onOpen,
}: {
  event: SubEvent
  group: Group | undefined
  point: boolean
  durationLabel: string
  pointShort: string
  parallel: number
  parallelHint: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'flex',
        gap: 14,
        width: '100%',
        textAlign: 'left',
        padding: 16,
        minHeight: 44,
        background: 'var(--surface-card)',
        border: 'var(--border-hairline) solid var(--border-card)',
        borderLeft: point ? `3px solid ${group?.color || 'var(--cat-general)'}` : 'var(--border-hairline) solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        font: 'inherit',
      }}
    >
      <div style={{ flex: 'none', textAlign: 'center', minWidth: 52 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-semibold)',
            fontSize: '18px',
            lineHeight: 1,
            color: 'var(--text-strong)',
          }}
        >
          {event.start}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--fw-medium)',
            fontSize: '10px',
            color: 'var(--text-mono)',
            marginTop: 3,
          }}
        >
          {point ? `· ${pointShort}` : (event.end ?? '')}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, borderLeft: '1px dashed var(--border-dashed)', paddingLeft: 14 }}>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {group ? <CategoryTag group={group} size="sm" /> : null}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-mono)' }}>
            {formatTimeRange(event.start, event.end)} · {durationLabel}
          </span>
        </div>
        <h3
          style={{
            margin: '0 0 4px',
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--fw-semibold)',
            fontSize: 'var(--fs-card-title)',
            lineHeight: 1.25,
            color: 'var(--text-strong)',
          }}
        >
          {event.title}
        </h3>
        {event.shortDescription ? (
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-body-sm)',
              color: 'var(--text-muted)',
            }}
          >
            {event.shortDescription}
          </p>
        ) : null}
        {parallel > 0 ? (
          <p
            style={{
              margin: '6px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-body)',
              fontWeight: 'var(--fw-semibold)',
              fontSize: 'var(--fs-caption)',
              color: 'var(--text-body)',
            }}
          >
            {/* Sage dot keeps the botanical accent while the label text meets
                AA contrast (colour is paired with the label, never alone). */}
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)', flex: 'none' }} />
            {parallelHint} · {parallel}
          </p>
        ) : null}
      </div>
    </button>
  )
}
