import { useMemo } from 'react'
import { useData } from './data/useData'
import { useHashRoute } from './lib/router'
import { Hero } from './components/Hero'
import { Timeline } from './components/Timeline'
import { Partners } from './components/Partners'
import { Footer } from './components/Footer'
import { EventSheet } from './components/EventSheet'
import { pointDuration, toCalEntries } from './lib/calendar'
import { buildIcs } from './lib/ics'
import { downloadTextFile } from './lib/download'

export function App() {
  const state = useData()
  const [route, navigate] = useHashRoute()

  const data = state.status === 'ready' ? state.data : null
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
  }

  // The hash route drives the detail sheet: `/#/event/:id` opens the matching
  // event; an unknown id resolves to nothing and simply stays on the home view.
  const handleOpenEvent = (id: string) => navigate({ name: 'event', id })
  const closeSheet = () => navigate({ name: 'home' })

  const activeEvent =
    route.name === 'event' ? events.find((e) => e.id === route.id) : undefined

  return (
    <>
      {/* Everything except the active sheet lives under #page-content so the
          sheet can mark it inert/aria-hidden while open (see Sheet.tsx). */}
      <div id="page-content">
        <Hero event={event} strings={strings} onAddWholeDay={handleAddWholeDay} />
        <main>
          <Timeline
            event={event}
            events={events}
            groups={groups}
            strings={strings}
            onOpen={handleOpenEvent}
          />
          <Partners partners={partners} strings={strings} />
        </main>
        <Footer event={event} strings={strings} />
      </div>

      {activeEvent ? (
        <EventSheet
          event={activeEvent}
          eventInfo={event}
          group={groupById.get(activeEvent.group)}
          relatedPartners={activeEvent.partnerIds
            .map((id) => partnerById.get(id))
            .filter((p): p is NonNullable<typeof p> => Boolean(p))}
          strings={strings}
          onClose={closeSheet}
        />
      ) : null}
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
        color: tone === 'error' ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      {text}
    </div>
  )
}
