import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import type { SearchResult } from '@/lib/types'

const ABR_BASE = 'https://abr.business.gov.au'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim()

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Search name must be at least 2 characters' }, { status: 400 })
  }

  try {
    const url = `${ABR_BASE}/Search/ResultsActive?SearchText=${encodeURIComponent(name)}&SearchType=0`
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
        Referer: `${ABR_BASE}/`,
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`ABR search returned ${res.status}`)
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    const results: SearchResult[] = []

    // ABR search results are in a table with class "table" or similar
    // Each row: ABN | Entity name | Entity type | State | Postcode | Status
    $('table tbody tr, table tr').each((_, row) => {
      const cells = $('td', row)
      if (cells.length < 3) return

      const abnRaw = $(cells[0]).text().trim().replace(/\s+/g, '')
      const entityName = $(cells[1]).text().trim()
      const entityType = $(cells[2]).text().trim()
      const state = $(cells[3])?.text().trim() ?? ''
      const postcode = $(cells[4])?.text().trim() ?? ''
      const status = $(cells[5])?.text().trim() ?? 'Active'

      // Skip header rows
      if (!abnRaw || !/\d{11}/.test(abnRaw.replace(/\s/g, ''))) return

      const abn = abnRaw.replace(/\s/g, '')
      const abnFormatted = `${abn.slice(0, 2)} ${abn.slice(2, 5)} ${abn.slice(5, 8)} ${abn.slice(8, 11)}`

      results.push({
        abn,
        abnFormatted,
        entityName,
        entityType,
        state,
        postcode,
        status,
      })
    })

    // Also try alternate layout — some ABR pages use list items or divs
    if (results.length === 0) {
      $('.searchresults li, .result-item, [class*="result"]').each((_, el) => {
        const text = $(el).text().trim()
        const abnMatch = text.match(/(\d{2}\s*\d{3}\s*\d{3}\s*\d{3})/)
        if (!abnMatch) return
        const abn = abnMatch[1].replace(/\s/g, '')
        const abnFormatted = `${abn.slice(0, 2)} ${abn.slice(2, 5)} ${abn.slice(5, 8)} ${abn.slice(8, 11)}`
        const entityName = $('a', el).first().text().trim() || text.replace(abnMatch[0], '').trim()
        results.push({
          abn,
          abnFormatted,
          entityName,
          entityType: '',
          state: '',
          postcode: '',
          status: 'Active',
        })
      })
    }

    return NextResponse.json({ results, total: results.length, query: name })
  } catch (err) {
    console.error('Name search error:', err)
    return NextResponse.json(
      { error: 'Failed to search ABR. Please try again.' },
      { status: 502 }
    )
  }
}
