'use client'

import { Search, Hash, List, History } from 'lucide-react'

export type Tab = 'abn' | 'name' | 'bulk' | 'history'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'abn', label: 'ABN Lookup', icon: <Hash className="w-4 h-4" /> },
  { id: 'name', label: 'Name Search', icon: <Search className="w-4 h-4" /> },
  { id: 'bulk', label: 'Bulk Lookup', icon: <List className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
]

export default function SearchTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
