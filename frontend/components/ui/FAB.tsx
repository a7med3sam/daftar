'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FABAction {
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
}

interface FABProps {
  actions: FABAction[];
}

export default function FAB({ actions }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  function handleActionClick(action: FABAction) {
    setIsOpen(false);
    action.onClick?.();
  }

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`fab-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* FAB Container */}
      <div className="fab-container" aria-label="إجراءات سريعة">
        {/* Speed dial actions */}
        <div className={`fab-speed-dial ${isOpen ? 'open' : ''}`} role="menu">
          {actions.map((action, i) => (
            action.href ? (
              <Link
                key={i}
                href={action.href}
                className="fab-action"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                style={{ transitionDelay: isOpen ? `${i * 40}ms` : '0ms' }}
              >
                <span className="fab-action-icon">{action.icon}</span>
                <span>{action.label}</span>
              </Link>
            ) : (
              <button
                key={i}
                className="fab-action"
                role="menuitem"
                onClick={() => handleActionClick(action)}
                style={{ transitionDelay: isOpen ? `${i * 40}ms` : '0ms' }}
              >
                <span className="fab-action-icon">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            )
          ))}
        </div>

        {/* Main FAB button */}
        <button
          className={`fab-main ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'إغلاق القائمة' : 'إضافة جديد'}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          ＋
        </button>
      </div>
    </>
  );
}
