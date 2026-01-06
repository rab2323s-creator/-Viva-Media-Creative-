(() => {
  const state = {
    lang: "ar" // default
  };

  const dict = {
    ar: {
      tagline: "Influencer Partnerships • Strategy • Growth",
      nav_service: "صفحة الخدمة",
      nav_contact: "تواصل",

      elite_badge: "Elite Partnerships",
      hero_title: "نحوّل التأثير إلى شراكات مدفوعة ونتائج حقيقية",
      hero_lead:
        "نربط المشاهير وصنّاع المحتوى بعلامات تجارية مناسبة عبر عقود واضحة — ونحوّل التأثير الرقمي إلى حملات مدفوعة ونتائج قابلة للقياس (مبيعات / Leads / زيارات).",

      cta_creator: "👑 أنا مؤثر / صانع محتوى",
      cta_brand: "🏢 أنا علامة تجارية",

      m1: "تقارير أداء وقياس",
      m2: "عقود واضحة وشفافة",
      m3: "نمو قابل للاستمرار",

      creators_title: "للمشاهير وصنّاع المحتوى",
      creators_sub: "حوّل تأثيرك إلى دخل… بدون أن تساوم على قيمتك.",
      c1: "تحويل الشهرة إلى دخل مستدام",
      c2: "الوصول إلى علامات تجارية حقيقية",
      c3: "إدارة احترافية للعقود والتعاونات",
      c4: "حماية الحقوق المالية والمعنوية",
      c5: "بناء صورة مؤثر موثوق أمام المعلنين",
      cta_creator_now: "اطلب شراكة كمؤثر",

      brands_title: "للعلامات التجارية",
      brands_sub: "Influencer Marketing لا يطارد المشاهدات… بل يحقق نتائج.",
      b1: "اختيار المؤثر المناسب بدقة",
      b2: "حملات مدروسة مبنية على هدف تجاري",
      b3: "وصول لجمهور حقيقي غير وهمي",
      b4: "تقارير أداء وقياس ROI",
      b5: "بناء علاقات طويلة الأمد مع السوق",
      cta_brand_now: "ناقش حملة كشركة",

      what_kicker: "ما هي الخدمة فعلًا؟",
      what_title: "إدارة شراكات… لا وساطة عابرة",
      what_p1:
        "“إدارة وربط المشاهير بالعلامات التجارية” هي خدمة متكاملة نعمل فيها كمدير شراكات: نحلل، نطابق، نتفاوض، نوثق، ننفّذ، ثم نقيس ونحسّن — لضمان قيمة حقيقية للطرفين.",

      fail_kicker: "لماذا تفشل أغلب شراكات المؤثرين؟",
      fail_title: "لأن الشهرة وحدها لا تكفي",
      fail_p:
        "كثير من التعاونات تفشل بسبب اختيار خاطئ، غياب عقود واضحة، أو التركيز على المشاهدات بدل النتائج. في Viva Media Creative نعيد تعريف Influencer Marketing ليصبح أداة نمو حقيقية — لا إعلانًا عابرًا.",
      fail_1: "اختيار غير مناسب بين الجمهور والمنتج",
      fail_2: "رسائل غير متسقة مع هوية المؤثر",
      fail_3: "غياب بنود واضحة (حقوق/مواعيد/مخرجات)",
      fail_4: "لا Tracking ولا تقارير ROI",
      fail_5: "حملة قصيرة بلا بناء علاقة طويلة",

      how_kicker: "كيف نعمل؟",
      how_title: "من التحليل إلى النتائج",
      s1_t: "تحليل المؤثر أو العلامة",
      s1_d: "نفهم الجمهور، المنصات، ونقاط القوة — قبل أي قرار.",
      s2_t: "تحديد الهدف التجاري الحقيقي",
      s2_d: "مبيعات؟ Leads؟ زيارات؟ نحدد الهدف ونبني عليه.",
      s3_t: "اختيار الشريك الأنسب",
      s3_d: "تطابق الجمهور والقيم، لا أرقام سطحية.",
      s4_t: "إدارة التفاوض والعقود",
      s4_d: "شفافية، حقوق واضحة، ومخرجات محددة.",
      s5_t: "تنفيذ الحملة ومتابعة الأداء",
      s5_d: "نرافق التنفيذ لضمان الجودة والاتساق.",
      s6_t: "قياس النتائج وتحسينها",
      s6_d: "تقارير واضحة وتحسين مستمر لما هو قابل للنمو.",

      case_kicker: "مثال تطبيقي مبسّط",
      case_title: "صورة ذهنية… تشرح الفكرة بوضوح",
      case_creator_h: "المؤثر",
      case_creator_p:
        "صانع محتوى في مجال اللياقة بجمهور خليجي نشط، يريد دخلًا مستدامًا دون الإضرار بهويته.",
      case_brand_h: "العلامة",
      case_brand_p:
        "علامة تجارية تبحث عن نمو فعلي: Leads ومبيعات، لا مجرد “ظهور”.",
      case_result_h: "النتيجة",
      case_result_p:
        "حملة مدفوعة بعقد واضح وأهداف قابلة للقياس — دخل محترم للمؤثر وعائد واضح على الاستثمار للعلامة.",

      why_kicker: "لماذا Viva Media Creative؟",
      why_title: "فخامة هادئة… ونتائج واضحة",
      why_p:
        "نحن نبني شراكات تحترم القيم والهوية — وتحقق عائدًا تجاريًا قابلًا للقياس. خبرة في الخليج ومصر، شبكة علاقات، وشفافية كاملة في العقود والعوائد.",
      why_1: "خبرة في السوق العربي (الخليج – مصر)",
      why_2: "شبكة علاقات مع مشاهير وعلامات تجارية",
      why_3: "شفافية كاملة في العقود والعوائد",
      why_4: "تركيز على الربح لا الضجيج",
      why_5: "بناء علاقة طويلة الأمد مع السوق",

      faq_kicker: "أسئلة شائعة",
      faq_title: "إجابات قصيرة… وواضحة",
      q1: "هل تعملون مع مشاهير صغار؟",
      a1: "نعم، نعمل مع مؤثرين في مراحل مختلفة — بشرط وجود قابلية للنمو وملاءمة للشراكات.",
      q2: "هل تضمنون النتائج؟",
      a2: "نضمن إدارة احترافية، اختيارًا صحيحًا، وقياسًا شفافًا. النتائج تتأثر بجودة التنفيذ والمنتج/الخدمة والسوق.",
      q3: "كيف يتم اختيار العلامات التجارية أو المؤثرين؟",
      a3: "بناءً على تطابق القيم والجمهور والهدف التجاري — وليس على أرقام سطحية فقط.",

      final_title: "جاهز لتحويل التأثير إلى دخل حقيقي؟",
      final_lead:
        "سواء كنت مشهورًا، صانع محتوى، أو علامة تجارية — نحن هنا لبناء شراكة مؤثرة… ومربحة.",
      final_contact: "اطلب استشارة الآن",

      footer_small: "Elite Influencer Partnerships • Gulf & Egypt",
      footer_service: "صفحة الخدمة",
      footer_contact: "تواصل"
    },

    en: {
      tagline: "Influencer Partnerships • Strategy • Growth",
      nav_service: "Service Page",
      nav_contact: "Contact",

      elite_badge: "Elite Partnerships",
      hero_title: "We Turn Influence Into Paid Partnerships & Real Results",
      hero_lead:
        "We connect creators & celebrities with the right brands through clear contracts — and turn influence into paid campaigns with measurable outcomes (Sales / Leads / Traffic).",

      cta_creator: "👑 I’m a Creator",
      cta_brand: "🏢 I’m a Brand",

      m1: "Performance & ROI",
      m2: "Clear Contracts",
      m3: "Sustainable Growth",

      creators_title: "For Creators & Celebrities",
      creators_sub: "Turn influence into sustainable income — without compromising your value.",
      c1: "Sustainable monetization",
      c2: "Real brand deals",
      c3: "Professional deal & contract management",
      c4: "Rights protection & transparency",
      c5: "A premium creator brand image",
      cta_creator_now: "Request Creator Partnership",

      brands_title: "For Brands",
      brands_sub: "Influencer Marketing that drives outcomes — not vanity views.",
      b1: "Precise creator selection",
      b2: "Campaigns built on business goals",
      b3: "Real audiences (not fake reach)",
      b4: "ROI tracking & reporting",
      b5: "Long-term market relationships",
      cta_brand_now: "Discuss a Brand Campaign",

      what_kicker: "What this service really is",
      what_title: "Partnership Management — Not Simple Matchmaking",
      what_p1:
        "Influencer Partnerships & Monetization is a full-cycle service: we analyze, match, negotiate, contract, execute, and measure — ensuring real value for both creators and brands.",

      fail_kicker: "Why most influencer deals fail",
      fail_title: "Because influence alone isn’t enough",
      fail_p:
        "Many collaborations fail due to the wrong match, unclear contracts, or focusing on views instead of outcomes. At Viva Media Creative, we make influencer marketing a growth engine — not a one-off ad.",
      fail_1: "Mismatch between audience and offer",
      fail_2: "Messaging misaligned with creator identity",
      fail_3: "Unclear terms (deliverables/timeline/rights)",
      fail_4: "No tracking and no ROI reporting",
      fail_5: "Short-term campaigns with no relationship build",

      how_kicker: "How we work",
      how_title: "From analysis to measurable results",
      s1_t: "Analyze creator or brand",
      s1_d: "Audience, platforms, positioning — before decisions.",
      s2_t: "Define the real business goal",
      s2_d: "Sales? Leads? Traffic? We align first.",
      s3_t: "Select the best-fit partner",
      s3_d: "Values and audience fit — not surface numbers.",
      s4_t: "Negotiate and contract",
      s4_d: "Clear terms, transparency, rights protection.",
      s5_t: "Execute & monitor",
      s5_d: "Quality control and consistency throughout.",
      s6_t: "Measure & optimize",
      s6_d: "Clear reporting and continuous improvement.",

      case_kicker: "A simple scenario",
      case_title: "A clear mental model",
      case_creator_h: "Creator",
      case_creator_p:
        "A fitness creator with an engaged Gulf audience, seeking sustainable income without harming identity.",
      case_brand_h: "Brand",
      case_brand_p:
        "A brand aiming for real growth: leads and sales — not just exposure.",
      case_result_h: "Result",
      case_result_p:
        "A paid campaign with clear goals and tracking — fair creator income and measurable brand ROI.",

      why_kicker: "Why Viva Media Creative",
      why_title: "Quiet luxury — clear outcomes",
      why_p:
        "We build partnerships that respect identity and deliver measurable business value — with Gulf & Egypt market expertise, network strength, and full transparency.",
      why_1: "Gulf & Egypt market expertise",
      why_2: "Creator + brand network",
      why_3: "Contract & revenue transparency",
      why_4: "Profit over noise",
      why_5: "Long-term partnerships",

      faq_kicker: "FAQ",
      faq_title: "Clear answers",
      q1: "Do you work with smaller creators?",
      a1: "Yes — if there’s strong growth potential and partnership fit.",
      q2: "Do you guarantee results?",
      a2: "We guarantee professional management, correct fit, and transparent measurement. Outcomes depend on execution, product, and market.",
      q3: "How do you select brands/creators?",
      a3: "By values, audience fit, and business goals — not vanity metrics.",

      final_title: "Ready to turn influence into real revenue?",
      final_lead:
        "Creator or brand — let’s build a partnership that creates value, not noise.",
      final_contact: "Request a Consultation",

      footer_small: "Elite Influencer Partnerships • Gulf & Egypt",
      footer_service: "Service Page",
      footer_contact: "Contact"
    }
  };

  function setDirLang(lang){
    const html = document.documentElement;
    if(lang === "en"){
      html.lang = "en";
      html.dir = "ltr";
    } else {
      html.lang = "ar";
      html.dir = "rtl";
    }
  }

  function applyI18n(lang){
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = dict[lang][key];
      if(typeof val === "string") el.textContent = val;
    });
  }

  function setActiveButtons(lang){
    const ar = document.getElementById("btn-ar");
    const en = document.getElementById("btn-en");
    ar.classList.toggle("is-active", lang === "ar");
    en.classList.toggle("is-active", lang === "en");
  }

  function buildWhatsAppLinks(lang){
    document.querySelectorAll('a[id^="cta-whatsapp"]').forEach(a => {
      const number = a.dataset.number || "4915565678291";
      const msg = (lang === "en" ? a.dataset.msgEn : a.dataset.msgAr) || "";
      const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
      a.href = url;
    });
  }

  function bindLanguage(){
    const ar = document.getElementById("btn-ar");
    const en = document.getElementById("btn-en");

    ar.addEventListener("click", () => setLang("ar"));
    en.addEventListener("click", () => setLang("en"));
  }

  function bindJumpButtons(){
    document.querySelectorAll("[data-jump]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-jump");
        const el = document.querySelector(id);
        if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
      });
    });
  }

  function setLang(lang){
    state.lang = lang;
    setDirLang(lang);
    setActiveButtons(lang);
    applyI18n(lang);
    buildWhatsAppLinks(lang);

    // Optional: update title/description slightly
    if(lang === "en"){
      document.title = "Influencer Partnerships & Monetization | Viva Media Creative";
    } else {
      document.title = "إدارة وربط المشاهير بالعلامات التجارية | Influencer Marketing | Viva Media Creative";
    }
  }

  // Init
  bindLanguage();
  bindJumpButtons();
  setLang("ar");
})();
