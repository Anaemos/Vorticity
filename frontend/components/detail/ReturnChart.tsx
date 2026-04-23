'use client'
import { useEffect, useRef, useState } from 'react'
import type { TickerResult, Regime } from '@/lib/types'

interface Props {
  data: TickerResult
}

const REGIMES: Regime[] = ['Low', 'Medium', 'High']

const COLORS: Record<Regime, string> = {
  Low:    '#00c47a',
  Medium: '#f5a623',
  High:   '#e84040',
}

type RangeKey = '3mo' | '6mo' | '1y' | '2y'

const RANGES: { label: string; value: RangeKey }[] = [
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y'  },
  { label: '2Y', value: '2y'  },
]

interface PricePoint {
  time:  number
  close: number
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: '2-digit',
  })
}

function formatPrice(v: number): string {
  return v >= 1000
    ? v.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : v.toFixed(2)
}

// Google Finance style SVG area line chart — no library, no heavy math
function AreaLineChart({
  points,
  regime,
  ticker,
}: {
  points: PricePoint[]
  regime: Regime
  ticker: string
}) {
  const [hover, setHover] = useState<{ x: number; point: PricePoint } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  if (points.length === 0) return null

  const W = 700
  const H = 240
  const PAD = { top: 20, right: 16, bottom: 32, left: 56 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top  - PAD.bottom

  const closes   = points.map(p => p.close)
  const minClose = Math.min(...closes)
  const maxClose = Math.max(...closes)
  const range    = maxClose - minClose || 1

  const toX = (i: number) => PAD.left + (i / (points.length - 1)) * chartW
  const toY = (v: number) => PAD.top  + chartH - ((v - minClose) / range) * chartH

  // path for the line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.close).toFixed(1)}`).join(' ')

  // close the path to the baseline for the fill
  const fillPath = linePath +
    ` L ${toX(points.length - 1).toFixed(1)} ${(PAD.top + chartH).toFixed(1)}` +
    ` L ${toX(0).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`

  // y axis ticks — 4 evenly spaced
  const yTicks = [0, 0.33, 0.66, 1].map(f => minClose + f * range)

  // x axis ticks — roughly 5 evenly spaced dates
  const xTickIndices = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * (points.length - 1)))

  const color = COLORS[regime]
  const firstClose = points[0].close
  const lastClose  = points[points.length - 1].close
  const pctChange  = ((lastClose - firstClose) / firstClose) * 100
  const isUp       = pctChange >= 0

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect  = svgRef.current.getBoundingClientRect()
    const svgX  = ((e.clientX - rect.left) / rect.width) * W
    const rawI  = ((svgX - PAD.left) / chartW) * (points.length - 1)
    const i     = Math.max(0, Math.min(points.length - 1, Math.round(rawI)))
    setHover({ x: toX(i), point: points[i] })
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* price + change header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--base)', fontFamily: "'IBM Plex Mono', monospace" }}>
          ₹{formatPrice(lastClose)}
        </span>
        <span style={{ fontSize: '13px', color: isUp ? '#00c47a' : '#e84040' }}>
          {isUp ? '+' : ''}{pctChange.toFixed(2)}%
        </span>
        <span style={{ fontSize: '11px', color: 'var(--dim)' }}>
          vs period open
        </span>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`fill-${ticker}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* y grid lines + labels */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={toY(v)}
              x2={PAD.left + chartW} y2={toY(v)}
              stroke="#1e2d45" strokeWidth="0.5"
            />
            <text
              x={PAD.left - 6} y={toY(v) + 4}
              fill="#4a5268" fontSize="9"
              textAnchor="end"
              fontFamily="IBM Plex Mono, monospace"
            >
              {formatPrice(v)}
            </text>
          </g>
        ))}

        {/* x axis baseline */}
        <line
          x1={PAD.left} y1={PAD.top + chartH}
          x2={PAD.left + chartW} y2={PAD.top + chartH}
          stroke="#1e2d45" strokeWidth="0.5"
        />

        {/* x axis date labels */}
        {xTickIndices.map(i => (
          <text
            key={i}
            x={toX(i)} y={PAD.top + chartH + 16}
            fill="#4a5268" fontSize="9"
            textAnchor="middle"
            fontFamily="IBM Plex Mono, monospace"
          >
            {formatDate(points[i].time)}
          </text>
        ))}

        {/* filled area */}
        <path d={fillPath} fill={`url(#fill-${ticker})`} stroke="none" />

        {/* line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />

        {/* hover crosshair */}
        {hover && (
          <>
            <line
              x1={hover.x} y1={PAD.top}
              x2={hover.x} y2={PAD.top + chartH}
              stroke="#2a3d5c" strokeWidth="1" strokeDasharray="3 3"
            />
            <circle
              cx={hover.x} cy={toY(hover.point.close)}
              r="4" fill={color} stroke="var(--bg2)" strokeWidth="2"
            />
            {/* tooltip */}
            <g>
              <rect
                x={hover.x > W / 2 ? hover.x - 122 : hover.x + 10}
                y={PAD.top}
                width="112" height="34" rx="3"
                fill="var(--bg3)" stroke="#1e2d45" strokeWidth="0.5"
              />
              <text
                x={hover.x > W / 2 ? hover.x - 66 : hover.x + 66}
                y={PAD.top + 13}
                fill="var(--base)" fontSize="10" fontWeight="500"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
              >
                ₹{formatPrice(hover.point.close)}
              </text>
              <text
                x={hover.x > W / 2 ? hover.x - 66 : hover.x + 66}
                y={PAD.top + 26}
                fill="#4a5268" fontSize="8"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
              >
                {formatDate(hover.point.time)}
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  )
}

// Volatility comparison bars — same as before, compact
function VolatilityBars({ data }: { data: TickerResult }) {
  const maxStd = Math.max(...REGIMES.map(r => data.regime_stats[r]?.std ?? 0))

  return (
    <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Volatility by regime
      </div>
      {REGIMES.map(r => {
        const s = data.regime_stats[r]
        if (!s) return null
        const pct       = maxStd > 0 ? s.std / maxStd : 0
        const isCurrent = r === data.regime
        return (
          <div key={r}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', color: COLORS[r], letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: isCurrent ? 600 : 400 }}>
                  {r}
                </span>
                {isCurrent && <span style={{ fontSize: '8px', color: COLORS[r], opacity: 0.6 }}>current</span>}
              </div>
              <div style={{ display: 'flex', gap: '14px' }}>
                <span style={{ fontSize: '9px', color: 'var(--dim)' }}>σ {(s.std * 100).toFixed(2)}%</span>
                <span style={{ fontSize: '9px', color: 'var(--dim)' }}>VaR 1% {(s.var_1pct * 100).toFixed(2)}%</span>
                <span style={{ fontSize: '9px', color: 'var(--dim)' }}>{s.count.toLocaleString()}d</span>
              </div>
            </div>
            <div style={{ height: '5px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height:       '100%',
                width:        `${pct * 100}%`,
                background:   COLORS[r],
                borderRadius: '2px',
                boxShadow:    isCurrent ? `0 0 8px ${COLORS[r]}66` : 'none',
                transition:   'width 0.5s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ReturnChart({ data }: Props) {
  const [range,   setRange]   = useState<RangeKey>('1y')
  const [points,  setPoints]  = useState<PricePoint[]>([])
  const [status,  setStatus]  = useState<'loading' | 'done' | 'error'>('loading')
  const [errMsg,  setErrMsg]  = useState('')

  useEffect(() => {
    setStatus('loading')
    setPoints([])

    // fetch through our Next.js proxy — no CORS issues
    fetch(`/api/price?ticker=${encodeURIComponent(data.ticker)}&range=${range}`)
      .then(r => r.json())
      .then(json => {
        const result    = json?.chart?.result?.[0]
        if (!result) throw new Error('No chart data returned')

        const timestamps: number[] = result.timestamp ?? []
        const closes: number[]     = result.indicators?.quote?.[0]?.close ?? []

        const pts: PricePoint[] = []
        for (let i = 0; i < timestamps.length; i++) {
          if (closes[i] == null) continue
          pts.push({ time: timestamps[i], close: closes[i] })
        }

        if (pts.length === 0) throw new Error('Empty price series')
        setPoints(pts)
        setStatus('done')
      })
      .catch(e => {
        setErrMsg(e.message ?? String(e))
        setStatus('error')
      })
  }, [data.ticker, range])

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '20px 24px' }}>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '4px' }}>
            Price history
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {data.name} &nbsp;·&nbsp; {data.ticker} &nbsp;·&nbsp; NSE
          </div>
        </div>

        {/* range selector */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={{
                padding:      '4px 10px',
                fontSize:     '10px',
                fontFamily:   "'IBM Plex Mono', monospace",
                letterSpacing:'0.06em',
                border:       '1px solid',
                borderColor:  range === r.value ? 'var(--accent)' : 'var(--border2)',
                background:   range === r.value ? 'rgba(0,229,255,0.07)' : 'transparent',
                color:        range === r.value ? 'var(--accent)' : 'var(--muted)',
                borderRadius: '3px',
                cursor:       'pointer',
                transition:   'all 0.12s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* chart area */}
      <div style={{ minHeight: '240px', position: 'relative' }}>
        {status === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '8px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.1em' }}>Fetching price data...</div>
            <div style={{ fontSize: '9px', color: 'var(--dim)', opacity: 0.5 }}>{data.ticker}</div>
          </div>
        )}
        {status === 'error' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '6px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--high)' }}>Could not load price data</div>
            <div style={{ fontSize: '9px', color: 'var(--dim)' }}>{errMsg}</div>
          </div>
        )}
        {status === 'done' && (
          <AreaLineChart points={points} regime={data.regime} ticker={data.ticker} />
        )}
      </div>

      {/* volatility comparison below chart */}
      <div style={{ marginTop: '20px' }}>
        <VolatilityBars data={data} />
      </div>
    </div>
  )
}
