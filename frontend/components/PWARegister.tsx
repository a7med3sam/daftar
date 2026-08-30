'use client';

import { useEffect, useState } from 'react';

// ── Service Worker Registration ────────────────────────────────
function registerSW() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

// ── PWA Splash Screen ──────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    // fade-in → hold → fade-out
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('out'), 1200);
    const t3 = setTimeout(() => onDone(), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const opacity = phase === 'in' ? 0 : phase === 'hold' ? 1 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-primary, #f4f6fb)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        transition: `opacity ${phase === 'in' ? '0.4s' : '0.4s'} ease`,
        opacity,
        pointerEvents: 'none',
      }}
    >
      {/* Animated logo */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(91,82,240,0.35)',
          animation: phase === 'hold' ? 'splashPulse 0.8s ease-in-out infinite alternate' : undefined,
        }}
      >
        <img
          src="/favicon/android-chrome-192x192.png"
          alt="دفتر"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* App name */}
      <p
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-primary, #1a2235)',
          letterSpacing: '-0.03em',
          fontFamily: 'Cairo, sans-serif',
        }}
      >
        دفتر
      </p>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: '0.4rem', opacity: 0.5 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent, #5b52f0)',
              animation: `splashDot 0.9s ${i * 0.2}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splashPulse {
          from { transform: scale(1); box-shadow: 0 8px 32px rgba(91,82,240,0.35); }
          to   { transform: scale(1.05); box-shadow: 0 12px 40px rgba(91,82,240,0.5); }
        }
        @keyframes splashDot {
          from { transform: translateY(0); opacity: 0.4; }
          to   { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function PWARegister() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Register service worker
    registerSW();

    // Show splash only in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setShowSplash(true);
    }
  }, []);

  if (!showSplash) return null;

  return <SplashScreen onDone={() => setShowSplash(false)} />;
}
