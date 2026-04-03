import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { getHelpTerm, HELP_CONTENT, HELP_SLUGS, GROUP_LABELS } from '@/lib/helpContent'

interface Props {
  params: Promise<{ term: string }>
}

export function generateStaticParams() {
  return HELP_SLUGS.map(slug => ({ term: slug }))
}

export default async function HelpTermPage({ params }: Props) {
  const { term } = await params
  const content  = getHelpTerm(term)

  if (!content) notFound()

  const seeAlsoTerms = content.seeAlso
    .map(slug => HELP_CONTENT.find(t => t.slug === slug))
    .filter(Boolean)

  return (
    <>
      <Header />

      <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '860px', padding: '0 36px' }}>

          {/* breadcrumb */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px',
            fontSize: '10px',
            color: 'var(--dim)',
            letterSpacing: '0.08em',
          }}>
            <Link href="/dashboard" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Dashboard</Link>
            <span>/</span>
            <Link href="/help" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Glossary</Link>
            <span>/</span>
            <span style={{ color: 'var(--muted)' }}>{content.title}</span>
          </div>

          {/* group label */}
          <div style={{
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--dim)',
            marginBottom: '10px',
          }}>
            {GROUP_LABELS[content.group]}
          </div>

          {/* title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 600,
            color: 'var(--base)',
            margin: '0 0 24px',
            letterSpacing: '0.01em',
          }}>
            {content.title}
          </h1>

          {/* summary callout */}
          <div style={{
            padding: '20px 24px',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: '4px',
            marginBottom: '36px',
            fontSize: '15px',
            color: 'var(--base)',
            fontFamily: "'IBM Plex Sans', sans-serif",
            lineHeight: 1.7,
          }}>
            {content.summary}
          </div>

          {/* full detail */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--dim)',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border)',
            }}>
              Explanation
            </div>
            <p style={{
              fontSize: '15px',
              color: 'var(--muted)',
              fontFamily: "'IBM Plex Sans', sans-serif",
              lineHeight: 1.9,
              margin: '16px 0 0',
            }}>
              {content.detail}
            </p>
          </div>

          {/* example */}
          <div style={{
            padding: '20px 24px',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            marginBottom: '40px',
          }}>
            <div style={{
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--dim)',
              marginBottom: '12px',
            }}>
              Example
            </div>
            <p style={{
              fontSize: '14px',
              color: 'var(--muted)',
              fontFamily: "'IBM Plex Sans', sans-serif",
              lineHeight: 1.85,
              margin: 0,
            }}>
              {content.example}
            </p>
          </div>

          {/* see also */}
          {seeAlsoTerms.length > 0 && (
            <div>
              <div style={{
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--dim)',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border)',
              }}>
                See also
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {seeAlsoTerms.map(t => t && (
                  <Link
                    key={t.slug}
                    href={`/help/${t.slug}`}
                    style={{
                      padding: '6px 14px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--border2)',
                      borderRadius: '3px',
                      fontSize: '11px',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                      fontFamily: "'IBM Plex Mono', monospace",
                      letterSpacing: '0.04em',
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                  >
                    {t.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}