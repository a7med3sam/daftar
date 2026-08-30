'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, Buyer } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import BottomSheet from '@/components/ui/BottomSheet';
import { SkeletonList } from '@/components/ui/Skeleton';

function BuyersContent() {
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
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarActionsTarget, setAvatarActionsTarget] = useState<Buyer | null>(null);
  const [viewImageTarget, setViewImageTarget] = useState<Buyer | null>(null);

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
    setSelectedFile(null);
    setModal('create');
  }

  function openEdit(buyer: Buyer) {
    setName(buyer.name);
    setFormError('');
    setSelectedFile(null);
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
        let finalImageUrl = updated.imageUrl;
        if (selectedFile) {
          const { imageUrl } = await api.buyers.uploadImage(updated.id, selectedFile);
          finalImageUrl = imageUrl;
        }
        setBuyers(buyers.map(b => b.id === updated.id ? { ...updated, imageUrl: finalImageUrl } : b));
      } else {
        const created = await api.buyers.create({ name: name.trim() });
        let finalImageUrl = created.imageUrl;
        if (selectedFile) {
          const { imageUrl } = await api.buyers.uploadImage(created.id, selectedFile);
          finalImageUrl = imageUrl;
        }
        setBuyers([...buyers, { ...created, imageUrl: finalImageUrl }].sort((a, b) => a.name.localeCompare(b.name, 'ar')));
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

  async function handleImageUpload(buyer: Buyer, file: File) {
    setUploadingId(buyer.id);
    setAvatarActionsTarget(null);
    try {
      const { imageUrl } = await api.buyers.uploadImage(buyer.id, file);
      setBuyers(buyers.map(b => b.id === buyer.id ? { ...b, imageUrl } : b));
    } catch (e: any) {
      setError(e.message || 'فشل رفع الصورة');
    } finally {
      setUploadingId(null);
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
              {/* Avatar — shows real photo only */}
              {buyer.imageUrl && (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    border: '2px solid var(--border)',
                    position: 'relative',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAvatarActionsTarget(buyer)}
                    title="خيارات الصورة"
                    aria-label={`خيارات صورة ${buyer.name}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 0,
                      padding: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {uploadingId === buyer.id ? (
                      <span className="spinner spinner-sm" />
                    ) : (
                      <img src={buyer.imageUrl} alt={buyer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </button>
                  <input
                    id={`avatar-upload-${buyer.id}`}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(buyer, file);
                      e.target.value = '';
                    }}
                  />
                </div>
              )}

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
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <label
              htmlFor="new-buyer-image"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '2px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                color: 'var(--text-muted)',
              }}
            >
              {selectedFile ? (
                <img src={URL.createObjectURL(selectedFile)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (modal !== 'create' && (modal as Buyer)?.imageUrl) ? (
                <img src={(modal as Buyer).imageUrl!} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '1.5rem' }}>📷</span>
              )}
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>صورة المشتري (اختياري)</span>
            <input
              id="new-buyer-image"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
                e.target.value = '';
              }}
            />
          </div>
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

      <BottomSheet
        isOpen={!!avatarActionsTarget}
        onClose={() => setAvatarActionsTarget(null)}
        title="صورة المشتري"
      >
        {avatarActionsTarget && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setViewImageTarget(avatarActionsTarget);
                setAvatarActionsTarget(null);
              }}
            >
              عرض الصورة
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                document.getElementById(`avatar-upload-${avatarActionsTarget.id}`)?.click();
              }}
              disabled={uploadingId === avatarActionsTarget.id}
            >
              {uploadingId === avatarActionsTarget.id
                ? <><span className="spinner spinner-sm" /> جارٍ الرفع...</>
                : 'تغيير الصورة'}
            </button>
          </div>
        )}
      </BottomSheet>

      {viewImageTarget?.imageUrl && (
        <div
          onClick={() => setViewImageTarget(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewImageTarget(null);
            }}
            aria-label="إغلاق"
            style={{
              ...lbCloseStyle,
              position: 'fixed',
              top: 'calc(1rem + env(safe-area-inset-top))',
              left: '1rem',
            }}
          >
            ✕
          </button>
          <img
            src={viewImageTarget.imageUrl}
            alt={viewImageTarget.name}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '94vw', maxHeight: '82dvh', objectFit: 'contain', borderRadius: 12 }}
          />
        </div>
      )}

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

const lbCloseStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: 0,
  background: 'rgba(255,255,255,0.14)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export default function BuyersPage() {
  return (
    <Suspense fallback={<div className="loading-center"><span className="spinner" /></div>}>
      <BuyersContent />
    </Suspense>
  );
}
