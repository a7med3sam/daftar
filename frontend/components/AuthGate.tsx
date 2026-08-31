'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/register', '/offline'];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, loading, isPublic, pathname, router]);

  // If it's a public path, always render (login/register/offline)
  if (isPublic) return <>{children}</>;

  // While checking session or while unauthenticated on a protected route, show a loader
  if (loading || !user) {
    return (
      <div className="auth-splash" aria-hidden="true">
        <div className="auth-splash-logo">
          <img src="/favicon/android-chrome-192x192.png" alt="دفتر" />
        </div>
        <div className="auth-splash-dots">
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
