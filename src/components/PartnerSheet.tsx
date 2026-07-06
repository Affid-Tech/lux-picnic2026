import type { Group, Partner, Strings, SubEvent } from '../types'
import { Sheet } from './Sheet'
import { CategoryTag } from './CategoryTag'
import { formatTimeRange } from '../lib/time'

const TITLE_ID = 'partner-sheet-title'

/**
 * Partner detail, presented in the shared bottom sheet. Shows the logo (or a
 * type placeholder), category, description, the outbound link, and the events
 * this partner is tied to — each linking to that event's detail. Every field
 * comes from partners.json; organizers never surface here.
 */
export function PartnerSheet({
  partner,
  relatedEvents,
  groupById,
  strings,
  onClose,
  onOpenEvent,
}: {
  partner: Partner
  relatedEvents: SubEvent[]
  groupById: Map<string, Group>
  strings: Strings
  onClose: () => void
  onOpenEvent: (id: string) => void
}) {
  return (
    <Sheet labelledById={TITLE_ID} closeLabel={strings.eventCard.close} onClose={onClose}>
      <div style={LOGO_SLOT}>
        {partner.logo ? (
          <img
            src={partner.logo}
            alt={partner.name}
            loading="lazy"
            style={{ maxWidth: '70%', maxHeight: '70%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-mono)' }}>
            {partner.category}
          </span>
        )}
      </div>

      <h2 id={TITLE_ID} style={TITLE}>
        {partner.name}
      </h2>
      <p style={CATEGORY}>{partner.category}</p>

      {partner.description ? <p style={BODY}>{partner.description}</p> : null}

      {partner.url ? (
        <a href={partner.url} target="_blank" rel="noopener noreferrer" style={ACTION}>
          {strings.partners.visitSite} ↗
        </a>
      ) : null}

      {relatedEvents.length > 0 ? (
        <section style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={SUBHEAD}>{strings.partners.relatedEvents}</h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-2)' }}>
            {relatedEvents.map((e) => (
              <li key={e.id}>
                <RelatedEventRow event={e} group={groupById.get(e.group)} onOpen={() => onOpenEvent(e.id)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Sheet>
  )
}

function RelatedEventRow({
  event,
  group,
  onOpen,
}: {
  event: SubEvent
  group: Group | undefined
  onOpen: () => void
}) {
  return (
    <button type="button" onClick={onOpen} style={ROW}>
      <span style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
        {group ? <CategoryTag group={group} size="sm" /> : null}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-mono)' }}>
          {formatTimeRange(event.start, event.end)}
        </span>
      </span>
      <span style={ROW_TITLE}>{event.title}</span>
    </button>
  )
}

const LOGO_SLOT = {
  height: 96,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 'var(--space-4)',
  background: 'var(--surface-card)',
  border: 'var(--border-hairline) solid var(--border-card)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}

const TITLE = {
  margin: '0 0 var(--space-2)',
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-title)',
  lineHeight: 'var(--lh-snug)',
  color: 'var(--text-strong)',
}

const CATEGORY = {
  margin: 0,
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--accent)',
}

const BODY = {
  margin: 'var(--space-4) 0 0',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--fs-body)',
  lineHeight: 'var(--lh-normal)',
  color: 'var(--text-body)',
}

const SUBHEAD = {
  margin: '0 0 var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-caption)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase' as const,
  color: 'var(--text-muted)',
}

const ACTION = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 'var(--space-5)',
  minHeight: 48,
  padding: '12px 18px',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-bold)',
  fontSize: 'var(--fs-body)',
  color: 'var(--accent-on)',
  background: 'var(--accent)',
  borderRadius: 'var(--radius-md)',
  textDecoration: 'none',
}

const ROW = {
  display: 'grid',
  gap: 6,
  width: '100%',
  textAlign: 'left' as const,
  minHeight: 44,
  padding: '10px 14px',
  background: 'var(--surface-card)',
  border: 'var(--border-hairline) solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-card)',
  cursor: 'pointer',
  font: 'inherit',
}

const ROW_TITLE = {
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-strong)',
}
