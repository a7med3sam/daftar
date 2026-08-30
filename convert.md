مهمة إعادة تصميم وتطوير مشروع "دفتر" — Daftar Mobile-First Redesign
أنت تعمل الآن كـ Senior Full-Stack Engineer + Senior UI/UX Designer + Mobile UX Specialist.

لديك مشروع قائم بالفعل اسمه دفتر (Daftar)، وهو تطبيق عربي RTL لإدارة المشتريات والديون والمدفوعات بين المستخدم والمحلات التجارية.

المطلوب ليس إنشاء مشروع جديد، وليس تغيير الـ Backend بلا داعٍ.

المطلوب هو إعادة تصميم وتجربة استخدام الـ Frontend بالكامل ليصبح Mobile-First حقيقيًا، مع الحفاظ على الـ Backend والـ API وقاعدة البيانات والمنطق الحالي قدر الإمكان.

1. افهم طبيعة المنتج أولًا
هذا التطبيق سيُستخدم تقريبًا 90% من الوقت من خلال الهاتف المحمول.

المستخدم النموذجي غالبًا يكون واقفًا في محل أو أثناء تسجيل عملية شراء أو دفع دين، وبالتالي:

الاستخدام سريع.
غالبًا بيد واحدة.
الشاشات الصغيرة هي الأولوية.
الإدخال يجب أن يكون سريعًا.
الأزرار يجب أن تكون سهلة اللمس.
تصوير الإيصالات والمنتجات جزء أساسي من التجربة.
المستخدم لا يريد التعامل مع جداول Dashboard معقدة.
المعلومات المهمة يجب أن تظهر خلال ثوانٍ.
لذلك:

لا تتعامل مع المشروع باعتباره Desktop Dashboard يجب جعله Responsive.

بل:

أعد تصميمه باعتباره Mobile Application / Mobile-first Web App، ثم اجعل تجربة Desktop امتدادًا أكبر لنفس التصميم.

2. قبل تعديل أي كود — افحص المشروع
ابدأ أولًا بقراءة وفهم المشروع بالكامل.

افحص:

frontend structure
backend structure
API client
pages
components
CSS
responsive rules
layout
navigation
forms
tables
modals
image upload
payment flow
API endpoints
TypeScript types
existing business logic
لا تبدأ بإعادة الكتابة مباشرة.

حدد:

ما الذي يمكن إعادة استخدامه.
ما الذي يحتاج refactor.
ما الذي يحتاج إعادة تصميم.
ما الذي يمثل مشكلة Mobile UX.
ما الذي قد يؤدي إلى regression.
ممنوع حذف أو تغيير Backend logic لمجرد إعادة التصميم.

3. أهم مبدأ في التنفيذ
أريد منك أن تطبق:

Mobile First — وليس Responsive Desktop
التصميم الأساسي يجب أن يبدأ من:

360px
375px
390px
414px
ثم يتوسع إلى:

Tablet
Desktop
لا تصمم Desktop أولًا ثم تحاول ضغطه على الموبايل.

4. أعد بناء الـ App Shell
التصميم الحالي يعتمد على Dashboard/Toolbar وقد يسبب مشاكل مع Zoom والموبايل.

أعد بناء الـ application shell ليكون شبيهًا بتطبيق Mobile حقيقي.

Mobile Navigation
استخدم Bottom Navigation ثابتًا.

التنقل الأساسي:

الرئيسية
المحلات
المشترون
مع زر Action واضح لإضافة عملية جديدة.

يمكن أن يكون التصميم مثل:

┌──────────────────────────────┐
│                              │
│          CONTENT             │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│ الرئيسية │ المحلات │ المشترون │
│    🏠    │   🏪    │    👥    │
└──────────────────────────────┘

لكن لا تلتزم بهذا الشكل حرفيًا.

صمم Navigation حديثة ونظيفة واحترافية.

يجب أن:

تكون سهلة الاستخدام بإبهام اليد.
لا تغطي المحتوى.
تدعم Safe Area في أجهزة iPhone.
تعمل مع browser zoom.
تعمل مع keyboard.
لا تتحرك بشكل غريب عند scrolling.
لا تسبب horizontal overflow.
استخدم:

padding-bottom: env(safe-area-inset-bottom);

حيث يلزم.

5. زر الإضافة الرئيسي
عملية الإضافة هي أهم Action في التطبيق.

أنشئ FAB أو Action Button واضح.

عند الضغط عليه تظهر Actions مثل:

