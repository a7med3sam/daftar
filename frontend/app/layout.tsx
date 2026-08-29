import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'دفتر — تتبع المشتريات والديون',
  description: 'تطبيق بسيط لتتبع المشتريات والديون مع المحلات التجارية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo`}>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
