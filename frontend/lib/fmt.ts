import type { Regime, Stability } from './types'

// REGIME / STABILITY COLOURS

export const REGIME_COLOR: Record<Regime, string> = {
  Low:    '#00c47a',
  Medium: '#f5a623',
  High:   '#e84040',
}

export const REGIME_BG: Record<Regime, string> = {
  Low:    'rgba(0,196,122,0.10)',
  Medium: 'rgba(245,166,35,0.10)',
  High:   'rgba(232,64,64,0.10)',
}

export const REGIME_BORDER: Record<Regime, string> = {
  Low:    'rgba(0,196,122,0.30)',
  Medium: 'rgba(245,166,35,0.30)',
  High:   'rgba(232,64,64,0.30)',
}

export const STABILITY_COLOR: Record<Stability, string> = {
  Stable:    '#00c47a',
  Uncertain: '#f5a623',
  Unstable:  '#e84040',
}

// NUMBER FORMATTING

// Daily return as percentage: 0.00412 -> "+0.412%"
export function fmtReturn(v: number | null | undefined): string {
  if (v == null) return '—'
  const pct = v * 100
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(3)}%`
}

// Probability as percentage: 0.0042 -> "0.4%"
export function fmtPct(v: number | null | undefined, decimals = 1): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(decimals)}%`
}

// Entropy - real values are small: 0.0042 -> "0.0042"
export function fmtEntropy(v: number): string {
  return v.toFixed(4)
}

// "2026-03-20" -> "20 Mar 2026"
export function fmtDate(s: string | null | undefined): string {
  if (!s) return '—'
  const d = new Date(s)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ISO timestamp -> "16:41 IST"
export function fmtUpdatedAt(s: string | null | undefined): string {
  if (!s) return '—'
  return new Date(s).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }) + ' IST'
}

// COLOUR LOGIC
// Real transition_risk range: ~0.003 – 0.15 (not 0–1!)
// Thresholds calibrated to actual model output ranges from docs.
export function riskColor(v: number): string {
  if (v < 0.05)  return '#00c47a'
  if (v < 0.12)  return '#f5a623'
  return '#e84040'
}

// Risk bar fill width - scale against 0.40 max so bars aren't always empty
// (real values rarely exceed 0.30 even in stressed conditions)
export function riskBarWidth(v: number): string {
  return `${Math.min(v / 0.40, 1) * 100}%`
}

// Entropy bar fill - docs say baseline ~0.25, pre-transition ~0.32
// Scale 0-0.60 as the display range so typical values show meaningful fill
export function entropyBarWidth(v: number): string {
  return `${Math.min(v / 0.60, 1) * 100}%`
}

// Empirical high prob colour - real values are tiny (0.003 – 0.05 typical)
export function empiricalHighColor(v: number): string {
  if (v < 0.02)  return '#00c47a'
  if (v < 0.05)  return '#f5a623'
  return '#e84040'
}

// Transition matrix cell colour - diagonals are ~0.97, off-diagonals tiny
export function matrixCellColor(v: number, isDiagonal: boolean): string {
  if (isDiagonal) return 'var(--base)'
  if (v > 0.10)   return '#e84040'
  if (v > 0.03)   return '#f5a623'
  if (v > 0.01)   return '#7a8499'
  return '#4a5268'
}