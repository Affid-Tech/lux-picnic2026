import { useMemo } from 'react'
import type { Group, Strings, SubEvent } from '../types'
import { CategoryTag } from './CategoryTag'
import { SectionHeading } from './SectionHeading'
import { type Daypart, formatDuration, getDaypart, isPointEvent, sortEvents, toMinutes } from '../lib/time'
import { plural } from '../lib/plural'

const DAYPART_ORDER: Daypart[] = ['morning', 'day', 'evening']

/** Partition an already start-time-sorted list into non-empty daypart buckets, in order. */
function groupByDaypart(events: SubEvent[]): { daypart: Daypart; events: SubEvent[] }[] {
  const buckets = new Map<Daypart, SubEvent[]>()
  for (const e of events) {
    const d = getDaypart(e.start)
    const list = buckets.get(d)
    if (list) list.push(e)
    else buckets.set(d, [e])
  }
  return DAYPART_ORDER.filter((d) => buckets.has(d)).map((daypart) => ({ daypart, events: buckets.get(daypart)! }))
}

/**
 * Vertical agenda: a time rail on the left, category-tagged event rows on the
 * right. Point events render as slim markers. Receives an already-filtered
 * list, grouped into Утро/День/Вечер daypart sections by start time. Rows
 * carry `id="event-:id"` anchors and are the primary ≥44px tap target for
 * opening an event.
 *
 * The Timeline section provides the surrounding band; this renders the heading,
 * daypart sections and empty state only.
 */
export function Agenda({
  events,
  groups,
  strings,
  onOpen,
  liveIds,
}: {
  events: SubEvent[]
  groups: Group[]
  strings: Strings
  onOpen: (id: string) => void
  /** Ids of events running right now — rows in this set get an "идёт сейчас" marker. */
  liveIds?: Set<string>
}) {
  const groupById = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups])
  const ordered = useMemo(() => sortEvents(events, groups), [events, groups])
  const grouped = useMemo(() => groupByDaypart(ordered), [ordered])
  const t = strings.timeline
  const countLabel = `${events.length} ${plural(events.length, t.eventsOne, t.eventsFew, t.eventsMany)}`
  const daypartLabel: Record<Daypart, string> = {
    morning: t.daypartMorning,
    day: t.daypartDay,
    evening: t.daypartEvening,
  }

  return (
    <div className="pk-agenda" style={{ padding: 'var(--space-6) var(--gutter) var(--space-7)' }}>
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
        grouped.map(({ daypart, events: bucket }, i) => (
          <div key={daypart} style={{ marginTop: i === 0 ? 'var(--space-5)' : 'var(--space-6)' }}>
            <h3 style={DAYPART_HEADING}>{daypartLabel[daypart]}</h3>
            <AgendaRowList
              events={bucket}
              groupById={groupById}
              t={t}
              pointEventLabel={strings.eventCard.pointEvent}
              liveIds={liveIds}
              onOpen={onOpen}
            />
          </div>
        ))
      )}
    </div>
  )
}

function AgendaRowList({
  events,
  groupById,
  t,
  pointEventLabel,
  liveIds,
  onOpen,
}: {
  events: SubEvent[]
  groupById: Map<string, Group>
  t: Strings['timeline']
  pointEventLabel: string
  liveIds?: Set<string>
  onOpen: (id: string) => void
}) {
  return (
    <ol style={{ listStyle: 'none', margin: 'var(--space-3) 0 0', padding: 0, display: 'grid', gap: 'var(--space-3)' }}>
      {events.map((e) => {
        const group = groupById.get(e.group)
        const point = isPointEvent(e)
        const durMin = point ? null : toMinutes(e.end as string) - toMinutes(e.start)
        return (
          // scrollMarginTop clears the sticky filter bar when jump-to-now lands here.
          <li key={e.id} id={`event-${e.id}`} style={{ scrollMarginTop: 120 }}>
            <AgendaRow
              event={e}
              group={group}
              point={point}
              live={liveIds?.has(e.id) ?? false}
              liveLabel={t.liveNow}
              durationLabel={durMin ? formatDuration(durMin) : pointEventLabel}
              pointShort={t.pointShort}
              onOpen={() => onOpen(e.id)}
            />
          </li>
        )
      })}
    </ol>
  )
}

const DAYPART_HEADING = {
  margin: 0,
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)' as const,
  fontSize: 'var(--fs-caption)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase' as const,
  color: 'var(--text-muted)',
}

const LIVE_PILL = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)' as const,
  fontSize: 'var(--fs-caption)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase' as const,
  color: 'var(--accent-text)',
}

const LIVE_DOT = {
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: 'var(--accent)',
  flex: 'none' as const,
}

function AgendaRow({
  event,
  group,
  point,
  live,
  liveLabel,
  durationLabel,
  pointShort,
  onOpen,
}: {
  event: SubEvent
  group: Group | undefined
  point: boolean
  live: boolean
  liveLabel: string
  durationLabel: string
  pointShort: string
  onOpen: () => void
}) {
  // A live row gets the accent sticker outline; otherwise the hairline card
  // border, with the group-coloured left edge kept for point events.
  const baseBorder = 'var(--border-hairline) solid var(--border-card)'
  const border = live ? 'var(--border-sticker) solid var(--accent)' : baseBorder
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
        border,
        borderLeft: point && !live ? `3px solid ${group?.color || 'var(--cat-general)'}` : border,
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
          {point ? pointShort : durationLabel}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, borderLeft: '1px dashed var(--border-dashed)', paddingLeft: 14 }}>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {group ? <CategoryTag group={group} size="sm" /> : null}
          {live ? (
            <span style={LIVE_PILL}>
              <span aria-hidden style={LIVE_DOT} />
              {liveLabel}
            </span>
          ) : null}
        </div>
        <h4
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
        </h4>
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
      </div>
    </button>
  )
}

