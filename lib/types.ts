export interface AbnResult {
  abn: string
  abnFormatted: string
  abnStatus: string
  abnStatusEffectiveFrom: string
  entityName: string
  entityType: string
  gstStatus: string
  gstEffectiveFrom: string
  mainBusinessLocation: string
  tradingNames: string[]
  businessNames: string[]
  acn?: string
  charity?: boolean
  error?: string
}

export interface SearchResult {
  abn: string
  abnFormatted: string
  entityName: string
  entityType: string
  state: string
  postcode: string
  status: string
}

export interface BulkResultRow {
  abn: string
  abnFormatted: string
  entityName: string
  entityType: string
  abnStatus: string
  gstStatus: string
  mainBusinessLocation: string
  error?: string
}

export interface HistoryEntry {
  type: 'abn' | 'name'
  query: string
  label: string
  timestamp: number
}
