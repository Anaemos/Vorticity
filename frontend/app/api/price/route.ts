import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy for Yahoo Finance — avoids CORS block in browser
// Called as: /api/price?ticker=HDFCBANK.NS&range=1y
export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  const range  = req.nextUrl.searchParams.get('range') ?? '1y'

  if (!ticker) {
    return NextResponse.json({ error: 'Missing ticker' }, { status: 400 })
  }

  const VALID_RANGES = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y']
  const safeRange  = VALID_RANGES.includes(range) ? range : '1y'
  const safeTicker = ticker.replace(/[^A-Z0-9.^-]/gi, '').slice(0, 20)

  if (!safeTicker) {
    return NextResponse.json({ error: 'Invalid ticker' }, { status: 400 })
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(safeTicker)}?interval=1d&range=${safeRange}`

    const res = await fetch(url, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://finance.yahoo.com',
      },
      next: { revalidate: 900 }, // cache price data for 15 min — markets update intraday
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Yahoo returned ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
