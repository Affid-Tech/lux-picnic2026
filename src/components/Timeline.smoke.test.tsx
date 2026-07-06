import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import type { EventInfo, Group, Strings, SubEvent } from '../types'
import { Timeline } from './Timeline'
import { DayOverview } from './DayOverview'

// Smoke test: render the timeline tree against the real seed JSON to catch
// runtime render errors (bad positioning math, undefined access, mis-wired
// props) that typecheck alone won't surface.
const read = <T,>(file: string): T =>
  JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as T

const event = read<EventInfo>('event.json')
const groups = read<Group[]>('groups.json')
const events = read<SubEvent[]>('events.json')
const strings = read<Strings>('strings.json')
const noop = () => {}

describe('Timeline (static render with seed data)', () => {
  it('renders the agenda heading, a group chip and every event title', () => {
    const html = renderToStaticMarkup(
      <Timeline event={event} events={events} groups={groups} strings={strings} onOpen={noop} />,
    )
    expect(html).toContain(strings.timeline.agendaTitle)
    expect(html).toContain('IT') // a group chip label from groups.json
    for (const e of events) expect(html).toContain(escapeHtml(e.title))
  })

  it('shows the "Обзор дня" toggle and event count', () => {
    const html = renderToStaticMarkup(
      <Timeline event={event} events={events} groups={groups} strings={strings} onOpen={noop} />,
    )
    expect(html).toContain(strings.timeline.overviewTitle)
    expect(html).toContain(`${events.length}`)
  })
})

describe('DayOverview (expanded)', () => {
  it('renders a positioned block per event with an accessible label', () => {
    const html = renderToStaticMarkup(
      <DayOverview
        event={event}
        events={events}
        groups={groups}
        strings={strings}
        open
        onToggle={noop}
        onOpen={noop}
      />,
    )
    // One aria-label per event (title, group, time) — count the buttons.
    const labels = html.match(/aria-label="/g) ?? []
    expect(labels.length).toBe(events.length)
    // Left/width positioning made it into the markup.
    expect(html).toMatch(/left:\s*\d/)
  })
})

// react-dom escapes text; mirror it so title assertions match the markup.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
