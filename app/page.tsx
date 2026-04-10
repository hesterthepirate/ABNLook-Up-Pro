'use client'

import { useState } from 'react'
import SearchTabs, { type Tab } from '@/components/SearchTabs'
import AbnLookup from '@/components/AbnLookup'
import NameSearch from '@/components/NameSearch'
import BulkLookup from '@/components/BulkLookup'
import SearchHistory from '@/components/SearchHistory'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('abn')
  const [jumpAbn, setJumpAbn] = useState('')
  const [jumpName, setJumpName] = useState('')

  const handleSelectAbn = (abn: string) => {
    setJumpAbn(abn)
    setActiveTab('abn')
  }

  const handleSelectName = (name: string) => {
    setJumpName(name)
    setActiveTab('name')
  }

  return (
    <div className="bg-slate-50 min-h-full">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            ABN &amp; Business Search
          </h2>
          <p className="text-slate-500 text-base">
            Look up ABNs, search by business name, and bulk-validate up to 50 ABNs at once.
            More data than the ABR website — faster, cleaner.
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <SearchTabs active={activeTab} onChange={setActiveTab} />

          <div role="tabpanel">
            {activeTab === 'abn' && (
              <AbnLookup key={jumpAbn} initialAbn={jumpAbn} />
            )}
            {activeTab === 'name' && (
              <NameSearch
                key={jumpName}
                initialName={jumpName}
                onSelectAbn={handleSelectAbn}
              />
            )}
            {activeTab === 'bulk' && (
              <BulkLookup onSelectAbn={handleSelectAbn} />
            )}
            {activeTab === 'history' && (
              <SearchHistory
                onSelectAbn={handleSelectAbn}
                onSelectName={handleSelectName}
              />
            )}
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'ABN checksum validation',
            'Business name search',
            'Bulk lookup — 50 ABNs',
            'CSV export',
            'Search history',
            'Mobile friendly',
          ].map((f) => (
            <span
              key={f}
              className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-500 shadow-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
