// Browser-only side effect (not unit-tested): stream text content to the user
// as a downloaded file via a transient Blob URL. Used for the .ics exports.

/** Trigger a client-side file download of `content` under `filename`. */
export function downloadTextFile(
  filename: string,
  content: string,
  mime = 'text/calendar',
): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Defer revocation: revoking synchronously after click() cancels the download
  // in some browsers.
  window.setTimeout(() => URL.revokeObjectURL(href), 0)
}

/** Filesystem-safe slug for an .ics filename, keeping Cyrillic letters. */
export function icsFilename(id: string): string {
  const safe = id.replace(/[^\wЀ-ӿ-]+/g, '-').replace(/^-+|-+$/g, '')
  return `${safe || 'event'}.ics`
}
