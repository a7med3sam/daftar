import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import MobileHeader from '@/components/navigation/MobileHeader';
import FAB from '@/components/ui/FAB';
import PWARegister from '@/components/PWARegister';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'دفتر — تتبع المشتريات والديون',
  description: 'تطبيق عربي بسيط لتتبع مشترياتك وديونك مع المحلات التجارية. سهل الاستخدام على الهاتف.',
  applicationName: 'دفتر',
  appleWebApp: {
    capable: true,
    title: 'دفتر',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#5b52f0',
};

const fabActions = [
  { label: 'فاتورة جديدة', icon: '🧾', href: '/purchases/new' },
  { label: 'محل جديد',     icon: '🏪', href: '/shops?action=new' },
  { label: 'مشترٍ جديد',  icon: '👤', href: '/buyers?action=new' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#5b52f0" />
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/manifest.webmanifest" />
      </head>
      <body className={cairo.variable}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {/* Service Worker Registration for PWA */}
          <PWARegister />
          
          {/* Mobile header — sticky top, mobile only */}
          <MobileHeader />

          <div className="app-layout">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Main content */}
            <main className="main-content" id="main-content">
              <div style={{ padding: '1.25rem', maxWidth: '900px', margin: '0 auto' }}>
                {children}
              </div>
            </main>

            {/* Mobile bottom navigation */}
            <MobileNav />
          </div>

          {/* FAB — mobile only via CSS */}
          <FAB actions={fabActions} />
        </ThemeProvider>
      </body>
    </html>
  );
}
