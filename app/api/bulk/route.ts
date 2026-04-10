import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import type { BulkResultRow } from '@/lib/types'
import { stripAbn, validateAbn } from '@/lib/validate-abn'

const ABR_BASE = 'https://abr.business.gov.au'
const MAX_ABNS = 50

async function lookupOne(abn: string): Promise<BulkResultRow> {
  const base: BulkResultRow = {
    abn,
    abnFormatted: `${abn.slice(0, 2)} ${abn.slice(2, 5)} ${abn.slice(5, 8)} ${abn.slice(8, 11)}`,
    entityName: '',
    entityType: '',
    abnStatus: '',
    gstStatus: '',
    mainBusinessLocation: '',
  }

  try {
    const url = `${ABR_BASE}/ABN/View?abn=${abn}`
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!res.ok) {
      return { ...base, error: `HTTP ${res.status}` }
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    let entityName = ''
    $('h1').each((_, el) => {
      const t = $(el).text().trim()
      if (t && !t.toLowerCase().includes('abn lookup')) {
        entityName = t
        return false
      }
    })

    const parseRow = (label: string): string => {
      const el = $('th, td').filter((_, node) =>
        $(node).text().trim().toLowerCase().includes(label.toLowerCase())
      )
      return el.length ? el.first().next('td').text().trim() : ''
    }

    const abnStatus = parseRow('abn status') || parseRow('status')
    const entityType = parseRow('entity type')
    const gstStatus = parseRow('goods & services tax') || parseRow('gst')

    let mainBusinessLocation = ''
    const locLabel = $('th, td').filter((_, el) =>
      $(el).text().trim().toLowerCase().includes('main business location')
    )
    if (locLabel.length) {
      mainBusinessLocation = locLabel.first().next('td').text().trim()
    }

    if (!entityName) entityName = parseRow('entity name')

    return {
      ...base,
      entityName,
      entityType,
      abnStatus,
      gstStatus,
      mainBusinessLocation,
    }
  } catch {
    return { ...base, error: 'Lookup failed' }
  }
}

export async function POST(req: NextRequest) {
  let body: { abns?: unknown }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!Array.isArray(body.abns)) {
    return NextResponse.json({ error: '`abns` must be an array' }, { status: 400 })
  }

  const rawAbns = body.abns as string[]

  if (rawAbns.length > MAX_ABNS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_ABNS} ABNs per request` },
      { status: 400 }
    )
  }

  const abns = rawAbns.map(stripAbn).filter(Boolean)

  // Validate all ABNs first — return errors for invalid ones without hitting ABR
  const validated = abns.map((abn) => {
    const { valid, error } = validateAbn(abn)
    return { abn, valid, validationError: error }
  })

  // Run valid ABN lookups with concurrency limit of 5
  const CONCURRENCY = 5
  const results: BulkResultRow[] = new Array(validated.length)

  for (let i = 0; i < validated.length; i += CONCURRENCY) {
    const batch = validated.slice(i, i + CONCURRENCY)
    const settled = await Promise.allSettled(
      batch.map(({ abn, valid, validationError }) => {
        if (!valid) {
          const formatted = `${abn.slice(0, 2)} ${abn.slice(2, 5)} ${abn.slice(5, 8)} ${abn.slice(8, 11)}`
          return Promise.resolve<BulkResultRow>({
            abn,
            abnFormatted: formatted,
            entityName: '',
            entityType: '',
            abnStatus: '',
            gstStatus: '',
            mainBusinessLocation: '',
            error: validationError ?? 'Invalid ABN',
          })
        }
        return lookupOne(abn)
      })
    )

    settled.forEach((result, j) => {
      const idx = i + j
      if (result.status === 'fulfilled') {
        results[idx] = result.value
      } else {
        const abn = batch[j].abn
        results[idx] = {
          abn,
          abnFormatted: abn,
          entityName: '',
          entityType: '',
          abnStatus: '',
          gstStatus: '',
          mainBusinessLocation: '',
          error: 'Lookup failed',
        }
      }
    })
  }

  return NextResponse.json({ results })
}
