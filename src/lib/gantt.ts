import type { EventInfo, Group, SubEvent } from '../types'
import { toMinutes } from './time'
import { isSameLocalDate } from './date'

// Model for the "Обзор дня" mini-Gantt. Lanes are packed by concurrency (not
// by group): lane count equals the peak number of simultaneous events, lanes
// are anonymous, and each block carries its own colour (from the group) and
// title. All functions here are pure and unit-tested.

export interface Domain {
  startMin: number
  endMin: number
}

const HOUR = 60
const floorHour = (min: number): number => Math.floor(min / HOUR) * HOUR
const ceilHour = (min: number): number => Math.ceil(min / HOUR) * HOUR

/** The effective end minute of an event; point events collapse to their start. */
function endMinutes(e: SubEvent): number {
  return e.end ? toMinutes(e.end) : toMinutes(e.start)
}

/** Whole-hour window covering every event and the headline event's own span. */
export function ganttDomain(events: SubEvent[], event: EventInfo): Domain {
  const starts = events.map((e) => toMinutes(e.start))
  const ends = events.map(endMinutes)
  starts.push(toMinutes(event.startTime))
  ends.push(toMinutes(event.endTime))

  const startMin = floorHour(Math.min(...starts))
  let endMin = ceilHour(Math.max(...ends))
  if (endMin <= startMin) endMin = startMin + HOUR
  return { startMin, endMin }
}

/** One tick per hour across the domain, inclusive of both ends. */
export function hourTicks(domain: Domain): number[] {
  const ticks: number[] = []
  for (let m = domain.startMin; m <= domain.endMin; m += HOUR) ticks.push(m)
  return ticks
}

export interface LaneAssignment {
  id: string
  lane: number
}

export interface PackResult {
  assignments: LaneAssignment[]
  laneCount: number
}

/**
 * Interval packing: greedily place each event (by start time) into the first
 * lane whose previous event has already ended; open a new lane only when none
 * is free. The resulting lane count is the peak concurrency.
 */
export function packLanes(events: SubEvent[]): PackResult {
  const sorted = [...events].sort((a, b) => {
    const byStart = toMinutes(a.start) - toMinutes(b.start)
    return byStart !== 0 ? byStart : endMinutes(a) - endMinutes(b)
  })

  const laneEnds: number[] = []
  const assignments: LaneAssignment[] = sorted.map((e) => {
    const start = toMinutes(e.start)
    const end = endMinutes(e)
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(end)
    } else {
      laneEnds[lane] = end
    }
    return { id: e.id, lane }
  })

  return { assignments, laneCount: laneEnds.length }
}

export interface Segment {
  id: string
  title: string
  color: string
  groupId: string
  groupLabel: string
  lane: number
  leftPct: number
  widthPct: number
  point: boolean
  start: string
  end: string | null
}

const FALLBACK_COLOR = 'var(--cat-general)'

/** Positioned, coloured blocks ready to render, one per event. */
export function laneSegments(
  events: SubEvent[],
  groupById: Map<string, Group>,
  domain: Domain,
): Segment[] {
  const span = domain.endMin - domain.startMin
  const laneById = new Map(packLanes(events).assignments.map((a) => [a.id, a.lane]))

  return events.map((e) => {
    const start = toMinutes(e.start)
    const point = e.end === null
    const width = point ? 0 : endMinutes(e) - start
    const group = groupById.get(e.group)
    return {
      id: e.id,
      title: e.title,
      color: group?.color ?? FALLBACK_COLOR,
      groupId: e.group,
      groupLabel: group?.label ?? '',
      lane: laneById.get(e.id) ?? 0,
      leftPct: ((start - domain.startMin) / span) * 100,
      widthPct: (width / span) * 100,
      point,
      start: e.start,
      end: e.end,
    }
  })
}

/**
 * Horizontal position (0–100%) of the live "сейчас" marker, or null when it
 * should not show: any day other than the event date, or a time outside the
 * Gantt window. Driven purely by the passed-in clock.
 */
export function nowMarkerPct(now: Date, dateIso: string, domain: Domain): number | null {
  if (!isSameLocalDate(now, dateIso)) return null
  const nowMin = now.getHours() * 60 + now.getMinutes()
  if (nowMin < domain.startMin || nowMin > domain.endMin) return null
  return ((nowMin - domain.startMin) / (domain.endMin - domain.startMin)) * 100
}
