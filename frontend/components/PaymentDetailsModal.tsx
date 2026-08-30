'use client';

import { Purchase } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import ImageGallery from './ImageGallery';
import BottomSheet from '@/components/ui/BottomSheet';

interface Props {
  purchase: Purchase;
  onClose: () => void;
}

const statusLabel: Record<string, string> = {
  PAID:          'مدفوع بالكامل',
  PARTIALLY_PAID:'مدفوع جزئياً',
  UNPAID:        'غير مدفوع',
};

const statusColors: Record<string, string> = {
  PAID:          'var(--success)',
  PARTIALLY_PAID:'var(--warning)',
  UNPAID:        'var(--danger)',
};

export default function PaymentDetailsModal({ purchase, onClose }: Props) {
  const total     = Number(purchase.totalAmount);
  const paid      = Number(purchase.paidAmount ?? 0);
  const remaining = purchase.remainingAmount != null
    ? Number(purchase.remainingAmount)
    : total - paid;

  const receiptImages = (purchase.images ?? []).filter(img => img.isReceipt);

  return (
    <BottomSheet isOpen onClose={onClose} title="تفاصيل الدفع">
      {/* Status badge */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span
          className="badge"
          style={{
            background: `${statusColors[purchase.paymentStatus]}20`,
            color: statusColors[purchase.paymentStatus],
            fontSize: '0.9rem',
            padding: '0.4rem 1rem',
          }}
        >
          {purchase.paymentStatus === 'PAID'           ? '✅' :
           purchase.paymentStatus === 'PARTIALLY_PAID' ? '⏳' : '❌'}{' '}
          {statusLabel[purchase.paymentStatus]}
        </span>
      </div>

      {/* Amounts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.6rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 500 }}>الإجمالي</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{formatCurrency(total)}</div>
        </div>
        <div style={{ background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--success)', marginBottom: '0.3rem', fontWeight: 500 }}>المدفوع</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)' }}>{formatCurrency(paid)}</div>
        </div>
        <div style={{ background: remaining > 0 ? 'var(--danger-light)' : 'var(--success-light)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: remaining > 0 ? 'var(--danger)' : 'var(--success)', marginBottom: '0.3rem', fontWeight: 500 }}>المتبقي</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>{formatCurrency(remaining)}</div>
        </div>
      </div>

      {/* Payment details */}
      <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1.25rem' }}>
        {purchase.paidBy && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>👤 دفع بواسطة</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{purchase.paidBy.name}</span>
          </div>
        )}
        {purchase.paidAt && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>📅 تاريخ الدفع</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatDate(purchase.paidAt)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-primary)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>📅 تاريخ الشراء</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatDate(purchase.purchaseDate)}</span>
        </div>
      </div>

      {/* Receipt images */}
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          🧾 صور الإيصالات
        </p>
        {receiptImages.length > 0 ? (
          <ImageGallery images={receiptImages} />
        ) : (
          <div style={{
            padding: '1.25rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border)',
            fontSize: '0.875rem',
          }}>
            لا توجد صور إيصالات مرفقة
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <button className="btn btn-secondary btn-full" onClick={onClose}>إغلاق</button>
      </div>
    </BottomSheet>
  );
}
