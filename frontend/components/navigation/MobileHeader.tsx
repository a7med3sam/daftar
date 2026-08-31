'use client';

import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/lib/auth';

export default function MobileHeader() {
  const { user, loading, logout } = useAuth();

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

      <div className="mobile-header-actions">
        <ThemeToggle />
        {!loading && user && (
          <>
            <NotificationBell />
            <button type="button" className="mobile-header-user" onClick={() => logout()} title="تسجيل الخروج" aria-label="تسجيل الخروج">
              <span className="mobile-header-avatar">{user.name.charAt(0)}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
