import { PaymentStatus } from './api';

export function formatCurrency(amount: number | string): string {
  return Number(amount).toLocaleString('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getStatusLabel(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    UNPAID: 'غير مدفوع',
    PARTIALLY_PAID: 'مدفوع جزئياً',
    PAID: 'مدفوع',
  };
  return map[status];
}

export function getStatusColor(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    UNPAID: 'status-unpaid',
    PARTIALLY_PAID: 'status-partial',
    PAID: 'status-paid',
  };
  return map[status];
}
