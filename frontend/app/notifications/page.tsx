'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, AppNotification } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { SkeletonList } from '@/components/ui/Skeleton';

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.notifications
      .list(100)
      .then(setItems)
      .catch(() => setError('تعذّر تحميل الإشعارات'))
      .finally(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNotification = (n: AppNotification) => {
    if (!n.readAt) api.notifications.markRead(n.id).catch(() => {});
    if (n.entityId) {
      router.push(entityPath(n));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>الإشعارات</h1>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={async () => {
            await api.notifications.markAllRead().catch(() => {});
            load();
          }}
        >
          تعليم الكل كمقروء
        </button>
      </div>

      {!items && !error && <SkeletonList count={6} />}

      {error && (
        <div className="empty-state">
          <span className="empty-icon">😕</span>
          <p className="empty-title">{error}</p>
          <button className="btn btn-primary" onClick={load}>أعد المحاولة</button>
        </div>
      )}

      {items && items.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔕</span>
          <p className="empty-title">لا توجد إشعارات</p>
          <p className="empty-desc">ستظهر هنا إشعارات نشاط أفراد عائلتك</p>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="card">
          <div className="notif-list">
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`notif-item large ${!n.readAt ? 'unread' : ''}`}
                onClick={() => openNotification(n)}
              >
                <span className="notif-item-title">{n.title}</span>
                <span className="notif-item-msg">{n.message}</span>
                <span className="notif-item-time">{formatRelativeTime(n.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function entityPath(n: AppNotification): string {
  switch (n.entityType) {
    case 'shop':
      return `/shops/${n.entityId}`;
    case 'buyer':
      return `/buyers`;
    case 'purchase':
      return `/purchases/${n.entityId}`;
    default:
      return '/';
  }
}
