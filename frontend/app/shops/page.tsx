'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, Shop } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import ConfirmDialog from '@/components/ConfirmDialog';
import BottomSheet from '@/components/ui/BottomSheet';
import { SkeletonList } from '@/components/ui/Skeleton';

/* ── Shop Form ── */
interface ShopFormProps {
  initial?: Shop;
  onSave: (data: { name: string; phone?: string; notes?: string }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function ShopForm({ initial, onSave, onCancel, loading }: ShopFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('اسم المحل مطلوب');
    setError('');
    await onSave({
      name: name.trim(),
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="shop-name">اسم المحل *</label>
        <input
          id="shop-name"
          className="form-control"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="مثال: محل الأمانة"
          autoFocus
          autoComplete="organization"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="shop-phone">رقم الهاتف</label>
        <input
          id="shop-phone"
          className="form-control"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="01xxxxxxxxx"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="shop-notes">ملاحظات</label>
        <textarea
          id="shop-notes"
          className="form-control"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="أي ملاحظات إضافية..."
          style={{ resize: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
          style={{ flex: 1 }}
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ flex: 2 }}
        >
          {loading
            ? <><span className="spinner spinner-sm" /> جارٍ الحفظ...</>
            : (initial ? 'حفظ التغييرات' : 'إضافة المحل')}
        </button>
      </div>
    </form>
  );
}

/* ── Shop Card ── */
function ShopCard({ shop, onEdit, onDelete }: {
  shop: Shop;
  onEdit: (s: Shop) => void;
  onDelete: (s: Shop) => void;
}) {
  return (
    <div className="list-card" style={{ marginBottom: '0.75rem', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Icon */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem',
          flexShrink: 0,
        }} aria-hidden="true">
          🏪
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={`/shops/${shop.id}`}
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {shop.name}
          </Link>
          {shop.phone && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 500 }}>
              📞 {shop.phone}
            </p>
          )}
          {shop.notes && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '0.2rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {shop.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          <button
            className="btn-icon"
            title="تعديل"
            onClick={() => onEdit(shop)}
            aria-label={`تعديل ${shop.name}`}
          >
            ✏️
          </button>
          <button
            className="btn-icon"
            title="حذف"
            onClick={() => onDelete(shop)}
            style={{ color: 'var(--danger)' }}
            aria-label={`حذف ${shop.name}`}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* View link */}
      <Link
        href={`/shops/${shop.id}`}
        className="btn btn-secondary btn-sm"
        style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
      >
        عرض الفواتير ←
      </Link>
    </div>
  );
}

/* ── Main Page ── */
function ShopsContent() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | 'create' | Shop>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Auto-open create sheet if ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      const timer = window.setTimeout(() => {
        setModal('create');
        router.replace('/shops');
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [searchParams, router]);

  useEffect(() => {
    api.shops
      .list()
      .then(setShops)
      .catch(() => setError('تعذّر تحميل المحلات'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(data: Partial<Shop>) {
    setSaving(true);
    try {
      if (modal && modal !== 'create') {
        const updated = await api.shops.update((modal as Shop).id, data);
        setShops(shops.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await api.shops.create(data);
        setShops([created, ...shops]);
      }
      setModal(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'تعذّر حفظ المحل'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.shops.delete(deleteTarget.id);
      setShops(shops.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'تعذّر حذف المحل'));
    } finally {
      setDeleting(false);
    }
  }

  const filtered = shops.filter(s =>
    !search.trim() ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  return (
    <div>
      {/* Desktop header */}
      <div className="page-header desktop-only">
        <h1 className="page-title">🏪 المحلات</h1>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          ➕ إضافة محل
        </button>
      </div>

      {/* Mobile title */}
      <h1 className="page-title mobile-only" style={{ marginBottom: '1rem' }}>
        المحلات
      </h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search */}
      <div className="search-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          className="search-input"
          type="search"
          placeholder="ابحث باسم المحل أو الهاتف..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="البحث في المحلات"
        />
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-icon">🏪</span>
            <p className="empty-title">
              {search ? 'لا توجد نتائج' : 'لا توجد محلات بعد'}
            </p>
            <p className="empty-desc">
              {search ? 'جرب كلمة بحث أخرى' : 'أضف أول محل لتبدأ تتبع مشترياتك'}
            </p>
            {!search && (
              <button className="btn btn-primary" onClick={() => setModal('create')}>
                ➕ إضافة محل
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
            {filtered.length} محل{filtered.length !== shops.length ? ` من ${shops.length}` : ''}
          </p>
          {filtered.map(shop => (
            <ShopCard
              key={shop.id}
              shop={shop}
              onEdit={setModal}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Bottom Sheet */}
      <BottomSheet
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'إضافة محل جديد' : 'تعديل المحل'}
      >
        <ShopForm
          initial={modal !== 'create' ? (modal as Shop) : undefined}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      </BottomSheet>

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmDialog
          title="حذف المحل"
          message={`هل أنت متأكد من حذف "${deleteTarget.name}"؟ سيتم حذف جميع الفواتير المرتبطة به.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default function ShopsPage() {
  return (
    <Suspense fallback={<div className="loading-center"><span className="spinner" /></div>}>
      <ShopsContent />
    </Suspense>
  );
}
