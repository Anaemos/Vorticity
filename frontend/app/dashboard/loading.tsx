// Next.js automatically shows this while dashboard/page.tsx is fetching data.
// No imports needed - pure CSS animation via globals.

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--border2)',
      borderRadius: '4px',
      overflow: 'hidden',
    }}>
      {/* head */}
      <div style={{
        padding: '16px 18px 12px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skel" style={{ width: '120px', height: '14px' }} />
          <div className="skel" style={{ width: '90px',  height: '11px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
          <div className="skel" style={{ width: '52px', height: '18px' }} />
          <div className="skel" style={{ width: '60px', height: '18px' }} />
        </div>
      </div>

      {/* body */}
      <div style={{ padding: '16px 18px 14px 18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* risk gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skel" style={{ width: '90px', height: '9px', margin: '0 auto' }} />
          <div style={{ display: 'flex', gap: '12px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                <div className="skel" style={{ width: '20px', height: '8px' }} />
                <div className="skel" style={{ width: '100%', height: '4px' }} />
                <div className="skel" style={{ width: '36px', height: '11px' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* VaR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div className="skel" style={{ width: '80px', height: '9px' }} />
          <div style={{ display: 'flex', gap: '40px' }}>
            <div className="skel" style={{ width: '56px', height: '13px' }} />
            <div className="skel" style={{ width: '56px', height: '13px' }} />
          </div>
        </div>

        {/* return range */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div className="skel" style={{ width: '80px', height: '9px' }} />
          <div style={{ display: 'flex', gap: '28px' }}>
            {[0, 1, 2].map(i => (
              <div className="skel" key={i} style={{ width: '50px', height: '12px' }} />
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[100, 70, 90].map((w, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              <div className="skel" style={{ width: `${w}px`, height: '9px' }} />
              <div className="skel" style={{ width: '60px', height: '12px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 18px',
        borderTop: '1px solid var(--border)',
      }}>
        <div className="skel" style={{ width: '120px', height: '9px' }} />
        <div className="skel" style={{ width: '72px',  height: '9px' }} />
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <>
      {/* mirror of the real summary bar */}
      <div style={{
        display: 'flex',
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
      }}>
        {[140, 100, 120, 110, 80, 100, 110].map((w, i) => (
          <div key={i} style={{
            padding: '10px 20px',
            borderRight: '1px solid var(--border)',
            flexShrink: 0,
            minWidth: '110px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <div className="skel" style={{ width: '70px', height: '9px' }} />
            <div className="skel" style={{ width: `${w}px`, height: '14px' }} />
          </div>
        ))}
      </div>

      {/* mirror of filter bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        {[40, 32, 55, 46, 32, 44, 60, 60].map((w, i) => (
          <div key={i} className="skel" style={{ width: `${w}px`, height: '26px', borderRadius: '3px' }} />
        ))}
        <div className="skel" style={{ width: '120px', height: '26px', borderRadius: '3px', marginLeft: 'auto' }} />
      </div>

      {/* grid */}
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
          <div className="skel" style={{ width: '80px', height: '9px' }} />
          <div className="skel" style={{ width: '50px', height: '9px' }} />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>

      <style>{`
        .skel {
          background: var(--bg3);
          border-radius: 3px;
          position: relative;
          overflow: hidden;
        }
        .skel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.04) 50%,
            transparent 100%
          );
          animation: shimmer 1.6s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  )
}
