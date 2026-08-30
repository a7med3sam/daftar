'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, Buyer } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import BottomSheet from '@/components/ui/BottomSheet';
import { SkeletonList } from '@/components/ui/Skeleton';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | 'create' | Buyer>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Buyer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Auto-open create sheet if ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openCreate();
      router.replace('/buyers');
    }
  }, [searchParams, router]);

  useEffect(() => {
    api.buyers
      .list()
      .then(setBuyers)
      .catch(() => setError('تعذّر تحميل المشترين'))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setName('');
    setFormError('');
    setModal('create');
  }

  function openEdit(buyer: Buyer) {
    setName(buyer.name);
    setFormError('');
    setModal(buyer);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setFormError('الاسم مطلوب');
    setSaving(true);
    setFormError('');
    try {
      if (modal && modal !== 'create') {
        const updated = await api.buyers.update((modal as Buyer).id, { name: name.trim() });
        setBuyers(buyers.map(b => b.id === updated.id ? updated : b));
      } else {
        const created = await api.buyers.create({ name: name.trim() });
        setBuyers([...buyers, created].sort((a, b) => a.name.localeCompare(b.name, 'ar')));
      }
      setModal(null);
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.buyers.delete(deleteTarget.id);
      setBuyers(buyers.filter(b => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = buyers.filter(b =>
    !search.trim() || b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Desktop header */}
      <div className="page-header desktop-only">
        <h1 className="page-title">👥 المشترون</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          ➕ إضافة مشترٍ
        </button>
      </div>

      {/* Mobile title */}
      <h1 className="page-title mobile-only" style={{ marginBottom: '1rem' }}>
        المشترون
      </h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search */}
      <div className="search-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          className="search-input"
          type="search"
          placeholder="ابحث باسم المشتري..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="البحث في المشترين"
        />
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <p className="empty-title">
              {search ? 'لا توجد نتائج' : 'لا يوجد مشترون بعد'}
            </p>
            <p className="empty-desc">
              {search ? 'جرب كلمة بحث أخرى' : 'أضف أسماء المشترين لتتبع من يدفع'}
            </p>
            {!search && (
              <button className="btn btn-primary" onClick={openCreate}>
                ➕ إضافة مشترٍ
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
            {filtered.length} مشترٍ{filtered.length !== buyers.length ? ` من ${buyers.length}` : ''}
          </p>
          {filtered.map(buyer => (
            <div
              key={buyer.id}
              className="list-card"
              style={{ marginBottom: '0.6rem', cursor: 'default' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                {/* Avatar */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  letterSpacing: '-0.02em',
                }} aria-hidden="true">
                  {buyer.name.charAt(0)}
                </div>

                {/* Name */}
                <span style={{
                  flex: 1,
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                }}>
                  {buyer.name}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn-icon"
                    onClick={() => openEdit(buyer)}
                    aria-label={`تعديل ${buyer.name}`}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => setDeleteTarget(buyer)}
                    style={{ color: 'var(--danger)' }}
                    aria-label={`حذف ${buyer.name}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Bottom Sheet */}
      <BottomSheet
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'إضافة مشترٍ جديد' : 'تعديل الاسم'}
      >
        <form onSubmit={handleSave} noValidate>
          {formError && <div className="alert alert-error">{formError}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="buyer-name">الاسم *</label>
            <input
              id="buyer-name"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="اسم المشتري"
              autoFocus
              autoComplete="name"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal(null)}
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
                : (modal === 'create' ? 'إضافة' : 'حفظ التغييرات')}
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmDialog
          title="حذف المشتري"
          message={`هل أنت متأكد من حذف "${deleteTarget.name}"؟`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
