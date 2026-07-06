import { useMemo } from 'react'
import { useData } from './data/useData'
import { useHashRoute } from './lib/router'
import { Hero } from './components/Hero'
import { Timeline } from './components/Timeline'
import { Partners } from './components/Partners'
import { Footer } from './components/Footer'
import { EventSheet } from './components/EventSheet'
import { PartnerSheet } from './components/PartnerSheet'
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

  // The hash route drives the detail sheets: `/#/event/:id` and `/#/partner/:id`
  // open the matching entity; an unknown id resolves to nothing and stays home.
  const handleOpenEvent = (id: string) => navigate({ name: 'event', id })
  const handleOpenPartner = (id: string) => navigate({ name: 'partner', id })
  const closeSheet = () => navigate({ name: 'home' })

  const activeEvent =
    route.name === 'event' ? events.find((e) => e.id === route.id) : undefined
  const activePartner =
    route.name === 'partner' ? partners.find((p) => p.id === route.id) : undefined

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
          <Partners partners={partners} strings={strings} onOpen={handleOpenPartner} />
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
          onOpenPartner={handleOpenPartner}
        />
      ) : null}

      {activePartner ? (
        <PartnerSheet
          partner={activePartner}
          relatedEvents={activePartner.relatedEventIds
            .map((id) => events.find((e) => e.id === id))
            .filter((e): e is NonNullable<typeof e> => Boolean(e))}
          groupById={groupById}
          strings={strings}
          onClose={closeSheet}
          onOpenEvent={handleOpenEvent}
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
