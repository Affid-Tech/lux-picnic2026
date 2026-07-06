import type { CSSProperties } from 'react'
import type { Group } from '../types'

/**
 * Sticker-style category tag: cream fill, 1.5px coloured outline, a filled
 * colour dot and a hard offset shadow — the signature "printed sticker" motif.
 * Colour and label come entirely from the Group (from groups.json), never
 * hardcoded.
 */
export function CategoryTag({
  group,
  size = 'md',
  style = {},
}: {
  group: Group
  size?: 'sm' | 'md'
  style?: CSSProperties
}) {
  const sm = size === 'sm'
  const dot = sm ? 6 : 8
  const label = sm ? group.short || group.label : group.label
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sm ? 5 : 6,
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-semibold)',
        fontSize: sm ? '11px' : 'var(--fs-label)',
        lineHeight: 1,
        color: group.color,
        background: 'var(--surface-card)',
        border: `var(--border-sticker) solid ${group.color}`,
        padding: sm ? '5px 9px' : '7px 12px',
        borderRadius: 'var(--radius-pill)',
        boxShadow: '0 2px 0 rgba(0,0,0,.10)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span style={{ width: dot, height: dot, borderRadius: '50%', background: group.color, flex: 'none' }} />
      {label}
    </span>
  )
}
