'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, AuditLog } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { SkeletonList } from '@/components/ui/Skeleton';

export default function ActivityPage() {
  const [items, setItems] = useState<AuditLog[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.auditLogs
      .list(300)
      .then(setItems)
      .catch(() => setError('تعذّر تحميل سجل النشاط'))
      .finally(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>سجل النشاط</h1>

      {!items && !error && <SkeletonList count={8} />}

      {error && (
        <div className="empty-state">
          <span className="empty-icon">😕</span>
          <p className="empty-title">{error}</p>
          <button className="btn btn-primary" onClick={load}>أعد المحاولة</button>
        </div>
      )}

      {items && items.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📜</span>
          <p className="empty-title">لا يوجد نشاط بعد</p>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="card">
          <ul className="audit-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((log) => (
              <li key={log.id} className="audit-item">
                <div className="audit-item-main">
                  <span className="audit-item-icon" aria-hidden="true">{actionIcon(log.action)}</span>
                  <div style={{ minWidth: 0 }}>
                    <p className="audit-item-title">{actionLabel(log)}</p>
                    {log.entityName && <p className="audit-item-sub">{log.entityName}</p>}
                  </div>
                </div>
                <div className="audit-item-meta">
                  {log.amount != null && (
                    <span className="audit-item-amount">{formatCurrency(log.amount)}</span>
                  )}
                  <span className="audit-item-time">
                    {formatDate(log.createdAt)} · {timeOfDay(log.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function timeOfDay(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function actionIcon(action: string): string {
  if (action === 'purchase.payment') return '💵';
  if (action.includes('.created')) return '➕';
  if (action.includes('.updated')) return '✏️';
  if (action.includes('.deleted')) return '🗑️';
  return '📋';
}

function actionLabel(log: AuditLog): string {
  const actor = log.userName ? log.userName : 'النظام';
  const entity = log.entityName ? log.entityName : entityLabel(log.action);
  switch (log.action) {
    case 'shop.created': return `${actor} أضاف محل ${entity}`;
    case 'shop.updated': return `${actor} عدّل محل ${entity}`;
    case 'shop.deleted': return `${actor} حذف محل ${entity}`;
    case 'buyer.created': return `${actor} أضاف مشتري ${entity}`;
    case 'buyer.updated': return `${actor} عدّل مشتري ${entity}`;
    case 'buyer.deleted': return `${actor} حذف مشتري ${entity}`;
    case 'purchase.created': return `${actor} أضاف فاتورة من ${entity}`;
    case 'purchase.updated': return `${actor} عدّل فاتورة من ${entity}`;
    case 'purchase.payment': return `${actor} سدّد دفعة على فاتورة ${entity}`;
    case 'purchase.deleted': return `${actor} حذف فاتورة من ${entity}`;
    default: return `${actor} ${entity}`;
  }
}

function entityLabel(action: string): string {
  if (action.startsWith('shop')) return 'محل';
  if (action.startsWith('buyer')) return 'مشتري';
  if (action.startsWith('purchase')) return 'فاتورة';
  return 'عملية';
}
