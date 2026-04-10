import type { AbnResult, BulkResultRow, SearchResult } from './types'

function escapeCell(value: string | undefined): string {
  const str = value ?? ''
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function row(cells: string[]): string {
  return cells.map(escapeCell).join(',')
}

export function exportSingleToCsv(result: AbnResult): string {
  const headers = [
    'ABN',
    'Entity Name',
    'ABN Status',
    'ABN Status From',
    'Entity Type',
    'GST Status',
    'GST From',
    'Main Business Location',
    'Trading Names',
    'Business Names',
  ]

  const dataRow = [
    result.abnFormatted,
    result.entityName,
    result.abnStatus,
    result.abnStatusEffectiveFrom,
    result.entityType,
    result.gstStatus,
    result.gstEffectiveFrom,
    result.mainBusinessLocation,
    result.tradingNames.join(' | '),
    result.businessNames.join(' | '),
  ]

  return [row(headers), row(dataRow)].join('\n')
}

export function exportSearchToCsv(results: SearchResult[]): string {
  const headers = ['ABN', 'Entity Name', 'Entity Type', 'State', 'Postcode', 'Status']

  const dataRows = results.map((r) =>
    row([r.abnFormatted, r.entityName, r.entityType, r.state, r.postcode, r.status])
  )

  return [row(headers), ...dataRows].join('\n')
}

export function exportBulkToCsv(results: BulkResultRow[]): string {
  const headers = [
    'ABN',
    'Entity Name',
    'Entity Type',
    'ABN Status',
    'GST Status',
    'Main Business Location',
    'Error',
  ]

  const dataRows = results.map((r) =>
    row([
      r.abnFormatted || r.abn,
      r.entityName,
      r.entityType,
      r.abnStatus,
      r.gstStatus,
      r.mainBusinessLocation,
      r.error ?? '',
    ])
  )

  return [row(headers), ...dataRows].join('\n')
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
