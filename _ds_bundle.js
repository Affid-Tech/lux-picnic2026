/* ============================================================
   _ds_bundle.js — browser bundle of components/core/*.jsx.
   Loaded as a plain <script> (before Babel) by the UI kits and
   core.card.html; exposes the components as a global namespace
   the HTML discovers via a `'CategoryTag' in o && 'EventCard' in o`
   scan of window. Uses React.createElement (no JSX) so it runs
   without transpilation. Keep in sync with components/core/*.jsx.
   ============================================================ */
(function () {
  'use strict';
  var React = window.React;
  if (!React) throw new Error('_ds_bundle: window.React is not available yet');
  var h = React.createElement;

  // --- CategoryTag -------------------------------------------------
  var CATEGORIES = {
    general: { label: 'Общее',   color: 'var(--cat-general)', text: '#5c5b54' },
    it:      { label: 'IT',      color: 'var(--cat-it)',      text: 'var(--cat-it)' },
    kids:    { label: 'Детская', color: 'var(--cat-kids)',    text: 'var(--cat-kids)' },
    games:   { label: 'Игры',    color: 'var(--cat-games)',   text: 'var(--cat-games)' },
  };

  function CategoryTag(props) {
    props = props || {};
    var category = props.category || 'general';
    var size = props.size || 'md';
    var style = props.style || {};
    var c = CATEGORIES[category] || CATEGORIES.general;
    var sm = size === 'sm';
    var dot = sm ? 6 : 8;
    return h('span', {
      style: Object.assign({
        display: 'inline-flex',
        alignItems: 'center',
        gap: sm ? 5 : 6,
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-semibold)',
        fontSize: sm ? '11px' : 'var(--fs-label)',
        lineHeight: 1,
        color: c.text,
        background: 'var(--surface-card)',
        border: 'var(--border-sticker) solid ' + c.color,
        padding: sm ? '5px 9px' : '7px 12px',
        borderRadius: 'var(--radius-pill)',
        boxShadow: '0 2px 0 rgba(0,0,0,.10)',
      }, style),
    },
      h('span', { style: { width: dot, height: dot, borderRadius: '50%', background: c.color } }),
      props.label || c.label
    );
  }

  // --- Button ------------------------------------------------------
  var BTN_VARIANTS = {
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

  function Button(props) {
    props = props || {};
    var variant = props.variant || 'primary';
    var fullWidth = props.fullWidth || false;
    var style = props.style || {};
    var children = props.children;
    var rest = {};
    for (var k in props) {
      if (k !== 'variant' && k !== 'fullWidth' && k !== 'style' && k !== 'children') rest[k] = props[k];
    }
    var v = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
    return h('button', Object.assign({}, rest, {
      style: Object.assign({
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-bold)',
        fontSize: '14px',
        lineHeight: 1,
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'background .15s ease',
      }, v, style),
    }), children);
  }

  // --- EventCard ---------------------------------------------------
  function EventCard(props) {
    props = props || {};
    var category = props.category || 'general';
    var style = props.style || {};
    return h('div', {
      style: Object.assign({
        display: 'flex', gap: 14, padding: 16,
        background: 'var(--surface-card)',
        border: 'var(--border-hairline) solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
      }, style),
    },
      h('div', { style: { flex: 'none', textAlign: 'center', minWidth: 44 } },
        h('div', { style: { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', fontSize: '18px', lineHeight: 1, color: 'var(--text-strong)' } }, props.time),
        props.duration ? h('div', { style: { fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-medium)', fontSize: '10px', color: 'var(--text-mono)', marginTop: 3 } }, props.duration) : null
      ),
      h('div', { style: { flex: 1, minWidth: 0, borderLeft: '1px dashed var(--border-dashed)', paddingLeft: 14 } },
        h('div', { style: { marginBottom: 8 } }, h(CategoryTag, { category: category, size: 'sm' })),
        h('h3', { style: { margin: '0 0 4px', fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-card-title)', lineHeight: 1.25, color: 'var(--text-strong)' } }, props.title),
        props.location ? h('p', { style: { margin: 0, fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-regular)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' } }, props.location) : null
      )
    );
  }

  // --- DayOverviewBar ----------------------------------------------
  var CAT_COLOR = {
    general: 'var(--cat-general)',
    it: 'var(--cat-it)',
    kids: 'var(--cat-kids)',
    games: 'var(--cat-games)',
  };

  function DayOverviewBar(props) {
    props = props || {};
    var segments = props.segments || [];
    var ticks = props.ticks || [];
    var height = props.height == null ? 16 : props.height;
    var style = props.style || {};
    return h('div', { style: style },
      h('div', {
        style: { display: 'flex', gap: 3, height: height, borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: 8 },
      }, segments.map(function (s, i) {
        return h('div', { key: i, style: { flex: s.flex || 1, background: CAT_COLOR[s.category] || 'var(--cat-general)' } });
      })),
      ticks.length > 0 ? h('div', {
        style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-medium)', fontSize: '10px', color: 'var(--text-mono)' },
      }, ticks.map(function (t, i) { return h('span', { key: i }, t); })) : null
    );
  }

  // --- PartnerTile -------------------------------------------------
  function PartnerTile(props) {
    props = props || {};
    var brand = props.brand || false;
    var style = props.style || {};
    return h('div', {
      style: Object.assign({
        height: 56,
        background: 'var(--surface-card)',
        border: 'var(--border-hairline) solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: brand ? 'var(--font-body)' : 'var(--font-mono)',
        fontWeight: brand ? 'var(--fw-semibold)' : 'var(--fw-medium)',
        fontSize: brand ? '11px' : '10px',
        color: brand ? 'var(--accent)' : 'var(--text-mono)',
      }, style),
    }, props.name || 'лого');
  }

  // --- SectionHeading ----------------------------------------------
  function SectionHeading(props) {
    props = props || {};
    var style = props.style || {};
    return h('div', { style: Object.assign({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }, style) },
      h('h2', { style: { margin: 0, fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-title)', lineHeight: 1, color: 'var(--text-strong)' } }, props.children),
      props.meta ? h('span', { style: { fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-medium)', fontSize: 'var(--fs-label)', color: 'var(--text-muted)', whiteSpace: 'nowrap' } }, props.meta) : null
    );
  }

  window.PiknikDS = {
    Button: Button,
    CategoryTag: CategoryTag,
    CATEGORIES: CATEGORIES,
    EventCard: EventCard,
    DayOverviewBar: DayOverviewBar,
    PartnerTile: PartnerTile,
    SectionHeading: SectionHeading,
  };
})();
