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

export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return formatDate(dateStr);
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

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
