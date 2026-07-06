import React from 'react';

/**
 * Primary action button — terracotta pill for the main CTA,
 * bordered cream for secondary. Onest, bold, rounded-md.
 */
const VARIANTS = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--accent-on)',
    border: 'var(--border-sticker) solid transparent',
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--text-strong)',
    border: 'var(--border-sticker) solid var(--border-card)',
  },
};

export function Button({ variant = 'primary', fullWidth = false, children, style = {}, ...rest }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button
      {...rest}
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-bold)',
        fontSize: '14px',
        lineHeight: 1,
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'background .15s ease',
        ...v,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
