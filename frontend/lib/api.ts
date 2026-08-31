const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ── Token refresh (single-flight) ──────────────────────────────
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();
  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  skipRefresh?: boolean;
}

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  let res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
    ...options,
  });

  // On 401, try to refresh once and retry (unless explicitly skipped)
  if (
    res.status === 401 &&
    !options?.skipRefresh &&
    !path.startsWith('/auth/refresh') &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/register')
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        credentials: 'include',
        ...options,
      });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'خطأ في الخادم' }));
    throw new Error(error.message || 'خطأ في الخادم');
  }

  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  familyGroup: string;
  createdAt: string;
}

// ─── Shops ────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (data: { name: string; password: string }) =>
      request<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        skipRefresh: true,
      }),
    login: (data: { name: string; password: string }) =>
      request<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        skipRefresh: true,
      }),
    logout: () =>
      request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
        skipRefresh: true,
      }),
    me: () => request<User>('/auth/me', { skipRefresh: false }),
  },

  shops: {
    list: () => request<Shop[]>('/shops'),
    get: (id: number) => request<ShopWithStats>(`/shops/${id}`),
    create: (data: Partial<Shop>) =>
      request<Shop>('/shops', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Shop>) =>
      request<Shop>(`/shops/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/shops/${id}`, { method: 'DELETE' }),
  },

  buyers: {
    list: () => request<Buyer[]>('/buyers'),
    create: (data: { name: string }) =>
      request<Buyer>('/buyers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { name: string }) =>
      request<Buyer>(`/buyers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    uploadImage: (id: number, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${BASE_URL}/buyers/${id}/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({ message: 'خطأ في الخادم' }));
          throw new Error(e.message || 'خطأ في الخادم');
        }
        return r.json() as Promise<{ imageUrl: string }>;
      });
    },
    delete: (id: number) =>
      request<void>(`/buyers/${id}`, { method: 'DELETE' }),
  },

  purchases: {
    list: () => request<Purchase[]>('/purchases'),
    get: (id: number) => request<Purchase>(`/purchases/${id}`),
    create: (data: CreatePurchasePayload) =>
      request<Purchase>('/purchases', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<CreatePurchasePayload>) =>
      request<Purchase>(`/purchases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/purchases/${id}`, { method: 'DELETE' }),
    uploadImages: (id: number, files: File[], isReceipt = false) => {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      return fetch(`${BASE_URL}/purchases/${id}/images?isReceipt=${isReceipt}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({ message: 'خطأ في الخادم' }));
          throw new Error(e.message || 'خطأ في الخادم');
        }
        return r.json();
      });
    },
    deleteImage: (imageId: number) =>
      request<void>(`/purchases/images/${imageId}`, { method: 'DELETE' }),
  },

  dashboard: {
    get: () => request<DashboardStats>('/dashboard'),
  },

  notifications: {
    list: (limit = 50) =>
      request<AppNotification[]>(`/notifications?limit=${limit}`),
    unreadCount: () => request<{ count: number }>('/notifications/unread-count'),
    markRead: (id: number) =>
      request<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      request<{ count: number }>('/notifications/read-all', {
        method: 'PATCH',
      }),
  },

  auditLogs: {
    list: (limit = 200) =>
      request<AuditLog[]>(`/audit-logs?limit=${limit}`),
  },

  push: {
    getPublicKey: () =>
      request<{ publicKey: string }>('/push/vapid-public-key'),
    subscribe: (data: {
      endpoint: string;
      keysAuth: string;
      keysP256dh: string;
      userAgent?: string;
    }) =>
      request('/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

// ─── Types ──────────────────────────────────────────────────────
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface Shop {
  id: number;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface ShopWithStats extends Shop {
  purchases: Purchase[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface Buyer {
  id: number;
  name: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface PurchaseImage {
  id: number;
  purchaseId: number;
  imageUrl: string;
  isReceipt: boolean;
  createdAt: string;
}

export interface Purchase {
  id: number;
  shopId: number;
  buyerId: number;
  purchaseDate: string;
  totalAmount: string | number;
  paidAmount: string | number;
  paymentStatus: PaymentStatus;
  paidById?: number;
  paidAt?: string;
  createdAt: string;
  remainingAmount: number;
  shop?: Shop;
  buyer?: Buyer;
  paidBy?: Buyer;
  images: PurchaseImage[];
  description?: string;
  items?: { name: string; price: string | number }[];
}

export interface CreatePurchasePayload {
  shopId: number;
  buyerId: number;
  purchaseDate: string;
  totalAmount: number;
  paidAmount?: number;
  paymentStatus?: PaymentStatus;
  paidById?: number;
  paidAt?: string;
  description?: string;
  items?: { name: string; price: number }[];
}

export interface DashboardStats {
  totalPurchases: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  recentPurchases: Purchase[];
}

export interface AppNotification {
  id: number;
  actorId: number | null;
  actorName: string;
  recipientId: number;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: number | null;
  entityName: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId: number | null;
  userName: string;
  action: string;
  entityType: string;
  entityId: number | null;
  entityName: string | null;
  amount: string | number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
