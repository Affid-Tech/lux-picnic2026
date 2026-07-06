import { useData } from './data/useData'
import { useHashRoute } from './lib/router'
import { Hero } from './components/Hero'
import { Timeline } from './components/Timeline'
import { Partners } from './components/Partners'
import { Footer } from './components/Footer'

export function App() {
  const state = useData()
  const [, navigate] = useHashRoute()

  if (state.status === 'loading') {
    return <StatusScreen text="Загружаем программу…" />
  }
  if (state.status === 'error') {
    return <StatusScreen text={`Не удалось загрузить данные: ${state.error}`} tone="error" />
  }

  const { event, groups, events, partners, strings } = state.data

  const handleAddWholeDay = () => {
    // TODO(phase 4): generate a combined whole-day .ics from event + events.
  }
  // Opening an event addresses it via the hash route (`/#/event/:id`) so links
  // are shareable. TODO(phase 4): render the detail card / bottom sheet for the
  // active route — for now the route just becomes deep-linkable.
  const handleOpenEvent = (id: string) => {
    navigate({ name: 'event', id })
  }

  return (
    <>
      <Hero event={event} strings={strings} onAddWholeDay={handleAddWholeDay} />
      <Timeline
        event={event}
        events={events}
        groups={groups}
        strings={strings}
        onOpen={handleOpenEvent}
      />
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
