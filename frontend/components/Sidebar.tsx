'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { href: '/',              label: 'الرئيسية',  icon: '🏠' },
  { href: '/shops',         label: 'المحلات',   icon: '🏪' },
  { href: '/buyers',        label: 'المشترون',  icon: '👥' },
  { href: '/purchases/new', label: 'شراء جديد', icon: '➕' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar-logo">
        <span className="logo-icon" aria-hidden="true">📒</span>
        دفتر
      </Link>

      <nav className="sidebar-nav" aria-label="التنقل الرئيسي">
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
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '1rem',
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          دفتر v1.0
        </p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
