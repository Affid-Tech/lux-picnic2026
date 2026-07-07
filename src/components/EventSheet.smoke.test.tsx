import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import type { EventInfo, Group, Partner, Strings, SubEvent } from '../types'
import { EventSheet } from './EventSheet'

// Static-render the detail sheet over the real seed JSON: catches render-time
// breakage (undefined access, mis-wired props) without a DOM.
const read = <T,>(file: string): T =>
  JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as T

const eventInfo = read<EventInfo>('event.json')
const groups = read<Group[]>('groups.json')
const events = read<SubEvent[]>('events.json')
const partners = read<Partner[]>('partners.json')
const strings = read<Strings>('strings.json')
const noop = () => {}

const groupOf = (e: SubEvent) => groups.find((g) => g.id === e.group)
const relatedOf = (e: SubEvent) => partners.filter((p) => e.partnerIds.includes(p.id))

function render(e: SubEvent): string {
  return renderToStaticMarkup(
    <EventSheet
      event={e}
      eventInfo={eventInfo}
      group={groupOf(e)}
      relatedPartners={relatedOf(e)}
      strings={strings}
      onClose={noop}
    />,
  )
}

describe('EventSheet (static render with seed data)', () => {
  const withPartner = events.find((e) => e.id === 'book-fair')!
  const html = render(withPartner)

  it('renders dialog semantics labelled by the title', () => {
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    expect(html).toContain('aria-labelledby="event-sheet-title"')
    expect(html).toContain(escapeHtml(withPartner.title))
  })

  it('offers all three calendar providers and (since all events are drop-in) the drop-in copy', () => {
    expect(html).toContain(strings.eventCard.appleCalendar)
    expect(html).toContain(strings.eventCard.googleCalendar)
    expect(html).toContain(strings.eventCard.outlookCalendar)
    expect(html).toContain(strings.eventCard.dropIn)
    // No signup button while every event is signup.mode === "none".
    expect(html).not.toContain(strings.eventCard.signup + ' ↗')
  })

  it('lists related partners only when partnerIds is non-empty', () => {
    expect(html).toContain(strings.eventCard.partnersTitle)
    for (const p of relatedOf(withPartner)) expect(html).toContain(escapeHtml(p.name))

    const noPartner = events.find((e) => e.partnerIds.length === 0)!
    expect(render(noPartner)).not.toContain(strings.eventCard.partnersTitle)
  })

  it('labels a point event with the point-event duration text', () => {
    const point: SubEvent = { ...events[0], id: 'synthetic-point', end: null }
    expect(render(point)).toContain(strings.eventCard.pointEvent)
  })

  it('renders every seed event without throwing', () => {
    for (const e of events) expect(render(e).length).toBeGreaterThan(0)
  })
})

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
