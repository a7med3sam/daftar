'use client';

import { useState, useRef, useEffect } from 'react';
import { api, Purchase, Buyer } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import BottomSheet from '@/components/ui/BottomSheet';

interface Props {
  purchase: Purchase;
  onSuccess: () => void;
  onCancel: () => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500];

export default function PaymentModal({ purchase, onSuccess, onCancel }: Props) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const remaining = purchase.remainingAmount != null
    ? Number(purchase.remainingAmount)
    : Number(purchase.totalAmount) - Number(purchase.paidAmount);

  const [amount, setAmount] = useState<string>(remaining.toString());
  const [paidById, setPaidById] = useState<string>('');
  const [paidAt, setPaidAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.buyers.list().then(setBuyers).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (numAmount <= 0)       return setError('يجب أن يكون المبلغ أكبر من صفر');
    if (numAmount > remaining) return setError(`المبلغ يتجاوز المتبقي (${formatCurrency(remaining)})`);

    setLoading(true);
    try {
      const newPaidAmount = Number(purchase.paidAmount) + numAmount;

      await api.purchases.update(purchase.id, {
        totalAmount:  Number(purchase.totalAmount),
        paidAmount:   newPaidAmount,
        paidById:     paidById ? Number(paidById) : undefined,
        paidAt:       paidAt   || undefined,
      });

      if (files.length > 0) {
        await api.purchases.uploadImages(purchase.id, files, true);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الدفعة');
      setLoading(false);
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <BottomSheet
      isOpen
      onClose={onCancel}
      title="تسجيل دفعة"
      footer={
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="confirm-payment-btn"
          >
            {loading
              ? <><span className="spinner spinner-sm" /> جارٍ الحفظ...</>
              : '💵 تأكيد الدفعة'}
          </button>
        </form>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Shop name */}
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>المتجر</p>
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{purchase.shop?.name ?? '—'}</p>
          </div>
          <div style={{ textAlign: 'start' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>المتبقي</p>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--danger)' }}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Amount input */}
        <div className="form-group">
          <label className="form-label" htmlFor="pay-amount">المبلغ المراد دفعه *</label>
          <input
            id="pay-amount"
            type="text"
            inputMode="decimal"
            className="form-control"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            disabled={loading}
            style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', height: '60px' }}
            placeholder="0.00"
          />

          {/* Quick amounts */}
          <div className="quick-amounts" style={{ justifyContent: 'center' }}>
            {QUICK_AMOUNTS.filter(v => v <= remaining).map(val => (
              <button
                key={val}
                type="button"
                className={`quick-amount-btn ${Number(amount) === val ? 'active' : ''}`}
                onClick={() => setAmount(val.toString())}
                disabled={loading}
              >
                {val}
              </button>
            ))}
            <button
              type="button"
              className={`quick-amount-btn ${Number(amount) === remaining ? 'active' : ''}`}
              onClick={() => setAmount(remaining.toString())}
              disabled={loading}
            >
              الكل
            </button>
          </div>
        </div>

        {/* Paid by & date */}
        <div className="form-group">
          <label className="form-label" htmlFor="pay-paidby">دفع بواسطة</label>
          <select
            id="pay-paidby"
            className="form-control"
            value={paidById}
            onChange={e => setPaidById(e.target.value)}
            disabled={loading}
          >
            <option value="">— اختر مشتريًا —</option>
            {buyers.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="pay-date">تاريخ الدفع</label>
          <input
            id="pay-date"
            type="date"
            className="form-control"
            value={paidAt}
            onChange={e => setPaidAt(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Receipt image */}
        <div className="form-group">
          <label className="form-label">📸 صورة الإيصال (اختياري)</label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              className="upload-zone"
              onClick={() => cameraRef.current?.click()}
              disabled={loading}
              aria-label="التقاط صورة الإيصال"
            >
              <span className="upload-zone-icon">📷</span>
              <span>كاميرا</span>
            </button>
            <button
              type="button"
              className="upload-zone"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              aria-label="اختيار صورة من المعرض"
            >
              <span className="upload-zone-icon">🖼️</span>
              <span>معرض</span>
            </button>
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])}
          />

          {files.length > 0 && (
            <div className="image-preview-grid">
              {files.map((file, i) => (
                <div key={i} className="image-preview-item">
                  <img src={URL.createObjectURL(file)} alt="إيصال" />
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={() => removeFile(i)}
                    disabled={loading}
                    aria-label="حذف الصورة"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </BottomSheet>
  );
}
