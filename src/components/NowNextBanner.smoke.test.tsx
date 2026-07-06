import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import type { EventInfo, Strings, SubEvent } from '../types'
import { NowNextBanner } from './NowNextBanner'

const read = <T,>(file: string): T =>
  JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as T

const event = read<EventInfo>('event.json')
const events = read<SubEvent[]>('events.json')
const strings = read<Strings>('strings.json')
const noop = () => {}

function render(now: Date): string {
  return renderToStaticMarkup(
    <NowNextBanner
      now={now}
      events={events}
      dateIso={event.date}
      pointDurationMin={30}
      strings={strings}
      onOpen={noop}
    />,
  )
}

// event.date is 2026-07-12; construct local Dates on that day.
const at = (h: number, m = 0) => new Date(2026, 6, 12, h, m)

describe('NowNextBanner (static render with seed data)', () => {
  it('renders nothing on any day other than the event date', () => {
    expect(render(new Date(2026, 6, 11, 14, 0))).toBe('')
  })

  it('during the day shows the Сейчас/Далее labels and a running event', () => {
    const html = render(at(14, 30))
    expect(html).toContain('<aside') // complementary landmark
    expect(html).toContain(`aria-label="${strings.nowNext.regionLabel}"`)
    expect(html).toContain(strings.nowNext.nowLabel)
    expect(html).toContain(strings.nowNext.nextLabel)
    // "Мафия и настолки для взрослых" runs 14:00–19:00, so it is on now.
    expect(html).toContain(escapeHtml('Мафия и настолки для взрослых'))
  })

  it('before the first event shows the not-started copy', () => {
    expect(render(at(8)).length).toBeGreaterThan(0)
    expect(render(at(8))).toContain(strings.nowNext.notStarted)
  })

  it('after the last event shows the ended-today copy', () => {
    expect(render(at(22))).toContain(strings.nowNext.endedToday)
  })
})

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
