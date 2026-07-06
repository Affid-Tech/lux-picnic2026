const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

const WEEKDAYS = [
  'воскресенье', 'понедельник', 'вторник', 'среда',
  'четверг', 'пятница', 'суббота',
]

/** Parse "YYYY-MM-DD" as a local calendar date (no timezone shift). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "2026-07-12" → "12 июля 2026". */
export function formatDateLong(iso: string): string {
  const d = parseDate(iso)
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`
}

/** "2026-07-12" → "воскресенье". */
export function formatWeekday(iso: string): string {
  return WEEKDAYS[parseDate(iso).getDay()]
}