إضافة فاتورة
تسجيل دفعة
إضافة محل
إضافة مشترٍ
مثال:

        ＋

ماذا تريد أن تضيف؟

🧾 فاتورة جديدة
💰 دفعة جديدة
🏪 محل جديد
👤 مشترٍ جديد

اجعل التجربة سريعة جدًا.

لا تجعل المستخدم يمر عبر خطوات غير ضرورية.

6. الصفحة الرئيسية — Home
أعد تصميم الـ Dashboard بالكامل.

ممنوع الاعتماد على جدول كبير في الصفحة الرئيسية.

الـ Home يجب أن تجيب بسرعة عن:

أنا عليّ كام؟
كام فاتورة غير مسددة؟
كام فاتورة مدفوعة؟
آخر العمليات؟
ما الذي يحتاج إلى إجراء الآن؟
استخدم:

Summary Cards
Recent Purchases
Outstanding Payments
Quick Actions
مثال تقريبي:

صباح الخير 👋

دفتر

┌─────────────────────────────┐
│ إجمالي المتبقي              │
│                             │
│       12,450 ج.م            │
│                             │
│       8 فواتير              │
└─────────────────────────────┘

[ غير مسدد 8 ] [ مدفوع 15 ]

آخر العمليات

┌─────────────────────────────┐
│ 🏪 سوبر ماركت أحمد          │
│                             │
│ الإجمالي     1,200 ج.م     │
│ المتبقي        700 ج.م     │
│                             │
│ 🟠 مدفوع جزئيًا             │
└─────────────────────────────┘

لا تنفذ هذا التصميم حرفيًا.

استخدم خبرتك في UX لتصميم شيء أفضل.

7. المحلات — Shops
بدل الجداول على Mobile استخدم Cards/List.

كل Shop Card يجب أن تعرض أهم المعلومات فقط:

اسم المحل
الهاتف إن وجد
الدين/المتبقي
آخر عملية
حالة الحساب
مثال:

🏪 سوبر ماركت أحمد

الدين الحالي
2,450 ج.م

آخر فاتورة: منذ ساعتين

›

اجعل الـ Card clickable بالكامل.

لا تستخدم أزرار صغيرة جدًا داخل الـ Card.

8. صفحة تفاصيل المحل
هذه الصفحة مهمة جدًا.

اجعلها تعرض:

اسم المحل
رقم الهاتف
إجمالي الدين
إجمالي المدفوع
إجمالي المشتريات
قائمة الفواتير
حالة كل فاتورة
يمكن عرض الفواتير كـ Cards أو Timeline/List.

كل فاتورة يجب أن تعرض:

التاريخ
الإجمالي
المدفوع
المتبقي
حالة الدفع
الصور إن وجدت
واجعل الوصول إلى:

تسجيل دفعة

واضحًا جدًا.

9. المشترون — Buyers
نفس فلسفة Shops.

لا تستخدم Desktop Table كعنصر أساسي على الهاتف.

استخدم:

Search
Cards
Clear hierarchy
Large touch targets
10. الفواتير — Purchases
أعد تصميم قائمة الفواتير.

استخدم:

Search
Status filters
Cards/List
Pagination أو infinite loading إذا كان ذلك مناسبًا للبنية الحالية.
لا تجعل المستخدم يتعامل مع جدول عريض يحتاج horizontal scrolling.

حالات الدفع:

UNPAID
PARTIALLY_PAID
PAID
يجب أن تكون واضحة بصريًا.

استخدم ألوانًا هادئة ومناسبة للـ RTL.

لا تعتمد على اللون وحده؛ اعرض Label أيضًا.

مثال:

🟠 مدفوع جزئيًا

11. إضافة فاتورة — أهم شاشة في التطبيق
أعد تصميم PurchaseForm بالكامل للموبايل.

اجعلها سريعة وبسيطة.

الترتيب المقترح:

المحل
المبلغ
التاريخ
الملاحظات
الصور
لكن استخدم UX أفضل إذا رأيت ترتيبًا مناسبًا.

الحقول يجب أن تكون:

كبيرة.
سهلة اللمس.
واضحة.
Keyboard مناسب لنوع الإدخال.
Validation واضح.
Error messages مفهومة بالعربية.
استخدم inputmode="decimal" للمبالغ حيث يلزم.

لا تجعل المستخدم يكتب معلومات غير ضرورية.

12. الدفع — Payment UX
PaymentModal الحالي يجب إعادة التفكير فيه.

