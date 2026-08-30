'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, DashboardStats, Purchase } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import { SkeletonStatGrid, SkeletonList } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard
      .get()
      .then(setStats)
      .catch(() => setError('تعذّر تحميل البيانات'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        {/* Hero skeleton */}
        <div style={{
          height: 130,
          background: 'linear-gradient(135deg, var(--accent-dark) 0%, var(--accent-light) 100%)',
          borderRadius: 'var(--radius)',
          marginBottom: '1rem',
          animation: 'shimmer 1.5s infinite',
          backgroundSize: '200% 100%',
        }} aria-hidden="true" />
        <SkeletonStatGrid />
        <div style={{ marginTop: '1rem' }}>
          <SkeletonList count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <span className="empty-icon">⚠️</span>
        <p className="empty-title">{error}</p>
        <p className="empty-desc">تحقق من الاتصال بالإنترنت</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          حاول مرة أخرى
        </button>
      </div>
    );
  }

  const totalRemaining = stats?.totalRemaining ?? 0;
  const hasDebt = totalRemaining > 0;

  return (
    <div>
      {/* ── Hero Card ── */}
      <div className="hero-card" style={{ marginBottom: '1rem' }}>
        <p className="hero-label">إجمالي المتبقي عليك</p>
        <p className="hero-amount">{formatCurrency(totalRemaining)}</p>
        {stats && (
          <p className="hero-sub">
            {stats.totalPurchases} فاتورة إجمالية
          </p>
        )}
      </div>

      {/* ── Quick Stats ── */}
      <div className="stat-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card warning">
          <div className="stat-icon warning">💰</div>
          <div className="stat-value">{formatCurrency(stats?.totalAmount ?? 0)}</div>
          <div className="stat-label">إجمالي المشتريات</div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon success">✅</div>
          <div className="stat-value">{formatCurrency(stats?.totalPaid ?? 0)}</div>
          <div className="stat-label">إجمالي المدفوع</div>
        </div>
      </div>

      {/* ── Recent Purchases ── */}
      <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="section-label" style={{ marginBottom: 0, marginTop: 0 }}>آخر العمليات</p>
        <Link href="/shops" className="btn btn-secondary btn-sm">
          عرض المحلات
        </Link>
      </div>

      {!stats?.recentPurchases?.length ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
            <span className="empty-icon">🛍️</span>
            <p className="empty-title">لا توجد مشتريات بعد</p>
            <p className="empty-desc">ابدأ بإضافة أول فاتورة</p>
            <Link href="/purchases/new" className="btn btn-primary">
              ➕ إضافة فاتورة
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {stats.recentPurchases.map((p) => (
            <RecentPurchaseCard key={p.id} purchase={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecentPurchaseCard({ purchase: p }: { purchase: Purchase }) {
  return (
    <Link href={`/shops/${p.shopId}`} className="list-card" style={{ marginBottom: '0.75rem' }}>
      {/* Top row */}
      <div className="purchase-card-row" style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '1.1rem' }} aria-hidden="true">🏪</span>
          <span style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {p.shop?.name ?? '—'}
          </span>
        </div>
        <StatusBadge status={p.paymentStatus} />
      </div>

      {/* Amounts row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem', fontWeight: 500 }}>الإجمالي</p>
          <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            {formatCurrency(p.totalAmount)}
          </p>
        </div>
        {Number(p.remainingAmount) > 0 && (
          <div style={{ textAlign: 'start' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem', fontWeight: 500 }}>المتبقي</p>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--danger)' }}>
              {formatCurrency(p.remainingAmount)}
            </p>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="purchase-card-meta" style={{ marginTop: '0.5rem' }}>
        <span>📅 {formatDate(p.purchaseDate)}</span>
        {p.buyer && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {p.buyer.imageUrl ? (
              <img src={p.buyer.imageUrl} alt="" style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              '👤'
            )}
            {p.buyer.name}
          </span>
        )}
        {p.images?.length > 0 && <span>📎 {p.images.length} صورة</span>}
      </div>
    </Link>
  );
}
