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

// build histogram buckets from regime stats
// we dont have raw returns so we approximate from the quantile + VaR data
// using a normal distribution parameterised by mean and std
function buildHistogram(mean: number, std: number, buckets = 40): { x: number; y: number }[] {
  if (!std || std <= 0) return []
  const lo = mean - 4 * std
  const hi = mean + 4 * std
  const step = (hi - lo) / buckets
  const result = []
  for (let i = 0; i <= buckets; i++) {
    const x = lo + i * step
    // normal PDF
    const y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2)
    result.push({ x: parseFloat((x * 100).toFixed(4)), y: parseFloat(y.toFixed(6)) })
  }
  return result
}

export default function ReturnChart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef     = useRef<unknown>(null)
  const [active, setActive] = useState<Record<Regime, boolean>>({ Low: true, Medium: true, High: true })

  useEffect(() => {
    if (!containerRef.current) return

    // dynamic import - lightweight-charts only runs client side
    import('lightweight-charts').then(({ createChart, LineSeries }) => {
      if (!containerRef.current) return

      const chart = createChart(containerRef.current, {
        width:  containerRef.current.clientWidth,
        height: 280,
        layout: {
          background: { color: 'transparent' },
          textColor:  '#7a8fa8',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize:   11,
        },
        grid: {
          vertLines: { color: '#1e2d45' },
          horzLines: { color: '#1e2d45' },
        },
        rightPriceScale: {
          borderColor: '#1e2d45',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          visible: false, // x axis is return %, not time
        },
        crosshair: {
          vertLine: { color: '#2a3d5c', width: 1 },
          horzLine: { color: '#2a3d5c', width: 1 },
        },
        handleScroll:  false,
        handleScale:   false,
      })

      chartRef.current = chart

      REGIMES.forEach(regime => {
        const stats = data.regime_stats[regime]
        if (!stats || !active[regime]) return

        const points = buildHistogram(stats.mean, stats.std)
        if (points.length === 0) return

        const series = chart.addSeries(LineSeries, {
          color:     COLORS[regime],
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        })

        // lightweight-charts needs time series data - we use index as fake time
        series.setData(
          points.map((p, i) => ({ time: i + 1, value: p.y }))
        )
      })

      // fit all series
      chart.timeScale().fitContent()

      // resize observer
      const ro = new ResizeObserver(() => {
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth })
        }
      })
      ro.observe(containerRef.current)

      return () => {
        ro.disconnect()
        chart.remove()
      }
    })
  }, [data, active])

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '20px 24px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '4px' }}>
        Return distribution
      </div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: '16px' }}>
        Approximate normal distribution per regime - parameterised from historical mean and std
      </div>

      {/* legend / toggles */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {REGIMES.map(r => (
          <button
            key={r}
            onClick={() => setActive(prev => ({ ...prev, [r]: !prev[r] }))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '3px',
              opacity: active[r] ? 1 : 0.35,
              transition: 'opacity 0.15s',
            }}
          >
            <span style={{ width: '24px', height: '2px', background: COLORS[r], display: 'inline-block', borderRadius: '1px' }} />
            <span style={{ fontSize: '10px', color: COLORS[r], letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
              {r}
            </span>
            <span style={{ fontSize: '9px', color: 'var(--dim)' }}>
              ({data.regime_stats[r]?.count ?? 0} days)
            </span>
          </button>
        ))}
      </div>

      <div ref={containerRef} />

      <div style={{ marginTop: '12px', fontSize: '10px', color: 'var(--dim)', lineHeight: 1.6 }}>
        X axis = daily return %. Y axis = probability density. Click legend to toggle regimes.
      </div>
    </div>
  )
}