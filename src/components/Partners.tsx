import type { Partner, Strings } from '../types'
import { SectionHeading } from './SectionHeading'
import { plural } from '../lib/plural'

/**
 * Flat partners section — the sole surface for partners/sponsors
 * (from partners.json). A horizontally swipeable, non-autoplay row on
 * phones, all cards the same size. Tapping a card opens its detail via
 * `/#/partner/:id`. Organizers/hosts never appear here.
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
        {partners.map((p) => (
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
  return (
    <button type="button" onClick={onOpen} style={CARD}>
      {partner.logo ? (
        <>
          <div style={LOGO_FRAME}>
            {/* Name already renders as visible text below — alt="" avoids
                announcing it twice as this button's accessible name. */}
            <img src={partner.logo} alt="" loading="lazy" style={LOGO_IMG} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={CARD_NAME}>{partner.name}</div>
            <div style={CARD_CATEGORY}>{partner.category}</div>
          </div>
        </>
      ) : (
        <>
          {/* No logo asset: a monogram anchors the card visually (echoing
              the sticker dot/outline motif) so the name below can be a
              confident typographic headline instead of a squeezed wordmark. */}
          <span style={MONOGRAM} aria-hidden="true">
            {partner.name.trim().charAt(0).toUpperCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={CARD_NAME_TEXT_ONLY}>{partner.name}</div>
            <div style={CARD_CATEGORY_LABEL}>{partner.category}</div>
          </div>
        </>
      )}
    </button>
  )
}

const CARD = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-2)',
  width: 150,
  height: '100%',
  textAlign: 'left' as const,
  padding: 'var(--space-4)',
  background: 'var(--surface-card)',
  border: 'var(--border-hairline) solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-card)',
  cursor: 'pointer',
  font: 'inherit',
}

const LOGO_FRAME = {
  height: 72,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface-panel)',
  borderRadius: 'var(--radius-sm)',
  padding: 4,
  overflow: 'hidden',
}

const LOGO_IMG = {
  width: '100%',
  height: '100%',
  objectFit: 'contain' as const,
}

const MONOGRAM = {
  width: 40,
  height: 40,
  flex: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 17,
  lineHeight: 1,
  color: 'var(--text-strong)',
  background: 'var(--surface-card)',
  border: 'var(--border-sticker) solid var(--accent)',
  borderRadius: '50%',
  boxShadow: '0 2px 0 rgba(0,0,0,.12)',
}

function clampLines(lines: number) {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  }
}

const CARD_NAME = {
  ...clampLines(2),
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

const CARD_NAME_TEXT_ONLY = {
  ...clampLines(3),
  marginTop: 2,
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-card-title)',
  letterSpacing: 'var(--ls-display)',
  lineHeight: 'var(--lh-snug)',
  color: 'var(--text-strong)',
}

const CARD_CATEGORY_LABEL = {
  marginTop: 2,
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-caption)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase' as const,
  color: 'var(--text-muted)',
}
