'use client'

import { useState, useEffect } from 'react'
import { Hash, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import type { AbnResult } from '@/lib/types'
import { validateAbn } from '@/lib/validate-abn'
import { addHistory } from '@/lib/history'
import ResultCard from './ResultCard'

interface Props {
  initialAbn?: string
}

export default function AbnLookup({ initialAbn = '' }: Props) {
  const [input, setInput] = useState(initialAbn)
  const [result, setResult] = useState<AbnResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validation = input.trim() ? validateAbn(input) : null

  // Auto-trigger lookup when jumping in from history or bulk
  useEffect(() => {
    if (initialAbn) {
      const clean = initialAbn.replace(/\s+/g, '').replace(/-/g, '')
      const { valid } = validateAbn(clean)
      if (valid) runLookup(clean)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runLookup = async (abn: string) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`/api/lookup?abn=${abn}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Lookup failed')
        return
      }
      setResult(data)
      addHistory({
        type: 'abn',
        query: abn,
        label: data.entityName
          ? `${data.entityName} (${data.abnFormatted})`
          : data.abnFormatted,
      })
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    const abn = input.replace(/\s+/g, '').replace(/-/g, '')

    if (!abn) {
      setError('Enter an ABN to look up')
      return
    }

    const { valid, error: validErr } = validateAbn(abn)
    if (!valid) {
      setError(validErr ?? 'Invalid ABN')
      return
    }

    runLookup(abn)
  }

  const showValidation = input.trim().replace(/\s+/g, '').length === 11 && validation !== null

  return (
    <div className="space-y-5">
      <form onSubmit={handleLookup} className="space-y-3">
        <div>
          <label htmlFor="abn-input" className="block text-sm font-medium text-slate-700 mb-1.5">
            Australian Business Number (ABN)
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="abn-input"
              type="text"
              inputMode="numeric"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError('')
                setResult(null)
              }}
              placeholder="e.g. 51 824 753 556"
              maxLength={14}
              className={`w-full pl-9 pr-10 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                showValidation
                  ? validation?.valid
                    ? 'border-emerald-400 focus:ring-emerald-400 bg-emerald-50'
                    : 'border-red-400 focus:ring-red-400 bg-red-50'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              aria-describedby="abn-validation"
              autoComplete="off"
            />
            {showValidation && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation?.valid
                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                  : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            )}
          </div>

          {showValidation && (
            <p
              id="abn-validation"
              className={`mt-1 text-xs ${validation?.valid ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {validation?.valid ? 'Valid ABN format' : validation?.error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (showValidation && !validation?.valid)}
          className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Looking up...
            </>
          ) : (
            'Look Up ABN'
          )}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result && <ResultCard result={result} />}
    </div>
  )
}
