import React from 'react';

/**
 * Sticker-style category tag. Four fixed program categories, each with its
 * own colour, a filled dot, a colour outline and a hard drop-shadow so it
 * reads like a printed sticker.
 */
export const CATEGORIES = {
  general: { label: 'Общее',   color: 'var(--cat-general)', text: '#5c5b54' },
  it:      { label: 'IT',      color: 'var(--cat-it)',      text: 'var(--cat-it)' },
  kids:    { label: 'Детская', color: 'var(--cat-kids)',    text: 'var(--cat-kids)' },
  games:   { label: 'Игры',    color: 'var(--cat-games)',   text: 'var(--cat-games)' },
};

export function CategoryTag({ category = 'general', label, size = 'md', style = {} }) {
  const c = CATEGORIES[category] || CATEGORIES.general;
  const sm = size === 'sm';
  const dot = sm ? 6 : 8;
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
        color: c.text,
        background: 'var(--surface-card)',
        border: `var(--border-sticker) solid ${c.color}`,
        padding: sm ? '5px 9px' : '7px 12px',
        borderRadius: 'var(--radius-pill)',
        boxShadow: '0 2px 0 rgba(0,0,0,.10)',
        ...style,
      }}
    >
      <span style={{ width: dot, height: dot, borderRadius: '50%', background: c.color }} />
      {label || c.label}
    </span>
  );
}
