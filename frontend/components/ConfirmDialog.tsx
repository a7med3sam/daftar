'use client';

import BottomSheet from '@/components/ui/BottomSheet';

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  confirmLabel = 'حذف',
  confirmVariant = 'danger',
}: Props) {
  return (
    <BottomSheet
      isOpen
      onClose={onCancel}
      footer={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
            style={{ flex: 1 }}
          >
            إلغاء
          </button>
          <button
            className={`btn btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1 }}
            id="confirm-dialog-btn"
          >
            {loading ? <span className="spinner spinner-sm" /> : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="confirm-dialog-content" style={{ padding: 0 }}>
        <p className="confirm-dialog-title">⚠️ {title}</p>
        <p className="confirm-dialog-message">{message}</p>
      </div>
    </BottomSheet>
  );
}
