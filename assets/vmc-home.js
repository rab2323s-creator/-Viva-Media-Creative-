  

// iOS flag for performance tweaks
(function () {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) document.documentElement.classList.add("is-ios");
})();
     /* =========================
   VMC HOME (Slider Services C)
========================= */

// year
const y = document.getElementById("y");
if (y) y.textContent = String(new Date().getFullYear());

// reveal on scroll (lighter: unobserve after first reveal)
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target); // ✅ stop observing after first reveal
        }
      }
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));


// ===== Trusted marquee fixes (no shake + seamless + run only when visible) =====
(function () {
  const marquees = Array.from(document.querySelectorAll(".marquee"));
  if (!marquees.length) return;

  // Make the loop seamless by duplicating track children once (no HTML changes)
  marquees.forEach((mq) => {
    const track = mq.querySelector(".track");
    if (!track || track.dataset.duplicated === "1") return;

    const kids = Array.from(track.children);
    kids.forEach((node) => track.appendChild(node.cloneNode(true)));
    track.dataset.duplicated = "1";
  });

  // Run animation only when marquee is near viewport (reduces work + prevents jitter on scroll)
  if ("IntersectionObserver" in window) {
    const mo = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.classList.add("is-running");
          else en.target.classList.remove("is-running");
        });
      },
      { threshold: 0.05, rootMargin: "120px 0px" }
    );
    marquees.forEach((mq) => mo.observe(mq));
  } else {
    marquees.forEach((mq) => mq.classList.add("is-running"));
  }
})();
} else {
  // fallback: reveal everything if IO not supported
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
}

