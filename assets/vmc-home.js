 /* =========================
   VMC HOME — Luxury V3 (Final)
========================= */

// year
const y = document.getElementById("y");
if (y) y.textContent = String(new Date().getFullYear());

/* =========================
   Reveal on scroll (unobserve)
========================= */
(function setupReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("is-in"));
  }
})();

/* =========================
   Magnetic buttons (rAF)
========================= */
(function setupMagnetic() {
  const items = document.querySelectorAll(".magnetic");
  if (!items.length) return;

  items.forEach((el) => {
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
})();

/* =========================
   i18n (AR/EN)
========================= */
const dict = {
  ar: {
    nav_system: "النظام",
    nav_capabilities: "قدراتنا",
    nav_work: "أعمالنا",
    nav_contact: "تواصل",

    hero_kicker: "برلين × الشرق الأوسط • ترند • مشاهير • دخل",
    hero_title_1: "نحوّل شهرتك",
    hero_title_2: "إلى طلب… ثم دخل… ثم نفوذ",
    hero_sub: "ليست ضربة حظ. نظام واضح: Trend Engineering → Distribution → Monetization → Scale.",
    hero_cta_primary: "اطلب جلسة استراتيجية",
    hero_cta_secondary: "شاهد النظام",

    meta_1: "جمهور نؤثر عليه",
    meta_2: "سنوات صناعة ترند",
    meta_3: "شبكة تأثير",

    reel_1: "زاوية ترند قابلة للتكرار",
    reel_2: "تموضع يصنع “طلب”",
    reel_3: "فَنل + عروض + قياس",
    reel_hint: "حرّك الماوس / اسحب… وشاهد “اللمعة”",

    system_title: "نظام VMC",
    system_desc: "4 خطوات فقط… لكنها تُغيّر اللعبة.",
    sys_1: "Fame → Attention",
    sys_2: "Attention → Demand",
    sys_3: "Demand → Revenue",
    sys_4: "Revenue → Power",

    sys_k1: "الخطوة 01",
    sys_t1: "نصنع انتباهًا “مُستحقًا”.",
    sys_p1: "صياغة ظهورك لتصبح “ملحوظًا” و“مُتداولًا” بدون ابتذال.",
    sys_b11: "Hook Engineering",
    sys_b12: "Trend Angles",
    sys_b13: "Distribution",

    sys_k2: "الخطوة 02",
    sys_t2: "نحوّل الانتباه إلى “طلب”.",
    sys_p2: "تموضع براند شخصي + هوية + تقويم… يجعل السوق يريدك.",
    sys_b21: "Brand Positioning",
    sys_b22: "Content Architecture",
    sys_b23: "Deal Readiness",

    sys_k3: "الخطوة 03",
    sys_t3: "نربط الطلب بالدخل.",
    sys_p3: "عروض ورعايات وفَنلات أداء—مع قياس وتحسين مستمر.",
    sys_b31: "Monetization",
    sys_b32: "Funnels",
    sys_b33: "Performance",

    sys_k4: "الخطوة 04",
    sys_t4: "استمرارية = نفوذ.",
    sys_p4: "نظام تكرار النتائج بدون إنهاك أو تشويه صورة.",
    sys_b41: "Sustainability",
    sys_b42: "Network",
    sys_b43: "Scale",

    cap_title: "قدراتنا",
    cap_desc: "أربع قدرات… تُنتج نتيجة.",
    c1_t: "Trend Engineering",
    c1_p: "زاوية + هوك + توقيت… بشكل متكرر.",
    c2_t: "Celebrity Control",
    c2_p: "إدارة ظهور + صورة + صفقات.",
    c3_t: "Monetization",
    c3_p: "عروض وفَنلات أداء وقياس.",
    c4_t: "Premium Production",
    c4_p: "تنفيذ فاخر يخدم Retention + Conversion.",

    work_title: "أعمال مختارة",
    work_desc: "ضع هنا لاحقًا 3 Case Studies.",
    w1_t: "من انتشار إلى طلب",
    w1_p: "نظام تكرار… بدل “ضربة”.",
    w2_t: "شراكات فاخرة",
    w2_p: "تموضع + هوية + عقود.",
    w3_t: "Revenue System",
    w3_p: "Funnels + قياس + تحسين.",

    final_title: "جاهز نبدأ؟",
    final_desc: "أرسل حسابك وهدفك—وسنرسل لك مسارًا واضحًا خلال 48 ساعة.",
    final_cta: "اطلب جلسة استراتيجية",
    final_cta2: "ارجع للأعلى",
  },

  en: {
    nav_system: "System",
    nav_capabilities: "Capabilities",
    nav_work: "Work",
    nav_contact: "Contact",

    hero_kicker: "Berlin × MENA • Trends • Celebrities • Revenue",
    hero_title_1: "We turn fame",
    hero_title_2: "into demand… then revenue… then power",
    hero_sub: "Not luck. A clear system: Trend Engineering → Distribution → Monetization → Scale.",
    hero_cta_primary: "Request a strategy session",
    hero_cta_secondary: "See the system",

    meta_1: "Audience influenced",
    meta_2: "Years of trend-making",
    meta_3: "Influence network",

    reel_1: "Repeatable trend angles",
    reel_2: "Positioning that creates demand",
    reel_3: "Funnels + offers + measurement",
    reel_hint: "Move your cursor / drag… watch the shine",

    system_title: "The VMC System",
    system_desc: "Four steps. One outcome: power.",
    sys_1: "Fame → Attention",
    sys_2: "Attention → Demand",
    sys_3: "Demand → Revenue",
    sys_4: "Revenue → Power",

    sys_k1: "Step 01",
    sys_t1: "We earn attention.",
    sys_p1: "Make you notable and shareable — without cheap tactics.",
    sys_b11: "Hook Engineering",
    sys_b12: "Trend Angles",
    sys_b13: "Distribution",

    sys_k2: "Step 02",
    sys_t2: "We turn attention into demand.",
    sys_p2: "Positioning + identity + calendar — the market starts wanting you.",
    sys_b21: "Brand Positioning",
    sys_b22: "Content Architecture",
    sys_b23: "Deal Readiness",

    sys_k3: "Step 03",
    sys_t3: "We connect demand to revenue.",
    sys_p3: "Offers, funnels, performance — measured and optimized.",
    sys_b31: "Monetization",
    sys_b32: "Funnels",
    sys_b33: "Performance",

    sys_k4: "Step 04",
    sys_t4: "Consistency becomes power.",
    sys_p4: "Repeat outcomes without burning the brand.",
    sys_b41: "Sustainability",
    sys_b42: "Network",
    sys_b43: "Scale",

    cap_title: "Capabilities",
    cap_desc: "Four capabilities. One outcome.",
    c1_t: "Trend Engineering",
    c1_p: "Angle + hook + timing — repeatably.",
    c2_t: "Celebrity Control",
    c2_p: "Presence + image + deals — precisely.",
    c3_t: "Monetization",
    c3_p: "Offers, funnels, measurement.",
    c4_t: "Premium Production",
    c4_p: "Luxury execution for retention + conversion.",

    work_title: "Selected Work",
    work_desc: "Replace with 3 case studies later.",
    w1_t: "From reach to demand",
    w1_p: "Repeatable systems — not lucky hits.",
    w2_t: "Luxury partnerships",
    w2_p: "Positioning + identity + contracts.",
    w3_t: "Revenue System",
    w3_p: "Funnels + measurement + optimization.",

    final_title: "Ready to start?",
    final_desc: "Send your account and goal — we’ll reply with a clear path within 48 hours.",
    final_cta: "Request a strategy session",
    final_cta2: "Back to top",
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
  } catch {}
}

function applyLang(next) {
  lang = next === "en" ? "en" : "ar";
  safeSetLang(lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  if (langLabel) langLabel.textContent = lang === "ar" ? "EN" : "AR";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const v = dict[lang]?.[key];
    if (typeof v === "string") el.textContent = v;
  });
}
applyLang(safeGetLang() || "ar");
langBtn?.addEventListener("click", () => applyLang(lang === "ar" ? "en" : "ar"));

/* =========================
   Count-up (premium feel)
========================= */
function formatCount(n, mode) {
  if (mode === "short") {
    if (n >= 1000000) return `${Math.round(n / 1000000)}M+`;
    if (n >= 1000) return `${Math.round(n / 1000)}K+`;
    return String(n);
  }
  if (mode === "plus") return `${n}+`;
  return String(n);
}

(function setupCountUp() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;

  const run = (el) => {
    const to = Number(el.getAttribute("data-count") || "0");
    const mode = el.getAttribute("data-format") || "";
    const dur = 900;
    const start = performance.now();
    const from = 0;

    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = formatCount(val, mode);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            run(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.35 }
    );
    nums.forEach((n) => io.observe(n));
  } else {
    nums.forEach(run);
  }
})();

