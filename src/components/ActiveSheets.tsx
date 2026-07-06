import type { EventInfo, Group, Partner, Strings, SubEvent } from '../types'
import type { Route } from '../lib/router'
import { EventSheet } from './EventSheet'
import { PartnerSheet } from './PartnerSheet'
import { track } from '../lib/analytics'

/**
 * Renders whichever detail sheet the hash route addresses (event or partner),
 * or nothing on the home route / an unknown id. Owns the resolution from id →
 * entity and the analytics wiring, keeping App a thin composition.
 */
export function ActiveSheets({
  route,
  events,
  partners,
  eventInfo,
  groupById,
  partnerById,
  strings,
  onClose,
  onOpenEvent,
  onOpenPartner,
}: {
  route: Route
  events: SubEvent[]
  partners: Partner[]
  eventInfo: EventInfo
  groupById: Map<string, Group>
  partnerById: Map<string, Partner>
  strings: Strings
  onClose: () => void
  onOpenEvent: (id: string) => void
  onOpenPartner: (id: string) => void
}) {
  const activeEvent = route.name === 'event' ? events.find((e) => e.id === route.id) : undefined
  const activePartner = route.name === 'partner' ? partners.find((p) => p.id === route.id) : undefined

  if (activeEvent) {
    return (
      <EventSheet
        event={activeEvent}
        eventInfo={eventInfo}
        group={groupById.get(activeEvent.group)}
        relatedPartners={activeEvent.partnerIds
          .map((id) => partnerById.get(id))
          .filter((p): p is Partner => Boolean(p))}
        strings={strings}
        onClose={onClose}
        onOpenPartner={onOpenPartner}
        onCalendarAdd={(id, method) => track('calendar_add_event', { id, method })}
      />
    )
  }

  if (activePartner) {
    return (
      <PartnerSheet
        partner={activePartner}
        relatedEvents={activePartner.relatedEventIds
          .map((id) => events.find((e) => e.id === id))
          .filter((e): e is SubEvent => Boolean(e))}
        groupById={groupById}
        strings={strings}
        onClose={onClose}
        onOpenEvent={onOpenEvent}
        onVisit={() => track('partner_outbound', { id: activePartner.id })}
      />
    )
  }

  return null
}
