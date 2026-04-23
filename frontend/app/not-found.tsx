import Link from 'next/link'
import Header from '@/components/Header'

export default function NotFound() {
  return (
    <>
      <Header />
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '9px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--dim)',
          marginBottom: '16px',
        }}>
          404
        </div>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--base)',
          margin: '0 0 12px',
          letterSpacing: '0.02em',
        }}>
          Page not found
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'var(--muted)',
          fontFamily: "'IBM Plex Sans', sans-serif",
          lineHeight: 1.7,
          margin: '0 0 32px',
          maxWidth: '360px',
        }}>
          This page doesn't exist. If you typed a ticker or term manually, check the spelling and try again.
        </p>
        <Link
          href="/dashboard"
          style={{
            padding: '10px 28px',
            border: '1px solid var(--accent)',
            background: 'rgba(0,229,255,0.06)',
            color: 'var(--accent)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            borderRadius: '3px',
            textDecoration: 'none',
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </>
  )
}
