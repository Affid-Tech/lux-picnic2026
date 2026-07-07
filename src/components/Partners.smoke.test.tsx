import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Partner, Strings } from '../types'
import { Partners } from './Partners'

const read = <T,>(file: string): T =>
  JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as T

const partners = read<Partner[]>('partners.json')
const strings = read<Strings>('strings.json')
const noop = () => {}

function render(list: Partner[]): string {
  return renderToStaticMarkup(<Partners partners={list} strings={strings} onOpen={noop} />)
}

describe('Partners (static render with seed data)', () => {
  const html = render(partners)

  it('renders the section title and a correctly pluralized partner count', () => {
    expect(html).toContain(strings.partners.title)
    expect(html).toContain(`${partners.length} партнёров`)
  })

  it('renders every seed partner name', () => {
    for (const p of partners) expect(html).toContain(escapeHtml(p.name))
  })

  it('does not render a "more" affordance on any card', () => {
    expect(html).not.toContain('Подробнее')
  })

  it('renders nothing when there are no partners', () => {
    expect(render([])).toBe('')
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
