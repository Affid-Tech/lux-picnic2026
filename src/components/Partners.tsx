import { useMemo } from 'react'
import type { Partner, Strings } from '../types'
import { SectionHeading } from './SectionHeading'

/**
 * Flat partners section — the sole surface for featured partners/sponsors
 * (from partners.json). A horizontally swipeable, non-autoplay row on phones;
 * `featured` partners are pinned to the front and enlarged. Tapping a card
 * opens its detail via `/#/partner/:id`. Organizers/hosts never appear here.
 */
export function Partners({
  partners,
  strings,
  onOpen,
}: {
  partners: Partner[]
  strings: Strings
  onOpen: (id: string) => void
}) {
  // Pin featured partners first without mutating the source order.
  const ordered = useMemo(
    () => [...partners].sort((a, b) => Number(b.featured) - Number(a.featured)),
    [partners],
  )
  if (partners.length === 0) return null

  return (
    <section aria-label={strings.partners.title} style={{ padding: 'var(--space-7) 0', background: 'var(--surface-page)' }}>
      <div style={{ padding: '0 var(--gutter)' }}>
        <SectionHeading meta={strings.partners.swipeHint}>{strings.partners.title}</SectionHeading>
        {strings.partners.subtitle ? (
          <p
            style={{
              margin: 'var(--space-2) 0 0',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-body-sm)',
              color: 'var(--text-muted)',
            }}
          >
            {strings.partners.subtitle}
          </p>
        ) : null}
      </div>

      <ul
        style={{
          listStyle: 'none',
          margin: 'var(--space-5) 0 0',
          padding: '0 var(--gutter)',
          display: 'flex',
          gap: 'var(--space-3)',
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {ordered.map((p) => (
          <li key={p.id} style={{ scrollSnapAlign: 'start', flex: 'none' }}>
            <PartnerCard partner={p} moreLabel={strings.partners.more} onOpen={() => onOpen(p.id)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function PartnerCard({
  partner,
  moreLabel,
  onOpen,
}: {
  partner: Partner
  moreLabel: string
  onOpen: () => void
}) {
  const featured = partner.featured
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ ...CARD, width: featured ? 200 : 150, border: featured ? CARD_BORDER_FEATURED : CARD_BORDER }}
    >
      <div style={{ ...LOGO_SLOT, ...(partner.logo ? null : LOGO_SLOT_EMPTY) }}>
        {partner.logo ? (
          <img
            src={partner.logo}
            alt={partner.name}
            loading="lazy"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <span style={LOGO_PLACEHOLDER}>{partner.category}</span>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={CARD_NAME}>{partner.name}</div>
        <div style={CARD_CATEGORY}>{partner.category}</div>
      </div>

      <span style={CARD_MORE}>{moreLabel} ›</span>
    </button>
  )
}

const CARD = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-2)',
  height: '100%',
  textAlign: 'left' as const,
  padding: 'var(--space-4)',
  background: 'var(--surface-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-card)',
  cursor: 'pointer',
  font: 'inherit',
}

const CARD_BORDER = 'var(--border-hairline) solid var(--border-card)'
const CARD_BORDER_FEATURED = 'var(--border-sticker) solid var(--accent)'

const LOGO_SLOT = {
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius-sm)',
  padding: '0 6px',
}

const LOGO_SLOT_EMPTY = { background: 'var(--surface-panel)' }

const LOGO_PLACEHOLDER = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-mono)',
  color: 'var(--text-mono)',
  textAlign: 'center' as const,
}

const CARD_NAME = {
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-strong)',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const CARD_CATEGORY = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--fs-caption)',
  color: 'var(--text-muted)',
}

const CARD_MORE = {
  marginTop: 'auto',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--fs-caption)',
  color: 'var(--accent-text)',
}
