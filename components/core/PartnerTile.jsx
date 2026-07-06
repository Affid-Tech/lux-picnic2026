import React from 'react';

/**
 * Flat partner tile. Cream surface, hairline border. With no logo asset the
 * brand NAME is set as a Spectral terracotta wordmark (per the design brief —
 * never a grey category chip); an empty name falls back to the mono "лого"
 * placeholder. `brand` marks the host / headline partner with a terracotta border.
 */
export function PartnerTile({ name, brand = false, style = {} }) {
  return (
    <div
      style={{
        height: 56,
        background: 'var(--surface-card)',
        border: `var(--border-hairline) solid ${brand ? 'var(--accent)' : 'var(--border-card)'}`,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 8px',
        ...style,
      }}
    >
      <span
        style={{
          minWidth: 0,
          fontFamily: name ? 'var(--font-display)' : 'var(--font-mono)',
          fontWeight: name ? 'var(--fw-semibold)' : 'var(--fw-medium)',
          fontSize: name ? 'var(--fs-body-sm)' : '10px',
          color: name ? 'var(--accent-text)' : 'var(--text-mono)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
        }}
      >
        {name || 'лого'}
      </span>
    </div>
  );
}