// magnetic (optimized with requestAnimationFrame)
document.querySelectorAll(".magnetic").forEach((el) => {
  const strength = 10;
  let raf = 0;
  let lastX = 0;
  let lastY = 0;

  el.addEventListener("pointermove", (ev) => {
    const r = el.getBoundingClientRect();
    lastX = ev.clientX - (r.left + r.width / 2);
    lastY = ev.clientY - (r.top + r.height / 2);

    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      el.style.transform = `translate(${lastX / strength}px, ${lastY / strength}px)`;
    });
  });

  el.addEventListener("pointerleave", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
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

   hero_kicker: "تأثير يُدار باحتراف • شراكات تُبنى بذكاء • نتائج تُقاس بالأرقام",
    hero_micro: "We engineer influence — not noise.",
    hero_title_1: "نحوّل شهرتك الرقمية",
    hero_title_2: "إلى تأثير يصنع ترند… ويبيع باستمرار",
    hero_sub:
      "نعمل مع مشاهير وصُنّاع محتوى وعلامات تجارية لربط “الانتشار” بـ “الربح”. استراتيجية + تنفيذ + توزيع + قياس — لتصبح شهرتك مصدر شراكات مدفوعة، مبيعات، ونفوذ حقيقي.",
    hero_cta_primary: "Start Your Growth",
    hero_cta_secondary: "See How We Work",
    hero_cta_elite: "Elite Influencer Partnerships",
    meta_1: "Engaged followers",
    meta_2: "Years of trend-making",
    meta_3: "Influence network",

    services_cap: "Services",
    services_title: "خدماتنا",
    services_desc:
      "نبدأ من الهدف التجاري: ربط المشاهير بالعلامات التجارية، صناعة ترند، ثم تحويله إلى مبيعات — والإنتاج يأتي كأداة تنفيذ تخدم النتائج.",
    services_hint: "اسحب ← → أو استخدم عجلة الماوس",
    contact_us: "تواصل معنا",

    services_seo_title: "خدمات إدارة المشاهير والتسويق عبر المؤثرين",
    services_seo_desc:
      "تقدم Viva Media Creative خدمات متخصصة في إدارة حسابات المشاهير، ربط المؤثرين بالعلامات التجارية، صناعة الترند، وكتابة النصوص الإعلانية التي تحول المشاهدات إلى دخل حقيقي — مع تركيز على الخليج ومصر والعالم العربي.",
    services_seo_li1: "إدارة وربط المشاهير بالعلامات التجارية (Influencer Marketing)",
    services_seo_li2: "إدارة حسابات المشاهير وصنّاع المحتوى",
    services_seo_li3: "صناعة المحتوى والترندات على السوشيال ميديا",
    services_seo_li4: "كتابة السكريبتات والنصوص الإعلانية (Copywriting)",
    services_seo_li5: "التسويق للمواقع والمتاجر الإلكترونية (SEO & Growth)",


    // Slide 1
    s1_title: "إدارة وربط المشاهير بالعلامات التجارية",
    s1_desc:
      "نربط المشاهير وصُنّاع المحتوى بعلامات تجارية مناسبة عبر عقود واضحة — ونحوّل التأثير إلى حملات مدفوعة ونتائج قابلة للقياس (مبيعات / Leads / زيارات).",
    s1_b1: "• التسويق عبر المؤثرين (Influencer Marketing)",
    s1_b2: "• ربط المشاهير بالعلامات التجارية",
    s1_b3: "• تقارير أداء وقياس ROI",
    s1_btn: "تفاصيل خدمة التسويق عبر المؤثرين",

    // Slide 2
    s2_title: "إدارة حسابات المشاهير وصنّاع المحتوى",
    s2_desc:
      "ندير حسابك كعلامة تجارية: تقويم شهري، تنظيم الهوية الرقمية، إدارة النشر، وتحسين الأداء — لتكبر بثبات بدون حرق صورة أو فقدان مصداقية.",
    s2_b1: "• إدارة حسابات إنستغرام للمشاهير",
    s2_b2: "• إدارة حسابات مؤثرين",
    s2_b3: "• نمو + تفاعل + ثقة",
    s2_btn: "تفاصيل خدمة إدارة الحسابات",

    // Slide 3
    s3_title: "صناعة المحتوى والترندات على السوشيال ميديا",
    s3_desc:
      "نصنع ترند بذكاء: زوايا قوية + هوك + توقيت + توزيع. الهدف ليس مشاهدات فقط — بل حضور متكرر يضاعف الوصول ويجذب طلبات حقيقية.",
    s3_b1: "• كيف تصنع ترند",
    s3_b2: "• أفكار فيديوهات ترند",
    s3_b3: "• Viral video strategy",
     s3_btn: "تفاصيل خدمة صناعة الترند",

    // Slide 4
    s4_title: "كتابة النصوص الإعلانية وسيناريوهات الفيديو",
    s4_desc:
      "سكريبتات “تبيع”: هوك أول 3 ثواني، بناء قصة، CTA ذكي، ورسالة تناسب جمهورك. تُربط دائمًا بالإعلانات والترند والربح — لأن النص هو الذي يحرك القرار.",
    s4_b1: "• كتابة سكريبت فيديو",
    s4_b2: "• كتابة نص إعلاني",
    s4_b3: "• Copywriting عربي",
     s4_btn: "تفاصيل خدمة كتابة المحتوى (Copywriting)",

    tenets_title: "مبادئنا",
    tenets_desc: "الشهرة وحدها لا تكفي… نحن نصنع قرارًا ذكيًا خلف كل ظهور: ترند + استمرارية + دخل.",
    t1: "وضوح الرسالة",
    t1d: "نحوّل الفكرة إلى رسالة سريعة وواضحة… ثم نبني لها تنفيذًا يعلق بالذاكرة ويُشارك.",
    t2: "صناعة الترند بذكاء",
    t2d: "نعرف متى نصنع ضجّة… ومتى نبني استمرارية تجعل الجمهور يعود لك يوميًا.",
    t3: "تنفيذ Premium يخدم الهدف",
    t3d: "جودة الصورة والصوت والإيقاع ليست للزينة—بل لرفع المشاهدة والتفاعل والتحويل.",
    t4: "شفافية التعاون",
    t4d: "اتفاقات واضحة تحفظ الحقوق وتضمن الجودة—بدون مفاجآت أو وعود فضفاضة.",
    t5: "توزيع أقوى من الإنتاج",
    t5d: "لا ننتج فقط—نخطط للنشر والتكرار والتوسيع… حتى تصل لنتيجة محسوسة.",
    t6: "نمو ودخل قابلان للقياس",
    t6d: "نقيس ونحلل ثم نكرر ما ينجح—لتزيد الأرقام المهمة: الوصول، الطلبات، والدخل.",

    trusted_title: "نطاق الثقة",
    trusted_note: "نعمل ضمن نطاق محدد من الشراكات عالية التأثير مع مشاهير، صُنّاع محتوى، وعلامات تجارية تُدار بعقلية نمو لا ضجيج. بعض الشراكات تخضع لخصوصية كاملة — لأن الثقة تُبنى على النتائج لا على عرض الأسماء.",

    final_title: "جاهز تتحول من مشهور… إلى علامة تبيع؟",
    final_desc:
      "أرسل حسابك وهدفك—وسنقترح مسارًا واضحًا لصناعة ترند، نمو مستمر، ثم دخل ومبيعات قابلة للقياس.",
    final_cta: "اطلب استشارة الآن",
    service_details: "تفاصيل الخدمة",
    s5_btn: "تفاصيل خدمة SEO & Growth",
    s5_title: "التسويق للمواقع والمتاجر الإلكترونية (SEO & Growth)",
    s5_desc: "نحول الموقع/المتجر إلى ماكينة نمو: SEO + محتوى + صفحات هبوط + Funnels + تحسين تحويل. مناسب لعلامات تجارية تريد مبيعات أعلى مع قابلية قياس واضحة.",
    s5_b1: "• تحسين محركات البحث SEO",
    s5_b2: "• تسويق المتاجر الإلكترونية",
    s5_b3: "• زيادة المبيعات",
    footer_tagline: "نُحوّل التأثير إلى شراكات مدفوعة، مبيعات، ونمو قابل للقياس.",
    footer_links: "روابط سريعة",
    footer_contact: "تواصل",
    footer_cta: "اطلب استشارة",
    footer_region: "النطاق",
    footer_privacy: "الخصوصية",
    footer_terms: "الشروط",
    footer_elite_title: "Elite Influencer Partnerships",
    footer_elite_sub: "للشركات وصنّاع المحتوى من الفئة العليا",
    footer_trust_1: "شراكات آمنة للعلامات",
    footer_trust_2: "نمو يقوده الأداء",


    knowledge_cap: "Knowledge Hub",
    knowledge_title: "مركز المعرفة في التسويق بالمؤثرين وصناعة المحتوى",
    knowledge_desc: "تحليلات وأطر تفكير في التسويق بالمؤثرين، الهوية، وصناعة المحتوى في عصر الذكاء الاصطناعي—لتبدو قراراتك أقرب للعلم منها للتجربة العشوائية.",
    knowledge_cta: "دخول مركز المعرفة",
    k_read: "اقرأ التحليل →",

    k1_tag: "الهوية الشخصية",
    k1_title: "إدارة العلامة الشخصية: من الظهور إلى بناء الثقة",
    k1_desc: "دليل استراتيجي يشرح كيف تُبنى العلامة الشخصية كمنظومة طويلة المدى (هوية، رسالة، اتساق) لا كحضور مؤقت على المنصات.",

    k2_tag: "الهوية في عصر AI",
    k2_title: "هل ستصبح كل العلامات التجارية متشابهة؟",
    k2_desc: "قراءة معمّقة لخطر التشابه الذي يفرضه الذكاء الاصطناعي، وكيف تحمي العلامات التجارية تميزها عبر “خندق الهوية” والقرارات الإبداعية الصحيحة.",

    k3_tag: "المحتوى والذكاء الاصطناعي",
    k3_title: "لماذا ستخسر العلامات التجارية بدون محتوى إنساني؟",
    k3_desc: "إطار واضح يوضح حدود المحتوى الآلي ولماذا “الإشارة الإنسانية” (خبرة، موقف، قصص، مسؤولية) هي مفتاح الثقة والتحويل في 2026.",

  },
  en: {
    nav_services: "Services",
    nav_tenets: "Principles",
    nav_trusted: "Clients",
    nav_contact: "Contact",

    hero_kicker: "Influencer marketing agency • Celebrity & creator management • Partnerships that drive measurable sales",
    hero_micro: "We engineer influence — not noise.",
    hero_title_1: "We turn your digital fame",
    hero_title_2: "into influence that drives trends — and sells repeatedly",
    hero_sub:
      "We connect celebrities and creators with brands through clear deals and measurable outcomes. Strategy + execution + distribution + measurement — built to generate partnerships, sales, and real authority.",
    hero_cta_primary: "Start Your Growth",
    hero_cta_secondary: "See How We Work",
    hero_cta_elite: "Elite Influencer Partnerships",
    meta_1: "Engaged followers",
    meta_2: "Years of trend-making",
    meta_3: "Influence network",

    services_cap: "Services",
    services_title: "What We Do",
    services_desc:
      "We start with business intent: brand–creator partnerships, trend strategy, then conversion to sales — production comes last to serve results.",
    services_hint: "Drag ← → or scroll",
    contact_us: "Contact us",

    services_seo_title: "Celebrity Management & Influencer Marketing Services",
    services_seo_desc:
      "Viva Media Creative delivers influencer marketing, celebrity account management, viral content strategy, conversion copywriting, and SEO growth — focused on the Gulf, Egypt, and the Arab world.",
    services_seo_li1: "Influencer marketing & brand partnerships",
    services_seo_li2: "Celebrity & creator account management",
    services_seo_li3: "Viral content & trend strategy",
    services_seo_li4: "Copywriting & video scripts that convert",
    services_seo_li5: "SEO & growth for websites and e-commerce",


    // Slide 1
    s1_title: "Influencer Marketing & Brand Partnerships",
    s1_desc:
      "We match celebrities and creators with the right brands through clear contracts — turning influence into paid campaigns with measurable results (sales / leads / traffic).",
    s1_b1: "• Influencer marketing strategy",
    s1_b2: "• Brand–creator matchmaking",
    s1_b3: "• ROI tracking & reporting",
    s1_btn: "Influencer Marketing Service Details",
    // Slide 2
    s2_title: "Celebrity & Creator Account Management",
    s2_desc:
      "We run your account like a business: monthly planning, brand identity, publishing ops, and performance optimization — growth without harming credibility.",
    s2_b1: "• Instagram management for influencers",
    s2_b2: "• Creator account operations",
    s2_b3: "• Growth + engagement + trust",
   s2_btn: "Account Management Service Details",

    // Slide 3
    s3_title: "Viral Content & Trend Strategy",
    s3_desc:
      "Trend creation done smart: strong angles, hooks, timing, and distribution. Not just views — consistent demand and real inquiries.",
    s3_b1: "• How to create trends",
    s3_b2: "• Viral video ideas",
    s3_b3: "• Viral strategy system",
    s3_btn: "Viral Strategy Service Details",

    // Slide 4
    s4_title: "Ad Copywriting & Video Scripts",
    s4_desc:
      "Scripts that sell: first-3-seconds hook, story structure, sharp CTA, and platform-native messaging — tied directly to ads, trends, and revenue.",
    s4_b1: "• Video scripts",
    s4_b2: "• Ad copy",
    s4_b3: "• Arabic & English copywriting",
   s4_btn: "Copywriting Service Details",

    tenets_title: "Our Principles",
    tenets_desc:
      "Fame alone is not enough. Every appearance is backed by a smart decision: trend, consistency, and revenue.",
    t1: "Clear positioning",
    t1d: "We turn ideas into sharp, shareable messages.",
    t2: "Smart trend creation",
    t2d: "Knowing when to create noise — and when to build consistency.",
    t3: "Premium execution with purpose",
    t3d: "Visual quality serves retention, engagement, and conversion.",
    t4: "Transparent partnerships",
    t4d: "Clear agreements that protect value and reputation.",
    t5: "Distribution over production",
    t5d: "Publishing, scaling, and repetition until results are felt.",
    t6: "Measurable growth & income",
    t6d: "We track what matters: reach, demand, and revenue.",

    trusted_title: "Trust Scope",
    trusted_note: "We operate within a high-impact partnership scope across celebrities, creators, and brands focused on measurable growth. Some collaborations remain confidential — because trust is built on results, not name-dropping.",

    final_title: "Ready to turn fame into a selling brand?",
    final_desc:
      "Send us your account and goal — we’ll map a clear path to trends, consistent growth, and monetization.",
    final_cta: "Request a Strategy Call",
    service_details: "View service",

s5_btn: "SEO & Growth Service Details",

    
    s5_title: "SEO & Growth for Websites & E-commerce",
    s5_desc: "Turn your website/store into a growth engine: SEO, content, landing pages, funnels, and conversion optimization — built for measurable sales.",
    s5_b1: "• Technical & content SEO",
    s5_b2: "• E-commerce growth",
    s5_b3: "• Conversion optimization",
    footer_tagline: "We turn influence into paid partnerships, measurable sales, and scalable growth.",
    footer_links: "Quick links",
    footer_contact: "Contact",
    footer_cta: "Request a call",
    footer_region: "Region",
    footer_privacy: "Privacy",
    footer_terms: "Terms",
    footer_elite_title: "Elite Influencer Partnerships",
    footer_elite_sub: "For brands & high-profile creators",
    footer_trust_1: "Brand-safe partnerships",
    footer_trust_2: "Performance-led growth",


    knowledge_cap: "Knowledge Hub",
    knowledge_title: "Knowledge Hub for Influencer Marketing & Content Creation",
    knowledge_desc: "Strategic insights and frameworks on influencer marketing, brand identity, and content systems in the age of AI—so decisions feel driven by evidence, not guesswork.",
    knowledge_cta: "Enter the Knowledge Hub",
    k_read: "Read the insight →",

    k1_tag: "AI & CONTENT",
    k1_title: "How AI Is Transforming Content Creation",
    k1_desc: "A foundational perspective on how AI reshapes content workflows—without replacing human strategy, taste, and accountability.",

    k2_tag: "BRAND IDENTITY",
    k2_title: "Will All Brands Become the Same in the Age of AI?",
    k2_desc: "A deep dive into AI-driven homogenization—and how to protect differentiation with identity moats and smarter creative decisions.",

    k3_tag: "HUMAN CONTENT",
    k3_title: "Why Brands Will Lose Without Human Content (2026)",
    k3_desc: "A clear framework on AI limits and why human signals (experience, stance, stories, accountability) drive trust and conversion in 2026.",

  },
};

