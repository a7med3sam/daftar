'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/',       label: 'الرئيسية', icon: '🏠' },
  { href: '/shops',  label: 'المحلات',  icon: '🏪' },
  { href: '/buyers', label: 'المشترون', icon: '👥' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" role="navigation" aria-label="التنقل الرئيسي">
      <div className="mobile-nav-inner">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
