import { useData } from './data/useData'
import { Hero } from './components/Hero'
import { Agenda } from './components/Agenda'
import { Partners } from './components/Partners'
import { Footer } from './components/Footer'

export function App() {
  const state = useData()

  if (state.status === 'loading') {
    return <StatusScreen text="Загружаем программу…" />
  }
  if (state.status === 'error') {
    return <StatusScreen text={`Не удалось загрузить данные: ${state.error}`} tone="error" />
  }

  const { event, groups, events, partners, strings } = state.data

  // Calendar export (phase 4) and event detail cards (phase 4) are wired here.
  // For now these are placeholders so the seeded data is browsable end-to-end.
  const handleAddWholeDay = () => {
    // TODO(phase 4): generate a combined whole-day .ics from event + events.
  }
  const handleOpenEvent = (id: string) => {
    // TODO(phase 4): open the full event card / route to /#/event/:id.
    window.location.hash = `#/event/${id}`
  }

  return (
    <>
      <Hero event={event} strings={strings} onAddWholeDay={handleAddWholeDay} />
      <Agenda events={events} groups={groups} strings={strings} onOpen={handleOpenEvent} />
      <Partners partners={partners} strings={strings} />
      <Footer event={event} strings={strings} />
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
