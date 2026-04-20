import type { TickerResult, TickerMeta } from './types'

// CONFIG
// Set these in frontend/.env.local for dev, and in Vercel env vars for prod.
//
// frontend/.env.local:
//   NEXT_PUBLIC_GITHUB_USER=your-github-username
//   NEXT_PUBLIC_GITHUB_REPO=Vorticity
//   NEXT_PUBLIC_GITHUB_BRANCH=main
//
const GITHUB_USER   = process.env.NEXT_PUBLIC_GITHUB_USER   ?? 'YOUR_GITHUB_USER'
const GITHUB_REPO   = process.env.NEXT_PUBLIC_GITHUB_REPO   ?? 'Vorticity'
const GITHUB_BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH ?? 'main'

const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/data/results`

// TICKER REGISTRY
// Single source of truth. slug = ticker without .NS ; to be used in URLs only.
export const TICKERS: TickerMeta[] = [
  { ticker: 'NIFTYBEES.NS',  slug: 'NIFTYBEES',  name: 'Nippon Nifty BeES',   category: 'ETF',   sector: 'Broad Market',            type: 'etf'   },
  { ticker: 'GOLDBEES.NS',   slug: 'GOLDBEES',   name: 'Nippon Gold BeES',    category: 'ETF',   sector: 'Gold',                    type: 'etf'   },
  { ticker: 'HDFCBANK.NS',   slug: 'HDFCBANK',   name: 'HDFC Bank',           category: 'Stock', sector: 'Private Banking',         type: 'stock' },
  { ticker: 'ICICIBANK.NS',  slug: 'ICICIBANK',  name: 'ICICI Bank',          category: 'Stock', sector: 'Private Banking',         type: 'stock' },
  { ticker: 'AXISBANK.NS',   slug: 'AXISBANK',   name: 'Axis Bank',           category: 'Stock', sector: 'Private Banking',         type: 'stock' },
  { ticker: 'ULTRACEMCO.NS', slug: 'ULTRACEMCO', name: 'UltraTech Cement',    category: 'Stock', sector: 'Cement & Infrastructure', type: 'stock' },
  { ticker: 'SBIN.NS',       slug: 'SBIN',       name: 'State Bank of India', category: 'Stock', sector: 'PSU Banking',             type: 'stock' },
  { ticker: 'ONGC.NS',       slug: 'ONGC',       name: 'ONGC',                category: 'Stock', sector: 'Oil & Gas',               type: 'stock' },
  { ticker: 'INFY.NS',       slug: 'INFY',       name: 'Infosys',             category: 'Stock', sector: 'IT',                      type: 'stock' },
  { ticker: 'HCLTECH.NS',    slug: 'HCLTECH',    name: 'HCL Technologies',    category: 'Stock', sector: 'IT',                      type: 'stock' },
  { ticker: 'WIPRO.NS',      slug: 'WIPRO',      name: 'Wipro',               category: 'Stock', sector: 'IT',                      type: 'stock' },
  { ticker: 'HINDUNILVR.NS', slug: 'HINDUNILVR', name: 'Hindustan Unilever',  category: 'Stock', sector: 'FMCG',                    type: 'stock' },
  { ticker: 'ITC.NS',        slug: 'ITC',        name: 'ITC',                 category: 'Stock', sector: 'FMCG',                    type: 'stock' },
  { ticker: 'ASIANPAINT.NS', slug: 'ASIANPAINT', name: 'Asian Paints',        category: 'Stock', sector: 'Consumer Discretionary',  type: 'stock' },
  { ticker: 'SUNPHARMA.NS',  slug: 'SUNPHARMA',  name: 'Sun Pharma',          category: 'Stock', sector: 'Pharma',                  type: 'stock' },
  { ticker: 'MARUTI.NS',     slug: 'MARUTI',     name: 'Maruti Suzuki',       category: 'Stock', sector: 'Auto',                    type: 'stock' },
  { ticker: 'TATASTEEL.NS',  slug: 'TATASTEEL',  name: 'Tata Steel',          category: 'Stock', sector: 'Metals',                  type: 'stock' },
  { ticker: 'ADANIENT.NS',   slug: 'ADANIENT',   name: 'Adani Enterprises',   category: 'Stock', sector: 'Conglomerate',            type: 'stock' },
  { ticker: 'NTPC.NS',       slug: 'NTPC',       name: 'NTPC',                category: 'Stock', sector: 'Power & Utilities',       type: 'stock' },
  { ticker: 'BHARTIARTL.NS', slug: 'BHARTIARTL', name: 'Bharti Airtel',            category: 'Stock', sector: 'Telecom',                 type: 'stock' },
  { ticker: 'INDIGO.NS',      slug: 'INDIGO',      name: 'InterGlobe Aviation (IndiGo)', category: 'Stock', sector: 'Aviation',                type: 'stock' },
]

// HELPERS

// "HDFCBANK.NS" -> "HDFCBANK_NS"  (matches pipeline output filenames)
export function tickerToFilename(ticker: string): string {
  return ticker.replace('.', '_')
}

// slug -> full ticker: "HDFCBANK" → "HDFCBANK.NS"
export function slugToTicker(slug: string): string {
  const found = TICKERS.find(t => t.slug === slug.toUpperCase())
  return found?.ticker ?? `${slug}.NS`
}

// ticker -> slug: "HDFCBANK.NS" → "HDFCBANK"
export function tickerToSlug(ticker: string): string {
  const found = TICKERS.find(t => t.ticker === ticker)
  return found?.slug ?? ticker.replace('.NS', '')
}

// FETCHING

export async function fetchTickerResult(ticker: string): Promise<TickerResult | null> {
  try {
    const filename = tickerToFilename(ticker)
    const res = await fetch(`${BASE_URL}/${filename}.json`, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    })
    if (!res.ok) return null
    return res.json() as Promise<TickerResult>
  } catch {
    return null
  }
}

// Fetch all tickers in parallel, drop any that fail
export async function fetchAllResults(): Promise<TickerResult[]> {
  const results = await Promise.all(TICKERS.map(t => fetchTickerResult(t.ticker)))
  return results.filter((r): r is TickerResult => r !== null)
}