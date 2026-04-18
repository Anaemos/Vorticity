'use client'
import { useState, useMemo } from 'react'
import type { TickerResult } from '@/lib/types'
import type { RegimeFilter, StabilityFilter, SortKey } from '@/components/FilterBar'
import FilterBar from '@/components/FilterBar'
import TickerCard from '@/components/TickerCard'

interface Props {
  data: TickerResult[]
}

const REGIME_ORDER = { Low: 0, Medium: 1, High: 2 }

export default function DashboardClient({ data }: Props) {
  const [regime,    setRegime]    = useState<RegimeFilter>('all')
  const [stability, setStability] = useState<StabilityFilter>('all')
  const [sort,      setSort]      = useState<SortKey>('ticker')

  const filtered = useMemo(() => {
    let out = [...data]
    if (regime !== 'all')    out = out.filter(d => d.regime === regime)
    if (stability !== 'all') out = out.filter(d => d.stability === stability)
    out.sort((a, b) => {
      switch (sort) {
        case 'ticker':  return a.ticker.localeCompare(b.ticker)
        case 'regime':  return REGIME_ORDER[a.regime] - REGIME_ORDER[b.regime]
        case 'risk5d':  return b.transition_risk['5d'] - a.transition_risk['5d']
        case 'entropy': return b.entropy - a.entropy
        case 'var':     return a.var_1pct - b.var_1pct
        default:        return 0
      }
    })
    return out
  }, [data, regime, stability, sort])

  return (
    <>
      <FilterBar
        regime={regime}
        stability={stability}
        sort={sort}
        onRegime={setRegime}
        onStability={setStability}
        onSort={setSort}
      />

      <div className="page-enter" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
          <span className="label">Instruments</span>
          <span style={{ fontSize: '9px', color: 'var(--accent)' }}>{filtered.length} showing</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--dim)', fontSize: '11px', letterSpacing: '0.1em' }}>
            No tickers match current filters.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}>
            {filtered.map((d, i) => (
              <TickerCard key={d.ticker} data={d} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}