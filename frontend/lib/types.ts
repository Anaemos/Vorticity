export type Regime = 'Low' | 'Medium' | 'High'
export type Stability = 'Stable' | 'Uncertain' | 'Unstable'

export interface RegimeStats {
  mean: number
  std: number
  skew: number
  kurt: number
  var_1pct: number
  var_5pct: number
  q10: number
  q50: number
  q90: number
  count: number
}

export interface TransitionRisk {
  '1d': number
  '3d': number
  '5d': number
}

export interface ReturnRange {
  q10: number
  q50: number
  q90: number
}

export interface TransitionRow {
  Low: number
  Medium: number
  High: number
}

export interface TickerResult {
  ticker: string
  name: string
  category: string
  sector: string
  updated_at: string
  data_through: string

  regime: Regime
  entropy: number
  stability: Stability

  transition_risk: TransitionRisk
  empirical_high_prob: number

  var_1pct: number
  var_5pct: number
  return_range: ReturnRange

  regime_stats: {
    Low: RegimeStats
    Medium: RegimeStats
    High: RegimeStats
  }

  transition_matrix: {
    Low: TransitionRow
    Medium: TransitionRow
    High: TransitionRow
  }
}

export interface TickerMeta {
  ticker: string        // e.g "HDFCBANK.NS"
  name: string
  category: string
  sector: string
  type: string
  slug: string          // e.g "HDFCBANK" : used in URLs
}