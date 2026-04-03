import Link from 'next/link'
import type { TickerResult } from '@/lib/types'
import { fmtReturn, fmtPct, fmtEntropy, fmtDate, riskColor, riskBarWidth, entropyBarWidth, empiricalHighColor, REGIME_COLOR } from '@/lib/fmt'
import { tickerToSlug } from '@/lib/data'

interface Props {
  data: TickerResult
  index: number
}

const HORIZONS: { key: '1d' | '3d' | '5d'; label: string }[] = [
  { key: '1d', label: '1 day' },
  { key: '3d', label: '3 days' },
  { key: '5d', label: '5 days' },
]

export default function TickerCard({ data, index }: Props) {
  const slug      = tickerToSlug(data.ticker)
  const regimeKey = data.regime.toLowerCase()
  const stabKey   = data.stability.toLowerCase()
  const stats     = data.regime_stats[data.regime]
  const leftColor = REGIME_COLOR[data.regime]

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
        padding: '16px 18px 12px 18px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--base)', letterSpacing: '0.02em' }}>
            {slug}
            <span style={{ color: 'var(--dim)', fontSize: '10px', fontWeight: 400 }}>.NS</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: "'IBM Plex Sans', sans-serif", marginTop: '4px' }}>
            {data.name}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span className={`badge badge-${regimeKey}`}>{data.regime}</span>
          <span className={`badge badge-${stabKey}`}>{data.stability}</span>
        </div>
      </div>

      {/* metrics */}
      <div style={{ padding: '16px 18px 14px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* transition risk */}
        <div>
          <div className="label" style={{ marginBottom: '10px' }}>Transition risk</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {HORIZONS.map(({ key, label }) => {
              const v = data.transition_risk[key]
              const c = riskColor(v)
              return (
                <div key={key} style={{ flex: 1 }}>
                  <div className="label" style={{ fontSize: '9px', marginBottom: '5px' }}>{label}</div>
                  <div className="risk-bar-track" style={{ height: '4px' }}>
                    <div className="risk-bar-fill" style={{ width: riskBarWidth(v), background: c }} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: c, marginTop: '4px' }}>
                    {fmtPct(v)}
                  </div>
                </div>
              )
            })}

          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* VaR | empirical high probability */}
        <div style={{ display: 'flex', gap: '0' }}>
          {/* VaR — left */}
          <div style={{ flex: 1, paddingRight: '14px', borderRight: '1px solid var(--border)' }}>
            <div className="label" style={{ marginBottom: '8px' }}>Value at Risk</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <div className="label" style={{ fontSize: '8px', marginBottom: '3px' }}>1%</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--high)' }}>{fmtReturn(data.var_1pct)}</div>
              </div>
              <div>
                <div className="label" style={{ fontSize: '8px', marginBottom: '3px' }}>5%</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--high)' }}>{fmtReturn(data.var_5pct)}</div>
              </div>
            </div>
          </div>

          {/* empirical high probability — right */}
          <div style={{ flex: 1, paddingLeft: '14px' }}>
            <div className="label" style={{ marginBottom: '8px' }}>Empirical high probability</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: empiricalHighColor(data.empirical_high_prob) }}>
              {fmtPct(data.empirical_high_prob, 2)}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* entropy | mean and std */}
        <div style={{ display: 'flex', gap: '0' }}>
          {/* entropy */}
          <div style={{ flex: 1, paddingRight: '14px', borderRight: stats ? '1px solid var(--border)' : 'none' }}>
            <div className="label" style={{ marginBottom: '6px' }}>Entropy</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div className="entropy-track" style={{ width: '44px' }}>
                <div className="entropy-fill" style={{ width: entropyBarWidth(data.entropy) }} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{fmtEntropy(data.entropy)}</span>
            </div>
          </div>

          {/* mean / std — right */}
          {stats && (
            <div style={{ flex: 1, paddingLeft: '14px' }}>
              <div className="label" style={{ marginBottom: '6px' }}>Mean and standard deviation</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {fmtReturn(stats.mean)} / {fmtReturn(stats.std)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 18px',
        borderTop: '1px solid var(--border)',
      }}>
        <span className="label">{data.category} - {data.sector}</span>
        <span className="label">{fmtDate(data.data_through)}</span>
      </div>
    </Link>
  )
}