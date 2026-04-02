import Link from 'next/link'
import Header from '@/components/Header'
import { HELP_CONTENT, GROUP_LABELS } from '@/lib/helpContent'
import type { HelpTerm } from '@/lib/helpContent'

function GroupSection({ group, terms }: { group: HelpTerm['group']; terms: HelpTerm[] }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{
        fontSize: '9px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--dim)',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border)',
      }}>
        {GROUP_LABELS[group]}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {terms.map(term => (
          <Link
            key={term.slug}
            href={`/help/${term.slug}`}
            style={{
              display: 'block',
              textDecoration: 'none',
              padding: '16px 20px',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            className="help-card"
          >
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--base)', marginBottom: '5px' }}>
              {term.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: "'IBM Plex Sans', sans-serif", lineHeight: 1.6 }}>
              {term.summary}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function HelpIndexPage() {
  const groups = (['basics', 'risk', 'ml'] as HelpTerm['group'][])

  return (
    <>
      <Header />

      <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '720px', padding: '0 28px' }}>

          {/* page header */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <Link href="/dashboard" style={{
              fontSize: '10px',
              color: 'var(--dim)',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              display: 'inline-block',
              marginBottom: '20px',
            }}>
              &larr; Dashboard
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--base)', margin: '0 0 10px' }}>
              Glossary
            </h1>
            <p style={{
              fontSize: '13px',
              color: 'var(--muted)',
              fontFamily: "'IBM Plex Sans', sans-serif",
              lineHeight: 1.7,
              margin: 0,
            }}>
              Every term shown on the dashboard, explained in plain language.
              Click any term for the full explanation with examples.
            </p>
          </div>

          {groups.map(group => {
            const terms = HELP_CONTENT.filter(t => t.group === group)
            return <GroupSection key={group} group={group} terms={terms} />
          })}
        </div>
      </div>

      <style>{`
        .help-card:hover {
          border-color: var(--border2) !important;
          background: var(--bg3) !important;
        }
      `}</style>
    </>
  )
}