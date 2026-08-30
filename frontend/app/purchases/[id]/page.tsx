'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api, Purchase } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import { SkeletonList } from '@/components/ui/Skeleton';
import Link from 'next/link';

export default function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const purchaseId = Number(resolvedParams.id);
  const router = useRouter();

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.purchases.get(purchaseId)
      .then(setPurchase)
      .catch((err) => setError(err.message || 'تعذّر تحميل تفاصيل الفاتورة'))
      .finally(() => setLoading(false));
  }, [purchaseId]);

  if (loading) {
    return (
      <div style={{ padding: '1rem' }}>
        <SkeletonList count={4} />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="danger" style={{ marginBottom: '1rem' }}>{error || 'الفاتورة غير موجودة'}</p>
        <button onClick={() => router.back()} className="btn btn-secondary">
          العودة
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0.25rem' }}>
            🔙
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>تفاصيل الفاتورة #{purchase.id}</h1>
        </div>
        <StatusBadge status={purchase.paymentStatus} />
      </div>

      {/* Main Info Card */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <p className="stat-label">المحل</p>
            <Link href={`/shops/${purchase.shopId}`} style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              {purchase.shop?.name || `محل #${purchase.shopId}`}
            </Link>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p className="stat-label">المشتري</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{purchase.buyer?.name || '—'}</p>
              {purchase.buyer?.imageUrl && (
                <img src={purchase.buyer.imageUrl} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <p className="stat-label">تاريخ الشراء</p>
            <p style={{ fontWeight: 600 }}>{formatDate(purchase.purchaseDate)}</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p className="stat-label">أُضيفت في</p>
            <p style={{ fontWeight: 600 }}>{formatDate(purchase.createdAt)}</p>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p className="stat-label">المبلغ الإجمالي</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatCurrency(purchase.totalAmount)}
            </p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p className="stat-label">المدفوع</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
              {formatCurrency(purchase.paidAmount)}
            </p>
          </div>
        </div>

        {Number(purchase.totalAmount) - Number(purchase.paidAmount) > 0 && (
          <div style={{ marginTop: '0.75rem', textAlign: 'center', color: 'var(--danger)', fontWeight: 700 }}>
            المتبقي: {formatCurrency(Number(purchase.totalAmount) - Number(purchase.paidAmount))}
          </div>
        )}
      </div>

      {/* Description */}
      {purchase.description && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>📝 وصف الفاتورة</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {purchase.description}
          </p>
        </div>
      )}

      {/* Products */}
      {purchase.items && purchase.items.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🛒 المنتجات ({purchase.items.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {purchase.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(Number(item.price))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Details if partially or fully paid */}
      {purchase.paidById && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1.25rem', border: '1px solid var(--success-light)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--success)' }}>✅ معلومات الدفع</h3>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="stat-label">دفع بواسطة:</span> {purchase.paidBy?.name || '—'}
            {purchase.paidBy?.imageUrl && (
              <img src={purchase.paidBy.imageUrl} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
            )}
          </div>
          {purchase.paidAt && (
            <p style={{ fontSize: '0.9rem' }}>
              <span className="stat-label">تاريخ الدفع:</span> {formatDate(purchase.paidAt)}
            </p>
          )}
        </div>
      )}

      {/* Images - if any */}
      {purchase.images && purchase.images.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📸 الصور والمرفقات</h3>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {purchase.images.map((img) => (
              <div key={img.id} style={{ flexShrink: 0, width: 100, height: 100, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <a href={img.imageUrl} target="_blank" rel="noreferrer">
                  <img src={img.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
