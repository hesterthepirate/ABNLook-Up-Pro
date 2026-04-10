'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import ResultCard from '@/components/ResultCard'

interface LookupResult {
  abn: string
  entityName: string
  abnStatus: string
  gstRegistered: string | null
  gstCancelledDate: string | null
  error?: string
}

export default function Home() {
  const [abn, setAbn] = useState('')
  const [result, setResult] = useState<LookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const stripped = abn.replace(/\s/g, '')
    if (stripped.length !== 11) {
      setError('ABN must be 11 digits')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/lookup?abn=${stripped}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Lookup failed')
      } else {
        setResult(data)
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const formatted = abn
    .replace(/\s/g, '')
    .replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')

  return (
    <div>
      <p className="text-gray-500 mb-6 text-sm">
        Enter an 11-digit ABN to look up Australian business details.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={(e) => setAbn(e.target.value.replace(/\s/g, ''))}
          placeholder="12 345 678 901"
          maxLength={14}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white px-5 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          <Search size={18} />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {result && <ResultCard {...result} />}
    </div>
  )
}