على Mobile لا أريد Modal صغيرًا تقليديًا.

استخدم:

Bottom Sheet
أو
Full-screen mobile sheet
بحسب ما يناسب التصميم.

مثال:

تسجيل دفعة

سوبر ماركت أحمد

المتبقي
700 ج.م

المبلغ

[ 300 ]

[100] [200] [300] [الكل]

📷 إضافة إيصال

[ تأكيد الدفع ]

أريد تجربة ممتازة جدًا هنا.

المستخدم يجب أن يستطيع تسجيل دفعة خلال ثوانٍ.

13. الصور والكاميرا
الصور جزء أساسي من التطبيق.

حافظ على:

capture="environment"

حيث يلزم.

صمم Image Upload بحيث يكون:

Mobile friendly
واضح
سريع
يدعم Camera
يعرض preview
يسمح بالحذف
يميز Receipt عن Product images
لا تجعل رفع الصور تجربة Desktop يتم ضغطها على الهاتف.

14. Image Gallery
أعد تصميم ImageGallery للموبايل.

أريد:

thumbnails
fullscreen preview
swipe gestures إن أمكن
close button واضح
مناسب للصور الكبيرة
لا يكسر الـ viewport.
15. Bottom Sheets
استخدم Bottom Sheets بشكل متكرر عندما يكون مناسبًا بدل Modals التقليدية.

أمثلة:

Filters
Add actions
Payment
Select Shop
Select Buyer
Date selection
More actions
لكن لا تستخدم Bottom Sheet لكل شيء بشكل مبالغ فيه.

استخدمها فقط عندما تحسن الـ UX.

16. Search & Filters
اجعل البحث Mobile-first.

بدل مجموعة كبيرة من inputs:

Search
Status
Shop
Date
Buyer
...

اعمل:

🔎 ابحث...

[الكل] [غير مسدد] [جزئي] [مدفوع]

وFilter button يفتح Bottom Sheet عند الحاجة.

17. Typography
التطبيق عربي RTL.

اختر Typography مناسبة للعربية.

اهتم بـ:

readability
line-height
hierarchy
numbers
currency
dates
لا تستخدم font sizes صغيرة.

خصوصًا على Mobile.

18. Touch Targets
أي عنصر قابل للضغط يجب أن يكون مريحًا للمس.

استهدف تقريبًا:

44px+

للعناصر التفاعلية الأساسية.

لا تستخدم:

أزرار صغيرة جدًا
icons صغيرة بدون hit area
links متقاربة جدًا
19. مشكلة Zoom
هناك مشكلة حاليًا أن Zoom In / Zoom Out يكسر الـ layout ويؤثر على Bottom Navigation.

حل المشكلة من جذورها.

راجع:

viewport
fixed elements
100vw
100vh
100dvh
overflow
transforms
fixed positioning
safe areas
keyboard behavior
input font size
min-width
flex shrink
absolute positioning
خصوصًا على iOS Safari.

تأكد من أن:

input,
select,
textarea {
  font-size: 16px;
}

أو ما يعادل ذلك في design system، لتجنب auto zoom عند التركيز على inputs في iOS.

لا تستخدم حلولًا hacky تمنع المستخدم من الـ zoom بدون داعٍ.

الهدف هو أن الـ layout نفسه يكون resilient للـ zoom.

20. لا تستخدم Horizontal Scrolling كحل أساسي
ممنوع حل مشاكل Responsive عن طريق:

overflow-x: auto;

على الصفحة كلها.

الجداول الموجودة حاليًا يجب إعادة التفكير فيها.

إذا كانت بعض البيانات تحتاج Table على Desktop:

استخدم Cards/List على Mobile.
Table على Desktop إذا كان ذلك مفيدًا.
21. Responsive Strategy
اعتمد استراتيجية:

Mobile
Primary experience.

Tablet
Adaptive experience.

Desktop
Enhanced experience.

على Desktop يمكن استخدام:

Sidebar
Tables
Multi-column layout
Larger content areas
لكن لا تجعل Desktop architecture تفرض نفسها على Mobile.

22. Design System
قبل بناء الصفحات، أنشئ أو نظّم Design System موحد.

يجب أن يحتوي على:

Colors
Typography
Spacing
Border radius
Shadows
Buttons
Inputs
Cards
Badges
Bottom sheets
Navigation
Empty states
Loading states
Error states
Toasts
استخدم CSS variables الموجودة إذا كانت جيدة.

