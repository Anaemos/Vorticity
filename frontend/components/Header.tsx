'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Props {
  dataThrough?: string // e.g. "2026-03-20" from the fetched results
}

export default function Header({ dataThrough }: Props) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* logo */}
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          border: '1.5px solid var(--accent)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--accent)',
          letterSpacing: '-0.04em',
          boxShadow: '0 0 10px rgba(0,229,255,0.12)',
          flexShrink: 0,
        }}>
          VX
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--base)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Vorticity
          </div>
          <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.06em', marginTop: '1px' }}>
            Regime - Risk - Distribution
          </div>
        </div>
      </Link>

      {/* right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {dataThrough && (
          <div style={{ fontSize: '10px', color: 'var(--dim)' }}>
            data through <span style={{ color: 'var(--muted)' }}>{dataThrough}</span>
          </div>
        )}
        <Link href="/help" style={{ fontSize: '10px', color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.06em' }}>
          HELP
        </Link>
        <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>
          <span style={{ color: 'var(--accent)' }}>{time || '--:--:--'}</span> IST
        </div>
        <span style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--low)',
          boxShadow: '0 0 6px var(--low)',
          animation: 'statusPulse 2s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </header>
  )
}