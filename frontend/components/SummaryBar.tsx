import type { TickerResult } from '@/lib/types'
import { fmtPct, fmtDate } from '@/lib/fmt'

interface Props {
  data: TickerResult[]
}

export default function SummaryBar({ data }: Props) {
  const total    = data.length
  const low      = data.filter(d => d.regime === 'Low').length
  const med      = data.filter(d => d.regime === 'Medium').length
  const high     = data.filter(d => d.regime === 'High').length
  const unstable = data.filter(d => d.stability === 'Unstable').length
  const avgRisk  = total > 0
    ? data.reduce((s, d) => s + d.transition_risk['5d'], 0) / total
    : 0

  const dates    = data.map(d => d.data_through).filter(Boolean).sort()
  const latest   = fmtDate(dates[dates.length - 1])

  const stats = [
    { label: 'Tickers',      value: String(total),       color: 'var(--base)' },
    { label: 'Low regime',   value: String(low),         color: 'var(--low)' },
    { label: 'Medium regime',value: String(med),         color: 'var(--med)' },
    { label: 'High regime',  value: String(high),        color: high > 3 ? 'var(--high)' : 'var(--base)' },
    { label: 'Unstable',     value: String(unstable),    color: unstable > 0 ? 'var(--high)' : 'var(--muted)' },
    { label: 'Avg 5d risk',  value: fmtPct(avgRisk),    color: avgRisk > 0.10 ? 'var(--high)' : avgRisk > 0.05 ? 'var(--med)' : 'var(--low)' },
    { label: 'Data through', value: latest,              color: 'var(--muted)' },
  ]

  return (
    <div style={{
      display: 'flex',
      overflowX: 'auto',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: '10px 20px',
          borderRight: '1px solid var(--border)',
          flexShrink: 0,
          minWidth: '120px',
        }}>
          <div className="label" style={{ marginBottom: '4px' }}>{s.label}</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}