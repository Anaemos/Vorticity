import Link from 'next/link'
import type { TickerResult } from '@/lib/types'
import { fmtReturn, fmtPct, fmtEntropy, fmtDate, riskColor, riskBarWidth, entropyBarWidth, empiricalHighColor, REGIME_COLOR } from '@/lib/fmt'
import { tickerToSlug } from '@/lib/data'

interface Props {
  data: TickerResult
  index: number
}

const HORIZONS = ['1d', '3d', '5d'] as const

export default function TickerCard({ data, index }: Props) {
  const slug       = tickerToSlug(data.ticker)
  const regimeKey  = data.regime.toLowerCase()
  const stabKey    = data.stability.toLowerCase()
  const stats      = data.regime_stats[data.regime]
  const leftColor  = REGIME_COLOR[data.regime]

  return (
    <Link
      href={`/dashboard/${slug}`}
      className="card fade-up"
      style={{
        display: 'block',
        textDecoration: 'none',
        borderLeft: `3px solid ${leftColor}`,
        animationDelay: `${index * 0.03}s`,
      }}
    >
      {/* head */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '12px 14px 8px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--base)', letterSpacing: '0.02em' }}>
            {slug}
            <span style={{ color: 'var(--dim)', fontSize: '9px', fontWeight: 400 }}>.NS</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: "'IBM Plex Sans', sans-serif", marginTop: '2px' }}>
            {data.name}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span className={`badge badge-${regimeKey}`}>{data.regime}</span>
          <span className={`badge badge-${stabKey}`}>{data.stability}</span>
        </div>
      </div>

      {/* data rows */}
      <div style={{ padding: '10px 14px 10px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {/* transition risk */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="label" style={{ width: '76px', flexShrink: 0 }}>Trans. risk</span>
          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
            {HORIZONS.map(h => {
              const v = data.transition_risk[h]
              const c = riskColor(v)
              return (
                <div key={h} style={{ flex: 1 }}>
                  <div className="label" style={{ fontSize: '8px', textAlign: 'center', marginBottom: '3px' }}>{h}</div>
                  <div className="risk-bar-track">
                    <div className="risk-bar-fill" style={{ width: riskBarWidth(v), background: c }} />
                  </div>
                  <div style={{ fontSize: '9px', color: c, textAlign: 'center', marginTop: '2px' }}>
                    {fmtPct(v)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* VaR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="label" style={{ width: '76px', flexShrink: 0 }}>VaR</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>
              <span className="label" style={{ fontSize: '8px', marginRight: '4px' }}>1%</span>
              <span style={{ fontSize: '11px', color: 'var(--high)' }}>{fmtReturn(data.var_1pct)}</span>
            </span>
            <span>
              <span className="label" style={{ fontSize: '8px', marginRight: '4px' }}>5%</span>
              <span style={{ fontSize: '11px', color: 'var(--high)' }}>{fmtReturn(data.var_5pct)}</span>
            </span>
          </div>
        </div>

        {/* return range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="label" style={{ width: '76px', flexShrink: 0 }}>Q10/50/90</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
            <span style={{ color: 'var(--high)' }}>{fmtReturn(data.return_range.q10)}</span>
            <span style={{ color: 'var(--dim)' }}>/</span>
            <span style={{ color: 'var(--muted)' }}>{fmtReturn(data.return_range.q50)}</span>
            <span style={{ color: 'var(--dim)' }}>/</span>
            <span style={{ color: 'var(--low)' }}>{fmtReturn(data.return_range.q90)}</span>
          </div>
        </div>

        {/* entropy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="label" style={{ width: '76px', flexShrink: 0 }}>Entropy</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="entropy-track">
              <div className="entropy-fill" style={{ width: entropyBarWidth(data.entropy) }} />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{fmtEntropy(data.entropy)}</span>
          </div>
        </div>

        {/* regime mean/std */}
        {stats && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="label" style={{ width: '76px', flexShrink: 0 }}>Regime u/s</span>
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
              {fmtReturn(stats.mean)}
              <span style={{ color: 'var(--dim)', margin: '0 4px' }}>/</span>
              {fmtReturn(stats.std)}
            </div>
          </div>
        )}

        {/* empirical high prob */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="label" style={{ width: '76px', flexShrink: 0 }}> High P</span>
          <span style={{ fontSize: '10px', color: empiricalHighColor(data.empirical_high_prob) }}>
            {fmtPct(data.empirical_high_prob, 2)}
          </span>
          <span className="label" style={{ fontSize: '8px' }}>empirical</span>
        </div>
      </div>

      {/* footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 14px 6px 16px',
        borderTop: '1px solid var(--border)',
      }}>
        <span className="label">{data.category} - {data.sector}</span>
        <span className="label">{fmtDate(data.data_through)}</span>
      </div>
    </Link>
  )
}