'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ShopWithStats, Purchase } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import ImageGallery from '@/components/ImageGallery';
import ConfirmDialog from '@/components/ConfirmDialog';
import PaymentModal from '@/components/PaymentModal';
import PaymentDetailsModal from '@/components/PaymentDetailsModal';

export default function ShopDetailPage() {
  const { id } = useParams();
  const shopId = Number(id);
  const [shop, setShop] = useState<ShopWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<Purchase | null>(null);
  const [paymentDetailsTarget, setPaymentDetailsTarget] = useState<Purchase | null>(null);

  async function load() {
    try {
      const data = await api.shops.get(shopId);
      setShop(data);
    } catch {
      setError('تعذّر تحميل بيانات المحل');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [shopId]);

  async function handleDeletePurchase() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.purchases.delete(deleteTarget);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="loading-center"><span className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!shop) return null;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <Link href="/shops" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← المحلات
          </Link>
          <h1 className="page-title" style={{ marginTop: '0.25rem' }}>🏪 {shop.name}</h1>
          {shop.phone && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>📞 {shop.phone}</p>}
          {shop.notes && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{shop.notes}</p>}
        </div>
        <Link href={`/purchases/new?shopId=${shop.id}`} className="btn btn-primary">
          ➕ شراء جديد
        </Link>
      </div>

      {/* Shop Stats */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card accent">
          <div className="stat-icon accent">🛒</div>
          <div className="stat-value">{shop.purchases.length}</div>
          <div className="stat-label">عدد المشتريات</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning">💰</div>
          <div className="stat-value">{formatCurrency(shop.totalAmount)}</div>
          <div className="stat-label">إجمالي المبالغ</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success">✅</div>
          <div className="stat-value">{formatCurrency(shop.paidAmount)}</div>
          <div className="stat-label">إجمالي المدفوع</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon danger">⏳</div>
          <div className="stat-value">{formatCurrency(shop.remainingAmount)}</div>
          <div className="stat-label">إجمالي المتبقي</div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">المشتريات</h2>
        </div>
        {shop.purchases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <p>لا توجد مشتريات لهذا المحل بعد</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>الصور</th>
                  <th>المشتري</th>
                  <th>تاريخ الشراء</th>
                  <th>الإجمالي</th>
                  <th>الحالة</th>
                  <th>دفع بواسطة</th>
                  <th>تاريخ الدفع</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {shop.purchases.map(p => (
                  <tr key={p.id}>
                    <td>
                      {/* Product images only (no receipts) */}
                      <ImageGallery images={p.images.filter(i => !i.isReceipt)} />
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.buyer?.name ?? '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {formatDate(p.purchaseDate)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(p.totalAmount)}</td>
                    <td><StatusBadge status={p.paymentStatus} /></td>
                    <td>
                      {p.paidBy ? (
                        <button
                          onClick={() => setPaymentDetailsTarget(p)}
                          style={{
                            background: 'none', border: 'none',
                            color: 'var(--accent)', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.9rem',
                            fontWeight: 600, padding: '0.2rem 0',
                            textDecoration: 'underline', textDecorationStyle: 'dotted',
                          }}
                          title="عرض تفاصيل الدفع"
                        >
                          {p.paidBy.name}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {p.paidAt ? formatDate(p.paidAt) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {p.paymentStatus !== 'PAID' && (
                          <button className="btn-icon" title="سداد" onClick={() => setPaymentTarget(p)} style={{ color: 'var(--success)' }}>💵</button>
                        )}
                        <Link href={`/purchases/${p.id}/edit`} className="btn-icon" title="تعديل">✏️</Link>
                        <button className="btn-icon" title="حذف" onClick={() => setDeleteTarget(p.id)} style={{ color: 'var(--danger)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="حذف الشراء"
          message="هل أنت متأكد من حذف هذا الشراء؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={handleDeletePurchase}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {paymentTarget && (
        <PaymentModal
          purchase={paymentTarget}
          onSuccess={() => { setPaymentTarget(null); load(); }}
          onCancel={() => setPaymentTarget(null)}
        />
      )}

      {paymentDetailsTarget && (
        <PaymentDetailsModal
          purchase={paymentDetailsTarget}
          onClose={() => setPaymentDetailsTarget(null)}
        />
      )}
    </div>
  );
}
