'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Shop, Buyer, Purchase, CreatePurchasePayload } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import MobilePicker from '@/components/ui/MobilePicker';

interface Props {
  purchase?: Purchase;
}

// ── Collapsible Section ───────────────────────────────────────
function CollapsibleSection({
  title,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        background: 'var(--bg-card)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '0.9rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {title}
          {badge && (
            <span
              style={{
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-full)',
                padding: '0.1rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {badge}
            </span>
          )}
        </span>
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Product Item ──────────────────────────────────────────────
interface ProductItem {
  name: string;
  price: string;
}

// ── Main Form ─────────────────────────────────────────────────
export default function PurchaseForm({ purchase }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialShopId = searchParams.get('shopId');
  const { toasts, showToast, removeToast } = useToast();

  const [shops, setShops] = useState<Shop[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([{ name: '', price: '' }]);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const isPartiallyOrFullyPaid = Number(paidAmount) > 0;

  useEffect(() => {
    Promise.all([api.shops.list(), api.buyers.list()])
      .then(([s, b]) => { setShops(s); setBuyers(b); })
      .catch(() => showToast('تعذّر تحميل البيانات', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  function addProduct() {
    setProducts((prev) => [...prev, { name: '', price: '' }]);
  }

  function removeProduct(i: number) {
    setProducts((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateProduct(i: number, field: keyof ProductItem, val: string) {
    setProducts((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }

  const filledProducts = products.filter((p) => p.name.trim() || p.price.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!shopId)       return showToast('يرجى اختيار المحل', 'error');
    if (!buyerId)      return showToast('يرجى اختيار المشتري', 'error');
    if (!purchaseDate) return showToast('يرجى تحديد تاريخ الشراء', 'error');
    if (!totalAmount)  return showToast('يرجى إدخال المبلغ الإجمالي', 'error');

    const total = Number(totalAmount);
    const paid  = Number(paidAmount);

    if (total <= 0)    return showToast('المبلغ يجب أن يكون أكبر من صفر', 'error');
    if (paid > total)  return showToast('المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي', 'error');

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
        description: description.trim() ? description.trim() : undefined,
        items: filledProducts.map(p => ({
          name: p.name,
          price: Number(p.price) || 0,
        })),
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

      showToast(purchase ? 'تم تحديث الفاتورة بنجاح ✅' : 'تمت إضافة الفاتورة بنجاح ✅', 'success');

      setTimeout(() => {
        router.push(`/shops/${shopId}`);
      }, 800);
    } catch (e: unknown) {
      showToast(getErrorMessage(e, 'حدث خطأ أثناء الحفظ'), 'error');
      setSaving(false);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="loading-center">
        <span className="spinner" />
      </div>
    );
  }

  const shopOptions = shops.map((s) => ({ value: s.id.toString(), label: s.name }));
  const buyerOptions = buyers.map((b) => ({ value: b.id.toString(), label: b.name, imageUrl: b.imageUrl }));

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Row 1: Shop + Buyer ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <MobilePicker
            id="pf-shop"
            label="المحل"
            value={shopId}
            onChange={setShopId}
            options={shopOptions}
            placeholder="اختر المحل"
            required
          />
          <MobilePicker
            id="pf-buyer"
            label="المشتري"
            value={buyerId}
            onChange={setBuyerId}
            options={buyerOptions}
            placeholder="اختر المشتري"
            required
          />
        </div>

        {/* ── Row 2: Total + Paid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="pf-amount">الإجمالي (ج.م) *</label>
            <input
              id="pf-amount"
              type="text"
              inputMode="decimal"
              className="form-control"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              required
              style={{ fontSize: '1rem', fontWeight: 600 }}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="pf-paid">المدفوع (ج.م)</label>
            <input
              id="pf-paid"
              type="text"
              inputMode="decimal"
              className="form-control"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Quick paid amounts */}
        {totalAmount && Number(totalAmount) > 0 && (
          <div className="quick-amounts" style={{ marginBottom: '0.75rem' }}>
            {[0, 50, 100, 200].map((val) => (
              <button
                key={val}
                type="button"
                className={`quick-amount-btn ${Number(paidAmount) === val ? 'active' : ''}`}
                onClick={() => setPaidAmount(val.toString())}
              >
                {val === 0 ? 'صفر' : val}
              </button>
            ))}
            <button
              type="button"
              className={`quick-amount-btn ${paidAmount === totalAmount ? 'active' : ''}`}
              onClick={() => setPaidAmount(totalAmount)}
            >
              الكل
            </button>
          </div>
        )}

        {/* ── Date ── */}
        <div className="form-group">
          <label className="form-label" htmlFor="pf-date">تاريخ الشراء *</label>
          <input
            id="pf-date"
            type="date"
            className="form-control"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </div>

        {/* ── Payment info (if paid) ── */}
        {isPartiallyOrFullyPaid && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <MobilePicker
              id="pf-paidby"
              label="دفع بواسطة"
              value={paidById}
              onChange={setPaidById}
              options={buyerOptions}
              placeholder="اختر"
            />
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="pf-paidat">تاريخ الدفع</label>
              <input
                id="pf-paidat"
                type="date"
                className="form-control"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Collapsible: Description ── */}
        <CollapsibleSection title="📝 وصف الفاتورة" badge="اختياري">
          <div style={{ paddingTop: '0.75rem' }}>
            <textarea
              className="form-control"
              rows={3}
              placeholder="أضف ملاحظات أو وصفاً للفاتورة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical', fontSize: '0.95rem' }}
            />
          </div>
        </CollapsibleSection>

        {/* ── Collapsible: Products ── */}
        <CollapsibleSection
          title="📦 تفاصيل المنتجات"
          badge={filledProducts.length > 0 ? `${filledProducts.length}` : 'اختياري'}
        >
          <div style={{ paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {products.map((prod, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="اسم المنتج"
                  value={prod.name}
                  onChange={(e) => updateProduct(i, 'name', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  className="form-control"
                  placeholder="السعر"
                  value={prod.price}
                  onChange={(e) => updateProduct(i, 'price', e.target.value)}
                  style={{ flex: 1 }}
                />
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProduct(i)}
                    style={{
                      background: 'var(--danger-light)',
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--danger)',
                      flexShrink: 0,
                      fontSize: '1rem',
                    }}
                    aria-label="حذف المنتج"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addProduct}
              style={{
                background: 'var(--accent-light)',
                border: '1.5px dashed var(--accent)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.6rem',
                cursor: 'pointer',
                color: 'var(--accent)',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: '0.85rem',
                width: '100%',
                marginTop: '0.25rem',
              }}
            >
              ＋ إضافة منتج
            </button>
          </div>
        </CollapsibleSection>

        {/* ── Images ── */}
        <CollapsibleSection title="📷 صور المنتجات" badge="اختياري">
          <div style={{ paddingTop: '0.75rem' }}>
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
              onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            />

            {files.length > 0 && (
              <div className="image-preview-grid">
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

            {purchase?.images && purchase.images.length > 0 && (
              <div className="form-group">
                <label className="form-label">الصور الحالية</label>
                <div className="image-grid">
                  {purchase.images.map((img) => (
                    <img key={img.id} src={img.imageUrl} alt="صورة" className="thumb" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
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
    </>
  );
}
