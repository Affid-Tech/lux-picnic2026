import React from 'react';

/**
 * Compact full-day overview bar: proportional colour segments (one per
 * category block of the day) inside a rounded pill, with hour ticks below.
 */
const CAT_COLOR = {
  general: 'var(--cat-general)',
  it: 'var(--cat-it)',
  kids: 'var(--cat-kids)',
  games: 'var(--cat-games)',
};

export function DayOverviewBar({ segments = [], ticks = [], height = 16, style = {} }) {
  return (
    <div style={style}>
      <div
        style={{
          display: 'flex',
          gap: 3,
          height,
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        {segments.map((s, i) => (
          <div key={i} style={{ flex: s.flex || 1, background: CAT_COLOR[s.category] || 'var(--cat-general)' }} />
        ))}
      </div>
      {ticks.length > 0 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-medium)', fontSize: '10px', color: 'var(--text-mono)' }}>
          {ticks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