let lang = "ar";
const langBtn = document.getElementById("langBtn");
const langLabel = document.getElementById("langLabel");

function safeGetLang() {
  try {
    return localStorage.getItem("vmc_lang");
  } catch {
    return null;
  }
}

function safeSetLang(v) {
  try {
    localStorage.setItem("vmc_lang", v);
  } catch {
    // ignore (private mode / blocked storage)
  }
}

function applyLang(next) {
  lang = next === "en" ? "en" : "ar";
  safeSetLang(lang);

  document.documentElement.lang = lang === "ar" ? "ar" : "en";
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  if (langLabel) langLabel.textContent = lang === "ar" ? "EN" : "AR";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const v = dict[lang]?.[key];
    if (typeof v === "string") el.textContent = v;
  });

  // language-aware links (Knowledge Hub + featured insights)
  document.querySelectorAll("[data-href-ar][data-href-en]").forEach((a) => {
    a.setAttribute("href", lang === "ar" ? a.getAttribute("data-href-ar") : a.getAttribute("data-href-en"));
  });

  // update slider progress visuals after language flip
  requestAnimationFrame(() => updateServicesUI());
}

// init language (persisted)
applyLang(safeGetLang() || "ar");

langBtn?.addEventListener("click", () => {
  applyLang(lang === "ar" ? "en" : "ar");
});

