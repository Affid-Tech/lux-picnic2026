import { useEffect, useRef, useState, type CSSProperties } from 'react'

export type CalendarMenuAction =
  | { kind: 'link'; href: string }
  | { kind: 'button'; onClick: () => void }

export interface CalendarMenuItem {
  key: string
  label: string
  action: CalendarMenuAction
  /** Analytics hook — fires on click, before the menu closes. */
  onSelect?: () => void
}

/**
 * A small, generic "add to calendar" dropdown: a trigger button that reveals
 * a list of provider links/actions. Not built on `Sheet`'s modal machinery
 * (focus trap / scroll lock) — this is a lightweight disclosure, not a
 * full-screen dialog, and needs to work both standalone (Hero) and nested
 * inside an already-open Sheet (EventSheet).
 *
 * Visibility is toggled via the `hidden` attribute rather than conditional
 * JSX, so the (visually closed) menu's item labels stay present in
 * `renderToStaticMarkup` output for the project's static-render smoke tests.
 */
export function CalendarMenu({
  triggerLabel,
  triggerStyle,
  menuLabel,
  hint,
  items,
}: {
  triggerLabel: string
  triggerStyle?: CSSProperties
  menuLabel: string
  hint?: string
  items: CalendarMenuItem[]
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const select = (item: CalendarMenuItem) => {
    item.onSelect?.()
    setOpen(false)
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', ...WRAPPER }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={triggerStyle ?? TRIGGER}
      >
        {triggerLabel} {open ? '↑' : '↓'}
      </button>
      {/* `hidden` toggles visibility (kept off the styled child below, since an
          inline `display` on the same element would override the UA's
          `[hidden]{display:none}` rule); the layout styling lives on the
          nested child instead. Static-render smoke tests still see every item
          label regardless of `open`, since `hidden` doesn't remove children. */}
      <div role="menu" aria-label={menuLabel} hidden={!open} style={PANEL_POSITION}>
        <div style={PANEL}>
          {hint ? <p style={HINT}>{hint}</p> : null}
          {items.map((item) =>
            item.action.kind === 'link' ? (
              <a
                key={item.key}
                role="menuitem"
                href={item.action.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => select(item)}
                style={ITEM}
              >
                {item.label} ↗
              </a>
            ) : (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.action.kind === 'button' && item.action.onClick()
                  select(item)
                }}
                style={ITEM}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

const WRAPPER: CSSProperties = { display: 'inline-block' }

const TRIGGER: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
  padding: '10px 16px',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-strong)',
  background: 'var(--surface-card)',
  border: 'var(--border-sticker) solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
}

// Split in two: `PANEL_POSITION` carries only positioning and lives on the
// `hidden`-toggled element (no `display` — see the note at the call site);
// `PANEL` carries the visual/layout styling and lives on a nested child.
const PANEL_POSITION: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  zIndex: 5,
}

const PANEL: CSSProperties = {
  minWidth: 220,
  display: 'grid',
  gap: 2,
  padding: 'var(--space-2)',
  background: 'var(--surface-card)',
  border: 'var(--border-hairline) solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-card)',
}

const HINT: CSSProperties = {
  margin: '2px 10px 6px',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--fs-caption)',
  color: 'var(--text-muted)',
  maxWidth: '26ch',
}

const ITEM: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  minHeight: 44,
  padding: '10px',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-strong)',
  background: 'none',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  textAlign: 'left',
  textDecoration: 'none',
  cursor: 'pointer',
}
