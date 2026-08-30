'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ShopWithStats, Purchase, PurchaseImage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
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

/* ── Image Thumbnails Strip ── */
function ImageThumbnails({ images }: { images: PurchaseImage[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [canPortal, setCanPortal] = useState(false);

  useEffect(() => {
    setCanPortal(true);
  }, []);

  const closeLightbox = (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIdx(null);
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          padding: '0.4rem 0 0.5rem',
          scrollbarWidth: 'none',
        }}
      >
        {images.length > 0 && (
          <button
            type="button"
            onClick={() => setLightboxIdx(0)}
            style={{
              flexShrink: 0,
              width: 60,
              height: 60,
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              border: '2px solid var(--border)',
              padding: 0,
              cursor: 'pointer',
              background: 'var(--bg-primary)',
              position: 'relative',
            }}
            aria-label={`عرض ${images.length} صورة`}
          >
            <img
              src={images[0].imageUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {images.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}
              >
                +{images.length - 1}
              </div>
            )}
          </button>
        )}
      </div>

      {lightboxIdx !== null && canPortal && createPortal(
        <div
          data-lightbox
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLightboxIdx(null);
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Counter */}
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {lightboxIdx + 1} / {images.length}
          </p>
          <img
            src={images[lightboxIdx].imageUrl}
            alt=""
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '95vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: 12 }}
          />
          {/* Prev / Next */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
            {lightboxIdx > 0 && (
              <button
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i ?? 1) - 1); }}
                style={lbBtnStyle}
              >‹</button>
            )}
            <button
              onPointerDown={closeLightbox}
              onClick={(e) => e.stopPropagation()}
              style={{ ...lbBtnStyle, fontSize: '1rem' }}
            >✕</button>
            {lightboxIdx < images.length - 1 && (
              <button
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i ?? 0) + 1); }}
                style={lbBtnStyle}
              >›</button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const lbBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  borderRadius: '50%',
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.5rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

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
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[data-lightbox]')) return;
    router.push(`/purchases/${p.id}`);
  };

  return (
    <div className="purchase-card purchase-card-clickable" style={{ marginBottom: '0.75rem' }} onClick={handleCardClick}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.buyer?.name ?? '—'}</p>
            {p.buyer?.imageUrl && (
              <img src={p.buyer.imageUrl} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
            )}
          </div>
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
          {p.paidBy.imageUrl && (
            <img src={p.paidBy.imageUrl} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover', marginLeft: '-0.15rem' }} />
          )}
          {p.paidAt && ` · ${formatDate(p.paidAt)}`}
        </button>
      )}

      {/* Images — thumbnail strip */}
      {p.images?.filter(i => !i.isReceipt).length > 0 && (
        <ImageThumbnails images={p.images.filter(i => !i.isReceipt)} />
      )}

      {/* Actions */}
      <div className="purchase-card-actions" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        {!isPaid && (
          <button
            className="btn btn-success btn-sm"
            style={{ flex: '1 1 30%', minWidth: '80px', padding: '0.4rem 0.5rem', fontSize: '0.85rem' }}
            onClick={() => onPay(p)}
          >
            💵 دفع
          </button>
        )}
        <Link
          href={`/purchases/${p.id}`}
          className="btn btn-secondary btn-sm hide-on-mobile"
          style={{ flex: '1 1 30%', minWidth: '80px', padding: '0.4rem 0.5rem', fontSize: '0.85rem' }}
          aria-label="تفاصيل الفاتورة"
        >
          🔍 تفاصيل
        </Link>
        <Link
          href={`/purchases/${p.id}/edit`}
          className="btn btn-secondary btn-sm"
          style={{ flex: '1 1 30%', minWidth: '80px', padding: '0.4rem 0.5rem', fontSize: '0.85rem' }}
          aria-label="تعديل الفاتورة"
        >
          ✏️ تعديل
        </Link>
        <button
          className="btn-icon"
          onClick={() => onDelete(p.id)}
          aria-label="حذف الفاتورة"
          style={{ color: 'var(--danger)', padding: '0.4rem', minWidth: 'auto', flex: '0 0 auto' }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
