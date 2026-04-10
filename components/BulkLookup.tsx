'use client'

import { useState } from 'react'
import { List, Loader2, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react'
import type { BulkResultRow } from '@/lib/types'
import { exportBulkToCsv, downloadCsv } from '@/lib/csv'
import ExportButton from './ExportButton'

type SortKey = keyof Pick<BulkResultRow, 'abn' | 'entityName' | 'entityType' | 'abnStatus' | 'gstStatus' | 'mainBusinessLocation'>
type SortDir = 'asc' | 'desc'

interface Props {
  onSelectAbn: (abn: string) => void
}

export default function BulkLookup({ onSelectAbn }: Props) {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<BulkResultRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('entityName')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const abnLines = input
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const handleLookup = async () => {
    if (abnLines.length === 0) {
      setError('Paste at least one ABN')
      return
    }
    if (abnLines.length > 50) {
      setError('Maximum 50 ABNs at a time')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abns: abnLines }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Bulk lookup failed')
        return
      }

      setResults(data.results ?? [])
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...results].sort((a, b) => {
    const av = (a[sortKey] ?? '').toString().toLowerCase()
    const bv = (b[sortKey] ?? '').toString().toLowerCase()
    const cmp = av.localeCompare(bv)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const handleExport = () => {
    if (results.length === 0) return
    const csv = exportBulkToCsv(sorted)
    downloadCsv(csv, 'abn-bulk-results.csv')
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />
  }

  function ThButton({ col, label }: { col: SortKey; label: string }) {
    return (
      <th
        scope="col"
        className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
        onClick={() => handleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label}
          <SortIcon col={col} />
        </span>
      </th>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="bulk-input" className="block text-sm font-medium text-slate-700 mb-1.5">
          Paste ABNs — one per line (max 50)
        </label>
        <textarea
          id="bulk-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`51 824 753 556\n83 914 571 673\n...`}
          rows={6}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-shadow"
          aria-describedby="bulk-count"
        />
        <div id="bulk-count" className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-slate-400">
            {abnLines.length} ABN{abnLines.length !== 1 ? 's' : ''} entered
            {abnLines.length > 50 && (
              <span className="text-red-500 ml-1">— max 50</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleLookup}
          disabled={loading || abnLines.length === 0 || abnLines.length > 50}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <List className="w-4 h-4" />}
          {loading ? `Looking up ${abnLines.length} ABNs...` : 'Lookup All'}
        </button>
        {results.length > 0 && (
          <ExportButton onClick={handleExport} label="Export CSV" />
        )}
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <ThButton col="abn" label="ABN" />
                <ThButton col="entityName" label="Entity Name" />
                <ThButton col="entityType" label="Type" />
                <ThButton col="abnStatus" label="ABN Status" />
                <ThButton col="gstStatus" label="GST" />
                <ThButton col="mainBusinessLocation" label="Location" />
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sorted.map((row) => {
                const isActive = row.abnStatus.toLowerCase().includes('active')
                return (
                  <tr key={row.abn} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {row.abnFormatted || row.abn}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800 max-w-[200px] truncate">
                      {row.error
                        ? <span className="text-red-500 text-xs">{row.error}</span>
                        : row.entityName || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                      {row.entityType || '—'}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {row.abnStatus ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          isActive ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          {isActive
                            ? <CheckCircle className="w-3 h-3" />
                            : <XCircle className="w-3 h-3" />}
                          {row.abnStatus}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">
                      {row.gstStatus || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">
                      {row.mainBusinessLocation || '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      {!row.error && (
                        <button
                          onClick={() => onSelectAbn(row.abn)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                        >
                          View detail
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
