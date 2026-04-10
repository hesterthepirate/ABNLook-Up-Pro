'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ExternalLink, Building2, MapPin, Loader2 } from 'lucide-react'
import type { SearchResult } from '@/lib/types'
import { exportSearchToCsv, downloadCsv } from '@/lib/csv'
import { addHistory } from '@/lib/history'
import ExportButton from './ExportButton'

interface Props {
  onSelectAbn: (abn: string) => void
  initialName?: string
}

export default function NameSearch({ onSelectAbn, initialName = '' }: Props) {
  const [query, setQuery] = useState(initialName)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-trigger search when jumping in from history
  useEffect(() => {
    if (initialName && initialName.length >= 2) {
      runSearch(initialName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runSearch = async (term: string) => {
    setLoading(true)
    setError('')
    setSearched(false)
    try {
      const res = await fetch(`/api/search?name=${encodeURIComponent(term)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Search failed')
        setResults([])
        return
      }
      setResults(data.results ?? [])
      setSearched(true)
      addHistory({ type: 'name', query: term, label: term })
    } catch {
      setError('Network error — please try again')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) {
      setError('Enter at least 2 characters to search')
      return
    }
    runSearch(trimmed)
  }

  const handleExport = () => {
    if (results.length === 0) return
    const csv = exportSearchToCsv(results)
    downloadCsv(csv, `abn-search-${query.trim().replace(/\s+/g, '-')}.csv`)
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter business or entity name..."
            className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            aria-label="Business name search"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="px-5 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {searched && results.length === 0 && !error && (
        <div className="text-center py-10 text-slate-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No results found for &ldquo;{query}&rdquo;</p>
          <p className="text-xs mt-1">Try a different spelling or partial name</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{results.length}</span> results for &ldquo;{query}&rdquo;
            </p>
            <ExportButton onClick={handleExport} label="Export CSV" disabled={results.length === 0} />
          </div>

          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.abn}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {result.entityName}
                    </span>
                    {result.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        result.status.toLowerCase().includes('active')
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {result.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                    <span className="font-mono">{result.abnFormatted}</span>
                    {result.entityType && <span>{result.entityType}</span>}
                    {(result.state || result.postcode) && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {[result.state, result.postcode].filter(Boolean).join(' ')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onSelectAbn(result.abn)}
                  className="ml-3 shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`View full details for ${result.entityName}`}
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
