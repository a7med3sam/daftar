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
import { SkeletonList } from '@/components/ui/Skeleton';

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
  const [filter, setFilter] = useState<'all' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'>('all');

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

  if (loading) {
    return (
      <div>
        <div style={{
          height: 20,
          width: '40%',
          borderRadius: 4,
          background: 'var(--border)',
          marginBottom: '0.75rem',
        }} />
        <div style={{
          height: 130,
          borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, var(--accent-dark), var(--accent-light))',
          marginBottom: '1rem',
        }} />
        <SkeletonList count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <span className="empty-icon">⚠️</span>
        <p className="empty-title">{error}</p>
        <button className="btn btn-primary" onClick={load}>حاول مرة أخرى</button>
      </div>
    );
  }

  if (!shop) return null;

  const filteredPurchases = shop.purchases.filter(p =>
    filter === 'all' || p.paymentStatus === filter
  );

  return (
    <div>
      {/* ── Back ── */}
      <Link href="/shops" className="page-back">
        ← المحلات
      </Link>

      {/* ── Hero Card ── */}
      <div className="hero-card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <p className="hero-label" style={{ fontSize: '0.8rem' }}>🏪 {shop.name}</p>
            {shop.phone && (
              <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                📞 {shop.phone}
              </p>
            )}
            <p className="hero-label">إجمالي الدين المتبقي</p>
            <p className="hero-amount">{formatCurrency(shop.remainingAmount)}</p>
          </div>
          <Link
            href={`/purchases/new?shopId=${shop.id}`}
            className="btn btn-primary btn-sm"
            style={{ background: 'rgba(255,255,255,0.25)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', flexShrink: 0 }}
          >
            ➕ فاتورة
          </Link>
        </div>
        {shop.notes && (
          <p className="hero-sub">{shop.notes}</p>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="stat-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card accent">
          <div className="stat-icon accent">🛒</div>
          <div className="stat-value">{shop.purchases.length}</div>
          <div className="stat-label">فاتورة</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning">💰</div>
          <div className="stat-value">{formatCurrency(shop.totalAmount)}</div>
          <div className="stat-label">الإجمالي</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success">✅</div>
          <div className="stat-value">{formatCurrency(shop.paidAmount)}</div>
          <div className="stat-label">المدفوع</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon danger">⏳</div>
          <div className="stat-value">{formatCurrency(shop.remainingAmount)}</div>
          <div className="stat-label">المتبقي</div>
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="filter-chips">
        {[
          { value: 'all',             label: 'الكل' },
          { value: 'UNPAID',          label: '🔴 غير مدفوع' },
          { value: 'PARTIALLY_PAID',  label: '🟠 جزئي' },
          { value: 'PAID',            label: '🟢 مدفوع' },
        ].map(f => (
          <button
            key={f.value}
            className={`filter-chip ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value as typeof filter)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Purchases List ── */}
      {shop.purchases.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-icon">🛍️</span>
            <p className="empty-title">لا توجد فواتير لهذا المحل</p>
            <p className="empty-desc">أضف أول فاتورة لتتبع ديونك</p>
            <Link href={`/purchases/new?shopId=${shop.id}`} className="btn btn-primary">
              ➕ إضافة فاتورة
            </Link>
          </div>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <span className="empty-icon" style={{ fontSize: '2.5rem' }}>🔍</span>
            <p className="empty-title">لا توجد فواتير بهذه الحالة</p>
          </div>
        </div>
      ) : (
        <div>
          <p className="section-label" style={{ marginTop: 0 }}>
            الفواتير ({filteredPurchases.length})
          </p>
          {filteredPurchases.map(p => (
            <PurchaseCard
              key={p.id}
              purchase={p}
              shopId={shopId}
              onPay={setPaymentTarget}
              onViewPayment={setPaymentDetailsTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* ── Dialogs ── */}
      {deleteTarget && (
        <ConfirmDialog
          title="حذف الفاتورة"
          message="هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء."
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

/* ── Purchase Card Component ── */
function PurchaseCard({
  purchase: p,
  shopId,
  onPay,
  onViewPayment,
  onDelete,
}: {
  purchase: Purchase;
  shopId: number;
  onPay: (p: Purchase) => void;
  onViewPayment: (p: Purchase) => void;
  onDelete: (id: number) => void;
}) {
  const remaining = Number(p.remainingAmount);
  const isPaid = p.paymentStatus === 'PAID';

  return (
    <div className="purchase-card" style={{ marginBottom: '0.75rem' }}>
      {/* Top row */}
      <div className="purchase-card-row" style={{ marginBottom: '0.6rem' }}>
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>
            📅 {formatDate(p.purchaseDate)}
          </p>
          <p className="purchase-card-amount">
            {formatCurrency(p.totalAmount)}
          </p>
        </div>
        <StatusBadge status={p.paymentStatus} />
      </div>

      {/* Details row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>المدفوع</p>
          <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem' }}>
            {formatCurrency(p.paidAmount)}
          </p>
        </div>
        {remaining > 0 && (
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>المتبقي</p>
            <p className="purchase-card-remaining danger">
              {formatCurrency(remaining)}
            </p>
          </div>
        )}
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>المشتري</p>
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.buyer?.name ?? '—'}</p>
        </div>
      </div>

      {/* Payment info */}
      {p.paidBy && (
        <button
          onClick={() => onViewPayment(p)}
          style={{
            background: 'var(--success-light)',
            border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            color: 'var(--success)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 600,
            marginBottom: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          ✅ دفع بواسطة {p.paidBy.name}
          {p.paidAt && ` · ${formatDate(p.paidAt)}`}
        </button>
      )}

      {/* Images */}
      {p.images?.filter(i => !i.isReceipt).length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <ImageGallery images={p.images.filter(i => !i.isReceipt)} />
        </div>
      )}

      {/* Actions */}
      <div className="purchase-card-actions">
        {!isPaid && (
          <button
            className="btn btn-success"
            style={{ flex: 1 }}
            onClick={() => onPay(p)}
          >
            💵 تسجيل دفعة
          </button>
        )}
        <Link
          href={`/purchases/${p.id}/edit`}
          className="btn btn-secondary btn-sm"
          aria-label="تعديل الفاتورة"
        >
          ✏️ تعديل
        </Link>
        <button
          className="btn-icon"
          onClick={() => onDelete(p.id)}
          aria-label="حذف الفاتورة"
          style={{ color: 'var(--danger)' }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
