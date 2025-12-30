import { format, parseISO } from 'date-fns'
import type { Locale } from 'date-fns'
import { enUS, enGB, fr, de, es, it, ja, ko, zhCN, ptBR } from 'date-fns/locale'

// Map Salesforce locale codes to date-fns locales
const localeMap: Record<string, Locale> = {
  en_US: enUS,
  en_GB: enGB,
  en_AU: enGB,
  fr: fr,
  fr_FR: fr,
  de: de,
  de_DE: de,
  es: es,
  es_ES: es,
  it: it,
  it_IT: it,
  ja: ja,
  ja_JP: ja,
  ko: ko,
  ko_KR: ko,
  zh_CN: zhCN,
  pt_BR: ptBR,
}

/**
 * Get the date-fns locale object for a Salesforce userLocale string.
 * Falls back to enUS if locale is not found.
 */
export function getDateFnsLocale(salesforceLocale: string | undefined): Locale {
  if (!salesforceLocale) return enUS
  // Try exact match first (e.g., 'en_US'), then language code (e.g., 'en')
  return localeMap[salesforceLocale] || localeMap[salesforceLocale.substring(0, 2)] || enUS
}

/**
 * Format a date value using the locale-aware short date format.
 * Example: 01/15/2024 (US) or 15/01/2024 (UK)
 */
export function formatDate(value: string | Date, locale: Locale = enUS): string {
  if (!value) return ''
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, 'P', { locale })
}

/**
 * Format a datetime value using the locale-aware short date and time format.
 * Example: 01/15/2024, 3:45 PM
 */
export function formatDateTime(value: string | Date, locale: Locale = enUS): string {
  if (!value) return ''
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, 'Pp', { locale })
}

/**
 * Format a date for Salesforce storage (ISO format: yyyy-MM-dd).
 * This format is locale-independent.
 */
export function formatDateForStorage(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Format a datetime for Salesforce storage (ISO 8601 format).
 * Returns format like: 2024-01-15T15:45:00.000Z
 * This format is locale-independent.
 */
export function formatDateTimeForStorage(date: Date): string {
  return date.toISOString()
}