لا تنشئ عشرات القيم العشوائية.

اجعل التصميم متناسقًا.

23. حالات Loading / Empty / Error
كل Screen يجب أن تحتوي على UX مناسب لـ:

Loading
Skeletons أفضل من شاشة بيضاء.

Empty
مثال:

📒 لا توجد فواتير بعد

ابدأ بإضافة أول فاتورة

[ + إضافة فاتورة ]

Error
رسالة مفهومة للمستخدم، وليس raw API error.

مثال:

حدث خطأ أثناء تحميل البيانات

[ حاول مرة أخرى ]

24. Arabic UX
التطبيق عربي RTL.

تأكد من:

dir="rtl"
ترتيب الأيقونات المناسب للعربية.
alignment صحيح.
الأسهم والـ chevrons منطقية.
الأرقام لا تسبب layout issues.
التواريخ مفهومة.
العملة واضحة.
لا يوجد mixed-direction bugs.
اختبر النصوص العربية الطويلة.

25. Accessibility
لا تهمل accessibility.

اهتم بـ:

semantic HTML
labels
aria-labels للأيقونات
focus states
keyboard navigation على Desktop
contrast
touch targets
screen reader compatibility حيث يلزم.
26. Performance
التطبيق سيستخدم على الموبايل.

لذلك:

قلل JavaScript غير الضروري.
لا تحمل الصور الأصلية بحجم ضخم.
استخدم image optimization المناسب.
تجنب unnecessary re-renders.
لا تعمل API calls متكررة بلا داعٍ.
استخدم loading states جيدة.
lazy load ما يمكن تحميله لاحقًا.
27. لا تغير Business Logic
احتفظ بالقواعد الحالية:

remainingAmount = totalAmount - paidAmount

الحالات:

0 → UNPAID

0 < paidAmount < totalAmount
→ PARTIALLY_PAID

paidAmount >= totalAmount
→ PAID

ولا تسمح بأن يتجاوز المدفوع الإجمالي.

الحسابات المهمة تظل في Backend.

الـ Frontend يعرض البيانات القادمة من Backend ولا يصبح مصدر الحقيقة.

28. لا تكسر API
حافظ على الـ API الحالي ما لم يوجد سبب حقيقي.

Endpoints الحالية:

GET/POST /shops
GET/PATCH/DELETE /shops/:id

GET/POST /buyers
PATCH/DELETE /buyers/:id

GET/POST /purchases
GET/PATCH/DELETE /purchases/:id

POST /purchases/:id/images

GET /dashboard

إذا احتجت تغيير API، لا تفعل ذلك عشوائيًا.

حدد السبب والتأثير قبل التنفيذ.

29. لا تعيد كتابة كل شيء بلا داعٍ
قاعدة مهمة:

Refactor what is necessary, reuse what is good.

لا أريد rewrite لمجرد rewrite.

أريد نتيجة أفضل، وليس عدد ملفات أكثر.

30. جودة الكود
اكتب TypeScript نظيف.

تجنب:

any
duplicated logic
duplicated CSS
magic numbers
giant components
unnecessary client components
deeply nested conditional rendering
قسّم المكونات بطريقة منطقية.

مثال:

components/
├── navigation/
│   ├── BottomNav
│   └── MobileHeader
│
├── ui/
│   ├── Button
│   ├── Input
│   ├── Card
│   ├── Badge
│   ├── BottomSheet
│   └── Skeleton
│
├── shops/
│   ├── ShopCard
│   └── ShopList
│
├── purchases/
│   ├── PurchaseCard
│   ├── PurchaseForm
│   └── PaymentSheet
│
└── images/
    └── ImageGallery

لا تتقيد بهذا structure حرفيًا إذا كان المشروع الحالي أفضل.

31. UX Details أريد منك التفكير فيها كمصمم Senior
لا تنفذ المطلوب حرفيًا فقط.

اتخذ قرارات UX من نفسك.

فكر في:

ماذا يحدث بعد إضافة فاتورة؟
هل نرجع للمحلات أم نعرض الفاتورة؟
كيف يسجل المستخدم دفعة بسرعة؟
ماذا يحدث إذا صور الإيصال قبل إدخال المبلغ؟
كيف نتصرف عند انقطاع الإنترنت؟
كيف يظهر آخر إجراء؟
كيف يعرف المستخدم أن الدفع تم بنجاح؟
هل يحتاج confirmation قبل الحذف؟
هل يمكن undo؟
ما هي أهم معلومة في كل Card؟
ما هو أفضل مكان لزر الدفع؟
هل الـ FAB ضروري في كل Screen؟
كيف نقلل عدد الـ taps؟
أريد منك أن تتصرف كـ Product Designer وليس فقط Frontend Developer.

