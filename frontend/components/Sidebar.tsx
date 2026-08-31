'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/',              label: 'الرئيسية',  icon: '🏠' },
  { href: '/shops',         label: 'المحلات',   icon: '🏪' },
  { href: '/buyers',        label: 'المشترون',  icon: '👥' },
  { href: '/purchases/new', label: 'شراء جديد', icon: '➕' },
];

const secondaryNavItems = [
  { href: '/notifications', label: 'الإشعارات', icon: '🔔' },
  { href: '/activity',      label: 'سجل النشاط', icon: '📜' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar-logo">
        <Image
          className="sidebar-logo-img sidebar-logo-light"
          src="/logo-for-white-mood.svg"
          alt="شعار دفتر"
          width={104}
          height={73}
          priority
        />
        <Image
          className="sidebar-logo-img sidebar-logo-dark"
          src="/logo-for-dark-mood.svg"
          alt="شعار دفتر"
          width={104}
          height={73}
          priority
        />
      </Link>

      <nav className="sidebar-nav" aria-label="التنقل الرئيسي">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="sidebar-nav-secondary">
          {secondaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          {!loading && user ? (
            <>
              <span className="sidebar-avatar">{user.name.charAt(0)}</span>
              <span className="sidebar-user-name">{user.name}</span>
              <button
                type="button"
                className="sidebar-logout"
                onClick={() => logout()}
                title="تسجيل الخروج"
                aria-label="تسجيل الخروج"
              >
                ⏻
              </button>
            </>
          ) : (
            <span className="sidebar-version">دفتر v1.0</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!loading && user && <NotificationBell />}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
