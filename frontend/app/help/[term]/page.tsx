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

      <div style={{ padding: '32px 28px', maxWidth: '760px' }}>
        {/* breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.08em' }}>
          <Link href="/dashboard" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Dashboard</Link>
          <span>/</span>
          <Link href="/help" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Glossary</Link>
          <span>/</span>
          <span style={{ color: 'var(--muted)' }}>{content.title}</span>
        </div>

        {/* group label */}
        <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '10px' }}>
          {GROUP_LABELS[content.group]}
        </div>

        {/* title */}
        <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--base)', margin: '0 0 20px', letterSpacing: '0.01em' }}>
          {content.title}
        </h1>

        {/* summary callout */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)',
          borderRadius: '4px',
          marginBottom: '28px',
          fontSize: '13px',
          color: 'var(--base)',
          fontFamily: "'IBM Plex Sans', sans-serif",
          lineHeight: 1.65,
        }}>
          {content.summary}
        </div>

        {/* full detail */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '10px' }}>
            Explanation
          </div>
          <p style={{
            fontSize: '13px',
            color: 'var(--muted)',
            fontFamily: "'IBM Plex Sans', sans-serif",
            lineHeight: 1.8,
            margin: 0,
          }}>
            {content.detail}
          </p>
        </div>

        {/* example */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          marginBottom: '32px',
        }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '10px' }}>
            Example
          </div>
          <p style={{
            fontSize: '12px',
            color: 'var(--muted)',
            fontFamily: "'IBM Plex Sans', sans-serif",
            lineHeight: 1.8,
            margin: 0,
          }}>
            {content.example}
          </p>
        </div>

        {/* see also */}
        {seeAlsoTerms.length > 0 && (
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '12px' }}>
              See also
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
    </>
  )
}