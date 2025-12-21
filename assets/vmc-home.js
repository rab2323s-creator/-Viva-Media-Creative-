 /* =========================
   VMC HOME (Slider Services C)
========================= */

// year
const y = document.getElementById("y");
if (y) y.textContent = String(new Date().getFullYear());

// reveal on scroll
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add("is-in");
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// magnetic
document.querySelectorAll(".magnetic").forEach((el) => {
  const strength = 10;
  el.addEventListener("pointermove", (ev) => {
    const r = el.getBoundingClientRect();
    const dx = ev.clientX - (r.left + r.width / 2);
    const dy = ev.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx / strength}px, ${dy / strength}px)`;
  });
  el.addEventListener("pointerleave", () => {
    el.style.transform = `translate(0px, 0px)`;
  });
});

/* =========================
   i18n (AR/EN) — no URL change
========================= */
const dict = {
  ar: {
    nav_services: "الخدمات",
    nav_tenets: "مبادئنا",
    nav_trusted: "عملاؤنا",
    nav_contact: "تواصل",

    hero_kicker: "وكالة عالمية لإنتاج المحتوى • إدارة المؤثرين • التسويق بالأداء",
    hero_title_1: "نحوّل حضورك",
    hero_title_2: "إلى تأثير يبيع ويكبر",
    hero_sub:
      "من “فكرة” إلى “فيديو” إلى “حملة” — إنتاج سينمائي، إدارة صنّاع محتوى ومشاهير، وتسويق رقمي يعتمد على نتائج قابلة للقياس.",
    hero_cta_primary: "ابدأ مشروعك",
    hero_cta_secondary: "استكشف الخدمات",
    meta_1: "وصول جماهيري",
    meta_2: "سنوات خبرة",
    meta_3: "نطاق عمل",

    services_cap: "Services",
    services_title: "خدماتنا",
    services_desc: "خدمات مصممة لعلامات وتجّار ومؤثرين — تنفيذ فخم + استراتيجية + توزيع + قياس.",
    services_hint: "اسحب ← → أو استخدم عجلة الماوس",
    contact_us: "تواصل معنا",

    s1_title: "إنتاج فيديوهات وإعلانات",
    s1_desc:
      "كتابة سكريبت، تصوير/Remote Production، مونتاج فاخر، Shorts/Reels، وإعلانات جاهزة للنشر — بإيقاع يناسب المنصات.",
    s1_b1: "• فيديو دعائي",
    s1_b2: "• مونتاج سينمائي",
    s1_b3: "• سكريبت + هوك",

    s2_title: "إدارة مشاهير وصنّاع محتوى",
    s2_desc:
      "خطة محتوى، جدولة، تطوير الهوية الرقمية، إدارة التعاونات، وتفاوض احترافي مع العلامات — لتكبر حساباتك بشكل مستمر.",
    s2_b1: "• خطة + تقويم محتوى",
    s2_b2: "• تطوير الهوية",
    s2_b3: "• إدارة شراكات",

    s3_title: "حملات مؤثرين للشركات",
    s3_desc:
      "نربط العلامات بالمؤثرين الأنسب، ندير التنفيذ بالكامل، ونقدّم تقارير نتائج واضحة — بعقود شفافة تحفظ حقوق الجميع.",
    s3_b1: "• اختيار مؤثرين مناسبين",
    s3_b2: "• إدارة حملة كاملة",
    s3_b3: "• تقارير وقياس",

    s4_title: "مواقع، SEO، وتحويل",
    s4_desc:
      "تصميم وبناء مواقع، تحسين محركات البحث، صفحات هبوط، تتبع وتحسين Conversion — لتحويل الزيارات إلى عملاء.",
    s4_b1: "• Website & Landing",
    s4_b2: "• SEO",
    s4_b3: "• CRO & Tracking",

    tenets_title: "مبادئنا",
    tenets_desc: "الفخامة ليست “زينة”… الفخامة = وضوح + تناسق + قرار إبداعي قوي.",
    t1: "وضوح الرسالة",
    t1d: "نحوّل الفكرة إلى رسالة بسيطة… ثم نصنع لها تنفيذًا يعلق بالذاكرة.",
    t2: "إيقاع المنصات",
    t2d: "نعرف كيف تُصنع لقطات “توقف السكروول” وتستمر بالمشاهدة.",
    t3: "تنفيذ Premium",
    t3d: "تفاصيل صغيرة تصنع فرقًا كبيرًا: حركة، مسافات، صوت، إضاءة.",
    t4: "شفافية التعاون",
    t4d: "شراكات بعقود واضحة تحفظ الحقوق وتضمن جودة التنفيذ.",
    t5: "توزيع ذكي",
    t5d: "ليس إنتاجًا فقط—بل نشر وتوزيع وقياس حتى تصل للنتيجة.",
    t6: "نمو قابل للقياس",
    t6d: "نقيس، نحلل، ثم نكرر ما ينجح — بدون تخمين.",

    trusted_title: "يثق بنا",
    trusted_note: "حاليًا نستخدم شعارات “Placeholder” — وعندما تجهز قائمة العملاء، نستبدلها فورًا.",

    final_title: "جاهز لتبدو “Premium”؟",
    final_desc: "أرسل هدفك ونوع المشروع—وسنقترح اتجاهًا واضحًا مع خطة تنفيذ وقياس.",
    final_cta: "اطلب عرض سعر",
  },

  en: {
    nav_services: "Services",
    nav_tenets: "Tenets",
    nav_trusted: "Trusted",
    nav_contact: "Contact",

    hero_kicker: "Global content production • Influencer management • Performance marketing",
    hero_title_1: "We turn your presence",
    hero_title_2: "into impact that sells & scales",
    hero_sub:
      "From idea → video → campaign: cinematic production, creator/celebrity management, and measurable digital growth.",
    hero_cta_primary: "Start a Project",
    hero_cta_secondary: "Explore Services",
    meta_1: "Audience Reach",
    meta_2: "Years Experience",
    meta_3: "Operating Range",

    services_cap: "Services",
    services_title: "What we do",
    services_desc: "Built for brands, founders & creators — premium execution + strategy + distribution + measurement.",
    services_hint: "Drag ← → or use mouse wheel",
    contact_us: "Contact us",

    s1_title: "Video & Ad Production",
    s1_desc:
      "Scripts, filming/remote production, premium editing, shorts/reels, and ad-ready deliverables—built for platform rhythm.",
    s1_b1: "• Promotional videos",
    s1_b2: "• Cinematic editing",
    s1_b3: "• Scripts + hooks",

    s2_title: "Creators & Celebs Management",
    s2_desc:
      "Content planning, scheduling, brand identity, collaborations, and professional brand negotiations—for steady account growth.",
    s2_b1: "• Content calendar",
    s2_b2: "• Identity building",
    s2_b3: "• Partnership management",

    s3_title: "Influencer Campaigns",
    s3_desc:
      "We match you with the right influencers, manage execution end-to-end, and deliver clear reporting—with transparent contracts.",
    s3_b1: "• Influencer selection",
    s3_b2: "• Full campaign management",
    s3_b3: "• Reporting & measurement",

    s4_title: "Web, SEO & Conversion",
    s4_desc:
      "Websites, SEO, landing pages, tracking, and CRO—turn traffic into qualified leads and sales.",
    s4_b1: "• Website & landing",
    s4_b2: "• SEO",
    s4_b3: "• CRO & tracking",

    tenets_title: "Our Tenets",
    tenets_desc: "Luxury isn’t decoration. Luxury = clarity + consistency + decisive craft.",
    t1: "Clarity",
    t1d: "We simplify the message—then craft it to be remembered.",
    t2: "Platform rhythm",
    t2d: "Scroll-stopping hooks, pacing, and retention by design.",
    t3: "Premium craft",
    t3d: "Micro-details: motion, spacing, sound, lighting.",
    t4: "Transparent partnerships",
    t4d: "Clear contracts that protect rights and quality.",
    t5: "Smart distribution",
    t5d: "Not just production—distribution + measurement to reach outcomes.",
    t6: "Measurable growth",
    t6d: "We measure, analyze, and repeat what works—no guessing.",

    trusted_title: "Trusted by",
    trusted_note: "We’re using placeholder logos for now—swap them once your client list is ready.",

    final_title: "Ready to look premium?",
    final_desc: "Share your goal and project type—we’ll propose a clear direction with execution + measurement.",
    final_cta: "Request a Quote",
  },
};

let lang = "ar";
const langBtn = document.getElementById("langBtn");
const langLabel = document.getElementById("langLabel");

function applyLang(next) {
  lang = next;
  document.documentElement.lang = lang === "ar" ? "ar" : "en";
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  if (langLabel) langLabel.textContent = lang === "ar" ? "EN" : "AR";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const v = dict[lang]?.[key];
    if (typeof v === "string") el.textContent = v;
  });

  // update slider progress visuals after language flip (no layout shift surprises)
  requestAnimationFrame(() => updateServicesUI());
}

applyLang("ar");

langBtn?.addEventListener("click", () => {
  applyLang(lang === "ar" ? "en" : "ar");
});

/* =========================
   Services Slider C controller
========================= */
const viewport = document.getElementById("servicesViewport");
const bar = document.getElementById("servicesBar");
const dots = Array.from(document.querySelectorAll(".dot2"));
const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");

function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }

function getSlideWidth() {
  if (!viewport) return 0;
  return viewport.clientWidth; // each slide = 100% width
}

function getIndexFromScroll() {
  if (!viewport) return 0;
  const w = getSlideWidth();
  if (!w) return 0;
  return clamp(Math.round(viewport.scrollLeft / w), 0, 3);
}

function scrollToIndex(idx) {
  if (!viewport) return;
  const w = getSlideWidth();
  viewport.scrollTo({ left: idx * w, behavior: "smooth" });
}

function updateServicesUI() {
  if (!viewport) return;
  const idx = getIndexFromScroll();

  // dots
  dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));

  // progress bar
  if (bar) {
    const pct = ((idx + 1) / 4) * 100;
    bar.style.width = `${pct}%`;
  }
}

if (viewport) {
  // initial
  updateServicesUI();

  // scroll updates
  let raf = 0;
  viewport.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateServicesUI);
  }, { passive: true });

  // wheel -> horizontal (lux)
  viewport.addEventListener("wheel", (e) => {
    // allow trackpads to scroll naturally; only intercept vertical intent
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      viewport.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  // keyboard
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const dir = (e.key === "ArrowRight") ? 1 : -1;
      const idx = getIndexFromScroll();
      scrollToIndex(clamp(idx + dir, 0, 3));
    }
  });

  // drag to scroll
  let isDown = false;
  let startX = 0;
  let startLeft = 0;

  viewport.addEventListener("pointerdown", (e) => {
    isDown = true;
    viewport.classList.add("is-dragging");
    startX = e.clientX;
    startLeft = viewport.scrollLeft;
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    viewport.scrollLeft = startLeft - dx;
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    viewport.classList.remove("is-dragging");

    // snap to nearest slide
    const idx = getIndexFromScroll();
    scrollToIndex(idx);
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", endDrag);
}

// arrows
prevBtn?.addEventListener("click", () => {
  const idx = getIndexFromScroll();
  scrollToIndex(clamp(idx - 1, 0, 3));
});
nextBtn?.addEventListener("click", () => {
  const idx = getIndexFromScroll();
  scrollToIndex(clamp(idx + 1, 0, 3));
});

// on resize keep correct snap
window.addEventListener("resize", () => {
  if (!viewport) return;
  const idx = getIndexFromScroll();
  viewport.scrollLeft = idx * getSlideWidth();
  updateServicesUI();
});

