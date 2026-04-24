import type { TickerResult } from '@/lib/types'
import { fmtReturn, fmtPct, fmtEntropy, riskColor, riskBarWidth, entropyBarWidth, empiricalHighColor } from '@/lib/fmt'

interface Props {
  data: TickerResult
}

const HORIZONS = ['1d', '3d', '5d'] as const

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', width: '120px', flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}

export default function RiskPanel({ data }: Props) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '20px 24px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '4px' }}>
        Risk forecast
      </div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '16px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
        TFT probability of entering High regime
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ minWidth: '420px' }}>

      {/* transition risk gauges */}
      <Row label="Transition risk">
        <div style={{ display: 'flex', gap: '16px' }}>
          {HORIZONS.map(h => {
            const v = data.transition_risk[h]
            const c = riskColor(v)
            return (
              <div key={h} style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.08em', textAlign: 'center', marginBottom: '5px' }}>{h}</div>
                <div style={{ height: '4px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                  <div style={{ height: '100%', width: riskBarWidth(v), background: c, borderRadius: '2px', transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: c, textAlign: 'center' }}>{fmtPct(v)}</div>
              </div>
            )
          })}
        </div>
      </Row>

      {/* empirical high prob */}
      <Row label="Empirical High P">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 500, color: empiricalHighColor(data.empirical_high_prob) }}>
            {fmtPct(data.empirical_high_prob, 2)}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--dim)' }}>historical base rate from current regime</span>
        </div>
      </Row>

      {/* VaR */}
      <Row label="Value at Risk">
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: '3px' }}>1% VaR</div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--high)' }}>{fmtReturn(data.var_1pct)}</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: '3px' }}>5% VaR</div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--high)' }}>{fmtReturn(data.var_5pct)}</div>
          </div>
        </div>
      </Row>

      {/* return range */}
      <Row label="Return range">
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Q10 (bad day)',    val: data.return_range.q10, color: 'var(--high)' },
            { label: 'Q50 (median)',     val: data.return_range.q50, color: 'var(--muted)' },
            { label: 'Q90 (good day)',   val: data.return_range.q90, color: 'var(--low)' },
          ].map(q => (
            <div key={q.label}>
              <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: '3px' }}>{q.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: q.color }}>{fmtReturn(q.val)}</div>
            </div>
          ))}
        </div>
      </Row>

      {/* entropy */}
      <Row label="Entropy">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, height: '4px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: entropyBarWidth(data.entropy), borderRadius: '2px', background: 'linear-gradient(to right, var(--low), var(--med), var(--high))' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted)', flexShrink: 0 }}>{fmtEntropy(data.entropy)}</span>
          <span style={{ fontSize: '10px', color: 'var(--dim)' }}>
            {data.entropy < 0.20 ? 'model is confident' : data.entropy < 0.32 ? 'mild uncertainty' : 'transition likely near'}
          </span>
        </div>
      </Row>
      </div>
      </div>
    </div>
  )
}