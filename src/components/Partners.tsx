import type { Partner, Strings } from '../types'
import { SectionHeading } from './SectionHeading'

/**
 * Flat partners section — the sole surface for featured partners/sponsors
 * (from partners.json). Renders a horizontally swipeable row on phones; no
 * autoplay. Organizers/hosts never appear here.
 */
export function Partners({ partners, strings }: { partners: Partner[]; strings: Strings }) {
  if (partners.length === 0) return null

  return (
    <section style={{ padding: 'var(--space-7) 0', background: 'var(--surface-page)' }}>
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
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: '150px',
          gap: 'var(--space-3)',
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {partners.map((p) => (
          <li key={p.id} style={{ scrollSnapAlign: 'start' }}>
            <PartnerCard partner={p} label={strings.partners.visitSite} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function PartnerCard({ partner, label }: { partner: Partner; label: string }) {
  const Tag = partner.url ? 'a' : 'div'
  const linkProps = partner.url
    ? { href: partner.url, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Tag
      {...linkProps}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        height: '100%',
        padding: 'var(--space-4)',
        background: 'var(--surface-card)',
        border: 'var(--border-hairline) solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        textDecoration: 'none',
      }}
    >
      {/* Logo slot — real logo when supplied, type placeholder until then. */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          background: partner.logo ? 'transparent' : 'var(--surface-panel)',
          fontFamily: partner.featured ? 'var(--font-body)' : 'var(--font-mono)',
          fontWeight: partner.featured ? 'var(--fw-bold)' : 'var(--fw-medium)',
          fontSize: partner.featured ? '13px' : '11px',
          color: partner.featured ? 'var(--accent)' : 'var(--text-mono)',
          textAlign: 'center',
          padding: '0 6px',
        }}
      >
        {partner.logo ? (
          <img
            src={partner.logo}
            alt={partner.name}
            loading="lazy"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          partner.name
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--fw-semibold)',
            fontSize: 'var(--fs-body-sm)',
            color: 'var(--text-strong)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {partner.name}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
          {partner.category}
        </div>
      </div>

      {partner.url ? (
        <span style={{ marginTop: 'auto', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-caption)', color: 'var(--accent)' }}>
          {label} ↗
        </span>
      ) : null}
    </Tag>
  )
}
