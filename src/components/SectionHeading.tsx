import type { CSSProperties, ReactNode } from 'react'

/** Spectral serif section title with an optional muted meta line on the right. */
export function SectionHeading({
  children,
  meta,
  style = {},
}: {
  children: ReactNode
  meta?: ReactNode
  style?: CSSProperties
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, ...style }}>
      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-semibold)',
          fontSize: 'var(--fs-title)',
          lineHeight: 1.1,
          color: 'var(--text-strong)',
        }}
      >
        {children}
      </h2>
      {meta ? (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--fw-medium)',
            fontSize: 'var(--fs-label)',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {meta}
        </span>
      ) : null}
    </div>
  )
}
