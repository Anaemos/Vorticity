'use client'
import Header from '@/components/Header'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
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
          color: 'var(--high)',
          marginBottom: '16px',
        }}>
          Error
        </div>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--base)',
          margin: '0 0 12px',
        }}>
          Something went wrong
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'var(--muted)',
          fontFamily: "'IBM Plex Sans', sans-serif",
          lineHeight: 1.7,
          margin: '0 0 8px',
          maxWidth: '400px',
        }}>
          The page failed to load. This usually means GitHub is temporarily unreachable or the data files haven't been pushed yet.
        </p>
        {error?.message && (
          <p style={{
            fontSize: '10px',
            color: 'var(--dim)',
            fontFamily: "'IBM Plex Mono', monospace",
            margin: '0 0 32px',
          }}>
            {error.message}
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={reset}
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
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <a
            href="/dashboard"
            style={{
              padding: '10px 28px',
              border: '1px solid var(--border2)',
              background: 'transparent',
              color: 'var(--muted)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              borderRadius: '3px',
              textDecoration: 'none',
            }}
          >
            Dashboard
          </a>
        </div>
      </div>
    </>
  )
}