/* =========================
   Services Slider C controller
========================= */
const viewport = document.getElementById("servicesViewport");
const bar = document.getElementById("servicesBar");
const slides = viewport ? Array.from(viewport.querySelectorAll(".slide")) : [];
const dotsWrap = document.getElementById("servicesDots");
let dots = Array.from(document.querySelectorAll(".dot2"));

function buildServicesDots() {
  if (!viewport) return;
  if (!dotsWrap || !slides.length) return;
  dotsWrap.innerHTML = slides
    .map((_, i) => `<span class="dot2 ${i === 0 ? "is-active" : ""}" data-i="${i}"></span>`)
    .join("");
  dots = Array.from(dotsWrap.querySelectorAll(".dot2"));
  dotsWrap.addEventListener("click", (e) => {
    const dot = e.target.closest(".dot2");
    if (!dot) return;
    const i = Number(dot.dataset.i);
    scrollToIndex(clamp(i, 0, Math.max(0, slides.length - 1)));
  });
}

const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function getSlideWidth() {
  if (!viewport) return 0;
  return viewport.clientWidth; // each slide = 100% width
}

function getIndexFromScroll() {
  if (!viewport) return 0;
  const w = getSlideWidth();
  if (!w) return 0;
  return clamp(Math.round(viewport.scrollLeft / w), 0, Math.max(0, slides.length - 1));
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
    const total = Math.max(1, slides.length || 1);
    const pct = ((idx + 1) / total) * 100;
    bar.style.width = `${pct}%`;
  }
}

