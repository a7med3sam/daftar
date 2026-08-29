'use client';

import { useState, useRef, useEffect } from 'react';
import { api, Purchase, Buyer } from '@/lib/api';

interface Props {
  purchase: Purchase;
  onSuccess: () => void;
  onCancel: () => void;
}

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
    if (numAmount <= 0) return setError('يجب أن يكون المبلغ أكبر من صفر');
    if (numAmount > remaining) return setError('المبلغ المدفوع يتجاوز المبلغ المتبقي');

    setLoading(true);
    try {
      const newPaidAmount = Number(purchase.paidAmount) + numAmount;
      
      // Update purchase
      await api.purchases.update(purchase.id, {
        totalAmount: Number(purchase.totalAmount),
        paidAmount: newPaidAmount,
        paidById: paidById ? Number(paidById) : undefined,
        paidAt: paidAt || undefined,
      });

      // Upload images if any
      if (files.length > 0) {
        await api.purchases.uploadImages(purchase.id, files, true);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ السداد');
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">💵 سداد دفعة جديدة</h2>
          <button className="btn-icon" onClick={onCancel} disabled={loading}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">المبلغ المراد سداده (ج.م) *</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              max={purchase.remainingAmount}
              step="0.01"
              required
              disabled={loading}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              المتبقي: {remaining} ج.م
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">دفع بواسطة</label>
              <select className="form-control" value={paidById} onChange={(e) => setPaidById(e.target.value)} disabled={loading}>
                <option value="">— اختر مشتريًا —</option>
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">تاريخ الدفع</label>
              <input type="date" className="form-control" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>📸 صورة الإيصال / الفاتورة</label>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', border: '2px dashed var(--border)' }}
                onClick={() => cameraRef.current?.click()}
              >
                <span style={{ fontSize: '1.5rem' }}>📷</span>
                <span style={{ fontSize: '0.9rem' }}>فتح الكاميرا</span>
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', border: '2px dashed var(--border)' }}
                onClick={() => fileRef.current?.click()}
              >
                <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                <span style={{ fontSize: '0.9rem' }}>اختر من المعرض</span>
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
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                flexWrap: 'wrap', 
                padding: '0.75rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
              }}>
                {files.map((file, i) => (
                  <div key={i} style={{ position: 'relative', width: '70px', height: '70px' }}>
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setFiles(prev => prev.filter((_, index) => index !== i))}
                      style={{
                        position: 'absolute', top: -5, right: -5, 
                        background: 'var(--danger)', color: 'white', 
                        border: 'none', borderRadius: '50%', 
                        width: '22px', height: '22px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>إلغاء</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'تأكيد السداد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
