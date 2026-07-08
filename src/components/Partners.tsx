import { useState } from 'react'
import type { Partner, Strings } from '../types'
import { SectionHeading } from './SectionHeading'
import { plural } from '../lib/plural'
import { useMediaQuery } from '../hooks/useMediaQuery'

/**
 * Flat partners section — the sole surface for partners/sponsors
 * (from partners.json). Defaults to a horizontally swipeable, non-autoplay
 * row on phones, all cards the same size; "Показать все" switches to a
 * wrapping grid showing every card at once, and back. Tapping a card opens
 * its detail via `/#/partner/:id`. Organizers/hosts never appear here.
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
  const [expanded, setExpanded] = useState(false)
  // Desktop always shows every partner in the full grid — swipe/toggle is a
  // narrow-viewport affordance that has nothing to do once there's room for
  // all of them at once (see .pk-partners-list's auto-fill grid: it already
  // widens to more columns on its own, no desktop-specific column count
  // needed here).
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const showGrid = expanded || isDesktop

  if (partners.length === 0) return null

  const t = strings.partners
  const countLabel = `${partners.length} ${plural(partners.length, t.partnersOne, t.partnersFew, t.partnersMany)}`

  return (
    <section aria-label={strings.partners.title} style={{ padding: 'var(--space-7) 0', background: 'var(--surface-page)' }}>
      <div style={{ padding: '0 var(--gutter)' }}>
        <SectionHeading
          meta={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {countLabel}
              {isDesktop ? null : (
                <button type="button" onClick={() => setExpanded((v) => !v)} style={TOGGLE_BTN}>
                  {expanded ? t.showLess : t.showAll}
                </button>
              )}
            </span>
          }
        >
          {strings.partners.title}
        </SectionHeading>
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

      <ul style={showGrid ? GRID_LIST : ROW_LIST}>
        {partners.map((p) => (
          <li key={p.id} style={showGrid ? undefined : ROW_ITEM}>
            <PartnerCard partner={p} onOpen={() => onOpen(p.id)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

const TOGGLE_BTN = {
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)' as const,
  fontSize: 'var(--fs-label)',
  color: 'var(--accent-text)',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
}

const ROW_LIST = {
  listStyle: 'none' as const,
  margin: 'var(--space-5) 0 0',
  padding: '0 var(--gutter)',
  display: 'flex',
  gap: 'var(--space-3)',
  overflowX: 'auto' as const,
  scrollSnapType: 'x proximity' as const,
  WebkitOverflowScrolling: 'touch' as const,
}

const ROW_ITEM = { scrollSnapAlign: 'start' as const, flex: 'none' as const }

const GRID_LIST = {
  listStyle: 'none' as const,
  margin: 'var(--space-5) 0 0',
  padding: '0 var(--gutter)',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 150px)',
  justifyContent: 'center' as const,
  gap: 'var(--space-3)',
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
      <div style={LOGO_FRAME}>
        {partner.logo ? (
          // Name already renders as visible text below — alt="" avoids
          // announcing it twice as this button's accessible name.
          <img src={partner.logo} alt="" loading="lazy" style={LOGO_IMG} />
        ) : (
          // No logo asset: a monogram fills the same frame a logo would
          // (echoing the sticker dot/outline motif), so the two card
          // variants read as the same shape.
          <span style={MONOGRAM} aria-hidden="true">
            {partner.name.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={CARD_NAME}>{partner.name}</div>
        <div style={CARD_CATEGORY}>{partner.category}</div>
      </div>
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
  aspectRatio: '3 / 2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  height: '100%',
  aspectRatio: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-title)',
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
