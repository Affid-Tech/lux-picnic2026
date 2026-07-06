import React from 'react';
import { CategoryTag } from './CategoryTag.jsx';

/**
 * Agenda event card: a serif time column, a dashed rule, a category sticker,
 * title and location. The building block of the scrollable day agenda.
 */
export function EventCard({ time, duration, title, location, category = 'general', style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        padding: 16,
        background: 'var(--surface-card)',
        border: 'var(--border-hairline) solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
    >
      <div style={{ flex: 'none', textAlign: 'center', minWidth: 44 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', fontSize: '18px', lineHeight: 1, color: 'var(--text-strong)' }}>{time}</div>
        {duration ? (
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-medium)', fontSize: '10px', color: 'var(--text-mono)', marginTop: 3 }}>{duration}</div>
        ) : null}
      </div>
      <div style={{ flex: 1, minWidth: 0, borderLeft: '1px dashed var(--border-dashed)', paddingLeft: 14 }}>
        <div style={{ marginBottom: 8 }}>
          <CategoryTag category={category} size="sm" />
        </div>
        <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-card-title)', lineHeight: 1.25, color: 'var(--text-strong)' }}>{title}</h3>
        {location ? (
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-regular)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>{location}</p>
        ) : null}
      </div>
    </div>
  );
}
