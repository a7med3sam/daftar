'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Shop } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

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
    await onSave({ name: name.trim(), phone: phone.trim() || undefined, notes: notes.trim() || undefined });
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label className="form-label">اسم المحل *</label>
        <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: محل الأمانة" />
      </div>
      <div className="form-group">
        <label className="form-label">رقم الهاتف</label>
        <input className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01xxxxxxxxx" />
      </div>
      <div className="form-group">
        <label className="form-label">ملاحظات</label>
        <textarea className="form-control" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="أي ملاحظات إضافية..." />
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>إلغاء</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : (initial ? 'حفظ التغييرات' : 'إضافة المحل')}
        </button>
      </div>
    </form>
  );
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<null | 'create' | Shop>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    try {
      const data = await api.shops.list();
      setShops(data);
    } catch {
      setError('تعذّر تحميل المحلات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

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
    } catch (e: any) {
      setError(e.message);
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">المحلات</h1>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          ➕ إضافة محل
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-center"><span className="spinner" /></div>
      ) : shops.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <p>لا توجد محلات بعد. أضف أول محل!</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>اسم المحل</th>
                <th>الهاتف</th>
                <th>ملاحظات</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {shops.map(shop => (
                <tr key={shop.id}>
                  <td>
                    <Link href={`/shops/${shop.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                      {shop.name}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{shop.phone || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{shop.notes || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" title="تعديل" onClick={() => setModal(shop)}>✏️</button>
                      <button className="btn-icon" title="حذف" onClick={() => setDeleteTarget(shop)} style={{ color: 'var(--danger)' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? 'إضافة محل جديد' : 'تعديل المحل'}</h2>
              <button className="btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <ShopForm
              initial={modal !== 'create' ? (modal as Shop) : undefined}
              onSave={handleSave}
              onCancel={() => setModal(null)}
              loading={saving}
            />
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="حذف المحل"
          message={`هل أنت متأكد من حذف "${deleteTarget.name}"؟ سيتم حذف جميع المشتريات المرتبطة به.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
