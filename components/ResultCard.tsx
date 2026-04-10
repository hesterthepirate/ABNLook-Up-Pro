'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Copy, Check, MapPin, Building2, Tag, FileText } from 'lucide-react'
import type { AbnResult } from '@/lib/types'
import { exportSingleToCsv, downloadCsv } from '@/lib/csv'
import ExportButton from './ExportButton'

interface Props {
  result: AbnResult
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status.toLowerCase().includes('active')
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
      }`}
    >
      {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status || 'Unknown'}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      title="Copy ABN"
      aria-label="Copy ABN to clipboard"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-emerald-500" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 sm:w-48 shrink-0 mb-0.5 sm:mb-0 sm:pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-slate-800 font-medium">{value}</dd>
    </div>
  )
}

export default function ResultCard({ result }: Props) {
  const handleExport = () => {
    const csv = exportSingleToCsv(result)
    downloadCsv(csv, `abn-${result.abn}.csv`)
  }

  const abnStatusFull = [
    result.abnStatus,
    result.abnStatusEffectiveFrom ? `(from ${result.abnStatusEffectiveFrom})` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const gstStatusFull = [
    result.gstStatus,
    result.gstEffectiveFrom ? `(from ${result.gstEffectiveFrom})` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight">
              {result.entityName || 'Unknown Entity'}
            </h2>
            <div className="flex items-center mt-1.5">
              <span className="text-slate-300 text-sm font-mono tracking-wider">
                {result.abnFormatted}
              </span>
              <CopyButton text={result.abn} />
            </div>
          </div>
          <div className="shrink-0 pt-1">
            {result.abnStatus && <StatusBadge status={result.abnStatus} />}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-2">
        <dl>
          <DataRow label="ABN Status" value={abnStatusFull} />
          <DataRow label="Entity Type" value={result.entityType} />
          <DataRow label="GST Status" value={gstStatusFull} />
          {result.mainBusinessLocation && (
            <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-slate-100">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 sm:w-48 shrink-0 mb-0.5 sm:mb-0 sm:pt-0.5">
                Main Location
              </dt>
              <dd className="text-sm text-slate-800 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {result.mainBusinessLocation}
              </dd>
            </div>
          )}
        </dl>

        {result.tradingNames.length > 0 && (
          <div className="py-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Trading Names
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.tradingNames.map((name) => (
                <span key={name} className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-lg">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.businessNames.length > 0 && (
          <div className="py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Business Names
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.businessNames.map((name) => (
                <span key={name} className="px-2.5 py-1 bg-violet-50 text-violet-800 text-xs font-medium rounded-lg">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Source: abr.business.gov.au
        </span>
        <ExportButton onClick={handleExport} />
      </div>
    </div>
  )
}
