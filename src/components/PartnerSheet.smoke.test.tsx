import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Group, Partner, Strings, SubEvent } from '../types'
import { PartnerSheet } from './PartnerSheet'

const read = <T,>(file: string): T =>
  JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as T

const groups = read<Group[]>('groups.json')
const events = read<SubEvent[]>('events.json')
const partners = read<Partner[]>('partners.json')
const strings = read<Strings>('strings.json')
const groupById = new Map(groups.map((g) => [g.id, g]))
const noop = () => {}

function render(p: Partner): string {
  return renderToStaticMarkup(
    <PartnerSheet
      partner={p}
      relatedEvents={p.relatedEventIds
        .map((id) => events.find((e) => e.id === id))
        .filter((e): e is SubEvent => Boolean(e))}
      groupById={groupById}
      strings={strings}
      onClose={noop}
      onOpenEvent={noop}
    />,
  )
}

describe('PartnerSheet (static render with seed data)', () => {
  const featured = partners.find((p) => p.id === 'lux-mafia')!
  const html = render(featured)

  it('renders dialog semantics, name, category and description', () => {
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-labelledby="partner-sheet-title"')
    expect(html).toContain(escapeHtml(featured.name))
    expect(html).toContain(featured.category)
    expect(html).toContain(escapeHtml(featured.description))
  })

  it('shows the outbound link only when the partner has a url', () => {
    expect(html).toContain(strings.partners.visitSite)
    expect(html).toContain(`href="${featured.url}"`)
    const noUrl = partners.find((p) => !p.url)!
    expect(render(noUrl)).not.toContain(strings.partners.visitSite)
  })

  it('lists related events by title when relatedEventIds is set', () => {
    expect(html).toContain(strings.partners.relatedEvents)
    for (const id of featured.relatedEventIds) {
      const e = events.find((ev) => ev.id === id)!
      expect(html).toContain(escapeHtml(e.title))
    }
  })

  it('renders every seed partner without throwing', () => {
    for (const p of partners) expect(render(p).length).toBeGreaterThan(0)
  })
})

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
