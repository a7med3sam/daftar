# 📒 دفتر — Daftar

تطبيق ويب بسيط عربي RTL لتتبع المشتريات والديون مع المحلات التجارية.

---

## المتطلبات

- Node.js 18+
- PostgreSQL (مثبّت محلياً أو عبر Docker)
- حساب Cloudinary (لرفع الصور)

---

## إعداد المشروع

### 1. Backend (NestJS)

```bash
cd backend

# تعديل بيانات الاتصال في .env
# افتح backend/.env وعدّل:
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/daftar"
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# تثبيت الحزم
npm install

# إنشاء قاعدة البيانات
npx prisma migrate dev --name init

# تشغيل الخادم
npm run start:dev
```

Backend يعمل على: `http://localhost:3001`

### 2. Frontend (Next.js)

```bash
cd frontend

# تثبيت الحزم
npm install

# تشغيل الواجهة
npm run dev
```

Frontend يعمل على: `http://localhost:3000`

---

## هيكل المشروع

```
daftar/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── shops/       # محلات CRUD
│   │   ├── buyers/      # مشترون CRUD
│   │   ├── purchases/   # مشتريات + منطق الدفع
│   │   ├── dashboard/   # إحصائيات
│   │   ├── cloudinary/  # رفع الصور
│   │   └── prisma/      # Prisma service
│   └── prisma/
│       └── schema.prisma
└── frontend/         # Next.js UI
    ├── app/
    │   ├── page.tsx          # الداشبورد
    │   ├── shops/            # صفحات المحلات
    │   ├── buyers/           # صفحة المشترين
    │   └── purchases/        # إضافة/تعديل مشتريات
    ├── components/           # مكونات مشتركة
    └── lib/
        ├── api.ts            # API client + Types
        └── utils.ts          # دوال مساعدة
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/shops` | المحلات |
| GET/PATCH/DELETE | `/shops/:id` | محل محدد |
| GET/POST | `/buyers` | المشترون |
| PATCH/DELETE | `/buyers/:id` | مشترٍ محدد |
| GET/POST | `/purchases` | المشتريات |
| GET/PATCH/DELETE | `/purchases/:id` | شراء محدد |
| POST | `/purchases/:id/images` | رفع صور |
| GET | `/dashboard` | الإحصائيات |

---

## قواعد العمل

- **حالة الدفع** تُحسب تلقائياً:
  - `UNPAID` — لم يُدفع شيء
  - `PARTIALLY_PAID` — دُفع جزء
  - `PAID` — دُفع كاملاً
- **المتبقي** = الإجمالي − المدفوع
- لا يمكن أن يتجاوز المدفوع الإجمالي
