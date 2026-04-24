import type { TickerResult, Regime } from '@/lib/types'
import { fmtReturn, fmtPct, REGIME_COLOR } from '@/lib/fmt'

interface Props {
  data: TickerResult
}

const REGIMES: Regime[] = ['Low', 'Medium', 'High']

interface StatRow {
  label: string
  fmt: (v: number) => string
  key: keyof import('@/lib/types').RegimeStats
}

const ROWS: StatRow[] = [
  { label: 'Mean daily return', key: 'mean',    fmt: fmtReturn },
  { label: 'Std deviation',     key: 'std',     fmt: fmtReturn },
  { label: 'Skewness',          key: 'skew',    fmt: (v) => v.toFixed(3) },
  { label: 'Kurtosis',          key: 'kurt',    fmt: (v) => v.toFixed(2) },
  { label: 'VaR 1%',            key: 'var_1pct',fmt: fmtReturn },
  { label: 'VaR 5%',            key: 'var_5pct',fmt: fmtReturn },
  { label: 'Q10',               key: 'q10',     fmt: fmtReturn },
  { label: 'Q50 (median)',      key: 'q50',     fmt: fmtReturn },
  { label: 'Q90',               key: 'q90',     fmt: fmtReturn },
  { label: 'Days in regime',    key: 'count',   fmt: (v) => v.toLocaleString() },
]

export default function RegimeStatsTable({ data }: Props) {
  const current = data.regime

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '20px 24px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '4px' }}>
        Regime statistics
      </div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '20px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
        Full distribution stats per regime across all historical data. Current regime highlighted.
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '360px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0 0 10px', width: '160px' }} />
            {REGIMES.map(r => (
              <th key={r} style={{
                textAlign: 'center',
                padding: '0 0 10px',
                fontSize: '9px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: REGIME_COLOR[r],
                background: r === current ? 'rgba(255,255,255,0.02)' : 'transparent',
              }}>
                {r}
                {r === current && (
                  <div style={{ fontSize: '8px', color: 'var(--dim)', fontWeight: 400, marginTop: '2px' }}>current</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={row.key} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
              <td style={{
                fontSize: '10px',
                color: 'var(--dim)',
                padding: '8px 12px 8px 0',
                borderTop: '1px solid var(--border)',
                letterSpacing: '0.04em',
              }}>
                {row.label}
              </td>
              {REGIMES.map(r => {
                const stats = data.regime_stats[r]
                const val = stats?.[row.key] as number | undefined
                return (
                  <td key={r} style={{
                    textAlign: 'center',
                    padding: '8px',
                    borderTop: '1px solid var(--border)',
                    fontSize: '11px',
                    color: r === current ? 'var(--base)' : 'var(--muted)',
                    fontWeight: r === current ? 500 : 400,
                    background: r === current ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}>
                    {val != null ? row.fmt(val) : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}