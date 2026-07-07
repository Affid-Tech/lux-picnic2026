import { useMemo } from 'react'
import type { Partner, Strings } from '../types'
import { SectionHeading } from './SectionHeading'
import { plural } from '../lib/plural'

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

  const t = strings.partners
  const countLabel = `${partners.length} ${plural(partners.length, t.partnersOne, t.partnersFew, t.partnersMany)}`

  return (
    <section aria-label={strings.partners.title} style={{ padding: 'var(--space-7) 0', background: 'var(--surface-page)' }}>
      <div style={{ padding: '0 var(--gutter)' }}>
        <SectionHeading meta={countLabel}>{strings.partners.title}</SectionHeading>
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
            <PartnerCard partner={p} onOpen={() => onOpen(p.id)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function PartnerCard({
  partner,
  onOpen,
}: {
  partner: Partner
  onOpen: () => void
}) {
  const featured = partner.featured
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ ...CARD, width: featured ? 200 : 150, border: featured ? CARD_BORDER_FEATURED : CARD_BORDER }}
    >
      <div style={LOGO_SLOT}>
        {partner.logo ? (
          <img
            src={partner.logo}
            alt={partner.name}
            loading="lazy"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          // No logo asset yet: render the brand name as a terracotta wordmark
          // (per the design brief) rather than a grey category chip.
          <span style={WORDMARK}>{partner.name}</span>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        {partner.logo ? <div style={CARD_NAME}>{partner.name}</div> : null}
        <div style={CARD_CATEGORY}>{partner.category}</div>
      </div>
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
  minHeight: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface-panel)',
  border: 'var(--border-hairline) solid var(--border-card)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-2) 6px',
}

const CLAMP_2_LINES = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
}

const WORDMARK = {
  ...CLAMP_2_LINES,
  minWidth: 0,
  padding: '0 4px',
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-heading)',
  letterSpacing: 'var(--ls-display)',
  lineHeight: 'var(--lh-snug)',
  color: 'var(--accent-text)',
  textAlign: 'center' as const,
}

const CARD_NAME = {
  ...CLAMP_2_LINES,
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-body-sm)',
  lineHeight: 'var(--lh-snug)',
  color: 'var(--text-strong)',
}

const CARD_CATEGORY = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--fs-caption)',
  color: 'var(--text-muted)',
}
