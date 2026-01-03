 /* =========================
   VMC HOME — Luxury V2
========================= */

// year
const y = document.getElementById("y");
if (y) y.textContent = String(new Date().getFullYear());

/* =========================
   reveal on scroll (unobserve)
========================= */
function setupReveal() {
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
}
setupReveal();

/* =========================
   magnetic (rAF)
========================= */
function setupMagnetic() {
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
}
setupMagnetic();

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
    hero_title_1: "نحن لا نصنع محتوى.",
    hero_title_2: "نحن نُغيّر قواعد اللعب.",
    hero_sub:
      "VMC تُحوّل الشهرة إلى “طلب” ثم إلى “دخل” — بنظام واضح: استراتيجية، تنفيذ، توزيع، وقياس.",
    hero_cta_primary: "ابدأ التحوّل",
    hero_cta_secondary: "شاهد النظام",
    meta_1: "جمهور نؤثر عليه",
    meta_2: "سنوات صناعة ترند",
    meta_3: "شبكة تأثير",

    system_title: "نظام VMC",
    system_desc: "الشهرة “ضجيج”. نحن نحولها إلى طلب… ثم إلى دخل… ثم إلى نفوذ قابل للاستمرار.",
    sys_1: "Fame → Attention",
    sys_2: "Attention → Demand",
    sys_3: "Demand → Revenue",
    sys_4: "Revenue → Power",

    sys_k1: "الخطوة 01",
    sys_t1: "الشهرة ليست هدفًا… بل بوابة.",
    sys_p1: "نعيد صياغة ظهورك ليكون “لافتًا” و“متداولًا” دون فقدان هيبتك. هوك، زوايا، توقيت، توزيع.",
    sys_b11: "Hook Engineering",
    sys_b12: "Trend Angles",
    sys_b13: "Distribution",

    sys_k2: "الخطوة 02",
    sys_t2: "الانتباه وحده لا يكفي… نخلق “طلب”.",
    sys_p2: "نضبط تموضعك كبراند شخصي — بحيث يصبح وجودك “مرغوبًا” للمتابعين وللشركات معًا.",
    sys_b21: "Brand Positioning",
    sys_b22: "Content Architecture",
    sys_b23: "Deal Readiness",

    sys_k3: "الخطوة 03",
    sys_t3: "نربط الطلب بالدخل — بشكل محسوب.",
    sys_p3: "عروض، رعايات، Funnels، حملات أداء… مع قياس مستمر لرفع ما يهم فعلاً: الدخل والطلبات.",
    sys_b31: "Monetization",
    sys_b32: "Funnels",
    sys_b33: "Performance",

    sys_k4: "الخطوة 04",
    sys_t4: "هذا ليس “ترند”… هذا نفوذ.",
    sys_p4: "نبني استمرارية: نظام محتوى، علاقات، وتوزيع… يجعل النتائج تتكرر بدون استنزاف صورتك.",
    sys_b41: "Sustainability",
    sys_b42: "Network",
    sys_b43: "Scale",

    cap_title: "ما نتحكم به",
    cap_desc: "أقل كلام… تأثير أكبر. هذه هي الأعمدة التي تبني النمو والدخل بدون فوضى.",
    c1_t: "Trend Engineering",
    c1_p: "نصنع “زاوية” قابلة للتكرار — لا ضربة حظ.",
    c2_t: "Celebrity Control",
    c2_p: "إدارة ظهورك، صورتك، وشراكاتك… بدقة.",
    c3_t: "Monetization Architecture",
    c3_p: "من الانتباه إلى عروض ودخل بتتبّع وقياس.",
    c4_t: "Premium Production",
    c4_p: "تنفيذ فاخر يخدم الهدف: Retention + Conversion.",
    cap_cta: "اطلب خطة مبدئية",

    work_title: "أعمال مختارة",
    work_desc: "ضع هنا لاحقًا 3 حالات (Case Studies). الآن نعرض قالبًا فخمًا جاهزًا للاستبدال.",
    w1_m: "Growth • TikTok",
    w1_t: "من انتشار إلى طلب",
    w1_p: "نظام هوك + توزيع + تكرار… يرفع الطلب بدل أرقام فارغة.",
    w2_m: "Brand • Instagram",
    w2_t: "إدارة شراكات فاخرة",
    w2_p: "تموضع + هوية + صفقات… بدون كسر المصداقية.",
    w3_m: "Monetization • YouTube",
    w3_t: "Revenue System",
    w3_p: "Funnels + عروض + قياس… لتكرار الدخل بشكل أنيق.",

    final_title: "جاهز تتحول من مشهور… إلى قوة تبيع؟",
    final_desc: "أرسل حسابك وهدفك—وسنقترح مسارًا واضحًا: ترند → طلب → دخل → نفوذ.",
    final_cta: "اطلب جلسة استراتيجية",
    final_cta2: "ارجع للأعلى",
  },

  en: {
    nav_system: "System",
    nav_capabilities: "Capabilities",
    nav_work: "Work",
    nav_contact: "Contact",

    hero_kicker: "Berlin × MENA • Trends • Celebrities • Revenue",
    hero_title_1: "We don’t create content.",
    hero_title_2: "We change the rules.",
    hero_sub:
      "VMC turns fame into demand — then into revenue — through a clear system: strategy, execution, distribution, and measurement.",
    hero_cta_primary: "Start the shift",
    hero_cta_secondary: "See the system",
    meta_1: "Audience influenced",
    meta_2: "Years of trend-making",
    meta_3: "Influence network",

    system_title: "The VMC System",
    system_desc: "Fame is noise. We turn it into demand, then revenue, then sustainable power.",
    sys_1: "Fame → Attention",
    sys_2: "Attention → Demand",
    sys_3: "Demand → Revenue",
    sys_4: "Revenue → Power",

    sys_k1: "Step 01",
    sys_t1: "Fame isn’t the goal. It’s the doorway.",
    sys_p1: "We reframe your presence to become notable and shareable without hurting credibility. Hooks, angles, timing, distribution.",
    sys_b11: "Hook Engineering",
    sys_b12: "Trend Angles",
    sys_b13: "Distribution",

    sys_k2: "Step 02",
    sys_t2: "Attention isn’t enough. We create demand.",
    sys_p2: "We position your personal brand so you become desirable to audiences and brands — at the same time.",
    sys_b21: "Brand Positioning",
    sys_b22: "Content Architecture",
    sys_b23: "Deal Readiness",

    sys_k3: "Step 03",
    sys_t3: "We connect demand to revenue — precisely.",
    sys_p3: "Offers, sponsorships, funnels, performance campaigns — measured and optimized for what matters: revenue and inquiries.",
    sys_b31: "Monetization",
    sys_b32: "Funnels",
    sys_b33: "Performance",

    sys_k4: "Step 04",
    sys_t4: "Not a trend. Power.",
    sys_p4: "We build repeatable outcomes: content systems, relationships, and distribution — without burning the brand.",
    sys_b41: "Sustainability",
    sys_b42: "Network",
    sys_b43: "Scale",

    cap_title: "What We Control",
    cap_desc: "Less talk, more impact. These pillars build growth and revenue without chaos.",
    c1_t: "Trend Engineering",
    c1_p: "We design repeatable angles — not lucky hits.",
    c2_t: "Celebrity Control",
    c2_p: "We manage presence, image, and partnerships — with precision.",
    c3_t: "Monetization Architecture",
    c3_p: "From attention to offers and revenue, tracked and measured.",
    c4_t: "Premium Production",
    c4_p: "Luxury execution built for retention and conversion.",
    cap_cta: "Request a starter plan",

    work_title: "Selected Work",
    work_desc: "Replace these with 3 case studies later. For now, a luxury-ready placeholder layout.",
    w1_m: "Growth • TikTok",
    w1_t: "From reach to demand",
    w1_p: "Hooks + distribution + repetition that increases demand — not vanity metrics.",
    w2_m: "Brand • Instagram",
    w2_t: "Luxury partnerships",
    w2_p: "Positioning + identity + deals — without breaking trust.",
    w3_m: "Monetization • YouTube",
    w3_t: "Revenue System",
    w3_p: "Funnels + offers + measurement for repeatable revenue.",

    final_title: "Ready to turn fame into selling power?",
    final_desc: "Send your account and goal — we’ll map a clear path: trend → demand → revenue → power.",
    final_cta: "Request a strategy session",
    final_cta2: "Back to top",
  },
};

let lang = "ar";
const langBtn = document.getElementById("langBtn");
const langLabel = document.getElementById("langLabel");

function safeGetLang() {
  try { return localStorage.getItem("vmc_lang"); } catch { return null; }
}
function safeSetLang(v) {
  try { localStorage.setItem("vmc_lang", v); } catch {}
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
   System controller (steps + panels)
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
    // gentle scroll into stage (keeps premium feel)
    document.querySelector("#system")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Scroll-based activation (via IntersectionObserver on hidden marks)
if ("IntersectionObserver" in window && marks.length) {
  const io = new IntersectionObserver(
    (entries) => {
      // pick the most visible mark
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

