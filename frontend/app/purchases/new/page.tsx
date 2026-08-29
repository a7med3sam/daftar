import { Suspense } from 'react';
import PurchaseForm from '@/components/PurchaseForm';

export default function NewPurchasePage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">➕ إضافة شراء جديد</h1>
      </div>
      <div className="card">
        <Suspense fallback={<div className="loading-center"><span className="spinner" /></div>}>
          <PurchaseForm />
        </Suspense>
      </div>
    </div>
  );
}
