import type { TickerResult, Regime } from '@/lib/types'
import { matrixCellColor } from '@/lib/fmt'

interface Props {
  data: TickerResult
}

const REGIMES: Regime[] = ['Low', 'Medium', 'High']

const REGIME_COLOR: Record<Regime, string> = {
  Low:    'var(--low)',
  Medium: 'var(--med)',
  High:   'var(--high)',
}

export default function TransitionMatrix({ data }: Props) {
  const matrix = data.transition_matrix
  const current = data.regime

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '20px 24px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '4px' }}>
        Transition matrix
      </div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '20px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
        Historical probability of regime-to-regime moves (row = today, column = tomorrow)
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: '80px' }} />
            {REGIMES.map(r => (
              <th key={r} style={{
                fontSize: '9px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: REGIME_COLOR[r],
                fontWeight: 500,
                textAlign: 'center',
                padding: '0 0 10px',
              }}>
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REGIMES.map(from => {
            const isCurrentRow = from === current
            return (
              <tr key={from} style={{ background: isCurrentRow ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                <td style={{
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: REGIME_COLOR[from],
                  fontWeight: isCurrentRow ? 500 : 400,
                  padding: '10px 12px 10px 0',
                  borderTop: '1px solid var(--border)',
                }}>
                  {from}
                  {isCurrentRow && (
                    <span style={{ fontSize: '8px', color: 'var(--dim)', marginLeft: '6px' }}>now</span>
                  )}
                </td>
                {REGIMES.map(to => {
                  const v = matrix[from]?.[to] ?? 0
                  const isDiag = from === to
                  const color = matrixCellColor(v, isDiag)
                  return (
                    <td key={to} style={{
                      textAlign: 'center',
                      padding: '10px 8px',
                      borderTop: '1px solid var(--border)',
                      fontSize: isDiag ? '13px' : '12px',
                      fontWeight: isDiag ? 500 : 400,
                      color,
                    }}>
                      {(v * 100).toFixed(1)}%
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '14px', fontSize: '10px', color: 'var(--dim)', lineHeight: 1.6 }}>
        Diagonal = regime persists. Off-diagonal = regime changes. Current row highlighted.
      </div>
    </div>
  )
}