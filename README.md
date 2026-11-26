# تكنو ستيشنري — متجر فرع الأغواط الرسمي
## TECHNO STATIONERY Laghouat Official Store

[![Live Website](https://img.shields.io/badge/Website-techno--laghouat.pages.dev-0056B3?style=for-the-badge&logo=cloudflare&logoColor=white)](https://techno-laghouat.pages.dev)
[![Backend Worker](https://img.shields.io/badge/Backend-Cloudflare_Worker-F38020?style=for-the-badge&logo=cloudflareworkers&logoColor=white)](https://techno-laghouat-backend.hotel-saharien.workers.dev)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-@techno03bot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/techno03bot)
[![Build Status](https://img.shields.io/badge/Build-Passing_100%25-success?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/sigoulojia/techno-lagh03)

---

### 🌐 روابط المنظومة المباشرة:
- **المتجر الإلكتروني الرسمي (الواجهة المباشرة):**
  👉 **[https://techno-laghouat.pages.dev](https://techno-laghouat.pages.dev)**
- **الخادم السحابي الذكي (Cloudflare Worker API):**
  👉 **[https://techno-laghouat-backend.hotel-saharien.workers.dev](https://techno-laghouat-backend.hotel-saharien.workers.dev)**
- **لوحة تحكم الإدارة (Admin Dashboard):**
  👉 **[https://techno-laghouat.pages.dev/#admin](https://techno-laghouat.pages.dev/#admin)**
- **بوت التلغرام للإدارة وإضافة المنتجات والأشكال:**
  👉 **[@techno03bot](https://t.me/techno03bot)** / **[@items03bot](https://t.me/items03bot)**

---

### 🌟 الميزات التقنية والمعمارية للمشروع:
1. **واجهة أمامية فائقة السرعة والتفاعل:**
   - مبنية بأحدث تقنيات الويب: **React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion**.
   - دعم التمرير الأفقي الذكي للموديلات المتعددة (**Horizontal Swipe Snap Gallery**) مع مزامنة فورية للإحداثيات (الاسم، السعر، الكود، القياسات، والوصف).
   - تصميم إنساني هادئ واحترافي للوحة التحكم بدون إيموجيات مفرطة مع تناسق كامل في الحقول.

2. **نظام المنتجات المفردة والمجموعات المتعددة الأشكال:**
   - **المنتج المفرد:** إدخال بالاسم، رقم المنتج التسلسلي، السعر، القياسات والأبعاد، الوصف، والصور.
   - **المجموعة تحت منتج واحد (أشكال/موديلات متعددة):** كل شكل له صورته، اسمه ورقم كوده الخاص، نوع تسعيره (سعر موحد أو عدة قياسات بأسعارها)، وصفه، وقياساته وأبعاده الخاصة.

3. **خادم سحابي عالي الأمان على Cloudflare Workers & KV:**
   - تشفير AES-256-GCM للبيانات الشخصية وطلبات الزبائن في Cloudflare KV.
   - تشفير PIN الإدارة بـ PBKDF2-SHA256 مع 100,000 تكرار وحماية ضد محاولات التخمين.
   - نظام حماية تلقائي ضد الطلبات الوهمية والبوتات (Honeypot + Timing Analysis + Algerian Mobile Validation).
   - ضغط الصور تلقائياً على خوادم Cloudflare لتسريع التحميل وتوفير استهلاك البيانات.

4. **تكامل التوصيل الرسمي مع ZR Express:**
   - تغطية شاملة لـ 58 ولاية جزائرية مع تفصيل بلديات ومكاتب الأغواط وتوصيل للمنزل أو المكتب (Stop Desk).

---

### 💻 التشغيل والتطوير محلياً (Local Development):
```bash
# 1. تثبيت الحزم والتبعيات
npm install

# 2. تشغيل خادم التطوير المحلي
npm run dev

# 3. تشغيل جميع اختبارات الفحص (19 اختبار)
npx tsx --test src/utils/storeLogic.test.ts
npx tsx --test src/utils/loyaltyLogic.test.ts

# 4. بناء نسخة الإنتاج النهائية
npm run build
```

---

### 🚀 ربط المشروع بـ Cloudflare Pages و GitHub:

#### 1. الربط التلقائي عبر GitHub (Continuous Deployment):
المشروع مربوط حالياً بمستودع GitHub الرسمي:
`https://github.com/sigoulojia/techno-lagh03`

عند دفع أي تعديل جديد إلى فرع `main`:
```bash
git add .
git commit -m "feat: description of changes"
git push origin main
```

#### 2. ربط Cloudflare Pages مباشرة بـ GitHub (خطوة بخطوة):
لضمان البناء والنشر التلقائي من GitHub مباشرة دون الحاجة لأي أوامر يدوية:
1. ادخل إلى لوحة تحكم Cloudflare: [dash.cloudflare.com](https://dash.cloudflare.com)
2. انتقل إلى **Workers & Pages** ثم اختر مشروع **`techno-laghouat`**.
3. ادخل إلى تبويب **Settings** ثم **Builds & deployments**.
4. اضغط على **Connect to Git** واختر مستودع **`sigoulojia/techno-lagh03`**.
5. حدد إعدادات البناء:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
6. اضغط **Save and Deploy**.

#### 3. النشر اليدوي المباشر عبر السطر البرمجي (Wrangler CLI):
```bash
# نشر الواجهة الأمامية إلى Cloudflare Pages
npx wrangler pages deploy dist --project-name techno-laghouat

# نشر خادم الباك إند إلى Cloudflare Workers
cd cloudflare-backend
npx wrangler deploy
```

---

© 2026 تكنو ستيشنري الأغواط — جميع الحقوق محفوظة.
