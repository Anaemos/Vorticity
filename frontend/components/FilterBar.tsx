'use client'

export type RegimeFilter    = 'all' | 'Low' | 'Medium' | 'High'
export type StabilityFilter = 'all' | 'Stable' | 'Uncertain' | 'Unstable'
export type SortKey         = 'ticker' | 'regime' | 'risk5d' | 'entropy' | 'var'

interface Props {
  regime:      RegimeFilter
  stability:   StabilityFilter
  sort:        SortKey
  onRegime:    (v: RegimeFilter) => void
  onStability: (v: StabilityFilter) => void
  onSort:      (v: SortKey) => void
}

export default function FilterBar({ regime, stability, sort, onRegime, onStability, onSort }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 24px',
      borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap',
    }}>
      {/* regime filters */}
      <span className="label" style={{ marginRight: '4px' }}>Regime</span>
      {(['all', 'Low', 'Medium', 'High'] as RegimeFilter[]).map(r => (
        <button
          key={r}
          className={`filter-btn ${regime === r ? `active-${r.toLowerCase()}` : ''}`}
          onClick={() => onRegime(r)}
        >
          {r === 'all' ? 'All' : r}
        </button>
      ))}

      <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />

      {/* stability filters */}
      <span className="label" style={{ marginRight: '4px' }}>Stability</span>
      {(['all', 'Stable', 'Uncertain', 'Unstable'] as StabilityFilter[]).map(s => (
        <button
          key={s}
          className={`filter-btn ${stability === s ? `active-${s.toLowerCase()}` : ''}`}
          onClick={() => onStability(s)}
        >
          {s === 'all' ? 'All' : s}
        </button>
      ))}

      {/* sort */}
      <select
        value={sort}
        onChange={e => onSort(e.target.value as SortKey)}
        style={{
          marginLeft: 'auto',
          padding: '4px 10px',
          background: 'var(--bg3)',
          border: '1px solid var(--border2)',
          color: 'var(--muted)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px',
          borderRadius: '3px',
          cursor: 'pointer',
          outline: 'none',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
      >
        <option value="ticker">Sort: Ticker A-Z</option>
        <option value="regime">Sort: Regime</option>
        <option value="risk5d">Sort: 5d Risk</option>
        <option value="entropy">Sort: Entropy</option>
        <option value="var">Sort: VaR</option>
      </select>
    </div>
  )
}