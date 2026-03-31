import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchTickerResult, slugToTicker, TICKERS } from '@/lib/data'
import { fmtDate, fmtUpdatedAt, REGIME_COLOR, REGIME_BG, REGIME_BORDER } from '@/lib/fmt'
import Header from '@/components/Header'
import RiskPanel from '@/components/detail/RiskPanel'
import ReturnChart from '@/components/detail/ReturnChart'
import TransitionMatrix from '@/components/detail/TransitionMatrix'
import RegimeStatsTable from '@/components/detail/RegimeStatsTable'

interface Props {
  params: Promise<{ ticker: string }>
}

// tell Next.js which slugs exist at build time
export function generateStaticParams() {
  return TICKERS.map(t => ({ ticker: t.slug }))
}

export default async function TickerDetailPage({ params }: Props) {
  const { ticker }  = await params
  const fullTicker  = slugToTicker(ticker)
  const data       = await fetchTickerResult(fullTicker)

  if (!data) notFound()

  const regimeColor  = REGIME_COLOR[data.regime]
  const regimeBg     = REGIME_BG[data.regime]
  const regimeBorder = REGIME_BORDER[data.regime]
  const regimeKey    = data.regime.toLowerCase()
  const stabKey      = data.stability.toLowerCase()

  return (
    <>
      <Header dataThrough={data.data_through} />

      {/* ticker hero */}
      <div style={{
        padding: '24px 28px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)',
      }}>
        {/* back link */}
        <Link href="/dashboard" style={{
          fontSize: '10px',
          color: 'var(--dim)',
          textDecoration: 'none',
          letterSpacing: '0.08em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '16px',
        }}>
          &larr; Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* name block */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--base)', letterSpacing: '0.02em', margin: 0 }}>
                {ticker}
              </h1>
              <span style={{ fontSize: '12px', color: 'var(--dim)' }}>.NS</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: '8px' }}>
              {data.name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.06em' }}>
              {data.category} - {data.sector}
            </div>
          </div>

          {/* regime + stability block */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className={`badge badge-${regimeKey}`}>{data.regime}</span>
              <span className={`badge badge-${stabKey}`}>{data.stability}</span>
            </div>
            {/* regime pill with context */}
            <div style={{
              padding: '6px 14px',
              borderRadius: '3px',
              border: `1px solid ${regimeBorder}`,
              background: regimeBg,
              fontSize: '11px',
              color: regimeColor,
              letterSpacing: '0.04em',
            }}>
              Currently in <strong>{data.regime}</strong> volatility regime
            </div>
            <div style={{ fontSize: '10px', color: 'var(--dim)', textAlign: 'right' }}>
              Updated {fmtUpdatedAt(data.updated_at)} &nbsp;·&nbsp; Data through {fmtDate(data.data_through)}
            </div>
          </div>
        </div>
      </div>

      {/* panels */}
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px' }}>
        {/* top row - risk + matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <RiskPanel data={data} />
          <TransitionMatrix data={data} />
        </div>

        {/* return distribution chart - full width */}
        <ReturnChart data={data} />

        {/* regime stats table - full width */}
        <RegimeStatsTable data={data} />
      </div>
    </>
  )
}