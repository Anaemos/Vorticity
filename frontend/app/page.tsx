'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // fade in after mount
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s ease',
    }}>

      {/* logo mark */}
      <img
        src="/mini.svg"
        alt="Vorticity Logo"
        style={{
          width: '300px',
          height: '300px',
          marginBottom: '32px',
          filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.25))',
        }}
      />

      {/* name */}
      <div style={{
        fontSize: '28px',
        fontWeight: 600,
        color: 'var(--base)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        Vorticity
      </div>

      {/* tagline */}
      <div style={{
        fontSize: '12px',
        color: 'var(--muted)',
        letterSpacing: '0.08em',
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        Daily volatility regime intelligence for Indian equities and ETFs.
      </div>

      <div style={{
        fontSize: '10px',
        color: 'var(--dim)',
        letterSpacing: '0.06em',
        marginBottom: '56px',
        textAlign: 'center',
      }}>
        NSE - 14 instruments - HMM regime detection - TFT risk forecasting
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push('/dashboard')}
        style={{
          padding: '10px 32px',
          border: '1px solid var(--accent)',
          background: 'rgba(0,229,255,0.06)',
          color: 'var(--accent)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          borderRadius: '3px',
          cursor: 'pointer',
          transition: 'background 0.15s, box-shadow 0.15s',
          marginBottom: '48px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0,229,255,0.12)'
          e.currentTarget.style.boxShadow  = '0 0 16px rgba(0,229,255,0.15)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(0,229,255,0.06)'
          e.currentTarget.style.boxShadow  = 'none'
        }}
      >
        Enter Dashboard
      </button>

      {/* what is this */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}>
        <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          What is this?
        </div>
        <div style={{
          maxWidth: '420px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--dim)',
          lineHeight: 1.7,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          Vorticity runs nightly after market close. It detects the current volatility
          regime of each instrument using a Hidden Markov Model, then forecasts the
          probability of entering a high-volatility period using a Temporal Fusion
          Transformer.
        </div>
        <button
          onClick={() => router.push('/help')}
          style={{
            marginTop: '12px',
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            textDecorationColor: 'var(--border2)',
          }}
        >
          Read the glossary
        </button>
      </div>

      {/* bottom corner - data note */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '24px',
        fontSize: '9px',
        color: 'var(--dim)',
        letterSpacing: '0.06em',
        textAlign: 'right',
        lineHeight: 1.6,
      }}>
        Data sourced from Yahoo Finance via yfinance.<br />
        Not financial advice.
      </div>
    </div>
  )
}