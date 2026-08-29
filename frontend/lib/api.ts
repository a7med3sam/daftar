const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'خطأ في الخادم' }));
    throw new Error(error.message || 'خطأ في الخادم');
  }

  return res.json();
}

// ─── Shops ──────────────────────────────────────────────────
export const api = {
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
      }).then((r) => r.json());
    },
    deleteImage: (imageId: number) =>
      request<void>(`/purchases/images/${imageId}`, { method: 'DELETE' }),
  },

  dashboard: {
    get: () => request<DashboardStats>('/dashboard'),
  },
};

// ─── Types ──────────────────────────────────────────────────
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
}

export interface DashboardStats {
  totalPurchases: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  recentPurchases: Purchase[];
}
