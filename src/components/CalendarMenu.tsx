import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

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

// Gap between the trigger and the panel, matching the previous `calc(100% + 6px)` offset.
const GAP = 6
// Above Sheet's overlay (zIndex 100) — the panel must float on top of an
// already-open modal, not be clipped/scrolled by its overflow:auto panel.
const PANEL_Z_INDEX = 1000

interface Placement {
  left: number
  top: number
}

/**
 * A small, generic "add to calendar" dropdown: a trigger button that reveals
 * a list of provider links/actions. Not built on `Sheet`'s modal machinery
 * (focus trap / scroll lock) — this is a lightweight disclosure, not a
 * full-screen dialog, and needs to work both standalone (Hero) and nested
 * inside an already-open Sheet (EventSheet).
 *
 * While open, the panel is portaled to `document.body` and positioned with
 * `position: fixed` from the trigger's own bounding rect — instead of a
 * document-flow child of the trigger. That keeps it from ever expanding
 * whatever scrollable ancestor it's opened inside of (notably Sheet's
 * `overflow-y: auto` panel, which would otherwise grow its scrollable area
 * and force an extra scroll to reveal the panel). It also flips to open
 * upward when there isn't room below in the viewport, e.g. Sheet's mobile
 * bottom-sheet layout, where "below" often runs past the fold.
 *
 * While closed, a second, non-portaled copy renders `hidden` in place of the
 * portal (which SSR can't render at all — portals are a no-op in
 * `renderToStaticMarkup`) so the item labels stay present in that output for
 * the project's static-render smoke tests.
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    // Any scroll (including Sheet's internal panel) or resize invalidates the
    // computed position — close rather than track it continuously, since
    // this is a transient disclosure, not a pinned tooltip.
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const select = (item: CalendarMenuItem) => {
    item.onSelect?.()
    setOpen(false)
  }

  const panelBody = (
    <>
      {hint ? <p style={HINT}>{hint}</p> : null}
      {items.map((item) => (
        <MenuItem key={item.key} item={item} onSelect={select} />
      ))}
    </>
  )

  // Computed fresh every render a trigger is available — cheap (one
  // getBoundingClientRect) and avoids stale placement after re-renders.
  const placement = open && triggerRef.current ? computePlacement(triggerRef.current, items.length, Boolean(hint)) : null

  return (
    <div ref={rootRef} style={{ position: 'relative', ...WRAPPER }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={triggerStyle ?? TRIGGER}
      >
        {triggerLabel} {open ? '↑' : '↓'}
      </button>
      {placement
        ? createPortal(
            <div
              ref={panelRef}
              role="menu"
              aria-label={menuLabel}
              style={{ ...PANEL, position: 'fixed', top: placement.top, left: placement.left, zIndex: PANEL_Z_INDEX }}
            >
              {panelBody}
            </div>,
            document.body,
          )
        : (
            // `hidden` toggles visibility (kept off the styled child below, since an
            // inline `display` on the same element would override the UA's
            // `[hidden]{display:none}` rule); the layout styling lives on the
            // nested child instead.
            <div role="menu" aria-label={menuLabel} hidden style={PANEL_POSITION}>
              <div style={PANEL}>{panelBody}</div>
            </div>
          )}
    </div>
  )
}

function MenuItem({ item, onSelect }: { item: CalendarMenuItem; onSelect: (item: CalendarMenuItem) => void }) {
  if (item.action.kind === 'link') {
    return (
      <a
        role="menuitem"
        href={item.action.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onSelect(item)}
        style={ITEM}
      >
        {item.label} ↗
      </a>
    )
  }
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        item.action.kind === 'button' && item.action.onClick()
        onSelect(item)
      }}
      style={ITEM}
    >
      {item.label}
    </button>
  )
}

/**
 * Where to float the panel, in viewport coordinates. Estimates the panel's
 * own height from its content (rather than measuring a not-yet-painted
 * node) to decide whether there's enough room below the trigger; if not —
 * and there's more room above — it opens upward instead.
 */
function computePlacement(trigger: HTMLElement, itemCount: number, hasHint: boolean): Placement {
  const rect = trigger.getBoundingClientRect()
  const panelHeight = estimatePanelHeight(itemCount, hasHint)
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const openUp = spaceBelow < panelHeight + GAP && spaceAbove > spaceBelow
  return {
    left: rect.left,
    top: openUp ? rect.top - panelHeight - GAP : rect.bottom + GAP,
  }
}

function estimatePanelHeight(itemCount: number, hasHint: boolean): number {
  const ITEM_HEIGHT = 44
  const ITEM_GAP = 2
  const PANEL_PADDING = 16 // var(--space-2) top + bottom
  const HINT_HEIGHT = 34
  const itemsHeight = itemCount * ITEM_HEIGHT + Math.max(0, itemCount - 1) * ITEM_GAP
  return itemsHeight + (hasHint ? HINT_HEIGHT : 0) + PANEL_PADDING
}

// `block`, not `inline-block`: a shrink-to-fit inline-block has no definite
// width for a `width: 100%` trigger (e.g. Hero's primary CTA) to resolve
// against, which left it inconsistently sized — and off-center — on wider
// screens. `block` gives percentage children the full header width to fill.
const WRAPPER: CSSProperties = { display: 'block' }

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

// Always `hidden` (see the call site) — this copy exists only so its item
// labels are present in `renderToStaticMarkup` output; the real, visible
// panel is the portaled one positioned via `computePlacement`. Split in two
// so `display` (on the nested `PANEL` child) doesn't fight the UA's
// `[hidden]{display:none}` rule by living on the same element.
const PANEL_POSITION: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
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
