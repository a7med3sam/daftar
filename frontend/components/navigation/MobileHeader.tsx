'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function MobileHeader() {
  return (
    <header className="mobile-header" role="banner">
      <Link href="/" className="mobile-header-logo" aria-label="الرئيسية — دفتر">
        <img src="/logo2.svg" alt="شعار دفتر" style={{ height: '32px', width: 'auto', display: 'block' }} />
      </Link>
      <ThemeToggle />
    </header>
  );
}
