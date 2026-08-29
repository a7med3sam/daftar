'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, Purchase } from '@/lib/api';
import PurchaseForm from '@/components/PurchaseForm';
import { Suspense } from 'react';

export default function EditPurchasePage() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.purchases
      .get(Number(id))
      .then(setPurchase)
      .catch(() => setError('تعذّر تحميل بيانات الشراء'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><span className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!purchase) return null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✏️ تعديل الشراء</h1>
      </div>
      <div className="card">
        <Suspense fallback={<div className="loading-center"><span className="spinner" /></div>}>
          <PurchaseForm purchase={purchase} />
        </Suspense>
      </div>
    </div>
  );
}
