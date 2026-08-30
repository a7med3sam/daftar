'use client';

import { Purchase } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import ImageGallery from './ImageGallery';

interface Props {
  purchase: Purchase;
  onClose: () => void;
}

const statusLabel: Record<string, string> = {
  PAID: 'مدفوع بالكامل',
  PARTIALLY_PAID: 'مدفوع جزئياً',
  UNPAID: 'غير مدفوع',
};

const statusColors: Record<string, string> = {
  PAID: 'var(--success)',
  PARTIALLY_PAID: 'var(--warning)',
  UNPAID: 'var(--danger)',
};

export default function PaymentDetailsModal({ purchase, onClose }: Props) {
  const total     = Number(purchase.totalAmount);
  const paid      = Number(purchase.paidAmount ?? 0);
  const remaining = purchase.remainingAmount != null
    ? Number(purchase.remainingAmount)
    : total - paid;

  const receiptImages = (purchase.images ?? []).filter((img) => img.isReceipt);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">💵 تفاصيل الدفع</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

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
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>الإجمالي</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{formatCurrency(total)}</div>
          </div>
          <div style={{ background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: '0.3rem' }}>المدفوع</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)' }}>{formatCurrency(paid)}</div>
          </div>
          <div style={{ background: remaining > 0 ? 'var(--danger-light)' : 'var(--success-light)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: remaining > 0 ? 'var(--danger)' : 'var(--success)', marginBottom: '0.3rem' }}>المتبقي</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>{formatCurrency(remaining)}</div>
          </div>
        </div>

        {/* Payment details */}
        <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          {purchase.paidBy && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>👤 دفع بواسطة</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{purchase.paidBy.name}</span>
            </div>
          )}
          {purchase.paidAt && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>📅 تاريخ الدفع</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(purchase.paidAt)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-primary)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>📅 تاريخ الشراء</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(purchase.purchaseDate)}</span>
          </div>
        </div>

        {/* Receipt images */}
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            🧾 صور الإيصالات / الفواتير
          </p>
          {receiptImages.length > 0 ? (
            <ImageGallery images={receiptImages} />
          ) : (
            <div style={{
              padding: '1.5rem',
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

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
