import { PaymentStatus } from '@/lib/api';
import { getStatusLabel, getStatusColor } from '@/lib/utils';

interface Props {
  status: PaymentStatus;
}

const dotColors: Record<PaymentStatus, string> = {
  PAID: '#22c55e',
  PARTIALLY_PAID: '#f59e0b',
  UNPAID: '#ef4444',
};

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`badge ${getStatusColor(status)}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColors[status],
          display: 'inline-block',
        }}
      />
      {getStatusLabel(status)}
    </span>
  );
}
