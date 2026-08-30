'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function MobileHeader() {
  return (
    <header className="mobile-header" role="banner">
      <Link href="/" className="mobile-header-logo" aria-label="الرئيسية — دفتر">
        <span aria-hidden="true">📒</span>
        <span>دفتر</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
