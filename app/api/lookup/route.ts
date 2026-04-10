import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import type { AbnResult } from '@/lib/types'
import { stripAbn } from '@/lib/validate-abn'

const ABR_BASE = 'https://abr.business.gov.au'

function parseLocation($: cheerio.CheerioAPI): string {
  // ABR shows location in a table row labelled "Main business location"
  const label = $('th, td').filter((_, el) => $(el).text().trim().toLowerCase().includes('main business location'))
  if (label.length) {
    return label.first().next('td').text().trim()
  }
  return ''
}

function parseTableRow($: cheerio.CheerioAPI, label: string): string {
  const el = $('th, td').filter((_, node) =>
    $(node).text().trim().toLowerCase().includes(label.toLowerCase())
  )
  if (el.length) {
    return el.first().next('td').text().trim()
  }
  return ''
}

function parseNames($: cheerio.CheerioAPI, label: string): string[] {
  const results: string[] = []
  $('th, td').filter((_, node) =>
    $(node).text().trim().toLowerCase().includes(label.toLowerCase())
  ).each((_, el) => {
    const val = $(el).next('td').text().trim()
    if (val) results.push(val)
  })

  // Also look for list items in section following the label heading
  const headings = $('h2, h3, h4, th, strong').filter((_, node) =>
    $(node).text().trim().toLowerCase().includes(label.toLowerCase())
  )
  headings.each((_, heading) => {
    $(heading).closest('tr, section, div').nextAll().each((_, sibling) => {
      const text = $(sibling).text().trim()
      if (!text || text.toLowerCase().includes('no ')) return false
      results.push(text)
    })
  })

  return [...new Set(results.filter(Boolean))]
}

export async function GET(req: NextRequest) {
  const abn = stripAbn(req.nextUrl.searchParams.get('abn') ?? '')

  if (!abn) {
    return NextResponse.json({ error: 'ABN is required' }, { status: 400 })
  }

  if (!/^\d{11}$/.test(abn)) {
    return NextResponse.json({ error: 'ABN must be 11 digits' }, { status: 400 })
  }

  try {
    const url = `${ABR_BASE}/ABN/View?abn=${abn}`
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      throw new Error(`ABR returned ${res.status}`)
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    // Check for "not found" page
    const pageTitle = $('h1').first().text().trim()
    if (pageTitle.toLowerCase().includes('not found') || pageTitle.toLowerCase().includes('no record')) {
      return NextResponse.json({ error: 'ABN not found' }, { status: 404 })
    }

    // Entity name — usually the first h1 or in a result table
    let entityName = ''
    $('h1, .abn-heading, .entity-name').each((_, el) => {
      const t = $(el).text().trim()
      if (t && !t.toLowerCase().includes('abn lookup') && !t.toLowerCase().includes('search')) {
        entityName = t
        return false
      }
    })

    // If no entity name found from headings, try the ABN result table
    if (!entityName) {
      entityName = parseTableRow($, 'entity name')
    }

    const abnStatus = parseTableRow($, 'abn status') || parseTableRow($, 'status')
    const entityType = parseTableRow($, 'entity type')
    const gstStatus = parseTableRow($, 'goods & services tax (gst)') ||
      parseTableRow($, 'gst') ||
      parseTableRow($, 'goods and services tax')
    const mainBusinessLocation = parseLocation($)

    // Extract status effective from dates
    let abnStatusEffectiveFrom = ''
    let gstEffectiveFrom = ''

    // ABR typically shows "Active from DD Mon YYYY" inline
    $('table tr').each((_, row) => {
      const th = $('th', row).text().trim().toLowerCase()
      const td = $('td', row).text().trim()
      if (th.includes('abn') && th.includes('status')) {
        // Try to extract date like "Active from 1 Jan 2000"
        const dateMatch = td.match(/from\s+(\d{1,2}\s+\w+\s+\d{4})/i)
        if (dateMatch) abnStatusEffectiveFrom = dateMatch[1]
        else abnStatusEffectiveFrom = td
      }
      if (th.includes('gst')) {
        const dateMatch = td.match(/from\s+(\d{1,2}\s+\w+\s+\d{4})/i)
        if (dateMatch) gstEffectiveFrom = dateMatch[1]
        else gstEffectiveFrom = td
      }
    })

    const tradingNames = parseNames($, 'trading name')
    const businessNames = parseNames($, 'business name')

    const abnFormatted = `${abn.slice(0, 2)} ${abn.slice(2, 5)} ${abn.slice(5, 8)} ${abn.slice(8, 11)}`

    const result: AbnResult = {
      abn,
      abnFormatted,
      abnStatus,
      abnStatusEffectiveFrom,
      entityName,
      entityType,
      gstStatus,
      gstEffectiveFrom,
      mainBusinessLocation,
      tradingNames,
      businessNames,
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('ABN lookup error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch ABN data. Please try again.' },
      { status: 502 }
    )
  }
}
