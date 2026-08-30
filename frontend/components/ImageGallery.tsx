'use client';

import { useState, useCallback, useEffect } from 'react';
import { PurchaseImage } from '@/lib/api';

interface Props {
  images: PurchaseImage[];
}

export default function ImageGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open  = (idx: number) => setActiveIndex(idx);
  const close = () => setActiveIndex(null);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i !== null ? (i + 1) % images.length : null));
  }, [images.length]);

  // Touch swipe support
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    setTouchStartX(null);
  };

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  next();
      if (e.key === 'ArrowRight') prev();
      if (e.key === 'Escape')     close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex, next, prev]);

  // ── No images ─────────────────────────────────
  if (!images || images.length === 0) {
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>;
  }

  // ── Compact trigger in table ───────────────────
  return (
    <>
      <button
        onClick={() => open(0)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.7rem',
          background: 'var(--accent-light)',
          border: '1.5px solid var(--accent)',
          borderRadius: 999,
          cursor: 'pointer',
          color: 'var(--accent)',
          fontFamily: 'inherit',
          fontWeight: 600,
          fontSize: '0.82rem',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
        title="عرض الصور"
      >
        {/* First image as micro-preview */}
        <img
          src={images[0].imageUrl}
          alt=""
          style={{
            width: 28,
            height: 28,
            objectFit: 'cover',
            borderRadius: '50%',
            border: '1.5px solid var(--accent)',
            flexShrink: 0,
          }}
        />
        {images.length === 1 ? '📷 صورة' : `📷 ${images.length} صور`}
      </button>

      {/* ── Full-screen Swiper Lightbox ── */}
      {activeIndex !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* ── Top bar ── */}
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              background: 'rgba(255,255,255,0.12)',
              padding: '0.3rem 0.75rem',
              borderRadius: 999,
              backdropFilter: 'blur(4px)',
            }}>
              {activeIndex + 1} / {images.length}
            </span>
            <button
              onClick={close}
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(4px)',
                border: 'none', borderRadius: '50%',
                width: 40, height: 40,
                cursor: 'pointer', color: '#fff',
                fontSize: '1.1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* ── Main image + side arrows ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0 0.75rem',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                onClick={prev}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(4px)',
                  border: 'none', borderRadius: '50%',
                  width: 44, height: 44, flexShrink: 0,
                  cursor: 'pointer', color: '#fff',
                  fontSize: '1.6rem', lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >›</button>
            )}

            <img
              src={images[activeIndex].imageUrl}
              alt={`صورة ${activeIndex + 1}`}
              style={{
                maxWidth: '90vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
              draggable={false}
            />

            {images.length > 1 && (
              <button
                onClick={next}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(4px)',
                  border: 'none', borderRadius: '50%',
                  width: 44, height: 44, flexShrink: 0,
                  cursor: 'pointer', color: '#fff',
                  fontSize: '1.6rem', lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >‹</button>
            )}
          </div>

          {/* ── Dot indicators + thumbnail strip ── */}
          {images.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem 1.5rem',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dot indicators */}
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      width: idx === activeIndex ? 22 : 8,
                      height: 8,
                      borderRadius: 999,
                      background: idx === activeIndex ? '#fff' : 'rgba(255,255,255,0.35)',
                      border: 'none', cursor: 'pointer', padding: 0,
                      transition: 'all 0.25s ease',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>

              {/* Thumbnail strip (show up to 6) */}
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', maxWidth: '90vw', padding: '0 0.25rem' }}>
                {images.slice(0, 6).map((img, idx) => (
                  <img
                    key={img.id}
                    src={img.imageUrl}
                    alt=""
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      width: 48, height: 48,
                      objectFit: 'cover',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: idx === activeIndex
                        ? '2.5px solid #fff'
                        : '2.5px solid rgba(255,255,255,0.25)',
                      opacity: idx === activeIndex ? 1 : 0.6,
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
