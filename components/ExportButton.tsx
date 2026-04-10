'use client'

import { Download } from 'lucide-react'

interface Props {
  onClick: () => void
  label?: string
  disabled?: boolean
}

export default function ExportButton({ onClick, label = 'Export CSV', disabled = false }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}
