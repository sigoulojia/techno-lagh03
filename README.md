# تكنو ستيشنري — متجر فرع الأغواط الرسمي
## TECHNO STATIONERY Laghouat Official Store

المتجر الإلكتروني الرسمي المعتمد لفرع تكنو ستيشنري بولاية الأغواط، الجزائر.
خبرة 25 سنة كعلامة رائدة في الأدوات المكتبية، أقلام التوقيع الفاخرة، حقائب الأعمال والحواسيب، مستلزمات الهندسة والفنون واللوازم المدرسية.

---

### الميزات التقنية:
- **واجهة أمامية فائقة التفاعلية**: مبنية باستخدام React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion.
- **تتبع الطلبات اللحظي**: كود تتبع سري فائق الأمان (12 خانة: `TL-XXXX-XXXX-XXXX`) مع مسار ثلاثي المراحل وزر واتساب مباشر.
- **تشفير متقدم على Cloudflare Worker**:
  - تشفير AES-256-GCM للبيانات الشخصية للزبائن في Cloudflare KV.
  - تشفير PIN الإدارة بـ PBKDF2-SHA256 مع 100,000 تكرار وحماية ضد Brute-Force.
  - حماية ذكية ضد البوتات والطلبات الوهمية (Honeypot + Timing Analysis + Algerian Mobile Validation).
- **التكامل مع ZR Express**: تسعيرة رسمية لـ 54 ولاية جزائرية و24 بلدية ومكتب بالأغواط.

---

### التشغيل محلياً (Local Development):
```bash
# تثبيت التبعيات
npm install

# تشغيل خادم التطوير
npm run dev

# تشغيل الفحوصات ووحدات الاختبار
npx tsx --test src/utils/storeLogic.test.ts src/utils/notificationService.test.ts src/utils/receiptGenerator.test.ts

# بناء نسخة الإنتاج
npm run build
```

---

### النشر التلقائي عبر GitHub و Cloudflare Pages:
عند دفع التعديلات إلى فرع `main` على GitHub:
```bash
git add .
git commit -m "feat: upgrade flagship design and order tracking"
git push origin main
```
يقوم Cloudflare Pages بالبناء والنشر التلقائي فوراً على:
[https://techno-laghouat.pages.dev](https://techno-laghouat.pages.dev)
