import React from 'react';

/**
 * Flat partner logo tile. Cream surface, hairline border. Use `brand` for the
 * host / headline partner (renders the name in the terracotta accent); the
 * rest are placeholders until real logos land.
 */
export function PartnerTile({ name, brand = false, style = {} }) {
  return (
    <div
      style={{
        height: 56,
        background: 'var(--surface-card)',
        border: 'var(--border-hairline) solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: brand ? 'var(--font-body)' : 'var(--font-mono)',
        fontWeight: brand ? 'var(--fw-semibold)' : 'var(--fw-medium)',
        fontSize: brand ? '11px' : '10px',
        color: brand ? 'var(--accent)' : 'var(--text-mono)',
        ...style,
      }}
    >
      {name || 'лого'}
    </div>
  );
}
