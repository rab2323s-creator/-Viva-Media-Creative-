/* =========================
   VMC HOME (Final JS)
   - Year
   - Scroll reveal
   - Magnetic buttons
   - AR/EN toggle (no URL change)
   - Sticky Services Scenes (stable)
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

// i18n (AR/EN) without changing URLs
const dict = {
  ar: {
    nav_services: "الخدمات",
    nav_tenets: "مبادئنا",
    nav_trusted: "عملاؤنا",
    nav_contact: "تواصل",

    hero_kicker: "وكالة فخمة للتسويق والإنتاج الإبداعي • تصميم • فيلم • أداء",
    hero_title_1: "نصنع حضورًا",
    hero_title_2: "يشبه العلامات العالمية",
    hero_sub:
      "ندمج التصميم الراقي مع السرد السينمائي واستراتيجية الأداء—لنجعل علامتك تبدو “باهظة الثمن” وتحقق نتائج ملموسة.",
    hero_cta_primary: "ابدأ مشروعك",
    hero_cta_secondary: "استكشف الخدمات",
    meta_1: "وصول جماهيري",
    meta_2: "سنوات خبرة",
    meta_3: "نطاق عمل",

    services_cap: "Services",
    services_title: "خدماتنا",
    services_desc:
      "باقات تنفيذ “بوتيك” بجودة عالمية—بدون حشو. كل قسم مصمم ليبدو مثل صفحة وكالة دولية.",
    contact_us: "تواصل معنا",

    s1_title: "استراتيجية وتسويق",
    s1_desc: "تحديد التموضع، الرسالة، جمهورك، وخطة المحتوى—قبل أي تصوير أو تصميم.",
    s2_title: "هوية وتصميم فاخر",
    s2_desc: "Design system، قوالب سوشيال، هوية مرئية—تبدو راقية ومتسقة على كل منصة.",
    s3_title: "إنتاج سينمائي ومحتوى",
    s3_desc: "إعلانات، Reels، قصص—مشاهد “نظيفة” بتفاصيل تصوير ومونتاج محسوبة.",
    s4_title: "أداء وتحويل",
    s4_desc: "Landing pages، تتبع، تحسين Conversion—نقيس ونكرر حتى تتحول المشاهدات لعملاء.",

    tenets_title: "مبادئنا",
    tenets_desc: "الفخامة ليست “زينة”… الفخامة = وضوح + تناسق + قرار إبداعي قوي.",
    t1: "وضوح الرسالة",
    t1d: "نكتب ما يُفهم بسرعة—ثم نصممه بطريقة تُحس.",
    t2: "جودة التنفيذ",
    t2d: "تفاصيل صغيرة تصنع فرقًا كبيرًا: حركة، مسافات، إيقاع.",
    t3: "اتساق الهوية",
    t3d: "نظام تصميم يحمي صورتك عبر كل منصة.",
    t4: "إبداع يقاس",
    t4d: "نحب الجمال… لكن نحب النتائج أكثر.",
    t5: "سرعة بدون فوضى",
    t5d: "نُنجز بسرعة مع نظام واضح ومسار تسليم نظيف.",
    t6: "طابع عالمي",
    t6d: "لغة بصرية تناسب برلين… كما تناسب دبي.",

    trusted_title: "يثق بنا",
    trusted_note: "حاليًا نستخدم شعارات “Placeholder” — وعندما تجهز قائمة العملاء، نستبدلها فورًا.",

    final_title: "جاهز لتبدو “Premium”؟",
    final_desc: "أرسل هدفك ونوع المشروع—وسنقترح اتجاهًا فخمًا مع خطة تحويل واضحة.",
    final_cta: "اطلب عرض سعر",
  },

  en: {
    nav_services: "Services",
    nav_tenets: "Tenets",
    nav_trusted: "Trusted",
    nav_contact: "Contact",

    hero_kicker: "Luxury Creative & Marketing Agency • Design • Film • Performance",
    hero_title_1: "We craft presence",
    hero_title_2: "that feels globally premium",
    hero_sub:
      "We blend luxury design, cinematic storytelling, and performance strategy—built to look expensive and convert.",
    hero_cta_primary: "Start a Project",
    hero_cta_secondary: "Explore Services",
    meta_1: "Audience Reach",
    meta_2: "Years Experience",
    meta_3: "Operating Range",

    services_cap: "Services",
    services_title: "What we do",
    services_desc:
      "Boutique execution with global polish—no fluff. Each section is built to feel like a top-tier agency.",
    contact_us: "Contact us",

    s1_title: "Strategy & Marketing",
    s1_desc: "Positioning, messaging, audience, and a content roadmap—before production begins.",
    s2_title: "Luxury Branding & Design",
    s2_desc: "Design systems, social templates, visual identity—premium consistency across platforms.",
    s3_title: "Cinematic Production",
    s3_desc: "Ads, reels, storytelling—clean frames with intentional editing and pacing.",
    s4_title: "Performance & Conversion",
    s4_desc: "Landing pages, tracking, CRO—measured creative that turns views into clients.",

    tenets_title: "Our Tenets",
    tenets_desc: "Luxury isn’t decoration. Luxury = clarity + consistency + decisive craft.",
    t1: "Clarity",
    t1d: "Say it fast. Make it felt.",
    t2: "Craft",
    t2d: "Micro-details: motion, spacing, rhythm.",
    t3: "Consistency",
    t3d: "A system that protects your brand everywhere.",
    t4: "Measurable creativity",
    t4d: "Beauty—then results.",
    t5: "Fast, not messy",
    t5d: "Speed with a clean delivery process.",
    t6: "Global taste",
    t6d: "A visual language that works worldwide.",

    trusted_title: "Trusted by",
    trusted_note: "We’re using placeholder logos for now—swap them once your client list is ready.",

    final_title: "Ready to look premium?",
    final_desc:
      "Share your goal and project type—we’ll propose a luxury direction with a conversion-first structure.",
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
}

applyLang("ar");

langBtn?.addEventListener("click", () => {
  applyLang(lang === "ar" ? "en" : "ar");
});

/* =========================
   Sticky Services Scenes (stable)
========================= */
(function stickyServices() {
  const stage = document.getElementById("servicesStage");
  if (!stage) return;

  const scenes = Array.from(stage.querySelectorAll(".scene"));
  const visuals = Array.from(stage.querySelectorAll(".visual"));
  const dots = Array.from(stage.querySelectorAll(".dot"));
  const spacer = stage.querySelector(".stage__spacer");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function isMobile() {
    return window.matchMedia("(max-width: 980px)").matches;
  }

  function setActive(idx) {
    scenes.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    visuals.forEach((v, i) => v.classList.toggle("is-active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }

  function onScroll() {
    if (prefersReduced || isMobile() || !spacer) return;

    const vh = window.innerHeight;
    const rect = spacer.getBoundingClientRect();

    // progress 0..1 based on spacer entering/leaving viewport
    const total = spacer.offsetHeight + vh;
    const passed = vh - rect.top;
    const p = Math.min(1, Math.max(0, passed / total));

    // 4 scenes
    const idx = Math.min(3, Math.max(0, Math.floor(p * 4)));
    setActive(idx);
  }

  setActive(0);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
