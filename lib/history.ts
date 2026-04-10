import type { HistoryEntry } from './types'

const STORAGE_KEY = 'abnlookuppro_history'
const MAX_ENTRIES = 20

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export function addHistory(entry: Omit<HistoryEntry, 'timestamp'>): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getHistory()
    const filtered = existing.filter(
      (h) => !(h.type === entry.type && h.query === entry.query)
    )
    const next: HistoryEntry[] = [
      { ...entry, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable — silent fail
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silent fail
  }
}
