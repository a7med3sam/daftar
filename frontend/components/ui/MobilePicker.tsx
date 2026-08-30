'use client';

import { useState } from 'react';

export default function MobilePicker({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; imageUrl?: string | null }[];
  placeholder: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" htmlFor={id}>{label}{required && ' *'}</label>
        <button
          id={id}
          type="button"
          onClick={() => setOpen(true)}
          className="form-control picker-trigger"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'right',
            color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            background: 'var(--bg-card)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {selected?.imageUrl && (
              <img src={selected.imageUrl} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            )}
            {selected ? selected.label : placeholder}
          </span>
          <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>▾</span>
        </button>
      </div>

      {/* Bottom-sheet picker */}
      {open && (
        <>
          <div
            className="fab-overlay open"
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius) var(--radius) 0 0',
              zIndex: 600,
              maxHeight: '70dvh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.18)',
              animation: 'slideUp 0.28s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0.25rem' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-light)' }} />
            </div>
            {/* Title */}
            <div style={{ padding: '0.5rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>{label}</p>
            </div>
            {/* Options */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    textAlign: 'right',
                    background: opt.value === value ? 'var(--accent-light)' : 'transparent',
                    color: opt.value === value ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: opt.value === value ? 700 : 500,
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {opt.imageUrl && (
                      <img src={opt.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <span>{opt.label}</span>
                  </div>
                  {opt.value === value && <span style={{ color: 'var(--accent)' }}>✓</span>}
                </button>
              ))}
            </div>
            {/* Cancel */}
            <div style={{ padding: '0.75rem 1.25rem', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={() => setOpen(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
