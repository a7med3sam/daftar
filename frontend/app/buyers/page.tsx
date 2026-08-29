'use client';

import { useEffect, useState } from 'react';
import { api, Buyer } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<null | 'create' | Buyer>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Buyer | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.buyers.list()
      .then(setBuyers)
      .catch(() => setError('تعذّر تحميل المشترين'))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setName('');
    setModal('create');
    setError('');
  }

  function openEdit(buyer: Buyer) {
    setName(buyer.name);
    setModal(buyer);
    setError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('الاسم مطلوب');
    setSaving(true);
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
      setError(e.message);
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">المشترون</h1>
        <button className="btn btn-primary" onClick={openCreate}>➕ إضافة مشترٍ</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-center"><span className="spinner" /></div>
      ) : buyers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>لا يوجد مشترون بعد</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((buyer, i) => (
                <tr key={buyer.id}>
                  <td style={{ color: 'var(--text-muted)', width: 50 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{buyer.name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => openEdit(buyer)}>✏️</button>
                      <button className="btn-icon" onClick={() => setDeleteTarget(buyer)} style={{ color: 'var(--danger)' }}>🗑️</button>
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
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? 'إضافة مشترٍ' : 'تعديل الاسم'}</h2>
              <button className="btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">الاسم *</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="اسم المشتري"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : (modal === 'create' ? 'إضافة' : 'حفظ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
