# Influencer Rate Calculator — Creator Pricing Engine V3

نسخة مستقلة موجهة للمؤثرين وصناع المحتوى.

## لماذا V3 مختلفة؟
- لا تستخدم Tier ثابتًا لتحديد السعر.
- السعر يتحرك على Smooth Log Curve؛ لا توجد قفزة عند 99,999 → 100,000 متابع.
- الفيديو يعتمد على Hybrid Anchor: حجم الحساب + الأداء الفعلي للمشاهدات.
- وزن المشاهدات:
  - Instagram Reel: 65%
  - TikTok Video: 75%
  - YouTube Short: 72%
  - YouTube Integration: 80%
  - YouTube Dedicated: 82%
- التفاعل محدود التأثير عمدًا إلى 0.92x–1.08x.
- المجال محدود ومحافظ، ولا يستطيع وحده تضخيم السعر.
- Audience Geography عامل مستقل.
- Demand / Creator Type / Brand History لا تغيّر Fair Publishing Rate؛ تغيّر Recommended Ask فقط.
- Usage Rights / Exclusivity / Whitelisting / Production / Rush تضاف بعد Fair Rate.
- يدعم Real Deal Calibration عبر `deal-data.js`.

## الملفات
- `index.html` — الواجهة.
- `style.css` — التصميم والـresponsive والـprint.
- `pricing-data.js` — Benchmarks والمحاور والقواعد.
- `deal-data.js` — قاعدة الصفقات الحقيقية (فارغة افتراضيًا).
- `pricing-engine.js` — محرك الحساب والمعايرة.
- `app.js` — ربط المحرك بالواجهة.
- `tests.js` — Stress tests.
- `calibration-template.csv` — قالب تسجيل الصفقات الفعلية.
- `TEST_REPORT.md` — نتيجة الاختبارات.
- `BENCHMARK_NOTES.md` — ملاحظات المعايرة.

## الحالة المرجعية
السعودية / Instagram Reel / 100,000 متابع / 50,000 متوسط مشاهدة / 3% تفاعل / 60% جمهور محلي / مجال عام:

- Market Median ≈ 1,900 SAR
- Fair Publishing Rate ≈ 2,248 SAR
- Do Not Go Below ≈ 1,818 SAR
- Recommended Ask ≈ 2,473 SAR
- Premium Ceiling ≈ 2,770 SAR

هذه الحالة مقصودة كـ sanity check حتى لا يعود النموذج إلى أرقام مثل 12,000 SAR لهذا السيناريو بدون مبرر تجاري إضافي.

## إضافة صفقات حقيقية
أضف الصفقات المكتملة إلى `deal-data.js`.

`finalPublishingFee` يجب أن يكون **سعر النشر الأساسي النهائي** بعد إزالة:
- Usage rights
- Exclusivity
- Whitelisting / Spark Ads
- Extra production
- Rush fee
- Extra revisions

عند وجود 5 صفقات مشابهة على الأقل يبدأ المحرك بالمعايرة، ويزيد وزن البيانات الفعلية تدريجيًا مع زيادة الصفقات وتشابهها وحداثتها.

## تشغيل الاختبارات
```bash
node tests.js
```

## ملاحظة مهمة
الـseed benchmarks الموجودة في `pricing-data.js` تقديرية ومحافظة وليست أسعارًا رسمية. أفضل طريقة للوصول إلى دقة عالية في الخليج ومصر هي تعبئة `deal-data.js` بصفقات فعلية مكتملة بشكل مستمر.
