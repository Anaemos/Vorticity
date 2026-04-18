'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  vx: number
  vy: number
  life: number
  size: number
}

const PARTICLE_COLORS = ['#50C878', '#1dc12e', '#DC143C', '#FF4040']

// the two lines of the quote + timing
const QUOTE_LINES = [
  { text: 'Markets are not random.', pauseAfter: 520 },
  { text: 'They follow patterns you don\'t see.', pauseAfter: 0 },
]

// total budget: ~6s
// line 1 types at ~55ms/char -> 23 chars = ~1.27s, pause 0.52s
// line 2 types at ~55ms/char -> 35 chars = ~1.93s, pause 0.8s hold
// fade out 0.5s, fade in landing 0.6s -> total ~5.6s

function ParticleEffect({ contentRef }: { contentRef: React.RefObject<HTMLDivElement | null> }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const idRef     = useRef(0)
  const lastSpawn = useRef(0)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastSpawn.current < 30) return
      lastSpawn.current = now

      // block particles over the content area
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect()
        // add 24px padding around content box
        if (
          e.clientX > rect.left   - 24 &&
          e.clientX < rect.right  + 24 &&
          e.clientY > rect.top    - 24 &&
          e.clientY < rect.bottom + 24
        ) return
      }

      const count = Math.floor(Math.random() * 4) + 5
      const batch: Particle[] = []
      for (let i = 0; i < count; i++) {
        batch.push({
          id:    idRef.current++,
          x:     e.clientX,
          y:     e.clientY,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          vx:    (Math.random() - 0.5) * 2.4,
          vy:    (Math.random() - 0.5) * 2.4 - 0.8,
          life:  1,
          size:  1 + Math.random() * 1.5,
        })
      }
      setParticles(prev => [...prev, ...batch])
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [contentRef])

  useEffect(() => {
    const id = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => {
            const cx = window.innerWidth  / 2
            const cy = window.innerHeight / 2
            const dx = cx - p.x
            const dy = cy - p.y
            const angle = Math.atan2(dy, dx)
            const pull  = 0.03
            const swirl = 0.0025
            let vx = p.vx + Math.cos(angle) * pull
            let vy = p.vy + Math.sin(angle) * pull
            vx += -dy * swirl
            vy +=  dx * swirl
            vx *= 0.95
            vy *= 0.95
            return { ...p, x: p.x + vx, y: p.y + vy, vx, vy, life: p.life - 0.02 }
          })
          .filter(p => p.life > 0)
      )
    }, 16)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position:        'absolute',
            left:            p.x,
            top:             p.y,
            width:           `${p.size}px`,
            height:          `${p.size}px`,
            borderRadius:    '50%',
            backgroundColor: p.color,
            opacity:         p.life * 0.85,
            transform:       'translate(-50%, -50%)',
            boxShadow:       `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </div>
  )
}

// typewriter intro — plays once then calls onDone
function TypewriterIntro({ onDone }: { onDone: () => void }) {
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [cursorLine, setCursorLine] = useState<1 | 2>(1)
  const [showCursor, setShowCursor] = useState(true)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    const l1 = QUOTE_LINES[0].text
    const l2 = QUOTE_LINES[1].text
    const charMs = 55
    let cancelled = false

    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    const run = async () => {
      await sleep(300) // brief pause before first char

      // type line 1 - cursor on line 1
      setCursorLine(1)
      for (let i = 1; i <= l1.length; i++) {
        if (cancelled) return
        setLine1(l1.slice(0, i))
        await sleep(charMs)
      }

      await sleep(QUOTE_LINES[0].pauseAfter)

      // move cursor to line 2 before typing it
      setCursorLine(2)
      for (let i = 1; i <= l2.length; i++) {
        if (cancelled) return
        setLine2(l2.slice(0, i))
        await sleep(charMs)
      }

      await sleep(800) // hold completed quote
      setShowCursor(false)
      await sleep(200)

      if (!cancelled) {
        setFadingOut(true)
        await sleep(500)
        onDone()
      }
    }

    run()
    return () => { cancelled = true }
  }, [onDone])

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'var(--bg)',
      zIndex:         50,
      opacity:        fadingOut ? 0 : 1,
      transition:     'opacity 0.5s ease',
    }}>
      <div style={{
        fontFamily:    "'IBM Plex Mono', monospace",
        textAlign:     'center',
        padding:       '0 32px',
      }}>
        {/* line 1 */}
        <div style={{
          fontSize:      'clamp(22px, 3.2vw, 36px)',
          fontWeight:    500,
          color:         '#e8f3fc',
          letterSpacing: '0.04em',
          minHeight:     '1.5em',
          marginBottom:  '16px',
          textShadow:    '0 0 24px rgba(0,229,255,0.45), 0 0 8px rgba(0,229,255,0.25)',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
        }}>
          {line1}
          {showCursor && cursorLine === 1 && (
            <span style={{
              display:       'inline-block',
              width:         '2px',
              height:        '1em',
              background:    'var(--accent)',
              marginLeft:    '4px',
              verticalAlign: 'middle',
              boxShadow:     '0 0 6px var(--accent)',
              animation:     'blink 0.75s step-end infinite',
            }} />
          )}
        </div>

        {/* line 2 */}
        <div style={{
          fontSize:      'clamp(18px, 2.6vw, 28px)',
          fontWeight:    300,
          color:         '#96aac2',
          letterSpacing: '0.06em',
          minHeight:     '1.5em',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          textShadow:    '0 0 20px rgba(0,229,255,0.30)',
        }}>
          {line2}
          {showCursor && cursorLine === 2 && (
            <span style={{
              display:       'inline-block',
              width:         '2px',
              height:        '1em',
              background:    'var(--accent)',
              marginLeft:    '4px',
              verticalAlign: 'middle',
              boxShadow:     '0 0 6px var(--accent)',
              animation:     'blink 0.75s step-end infinite',
            }} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function SplashPage() {
  const router     = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)

  const [phase, setPhase] = useState<'intro' | 'landing'>('intro')
  const [landingVisible, setLandingVisible] = useState(false)

  const handleIntroDone = () => {
    setPhase('landing')
    // slight delay so intro has fully faded before landing fades in
    setTimeout(() => setLandingVisible(true), 80)
  }

  return (
    <>
      {/* typewriter intro - unmounts after done */}
      {phase === 'intro' && <TypewriterIntro onDone={handleIntroDone} />}

      {/* landing page - fades in after intro */}
      <div style={{
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '40px 24px',
        position:       'relative',
        opacity:        landingVisible ? 1 : 0,
        transition:     'opacity 0.6s ease',
      }}>
        <ParticleEffect contentRef={contentRef} />

        <div
          ref={contentRef}
          style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* logo */}
          <img
            src="/mini.svg"
            alt="Vorticity Logo"
            style={{
              width:         '220px',
              height:        '220px',
              marginBottom:  '28px',
              filter:        'drop-shadow(0 0 20px rgba(0,229,255,0.30))',
            }}
          />

          {/* name */}
          <div style={{
            fontSize:      '38px',
            fontWeight:    600,
            color:         'var(--base)',
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            marginBottom:  '14px',
          }}>
            Vorticity
          </div>

          {/* tagline */}
          <div style={{
            fontSize:      '15px',
            color:         'var(--muted)',
            letterSpacing: '0.08em',
            marginBottom:  '8px',
            textAlign:     'center',
          }}>
            Daily volatility regime intelligence for Indian equities and ETFs.
          </div>

          <div style={{
            fontSize:      '12px',
            color:         'var(--dim)',
            letterSpacing: '0.06em',
            marginBottom:  '48px',
            textAlign:     'center',
          }}>
            NSE &middot; 14 instruments &middot; HMM regime detection &middot; TFT risk forecasting
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding:        '13px 44px',
              border:         '1px solid var(--accent)',
              background:     'rgba(0,229,255,0.06)',
              color:          'var(--accent)',
              fontFamily:     "'IBM Plex Mono', monospace",
              fontSize:       '13px',
              fontWeight:     500,
              letterSpacing:  '0.14em',
              textTransform:  'uppercase',
              borderRadius:   '3px',
              cursor:         'pointer',
              transition:     'background 0.15s, box-shadow 0.15s',
              marginBottom:   '48px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0,229,255,0.13)'
              e.currentTarget.style.boxShadow  = '0 0 20px rgba(0,229,255,0.18)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,229,255,0.06)'
              e.currentTarget.style.boxShadow  = 'none'
            }}
          >
            Enter Dashboard
          </button>

          {/* what is this */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              What is this?
            </div>
            <div style={{
              maxWidth:   '480px',
              textAlign:  'center',
              fontSize:   '13px',
              color:      'var(--dim)',
              lineHeight: 1.8,
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
                marginTop:           '10px',
                background:          'none',
                border:              'none',
                color:               'var(--muted)',
                fontFamily:          "'IBM Plex Mono', monospace",
                fontSize:            '12px',
                letterSpacing:       '0.08em',
                cursor:              'pointer',
                textDecoration:      'underline',
                textUnderlineOffset: '3px',
                textDecorationColor: 'var(--border2)',
              }}
            >
              Read the glossary
            </button>
          </div>
        </div>

        {/* footnote */}
        <div style={{
          position:      'fixed',
          bottom:        '20px',
          right:         '24px',
          fontSize:      '9px',
          color:         'var(--dim)',
          letterSpacing: '0.06em',
          textAlign:     'right',
          lineHeight:    1.6,
          zIndex:        1,
        }}>
          Data sourced from Yahoo Finance via yfinance.<br />
          Not financial advice.
        </div>
      </div>
    </>
  )
}
