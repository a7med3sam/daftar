import { Suspense } from 'react';
import Link from 'next/link';
import PurchaseForm from '@/components/PurchaseForm';

export default function NewPurchasePage() {
  return (
    <div>
      {/* Back link */}
      <Link href="/" className="page-back">
        ← الرئيسية
      </Link>

      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1 className="page-title">🧾 فاتورة جديدة</h1>
      </div>

      <div className="card">
        <Suspense fallback={<div className="loading-center"><span className="spinner" /></div>}>
          <PurchaseForm />
        </Suspense>
      </div>
    </div>
  );
}