if (viewport) {
  // build dots (dynamic)
  buildServicesDots();

  // initial
  updateServicesUI();

  // scroll updates
  let raf = 0;
  viewport.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateServicesUI);
    },
    { passive: true }
  );

  // wheel -> horizontal (throttled for smoothness)
  let wheelRAF = 0;
  let wheelAcc = 0;
  let wheelT = 0;

  viewport.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      e.preventDefault();
      wheelAcc += e.deltaY;

      if (!wheelRAF) {
        viewport.classList.add("is-dragging");

        wheelRAF = requestAnimationFrame(() => {
          viewport.scrollLeft += wheelAcc;
          wheelAcc = 0;
          wheelRAF = 0;

          clearTimeout(wheelT);
          wheelT = setTimeout(() => viewport.classList.remove("is-dragging"), 120);
        });
      }
    },
    { passive: false }
  );

  // keyboard
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const idx = getIndexFromScroll();
      scrollToIndex(clamp(idx + dir, 0, Math.max(0, slides.length - 1)));
    }
  });

  // drag to scroll (fixed: no click stealing + threshold)
  let isDown = false;
  let moved = false;
  let startX = 0;
  let startLeft = 0;

  viewport.addEventListener("pointerdown", (e) => {
    // Left click / primary touch only
    if (e.button !== 0) return;

    // Don't start dragging when interacting with controls inside a slide
    if (e.target.closest("a, button, [role='button'], input, textarea, select, label")) return;

    isDown = true;
    moved = false;
    startX = e.clientX;
    startLeft = viewport.scrollLeft;
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!isDown) return;

    const dx = e.clientX - startX;

    // Small threshold so taps/clicks don't become drags
    if (!moved && Math.abs(dx) < 6) return;

    if (!moved) {
      moved = true;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture?.(e.pointerId);
    }

    viewport.scrollLeft = startLeft - dx;
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;

    if (moved) {
      viewport.classList.remove("is-dragging");

      // snap to nearest slide
      const idx = getIndexFromScroll();
      scrollToIndex(idx);
    }

    moved = false;
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", endDrag);
}

// arrows
prevBtn?.addEventListener("click", () => {
  const idx = getIndexFromScroll();
  scrollToIndex(clamp(idx - 1, 0, Math.max(0, slides.length - 1)));
});
nextBtn?.addEventListener("click", () => {
  const idx = getIndexFromScroll();
  scrollToIndex(clamp(idx + 1, 0, Math.max(0, slides.length - 1)));
});

// on resize keep correct snap
window.addEventListener("resize", () => {
  if (!viewport) return;
  const idx = getIndexFromScroll();
  viewport.scrollLeft = idx * getSlideWidth();
  updateServicesUI();
});



