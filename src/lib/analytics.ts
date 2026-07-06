// Thin, provider-agnostic analytics wrapper. It is a no-op until a provider is
// configured, so nothing is sent and no third-party script is required for the
// app to work. Privacy-friendly by construction: only coarse event names and
// non-PII ids/methods are ever passed — never visitor data.
//
// To enable later, implement a Provider (e.g. wrapping Plausible's
// `window.plausible` or GA4's `gtag`) and call `configureAnalytics(provider)`
// once at startup. No provider is baked in here on purpose (see PRD §9/§12).

export type AnalyticsEvent =
  | 'calendar_add_event'
  | 'calendar_add_whole_day'
  | 'partner_outbound'
  | 'cta_click'

export type AnalyticsProps = Record<string, string | number>

export interface AnalyticsProvider {
  track(event: AnalyticsEvent, props?: AnalyticsProps): void
}

let provider: AnalyticsProvider | null = null

/** Install (or clear, with `null`) the active analytics provider. */
export function configureAnalytics(next: AnalyticsProvider | null): void {
  provider = next
}

/**
 * Record a product signal. No-op unless a provider is configured.
 * Contract: pass only coarse, non-PII values in `props` — event/partner ids and
 * enum-like methods ('ics'/'gcal'). Never visitor identifiers, emails, or URLs.
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (!provider) return
  try {
    provider.track(event, props)
  } catch {
    // Analytics must never break the app.
  }
}
