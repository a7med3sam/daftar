'use client';

export default function OfflinePage() {
  return (
    <section className="offline-page" aria-labelledby="offline-title">
      <div className="offline-panel">
        <div className="offline-mark" aria-hidden="true">
          !
        </div>
        <h1 id="offline-title" className="offline-title">
          لا يوجد اتصال بالإنترنت
        </h1>
        <p className="offline-message">
          تعذر تحميل الصفحة المطلوبة. تحقق من الاتصال ثم حاول مرة أخرى.
        </p>
        <button
          className="offline-retry"
          type="button"
          onClick={() => window.location.reload()}
        >
          إعادة المحاولة
        </button>
      </div>
    </section>
  );
}
