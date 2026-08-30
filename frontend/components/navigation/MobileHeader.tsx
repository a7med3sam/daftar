'use client';

import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function MobileHeader() {
  return (
    <header className="mobile-header" role="banner">
      <Link href="/" className="mobile-header-logo" aria-label="الرئيسية — دفتر">
        <Image
          className="mobile-header-logo-img mobile-header-logo-light"
          src="/logo-for-white-mood.svg"
          alt="شعار دفتر"
          width={104}
          height={73}
          priority
        />
        <Image
          className="mobile-header-logo-img mobile-header-logo-dark"
          src="/logo-for-dark-mood.svg"
          alt="شعار دفتر"
          width={104}
          height={73}
          priority
        />
      </Link>
      <ThemeToggle />
    </header>
  );
}
