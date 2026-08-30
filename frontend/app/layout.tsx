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
  description: 'تطبيق عربي لتتبع مشترياتك وديونك مع المحلات التجارية. سهل الاستخدام على الهاتف.',
  applicationName: 'دفتر',
  manifest: '/favicon/manifest.webmanifest?v=2',
  appleWebApp: {
    capable: true,
    title: 'دفتر',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
