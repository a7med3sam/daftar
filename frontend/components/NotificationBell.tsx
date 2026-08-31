'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, AppNotification } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (full = false) => {
    setLoading(true);
    try {
      const list = await api.notifications.list(20);
      setItems(list);
      const { count } = await api.notifications.unreadCount();
      setUnread(count);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      if (full) setOpen(true);
    }
  }, []);

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (open) {
        setOpen(false);
        return;
      }
      load(true);
    },
    [open, load],
  );

  const markAllRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="notif-bell-wrap" ref={listRef}>
      <button
        type="button"
        className="notif-bell"
        onClick={toggle}
        aria-label="الإشعارات"
        aria-expanded={open}
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-head">
            <span style={{ fontWeight: 700 }}>الإشعارات</span>
            {unread > 0 && (
              <button type="button" className="notif-read-all" onClick={markAllRead}>
                تعليم الكل كمقروء
              </button>
            )}
          </div>
          <div className="notif-dropdown-body">
            {loading && !items.length ? (
              <div className="notif-empty">جارٍ التحميل…</div>
            ) : items.length === 0 ? (
              <div className="notif-empty">لا توجد إشعارات</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notif-item ${!n.readAt ? 'unread' : ''}`}
                  onClick={() => {
                    if (!n.readAt) api.notifications.markRead(n.id).catch(() => {});
                    setOpen(false);
                    if (n.entityType && n.entityId) {
                      router.push(entityPath(n));
                    }
                  }}
                >
                  <span className="notif-item-title">{n.title}</span>
                  <span className="notif-item-msg">{n.message}</span>
                  <span className="notif-item-time">{formatRelativeTime(n.createdAt)}</span>
                </button>
              ))
            )}
          </div>
          <Link href="/notifications" className="notif-dropdown-foot" onClick={() => setOpen(false)}>
            عرض كل الإشعارات
          </Link>
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
