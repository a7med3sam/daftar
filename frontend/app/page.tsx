'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, DashboardStats } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';

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
      <div className="loading-center">
        <span className="spinner" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">لوحة التحكم</h1>
        <Link href="/purchases/new" className="btn btn-primary">
          ➕ شراء جديد
        </Link>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-icon accent">🛒</div>
          <div className="stat-value">{stats?.totalPurchases ?? 0}</div>
          <div className="stat-label">إجمالي المشتريات</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon warning">💰</div>
          <div className="stat-value">{formatCurrency(stats?.totalAmount ?? 0)}</div>
          <div className="stat-label">إجمالي المبالغ</div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon success">✅</div>
          <div className="stat-value">{formatCurrency(stats?.totalPaid ?? 0)}</div>
          <div className="stat-label">إجمالي المدفوع</div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon danger">⏳</div>
          <div className="stat-value">{formatCurrency(stats?.totalRemaining ?? 0)}</div>
          <div className="stat-label">إجمالي المتبقي</div>
        </div>
      </div>

      {/* Recent Purchases */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">أحدث المشتريات</h2>
          <Link href="/shops" className="btn btn-secondary btn-sm">
            عرض الكل
          </Link>
        </div>

        {!stats?.recentPurchases?.length ? (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <p>لا توجد مشتريات بعد</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>المحل</th>
                  <th>المشتري</th>
                  <th>التاريخ</th>
                  <th>الإجمالي</th>
                  <th>المتبقي</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPurchases.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link
                        href={`/shops/${p.shopId}`}
                        style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {p.shop?.name ?? '-'}
                      </Link>
                    </td>
                    <td>{p.buyer?.name ?? '-'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {formatDate(p.purchaseDate)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(p.totalAmount)}</td>
                    <td style={{ color: p.remainingAmount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {formatCurrency(p.remainingAmount)}
                    </td>
                    <td>
                      <StatusBadge status={p.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
