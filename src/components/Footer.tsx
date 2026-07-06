import type { EventInfo, Strings } from '../types'

/** Footer — dark brown band with the BesedaTech mark and the CTA from event.json. */
export function Footer({ event, strings }: { event: EventInfo; strings: Strings }) {
  const cta = event.besedatech
  return (
    <footer
      style={{
        padding: 'var(--space-8) var(--gutter) var(--space-7)',
        background: 'var(--surface-inverse)',
        color: 'var(--text-on-inverse)',
      }}
    >
      <p
        style={{
          margin: '0 0 var(--space-3)',
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--fs-heading)',
          color: 'var(--text-on-inverse-strong)',
        }}
      >
        {strings.footer.poweredBy}
      </p>

      {cta.ctaText ? (
        <p
          style={{
            margin: '0 0 var(--space-4)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-body)',
            lineHeight: 'var(--lh-normal)',
            color: 'var(--text-on-inverse)',
            maxWidth: '38ch',
          }}
        >
          {cta.ctaText}
        </p>
      ) : null}

      {cta.ctaUrl ? (
        <a
          href={cta.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            minHeight: 44,
            padding: '12px 18px',
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--fw-bold)',
            fontSize: '14px',
            color: 'var(--accent-on)',
            background: 'var(--accent)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          {cta.ctaLabel} ↗
        </a>
      ) : null}

      <p
        style={{
          margin: 'var(--space-6) 0 0',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-body-sm)',
          color: 'var(--text-on-inverse-muted)',
        }}
      >
        {strings.footer.credit} · {new Date().getFullYear()}
      </p>
      <p
        style={{
          margin: 'var(--space-2) 0 0',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-body-sm)',
          color: 'var(--text-on-inverse)',
        }}
      >
        {strings.footer.closing}
      </p>
    </footer>
  )
}