/* =========================
   System controller
========================= */
const railSteps = Array.from(document.querySelectorAll(".step"));
const panels = Array.from(document.querySelectorAll(".panel"));
const marks = Array.from(document.querySelectorAll(".mark"));

function setActive(i) {
  railSteps.forEach((b, idx) => b.classList.toggle("is-active", idx === i));
  panels.forEach((p, idx) => p.classList.toggle("is-active", idx === i));
}

railSteps.forEach((btn) => {
  btn.addEventListener("click", () => {
    const i = Number(btn.getAttribute("data-step") || "0");
    setActive(i);
    document.querySelector("#system")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if ("IntersectionObserver" in window && marks.length) {
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
      if (!visible) return;

      const i = Number(visible.target.getAttribute("data-mark") || "0");
      setActive(i);
    },
    { threshold: [0.15, 0.35, 0.55] }
  );
  marks.forEach((m) => io.observe(m));
}

/* =========================
   Reel Parallax + Shine (signature)
========================= */
(function setupReel() {
  const reel = document.getElementById("reel");
  if (!reel) return;

  const cards = Array.from(reel.querySelectorAll(".reelCard"));
  if (!cards.length) return;

  let raf = 0;
  let px = 0.5,
    py = 0.5;

  const apply = () => {
    raf = 0;

    const rx = (py - 0.5) * 10; // -5..5
    const ry = (px - 0.5) * -12; // -6..6

    cards.forEach((c, i) => {
      const depth = (i + 1) * 6;
      c.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${depth}px)`;
      c.style.setProperty("--shift", `${px * 50 - 25}%`);
    });
  };

  const onMove = (ev) => {
    const r = reel.getBoundingClientRect();
    px = (ev.clientX - r.left) / r.width;
    py = (ev.clientY - r.top) / r.height;
    px = Math.max(0, Math.min(1, px));
    py = Math.max(0, Math.min(1, py));

    if (raf) return;
    raf = requestAnimationFrame(apply);
  };

  reel.addEventListener("pointermove", onMove, { passive: true });

  reel.addEventListener("pointerleave", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;

    cards.forEach((c) => {
      c.style.transform = "";
      c.style.removeProperty("--shift");
    });
  });
})();

