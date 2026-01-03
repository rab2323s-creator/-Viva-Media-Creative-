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

    hero_kicker: "وكالة متخصصة في صناعة الترند • إدارة المشاهير • تحويل الشهرة إلى دخل",
    hero_title_1: "نحوّل شهرتك الرقمية",
    hero_title_2: "إلى تأثير يصنع ترند… ويبيع باستمرار",
    hero_sub:
      "نعمل مع مشاهير، صُنّاع محتوى، وصفحات كبرى لنقلك من “الانتشار” إلى “القيمة”. استراتيجية + تنفيذ + توزيع + قياس — ليصبح محتواك مصدر رعايات ومبيعات ونفوذ حقيقي.",
    globe_text: "VIVA MEDIA CREATIVE • ترند • تأثير • نمو • مبيعات •",
    hero_cta_primary: "ابدأ طريق الترند",
    hero_cta_secondary: "شاهد كيف نعمل",
    meta_1: "متابعون نؤثر عليهم",
    meta_2: "سنوات صناعة ترند",
    meta_3: "شبكة تأثير",

    services_cap: "Services",
    services_title: "خدماتنا",
    services_desc:
      "نحن لا نبدأ بالكاميرا… نبدأ بالترند، ثم النمو، ثم البيع — وبعدها يأتي الإنتاج كأداة تنفيذ تخدم النتائج.",
    services_hint: "اسحب ← → أو استخدم عجلة الماوس",
    contact_us: "تواصل معنا",

    // Slide 1
    s1_title: "صناعة الترند والنمو السريع",
    s1_desc:
      "نحلّل حسابك، جمهورك، ومنصّتك—ثم نبني استراتيجية تجعل اسمك حاضرًا، متداولًا، ومطلوبًا باستمرار. هوك + زوايا + توقيت + توزيع… لنمو واضح وليس عشوائي.",
    s1_b1: "• أفكار ترند أسبوعية",
    s1_b2: "• تحليل خوارزميات",
    s1_b3: "• خطة نمو قابلة للقياس",

    // Slide 2
    s2_title: "إدارة المشاهير والبراند الشخصي",
    s2_desc:
      "ندير حسابك كعلامة تجارية: تقويم محتوى، هوية رقمية، ظهور ذكي، وتعاونات مدفوعة بعقود واضحة— لتكبر بثبات بدون حرق صورتك أو فقدان مصداقيتك.",
    s2_b1: "• تقويم محتوى شهري",
    s2_b2: "• بناء هوية قوية",
    s2_b3: "• إدارة رعايات وشراكات",

    // Slide 3
    s3_title: "تحويل الشهرة إلى دخل ومبيعات",
    s3_desc:
      "نربط الانتشار بالربح: رعايات، عروض، حملات، وFunnel واضح—مع تتبّع وقياس لتحسين النتائج. لا “أرقام فارغة”… بل دخل يتصاعد وطلبات تزيد.",
    s3_b1: "• عروض ورعايات مدروسة",
    s3_b2: "• Funnel وتسويق بالأداء",
    s3_b3: "• تقارير وقياس نتائج",

    // Slide 4
    s4_title: "إنتاج فيديوهات وإعلانات (Premium)",
    s4_desc:
      "هنا يأتي التنفيذ الذي يخدم الاستراتيجية: كتابة سكريبت، تصوير/Remote Production، مونتاج فاخر، Shorts/Reels، وإعلانات جاهزة للنشر—بإيقاع يجعل الجمهور يكمل، يتفاعل، ويشارك.",
    s4_b1: "• سكريبت + هوك قوي",
    s4_b2: "• مونتاج يخدم المشاهدة",
    s4_b3: "• فيديوهات ترند وريلز",

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

    trusted_title: "يثق بنا",
    trusted_note: "حاليًا نستخدم شعارات “Placeholder” — وعندما تجهز قائمة العملاء، نستبدلها فورًا.",

    final_title: "جاهز تتحول من مشهور… إلى علامة تبيع؟",
    final_desc:
      "أرسل حسابك وهدفك—وسنقترح مسارًا واضحًا لصناعة ترند، نمو مستمر، ثم دخل ومبيعات قابلة للقياس.",
    final_cta: "اطلب استشارة الآن",
  },

  en: {
    nav_services: "Services",
    nav_tenets: "Principles",
    nav_trusted: "Clients",
    nav_contact: "Contact",

    hero_kicker: "Trend-making agency • Celebrity management • Monetization & growth",
    hero_title_1: "We turn digital fame",
    hero_title_2: "into trends that sell — repeatedly",
    hero_sub:
      "We work with celebrities, creators, and large pages to move you from reach to real value. Strategy, execution, distribution, and measurement — built to generate deals, revenue, and influence.",
    globe_text: "VIVA MEDIA CREATIVE • TRENDS • INFLUENCE • GROWTH • SALES •",
    hero_cta_primary: "Start Your Growth",
    hero_cta_secondary: "See How We Work",
    meta_1: "Engaged followers",
    meta_2: "Years of trend-making",
    meta_3: "Influence network",

    services_cap: "Services",
    services_title: "What We Do",
    services_desc:
      "We don’t start with the camera. We start with trends, then growth, then monetization — production comes last to serve results.",
    services_hint: "Drag ← → or scroll",
    contact_us: "Contact us",

    // Slide 1
    s1_title: "Trend Creation & Rapid Growth",
    s1_desc:
      "We analyze your account, audience, and platform — then build a system that keeps your name visible, talked about, and in demand. Hooks, angles, timing, and distribution for real growth.",
    s1_b1: "• Weekly trend ideas",
    s1_b2: "• Algorithm analysis",
    s1_b3: "• Measurable growth plan",

    // Slide 2
    s2_title: "Celebrity & Personal Brand Management",
    s2_desc:
      "We manage your presence as a brand: content calendars, digital identity, smart positioning, and paid collaborations — scaling without damaging credibility.",
    s2_b1: "• Monthly content planning",
    s2_b2: "• Strong brand identity",
    s2_b3: "• Deals & sponsorship management",

    // Slide 3
    s3_title: "Turning Fame into Revenue",
    s3_desc:
      "We connect reach to income: sponsorships, offers, campaigns, and performance funnels — tracked, optimized, and scaled. No vanity metrics. Real revenue.",
    s3_b1: "• Strategic sponsorships",
    s3_b2: "• Funnels & performance marketing",
    s3_b3: "• Revenue tracking & reports",

    // Slide 4
    s4_title: "Premium Video & Ad Production",
    s4_desc:
      "Execution that serves strategy: scripting, filming or remote production, premium editing, shorts and reels — designed to retain attention, drive engagement, and convert.",
    s4_b1: "• Scripts & strong hooks",
    s4_b2: "• Retention-focused editing",
    s4_b3: "• Trend-driven videos",

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

    trusted_title: "Trusted By",
    trusted_note: "Logos are placeholders for now — we’ll replace them once client approvals are ready.",

    final_title: "Ready to turn fame into a selling brand?",
    final_desc:
      "Send us your account and goal — we’ll map a clear path to trends, consistent growth, and monetization.",
    final_cta: "Request a Strategy Call",
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
const dots = Array.from(document.querySelectorAll(".dot2"));
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
  viewport.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateServicesUI);
    },
    { passive: true }
  );

  // wheel -> horizontal
  viewport.addEventListener(
    "wheel",
    (e) => {
      // allow trackpads to scroll naturally; only intercept vertical intent
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        viewport.scrollLeft += e.deltaY;
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


