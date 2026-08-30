'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Shop, Buyer, Purchase, CreatePurchasePayload } from '@/lib/api';

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

    if (!shopId)       return setError('يرجى اختيار المحل');
    if (!buyerId)      return setError('يرجى اختيار المشتري');
    if (!purchaseDate) return setError('يرجى تحديد تاريخ الشراء');
    if (!totalAmount)  return setError('يرجى إدخال المبلغ الإجمالي');

    const total = Number(totalAmount);
    const paid  = Number(paidAmount);

    if (total <= 0) return setError('المبلغ يجب أن يكون أكبر من صفر');
    if (paid > total) return setError('المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي');

    setSaving(true);
    try {
      const payload: CreatePurchasePayload = {
        shopId: Number(shopId),
        buyerId: Number(buyerId),
        purchaseDate,
        totalAmount: total,
        paidAmount: paid,
        paidById: isPartiallyOrFullyPaid && paidById ? Number(paidById) : undefined,
        paidAt:   isPartiallyOrFullyPaid && paidAt  ? paidAt            : undefined,
      };

      let saved: Purchase;
      if (purchase) {
        saved = await api.purchases.update(purchase.id, payload);
      } else {
        saved = await api.purchases.create(payload);
      }

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

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="loading-center">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Step 1: Shop & Buyer ── */}
      <p className="section-label" style={{ marginTop: 0 }}>بيانات الشراء</p>

      <div className="form-group">
        <label className="form-label" htmlFor="pf-shop">المحل *</label>
        <select
          id="pf-shop"
          className="form-control"
          value={shopId}
          onChange={e => setShopId(e.target.value)}
          required
        >
          <option value="">— اختر المحل —</option>
          {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pf-buyer">المشتري *</label>
        <select
          id="pf-buyer"
          className="form-control"
          value={buyerId}
          onChange={e => setBuyerId(e.target.value)}
          required
        >
          <option value="">— اختر المشتري —</option>
          {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* ── Step 2: Amount & Date ── */}
      <div className="form-group">
        <label className="form-label" htmlFor="pf-amount">المبلغ الإجمالي (ج.م) *</label>
        <input
          id="pf-amount"
          type="text"
          inputMode="decimal"
          className="form-control"
          value={totalAmount}
          onChange={e => setTotalAmount(e.target.value)}
          placeholder="0.00"
          required
          style={{ fontSize: '1.1rem', fontWeight: 600 }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pf-date">تاريخ الشراء *</label>
        <input
          id="pf-date"
          type="date"
          className="form-control"
          value={purchaseDate}
          onChange={e => setPurchaseDate(e.target.value)}
          required
        />
      </div>

      {/* ── Step 3: Payment info ── */}
      <p className="section-label">بيانات الدفع</p>

      <div className="form-group">
        <label className="form-label" htmlFor="pf-paid">المبلغ المدفوع (ج.م)</label>
        <input
          id="pf-paid"
          type="text"
          inputMode="decimal"
          className="form-control"
          value={paidAmount}
          onChange={e => setPaidAmount(e.target.value)}
          placeholder="0.00"
        />

        {/* Quick amounts */}
        {totalAmount && Number(totalAmount) > 0 && (
          <div className="quick-amounts">
            {[0, 50, 100, 200].map(val => {
              const label = val === 0 ? 'صفر' : `${val}`;
              return (
                <button
                  key={val}
                  type="button"
                  className={`quick-amount-btn ${Number(paidAmount) === val ? 'active' : ''}`}
                  onClick={() => setPaidAmount(val.toString())}
                >
                  {label}
                </button>
              );
            })}
            <button
              type="button"
              className={`quick-amount-btn ${paidAmount === totalAmount ? 'active' : ''}`}
              onClick={() => setPaidAmount(totalAmount)}
            >
              الكل
            </button>
          </div>
        )}
      </div>

      {isPartiallyOrFullyPaid && (
        <>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-paidby">دفع بواسطة</label>
            <select
              id="pf-paidby"
              className="form-control"
              value={paidById}
              onChange={e => setPaidById(e.target.value)}
            >
              <option value="">— اختر —</option>
              {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pf-paidat">تاريخ الدفع</label>
            <input
              id="pf-paidat"
              type="date"
              className="form-control"
              value={paidAt}
              onChange={e => setPaidAt(e.target.value)}
            />
          </div>
        </>
      )}

      {/* ── Step 4: Images ── */}
      <p className="section-label">صور المنتجات (اختياري)</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <button
          type="button"
          className="upload-zone"
          onClick={() => cameraRef.current?.click()}
          aria-label="التقاط صورة بالكاميرا"
        >
          <span className="upload-zone-icon">📷</span>
          <span>الكاميرا</span>
        </button>
        <button
          type="button"
          className="upload-zone"
          onClick={() => fileRef.current?.click()}
          aria-label="اختيار صورة من المعرض"
        >
          <span className="upload-zone-icon">🖼️</span>
          <span>المعرض</span>
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
        <div className="image-preview-grid" style={{ marginBottom: '1rem' }}>
          {files.map((file, i) => (
            <div key={i} className="image-preview-item">
              <img src={URL.createObjectURL(file)} alt="معاينة" />
              <button
                type="button"
                className="image-remove-btn"
                onClick={() => removeFile(i)}
                aria-label="حذف الصورة"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Existing images (edit mode) */}
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

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
          disabled={saving}
          style={{ flex: 1 }}
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
          style={{ flex: 2 }}
        >
          {saving
            ? <><span className="spinner spinner-sm" /> جارٍ الحفظ...</>
            : (purchase ? 'حفظ التغييرات' : '✅ إضافة الفاتورة')}
        </button>
      </div>
    </form>
  );
}
