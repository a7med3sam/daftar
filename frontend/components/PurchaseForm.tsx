'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Shop, Buyer, Purchase, CreatePurchasePayload, PaymentStatus } from '@/lib/api';

interface Props {
  purchase?: Purchase;
}

export default function PurchaseForm({ purchase }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialShopId = searchParams.get('shopId');

  const [shops, setShops] = useState<Shop[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [shopId, setShopId] = useState<string>(
    purchase?.shopId?.toString() ?? initialShopId ?? ''
  );
  const [buyerId, setBuyerId] = useState<string>(purchase?.buyerId?.toString() ?? '');
  const [purchaseDate, setPurchaseDate] = useState(
    purchase?.purchaseDate
      ? new Date(purchase.purchaseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [totalAmount, setTotalAmount] = useState(purchase?.totalAmount?.toString() ?? '');
  const [paidAmount, setPaidAmount] = useState(purchase?.paidAmount?.toString() ?? '0');
  const [paidById, setPaidById] = useState<string>(purchase?.paidById?.toString() ?? '');
  const [paidAt, setPaidAt] = useState(
    purchase?.paidAt ? new Date(purchase.paidAt).toISOString().split('T')[0] : ''
  );
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const isPartiallyOrFullyPaid = Number(paidAmount) > 0;

  useEffect(() => {
    Promise.all([api.shops.list(), api.buyers.list()])
      .then(([s, b]) => { setShops(s); setBuyers(b); })
      .catch(() => setError('تعذّر تحميل البيانات'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!shopId || !buyerId || !purchaseDate || !totalAmount) {
      return setError('يرجى ملء جميع الحقول المطلوبة');
    }

    const total = Number(totalAmount);
    const paid = Number(paidAmount);

    if (paid > total) {
      return setError('المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي');
    }

    setSaving(true);

    try {
      const payload: CreatePurchasePayload = {
        shopId: Number(shopId),
        buyerId: Number(buyerId),
        purchaseDate,
        totalAmount: total,
        paidAmount: paid,
        paidById: isPartiallyOrFullyPaid && paidById ? Number(paidById) : undefined,
        paidAt: isPartiallyOrFullyPaid && paidAt ? paidAt : undefined,
      };

      let saved: Purchase;
      if (purchase) {
        saved = await api.purchases.update(purchase.id, payload);
      } else {
        saved = await api.purchases.create(payload);
      }

      // Upload images if any
      if (files.length > 0) {
        await api.purchases.uploadImages(saved.id, files);
      }

      router.push(shopId ? `/shops/${shopId}` : '/');
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="loading-center"><span className="spinner" /></div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Images - PWA Optimized */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>📸 إضافة صور المنتجات</label>
        
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

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">المحل *</label>
          <select className="form-control" value={shopId} onChange={e => setShopId(e.target.value)} required>
            <option value="">— اختر محلًا —</option>
            {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">المشتري *</label>
          <select className="form-control" value={buyerId} onChange={e => setBuyerId(e.target.value)} required>
            <option value="">— اختر مشتريًا —</option>
            {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">تاريخ الشراء *</label>
          <input type="date" className="form-control" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">المبلغ الإجمالي (ج.م) *</label>
          <input type="number" className="form-control" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} min="0.01" step="0.01" placeholder="0.00" required />
        </div>
      </div>

      {/* Payment Fields */}
      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>💳 بيانات الدفع</h3>

        <div className="form-group">
          <label className="form-label">المبلغ المدفوع (ج.م)</label>
          <input type="number" className="form-control" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} min="0" step="0.01" placeholder="0.00" />
        </div>

        {isPartiallyOrFullyPaid && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">دفع بواسطة</label>
              <select className="form-control" value={paidById} onChange={e => setPaidById(e.target.value)}>
                <option value="">— اختر —</option>
                {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">تاريخ الدفع</label>
              <input type="date" className="form-control" value={paidAt} onChange={e => setPaidAt(e.target.value)} />
            </div>
          </div>
        )}
      </div>



      {/* Existing Images (edit mode) */}
      {purchase?.images && purchase.images.length > 0 && (
        <div className="form-group">
          <label className="form-label">الصور الحالية</label>
          <div className="image-grid">
            {purchase.images.map(img => (
              <img key={img.id} src={img.imageUrl} alt="صورة" className="thumb" />
            ))}
          </div>
        </div>
      )}

      <div className="modal-footer" style={{ border: 'none', padding: 0, justifyContent: 'flex-start', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
          disabled={saving}
        >
          إلغاء
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner" /> جارٍ الحفظ...</> : (purchase ? 'حفظ التغييرات' : 'إضافة الشراء')}
        </button>
      </div>
    </form>
  );
}
