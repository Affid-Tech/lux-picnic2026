import { useMemo } from 'react'
import { useData } from './data/useData'
import { useHashRoute } from './lib/router'
import { useNow } from './hooks/useNow'
import { Hero } from './components/Hero'
import { Timeline } from './components/Timeline'
import { Partners } from './components/Partners'
import { Footer } from './components/Footer'
import { ActiveSheets } from './components/ActiveSheets'
import { NowNextBanner } from './components/NowNextBanner'
import { pointDuration, toCalEntries } from './lib/calendar'
import { buildIcs } from './lib/ics'
import { downloadTextFile } from './lib/download'
import { track } from './lib/analytics'

export function App() {
  const state = useData()
  const [route, navigate] = useHashRoute()

  const data = state.status === 'ready' ? state.data : null
  const now = useNow(data?.event.date ?? '')
  const groupById = useMemo(
    () => new Map((data?.groups ?? []).map((g) => [g.id, g])),
    [data],
  )
  const partnerById = useMemo(
    () => new Map((data?.partners ?? []).map((p) => [p.id, p])),
    [data],
  )

  if (state.status === 'loading') {
    return <StatusScreen text="Загружаем программу…" />
  }
  if (state.status === 'error') {
    return <StatusScreen text={`Не удалось загрузить данные: ${state.error}`} tone="error" />
  }

  const { event, groups, events, partners, strings } = state.data

  const handleAddWholeDay = () => {
    const ics = buildIcs(
      toCalEntries(events, event, pointDuration(strings)),
      new Date(),
      strings.calendar.wholeDayTitle as string,
    )
    downloadTextFile('piknik-2026.ics', ics)
    track('calendar_add_whole_day')
  }

  // The hash route drives the detail sheets: `/#/event/:id` and `/#/partner/:id`
  // open the matching entity; an unknown id resolves to nothing and stays home.
  const openEvent = (id: string) => navigate({ name: 'event', id })
  const openPartner = (id: string) => navigate({ name: 'partner', id })
  const closeSheet = () => navigate({ name: 'home' })

  return (
    <>
      {/* Everything except the active sheet lives under #page-content so the
          sheet can mark it inert/aria-hidden while open (see Sheet.tsx). */}
      <div id="page-content">
        <a className="pk-skip" href="#programme">
          {strings.timeline.skipToContent}
        </a>
        <NowNextBanner
          now={now}
          events={events}
          dateIso={event.date}
          pointDurationMin={pointDuration(strings)}
          strings={strings}
          onOpen={openEvent}
        />
        <Hero event={event} strings={strings} onAddWholeDay={handleAddWholeDay} />
        <main id="programme" tabIndex={-1}>
          <Timeline events={events} groups={groups} strings={strings} onOpen={openEvent} />
          <Partners partners={partners} strings={strings} onOpen={openPartner} />
        </main>
        <Footer event={event} strings={strings} onCtaClick={() => track('cta_click')} />
      </div>

      <ActiveSheets
        route={route}
        events={events}
        partners={partners}
        eventInfo={event}
        groupById={groupById}
        partnerById={partnerById}
        strings={strings}
        onClose={closeSheet}
        onOpenEvent={openEvent}
        onOpenPartner={openPartner}
      />
    </>
  )
}

function StatusScreen({ text, tone = 'muted' }: { text: string; tone?: 'muted' | 'error' }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--gutter)',
        textAlign: 'center',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body)',
        color: tone === 'error' ? 'var(--accent-text)' : 'var(--text-muted)',
      }}
    >
      {text}
    </div>
  )
}