32. Micro-interactions
أضف interactions بسيطة واحترافية عند الحاجة:

button press
card press
sheet animation
toast
success state
loading state
image preview
navigation transitions
لكن:

لا تستخدم animations لمجرد الاستعراض.

الأولوية للسرعة والوضوح.

33. Desktop
بعد الانتهاء من Mobile UX، تأكد أن Desktop لا يزال ممتازًا.

Desktop يمكن أن يحتوي على:

Sidebar
Dashboard cards
Tables
Larger forms
Modal dialogs
لكن استخدم نفس Design System.

لا تنشئ منتجين مختلفين.

34. الاختبار
بعد التنفيذ اختبر على الأقل:

Mobile widths
360px
375px
390px
414px

Desktop
1024px
1280px
1440px

اختبر:

Portrait
Landscape
Zoom
Long Arabic text
Empty data
Large numbers
Long shop names
Many purchases
Images
Keyboard open
iOS Safari behavior
Android Chrome behavior
35. Acceptance Criteria
لن أعتبر المهمة منتهية لمجرد أن الصفحات أصبحت Responsive.

المطلوب:

Mobile
لا يوجد horizontal overflow.
Bottom Navigation ثابتة ومستقرة.
Zoom لا يكسر Layout.
Inputs لا تسبب مشاكل.
Forms سهلة بيد واحدة.
Cards واضحة.
لا توجد جداول مزعجة.
أهم Actions يمكن الوصول إليها بسرعة.
Payment flow سريع.
Image upload ممتاز.
Empty/loading/error states موجودة.
RTL صحيح.
Desktop
Layout احترافي.
Sidebar/Navigation مناسبة.
Tables تستخدم عندما تكون أفضل.
لا توجد regressions.
نفس الـ Design System.
36. طريقة التنفيذ
نفذ العمل على مراحل:

Phase 1
Audit كامل للمشروع.

Phase 2
Design System + App Shell.

Phase 3
Mobile Home.

Phase 4
Shops + Shop Details.

Phase 5
Buyers.

Phase 6
Purchases + Purchase Details.

Phase 7
Add Purchase.

Phase 8
Payment UX.

Phase 9
Images / Camera / Gallery.

Phase 10
Desktop adaptation.

Phase 11
Responsive + Zoom + Accessibility audit.

Phase 12
Final cleanup + bug fixing.

37. قاعدة مهمة جدًا أثناء التنفيذ
إذا وجدت أن التصميم الحالي يحتوي على شيء تم وضعه فقط لأنه مناسب للـ Desktop، اسأل نفسك:

هل المستخدم يحتاج هذا فعلًا على الموبايل؟

إذا كانت الإجابة لا:

أعد تصميمه.

لا تحاول الحفاظ على UI القديم لمجرد الحفاظ عليه.

38. النتيجة النهائية المطلوبة
أريد أن يشعر المستخدم عند فتح "دفتر" على الهاتف أنه يستخدم:

تطبيق Mobile احترافي لإدارة الديون والمشتريات

وليس:

Dashboard Website تم تصغيره للموبايل.

التصميم يجب أن يكون:

Modern
Clean
Arabic-first
RTL
Mobile-first
Fast
Simple
Professional
Touch-friendly
Financially trustworthy
وفي نفس الوقت لا يكون التصميم مزدحمًا أو مليئًا بالـ Cards والألوان بلا داعٍ.

استخدم Visual Hierarchy قوي.

اجعل الأرقام المهمة هي البطل.

اجعل Actions واضحة.

اجعل التطبيق سريعًا في الاستخدام اليومي.

39. أهم قاعدة أخيرة
لا تبدأ التنفيذ قبل أن تفهم الكود الحالي.

بعد الـ audit:

حدد المشاكل.
حدد ما ستعيد استخدامه.
حدد الـ components التي ستعيد بناءها.
نفذ الـ redesign.
اختبر.
أصلح الـ regressions.
تأكد أن الـ Backend Business Logic لم يتغير.
لا تكتفِ بإعطائي اقتراحات أو mockups.

نفّذ التغييرات فعليًا داخل المشروع والكود الموجود.