'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'الرئيسية', icon: '🏠' },
  { href: '/shops', label: 'المحلات', icon: '🏪' },
  { href: '/buyers', label: 'المشترون', icon: '👥' },
  { href: '/purchases/new', label: 'شراء جديد', icon: '➕' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar-logo">
        <span className="logo-icon">📒</span>
        دفتر
      </Link>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          دفتر v1.0
        </p>
      </div>
    </aside>
  );
}
