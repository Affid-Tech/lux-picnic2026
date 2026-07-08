import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useScrollLock } from '../hooks/useScrollLock'

const ENTER_MS = 240

/**
 * Accessible modal shell — a bottom sheet on mobile/tablet, a centered
 * dialog on desktop (>=1024px, see the --sheet-* custom properties in
 * desktop.css). Same dialog semantics, focus trap, scroll lock and Esc /
 * backdrop-tap dismissal either way; only the CSS entry animation and
 * panel shape differ (slide-up-from-bottom vs. fade/scale-in centered),
 * both collapsing to an instant swap under `prefers-reduced-motion`.
 *
 * No translucent scrim (the design bans transparency): the opaque panel lifts
 * off the page with the soft screen shadow, and the uncovered strip above it is
 * a transparent, click-to-close hit area that renders nothing.
 */
export function Sheet({
  labelledById,
  closeLabel,
  onClose,
  children,
}: {
  labelledById: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}) {
  const reduced = usePrefersReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  
  // FIXED LINE 30: Use number | undefined initialized to undefined
  const closeTimer = useRef<number | undefined>(undefined)
  
  const closedRef = useRef(false)
  const [entered, setEntered] = useState(reduced)
  const [closing, setClosing] = useState(false)

  useScrollLock(true)
  useFocusTrap(panelRef, true)
  useBackgroundInert()

  useEffect(() => {
    if (reduced) return setEntered(true)
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  // Fire onClose at most once, and never after unmount.
  const finishClose = useCallback(() => {
    if (closedRef.current) return
    closedRef.current = true
    
    // FIXED LINE 49: Only clear if the timer is defined
    if (closeTimer.current !== undefined) {
      window.clearTimeout(closeTimer.current)
    }
    
    onClose()
  }, [onClose])

  const requestClose = useCallback(() => {
    if (reduced) return finishClose()
    setClosing(true)
    closeTimer.current = window.setTimeout(finishClose, ENTER_MS + 40) // fallback if transitionend is missed
  }, [reduced, finishClose])

  // FIXED LINE 59: Only clear if the timer is defined
  useEffect(() => () => {
    if (closeTimer.current !== undefined) {
      window.clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [requestClose])

  const hidden = !entered || closing
  return (
    <div
      style={OVERLAY}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        tabIndex={-1}
        onTransitionEnd={(e) => {
          if (closing && (e.propertyName === 'transform' || e.propertyName === 'opacity')) finishClose()
        }}
        style={{
          ...PANEL,
          transform: hidden
            ? ('var(--sheet-transform-hidden, translateY(100%))' as CSSProperties['transform'])
            : ('var(--sheet-transform-shown, translateY(0))' as CSSProperties['transform']),
          opacity: hidden ? 'var(--sheet-opacity-hidden, 1)' : 1,
          transition: reduced ? undefined : `transform ${ENTER_MS}ms ease, opacity ${ENTER_MS}ms ease`,
        }}
      >
        <div style={HEADER}>
          {/* Grabber: the conventional bottom-sheet affordance signalling this
              panel is a dismissible sheet (decorative — Esc/backdrop/✕ dismiss).
              Hidden on desktop, where the panel is a centered dialog instead. */}
          <span aria-hidden className="pk-sheet-grabber" style={GRABBER} />
          <button type="button" aria-label={closeLabel} onClick={requestClose} style={CLOSE_BTN}>
            <span aria-hidden>✕</span>
          </button>
        </div>
        <div style={{ padding: '0 var(--gutter) var(--space-8)' }}>{children}</div>
      </div>
    </div>
  )
}

/**
 * While a dialog is open, mark the background page `inert` + `aria-hidden` so
 * assistive tech (SR browse mode) and Tab order can't reach it. Targets the
 * `#page-content` wrapper by id, per the getElementById-only policy.
 */
function useBackgroundInert(): void {
  useEffect(() => {
    const bg = document.getElementById('page-content')
    if (!bg) return
    bg.setAttribute('inert', '')
    bg.setAttribute('aria-hidden', 'true')
    return () => {
      bg.removeAttribute('inert')
      bg.removeAttribute('aria-hidden')
    }
  }, [])
}

const OVERLAY = {
  position: 'fixed' as const,
  inset: 0,
  zIndex: 100,
  display: 'flex',
  // Bottom-anchored sheet on mobile/tablet; desktop.css redefines this to
  // 'center' for a centered dialog (>=1024px).
  alignItems: 'var(--sheet-align, flex-end)' as CSSProperties['alignItems'],
  justifyContent: 'center',
}

const PANEL = {
  width: '100%',
  maxWidth: 'var(--sheet-max-w, 460px)',
  maxHeight: '92vh',
  overflowY: 'auto' as const,
  background: 'var(--surface-page)',
  borderTopLeftRadius: 'var(--radius-xl)',
  borderTopRightRadius: 'var(--radius-xl)',
  // Square on mobile/tablet (flush with the viewport bottom); desktop.css
  // rounds these too once the panel is a free-floating centered dialog.
  borderBottomLeftRadius: 'var(--sheet-radius-bottom, 0)',
  borderBottomRightRadius: 'var(--sheet-radius-bottom, 0)',
  boxShadow: 'var(--shadow-screen)',
  WebkitOverflowScrolling: 'touch' as const,
}

const HEADER = {
  position: 'sticky' as const,
  top: 0,
  zIndex: 1,
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 'var(--space-4) var(--space-3) var(--space-2)',
  background: 'var(--surface-page)',
}

const GRABBER = {
  position: 'absolute' as const,
  top: 8,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 36,
  height: 4,
  borderRadius: 'var(--radius-pill)',
  background: 'var(--border-card)',
}

const CLOSE_BTN = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  fontSize: '18px',
  color: 'var(--text-strong)',
  background: 'var(--surface-card)',
  border: 'var(--border-hairline) solid var(--border-card)',
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-card)',
}
