'use client'

import { useState, useEffect } from 'react'
import { History, Hash, Search, Trash2, Clock } from 'lucide-react'
import type { HistoryEntry } from '@/lib/types'
import { getHistory, clearHistory } from '@/lib/history'

interface Props {
  onSelectAbn: (abn: string) => void
  onSelectName: (name: string) => void
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function SearchHistory({ onSelectAbn, onSelectName }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setEntries(getHistory())
  }, [])

  const handleClear = () => {
    clearHistory()
    setEntries([])
  }

  const handleSelect = (entry: HistoryEntry) => {
    if (entry.type === 'abn') {
      onSelectAbn(entry.query)
    } else {
      onSelectName(entry.query)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No search history yet</p>
        <p className="text-xs mt-1">Your last 20 searches will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{entries.length}</span> recent searches
        </p>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear history
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <button
            key={`${entry.type}-${entry.query}-${entry.timestamp}`}
            onClick={() => handleSelect(entry)}
            className="w-full flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-left group"
          >
            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              entry.type === 'abn' ? 'bg-blue-50' : 'bg-violet-50'
            }`}>
              {entry.type === 'abn'
                ? <Hash className="w-4 h-4 text-blue-600" />
                : <Search className="w-4 h-4 text-violet-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{entry.label}</p>
              <p className="text-xs text-slate-400 capitalize">{entry.type === 'abn' ? 'ABN Lookup' : 'Name Search'}</p>
            </div>
            <div className="shrink-0 flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {timeAgo(entry.timestamp)}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
