import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import type { EventInfo, Partner, Strings, SubEvent } from '../types'
import { Hero } from './Hero'
import { Footer } from './Footer'
import { Partners } from './Partners'

const read = <T,>(file: string): T =>
  JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as T

const event = read<EventInfo>('event.json')
const events = read<SubEvent[]>('events.json')
const partners = read<Partner[]>('partners.json')
const strings = read<Strings>('strings.json')
const noop = () => {}

describe('Hero (static render)', () => {
  const html = renderToStaticMarkup(<Hero event={event} events={events} strings={strings} />)
  it('renders the event name, tagline and whole-day CTA in a header landmark', () => {
    expect(html).toContain('<header')
    expect(html).toContain(escapeHtml(event.name))
    expect(html).toContain(escapeHtml(event.tagline))
    expect(html).toContain(strings.hero.addWholeDay)
  })
  it('links the location to the map when a mapUrl is present', () => {
    expect(html).toContain(strings.hero.openMap)
    expect(html).toContain(`href="${event.location.mapUrl}"`)
  })
  it('offers all three calendar providers in the whole-day dropdown', () => {
    expect(html).toContain(strings.eventCard.googleCalendar)
    expect(html).toContain(strings.eventCard.outlookCalendar)
    expect(html).toContain(strings.eventCard.appleCalendar)
  })
})

describe('Footer (static render)', () => {
  const html = renderToStaticMarkup(<Footer event={event} strings={strings} onCtaClick={noop} />)
  it('renders the BesedaTech mark, CTA and closing line in a footer landmark', () => {
    expect(html).toContain('<footer')
    expect(html).toContain(strings.footer.poweredBy)
    expect(html).toContain(escapeHtml(event.besedatech.ctaLabel))
    expect(html).toContain(`href="${event.besedatech.ctaUrl}"`)
    expect(html).toContain(escapeHtml(strings.footer.closing))
  })
})

describe('Partners (static render)', () => {
  const html = renderToStaticMarkup(<Partners partners={partners} strings={strings} onOpen={noop} />)
  it('renders the labelled section and a card per partner', () => {
    expect(html).toContain(`aria-label="${strings.partners.title}"`)
    for (const p of partners) expect(html).toContain(escapeHtml(p.name))
  })
  it('renders nothing when there are no partners', () => {
    expect(renderToStaticMarkup(<Partners partners={[]} strings={strings} onOpen={noop} />)).toBe('')
  })
})

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
