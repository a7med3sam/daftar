'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const leadingNavItems = [
  { href: '/',       label: 'الرئيسية', icon: '🏠' },
  { href: '/shops',  label: 'المحلات',  icon: '🏪' },
];

const trailingNavItems = [
  { href: '/buyers', label: 'المشترون', icon: '👥' },
];

const addActions = [
  { label: 'فاتورة جديدة', icon: '🧾', href: '/purchases/new' },
  { label: 'محل جديد',     icon: '🏪', href: '/shops?action=new' },
  { label: 'مشترٍ جديد',  icon: '👤', href: '/buyers?action=new' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Close menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAddMenuOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Backdrop for Add Menu */}
      <div
        className={`mobile-add-backdrop ${isAddMenuOpen ? 'open' : ''}`}
        onClick={() => setIsAddMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Speed Dial Menu for Add Action */}
      <div className={`mobile-add-menu ${isAddMenuOpen ? 'open' : ''}`}>
        {addActions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="mobile-add-menu-item"
            onClick={() => setIsAddMenuOpen(false)}
            style={{ transitionDelay: isAddMenuOpen ? `${i * 30}ms` : '0ms' }}
          >
            <span className="mobile-add-icon">{action.icon}</span>
            <span className="mobile-add-label">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Bottom Nav Bar */}
      <nav className="mobile-nav" role="navigation" aria-label="التنقل الرئيسي">
        <div className="mobile-nav-inner">
          {leadingNavItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="mobile-nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            className={`mobile-nav-item mobile-nav-add-btn ${isAddMenuOpen ? 'active' : ''}`}
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            aria-label="إضافة جديد"
            aria-expanded={isAddMenuOpen}
          >
            <span className="mobile-nav-add-icon" aria-hidden="true">＋</span>
            <span>إضافة</span>
          </button>

          {trailingNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="mobile-nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
