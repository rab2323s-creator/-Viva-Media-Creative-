(() => {
  // عناصر الصفحة
  const topicEl = document.getElementById("topicInput");
  const sizeEl = document.getElementById("accountSize");
  const goalEl = document.getElementById("goal");
  const resultsEl = document.getElementById("results");
  const runBtn = document.getElementById("runBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (!topicEl || !sizeEl || !goalEl || !resultsEl || !runBtn) {
    console.warn("Hashtag tool: missing elements. Check IDs in HTML.");
    return;
  }

  /* =========================
     1) إعدادات + تنظيف النص
     ========================= */

  // كلمات عربية شائعة لا تصلح كهاشتاغات
  const STOP_WORDS_AR = new Set([
    "هل","ماذا","ام","أم","هذا","هذه","ذلك","تلك","هكذا","كذا",
    "انا","أنت","انتي","انت","هو","هي","هم","هن","نحن","احنا",
    "على","في","من","الى","إلى","عن","مع","بين","داخل","خارج",
    "اذا","إذا","لو","لكن","بل","ثم","و","او","أو","يعني",
    "ليش","لماذا","ليه","ايه","إيه","اي","أي","أين","متى","كيف",
    "لا","نعم","مش","مو","ليس","بس","جدا","جداً","مرة","مره",
    "كل","أيضا","ايضاً","كمان","كمانة","تمام","طيب","حلو","حلوة",
    "لما","عشان","علشان","زي","مثل","بسبب","بدون","حول","عند",
    "اللي","الذي","التي","الذين","الي","إلي","عليه","عليها",
    "ما","شو","ايش","إيش","مين","وين","ليه"
  ]);

  const TOO_GENERIC = new Set([
    "#love","#instagood","#photooftheday","#follow","#like4like","#fyp","#viral",
    "#trending","#explorepage"
  ]);

  function normalizeText(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      // إزالة التشكيل العربي
      .replace(/[\u064B-\u0652]/g, "")
      // توحيد بعض الحروف
      .replace(/[إأآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      // إزالة الرموز
      .replace(/[^\u0600-\u06FFa-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function uniq(arr) {
    return [...new Set(arr)];
  }

  function tokenize(text) {
    const t = normalizeText(text);
    if (!t) return [];
    return t.split(" ").filter(Boolean);
  }

  function extractKeywords(text) {
    const tokens = tokenize(text);

    // فلترة قوية
    const filtered = tokens
      .filter(w => w.length >= 3)
      .filter(w => !STOP_WORDS_AR.has(w))
      // فلترة كلمات إنجليزية عامة جدًا
      .filter(w => !["the","and","for","with","this","that","you","your","are","was","were","have","has","from","into"].includes(w));

    // إزالة تكرار
    return uniq(filtered).slice(0, 20);
  }

  /* =========================
     2) قاعدة معرفة: نية المحتوى + مجموعات هاشتاغ
     ========================= */

  // “مفاهيم/نية” → كلمات مفتاحية → هاشتاغات (Reach/Targeted/Niche)
  const INTENTS = [
    {
      id: "relationships",
      label: "علاقات ومشاعر",
      keys: ["حب","علاقات","مشاعر","غيره","اشتياق","فراق","زواج","خطوبه","ارتباط","قلب","خيانة","اعجاب","تجاهل","كره","حيره","قلق"],
      hashtags: {
        reach: ["#حب","#علاقات","#مشاعر","#فضفضه","#حياه"],
        targeted: ["#مشاعر_مختلطه","#حديث_القلب","#تفكير_عميق","#اسئله_الحب","#نصائح_علاقات"],
        niche: ["#وعي_عاطفي","#ذكاء_عاطفي","#حدود_عاطفيه","#علاقات_صحيه","#تقدير_الذات"]
      }
    },
    {
      id: "education",
      label: "تعليمي / معرفة",
      keys: ["شرح","تعليم","درس","نصائح","كيف","خطوات","دليل","تعلم","تعلمت","معلومه","معلومات","مراجعه","تحليل","استراتيجیه","استراتيجيه"],
      hashtags: {
        reach: ["#تعليم","#تطوير_الذات","#معلومات","#معرفه","#تعلم"],
        targeted: ["#نصائح","#خطوات","#دليل","#كيف","#تعلم_سريع"],
        niche: ["#تعلم_يومي","#تطوير_مهارات","#تعلم_اونلاين","#افكار_مفيده","#محتوي_تعليمي"]
      }
    },
    {
      id: "marketing",
      label: "تسويق ومحتوى",
      keys: ["تسويق","محتوى","سوشال","انستغرام","تيك","تيك_توك","يوتيوب","اعلان","حمله","براند","علامه","seo","reach","engagement","reels","creator"],
      hashtags: {
        reach: ["#تسويق","#تسويق_رقمي","#سوشال_ميديا","#صناعة_محتوى","#انستغرام"],
        targeted: ["#اداره_حسابات","#استراتيجيه_محتوى","#نمو_الحساب","#زيادة_التفاعل","#تسويق_الكتروني"],
        niche: ["#خوارزميات_انستغرام","#ريلز_احترافيه","#تحليل_اداء","#سيو","#brandstrategy"]
      }
    },
    {
      id: "photo_video",
      label: "تصوير وإنتاج",
      keys: ["تصوير","كاميرا","اضاءه","مونتاج","فيديو","سينما","لقطه","عدسه","صوت","مايك","تصميم","تحرير","editing","camera","photography","videography"],
      hashtags: {
        reach: ["#تصوير","#فيديو","#مونتاج","#صناعة_محتوى","#تصوير_احترافي"],
        targeted: ["#تصوير_منتجات","#تصوير_موبايل","#اضاءه","#تحرير_فيديو","#videoediting"],
        niche: ["#سينمائي","#لوان_سينمائيه","#تصوير_تجاري","#تصوير_استوديو","#contentstudio"]
      }
    },
    {
      id: "business",
      label: "بيزنس ومشاريع",
      keys: ["مشروع","بيزنس","متجر","خدمه","عميل","مبيعات","سعر","طلب","شراء","ماركت","متجر_الكتروني","ecommerce","business","store","shop"],
      hashtags: {
        reach: ["#مشروع_صغير","#بيزنس","#رواد_اعمال","#تجاره","#ecommerce"],
        targeted: ["#متجر_الكتروني","#اداره_مشروع","#استراتيجيات_بيع","#تسويق_للمنتجات","#smallbusiness"],
        niche: ["#قمع_مبيعات","#تحويل_عملاء","#تسعير","#landingpage","#growthmarketing"]
      }
    },
    {
      id: "travel",
      label: "سفر وتجارب",
      keys: ["سفر","رحله","رحلات","سياحه","مغامره","اوروبا","المانيا","تركيا","travel","trip","explore","adventure"],
      hashtags: {
        reach: ["#سفر","#رحلات","#سياحه","#travel","#explore"],
        targeted: ["#مغامره","#رحلاتي","#وجهات","#travelblogger","#travellife"],
        niche: ["#رحلات_اقتصاديه","#اوروبا","#المانيا","#travelguide","#اماكن_جميله"]
      }
    }
  ];

  // هاشتاغات “عامّة ذكية” تُستخدم إذا لم نستطع تحديد نية واضحة
  const FALLBACK = {
    reach: ["#محتوى","#ريلز","#انستغرام","#ابداع","#افكار"],
    targeted: ["#صانع_محتوى","#تطوير","#نصائح","#محتوى_عربي","#افكار_جديده"],
    niche: ["#استراتيجيه","#تحسين_الاداء","#نمو","#جوده_المحتوى","#تعلم"]
  };

  function detectIntents(text, keywords) {
    const t = normalizeText(text);
    const hits = [];

    for (const intent of INTENTS) {
      let score = 0;
      for (const k of intent.keys) {
        const kk = normalizeText(k);
        if (t.includes(kk)) score += 2;
        if (keywords.includes(kk)) score += 3;
      }
      if (score > 0) hits.push({ intent, score });
    }

    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, 2); // نأخذ أفضل نيتين
  }

  /* =========================
     3) منطق التوزيع حسب حجم الحساب + الهدف
     ========================= */

  function splitCounts(size, goal) {
    // إجمالي مناسب (28) لتفادي السبام
    let reach, targeted, niche;

    if (size === "small") { reach = 6; targeted = 10; niche = 12; }
    else if (size === "large") { reach = 10; targeted = 10; niche = 8; }
    else { reach = 8; targeted = 10; niche = 10; }

    if (goal === "reach") { reach += 2; niche -= 2; }
    if (goal === "engagement") { niche += 2; reach -= 1; }
    if (goal === "sales") { targeted += 2; niche += 1; reach -= 3; }
    if (goal === "brand") { targeted += 1; reach += 1; niche -= 2; }

    reach = Math.max(4, reach);
    targeted = Math.max(8, targeted);
    niche = Math.max(8, niche);

    const total = reach + targeted + niche;
    if (total > 28) {
      const extra = total - 28;
      niche = Math.max(8, niche - extra);
    }
    return { reach, targeted, niche };
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function toHashtagFromKeyword(w) {
    // لا نحول كلمات قصيرة أو توقف
    if (!w || w.length < 3) return null;
    if (STOP_WORDS_AR.has(w)) return null;

    // كلمات عربية
    if (/[\u0600-\u06FF]/.test(w)) {
      return "#" + w;
    }
    // إنجليزية
    return "#" + w.replace(/\s+/g, "");
  }

  /* =========================
     4) بناء النتائج: 3 مجموعات تدوير + مخرجات “ذكية”
     ========================= */

  function buildPools(text) {
    const keywords = extractKeywords(text);
    const topIntents = detectIntents(text, keywords);

    // اجمع هاشتاغات من النية/النيات
    let reach = [];
    let targeted = [];
    let niche = [];
    let detectedLabels = [];

    if (topIntents.length) {
      for (const h of topIntents) {
        detectedLabels.push(h.intent.label);
        reach = reach.concat(h.intent.hashtags.reach);
        targeted = targeted.concat(h.intent.hashtags.targeted);
        niche = niche.concat(h.intent.hashtags.niche);
      }
    } else {
      reach = reach.concat(FALLBACK.reach);
      targeted = targeted.concat(FALLBACK.targeted);
      niche = niche.concat(FALLBACK.niche);
      detectedLabels.push("عام / متعدد");
    }

    // أضف هاشتاغات من كلمات المستخدم (لكن بعد فلترة قوية)
    const kwTags = keywords.map(toHashtagFromKeyword).filter(Boolean);

    // توزيع كلمات المستخدم على targeted/niche أكثر (أدق)
    targeted = targeted.concat(kwTags.slice(0, 6));
    niche = niche.concat(kwTags.slice(6, 14));

    // تنظيف
    reach = uniq(reach).filter(t => !TOO_GENERIC.has(t.toLowerCase()));
    targeted = uniq(targeted).filter(t => !TOO_GENERIC.has(t.toLowerCase()));
    niche = uniq(niche).filter(t => !TOO_GENERIC.has(t.toLowerCase()));

    return {
      detectedLabels,
      reach,
      targeted,
      niche
    };
  }

 function makeRotationSets(pools, counts) {
  // نعمل مخازن منفصلة ونزيل التكرار
  let reachPool = uniq(pools.reach);
  let targetedPool = uniq(pools.targeted);
  let nichePool = uniq(pools.niche);

  // لو المخزون قليل جدًا، نولّد Variants بسيطة لزيادة التنوع
  // مثال: #تصوير_منتجات -> #تصوير_المنتجات / #تصويرمنتجات
  const variantize = (arr) => {
    const out = [];
    for (const tag of arr) {
      out.push(tag);
      if (tag.includes("_")) out.push(tag.replace(/_/g, ""));
      out.push(tag.replace(/#/g, "#").replace(/_/g, "_")); // ثابتة (لمنع أخطاء)
      if (tag.includes("_")) out.push(tag.replace(/_/g, "_ال"));
      // (اختياري) نسخة بدون ال التعريف إن وُجدت
      out.push(tag.replace("#ال", "#"));
    }
    return uniq(out).filter(t => t.startsWith("#") && t.length >= 3);
  };

  reachPool = variantize(reachPool);
  targetedPool = variantize(targetedPool);
  nichePool = variantize(nichePool);

  // خلط مختلف لكل مجموعة باستخدام seed بسيط
  const seededShuffle = (arr, seed) => {
    const a = arr.slice();
    let s = seed;
    for (let i = a.length - 1; i > 0; i--) {
      // pseudo random
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      const j = Math.floor(r * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // اختيار بدون تكرار قدر الإمكان بين المجموعات
  const takeUnique = (pool, usedSet, n) => {
    const picked = [];
    for (const tag of pool) {
      if (picked.length >= n) break;
      if (!usedSet.has(tag)) {
        usedSet.add(tag);
        picked.push(tag);
      }
    }
    // إذا لم يكفِ، نكمل حتى لو تكرر (لكن بأقل قدر)
    if (picked.length < n) {
      for (const tag of pool) {
        if (picked.length >= n) break;
        if (!picked.includes(tag)) picked.push(tag);
      }
    }
    return picked;
  };

  const sets = [];
  // نستخدم used لكل فئة لضمان اختلاف المجموعات
  const usedReach = new Set();
  const usedTargeted = new Set();
  const usedNiche = new Set();

  for (let i = 0; i < 3; i++) {
    const r = seededShuffle(reachPool, 11 + i * 7);
    const t = seededShuffle(targetedPool, 23 + i * 9);
    const n = seededShuffle(nichePool, 37 + i * 13);

    const reach = takeUnique(r, usedReach, counts.reach);
    const targeted = takeUnique(t, usedTargeted, counts.targeted);
    const niche = takeUnique(n, usedNiche, counts.niche);

    const all = uniq([...reach, ...targeted, ...niche]).slice(0, 28);

    sets.push({
      name: `مجموعة ${i + 1} (تدوير)`,
      reach,
      targeted,
      niche,
      all
    });
  }

  return sets;
}


  function copyText(text) {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      const old = runBtn.textContent;
      runBtn.textContent = "✅ تم النسخ";
      setTimeout(() => (runBtn.textContent = old), 900);
    }).catch(() => alert("لم أستطع النسخ تلقائيًا. انسخ يدويًا."));
  }

  function renderSmartHeader(detectedLabels, counts, goal) {
    const goalText = {
      reach: "وصول (Reach)",
      engagement: "تفاعل (Engagement)",
      sales: "مبيعات/عملاء (Sales)",
      brand: "وعي بالعلامة (Brand)"
    }[goal] || goal;

    return `
      <div class="block">
        <h3>تحليل ذكي للمحتوى</h3>
        <p style="margin:8px 0; line-height:1.9; opacity:.92">
          تم تصنيف محتواك كالتالي: <strong>${detectedLabels.join(" + ")}</strong><br/>
          توزيع مقترح حسب الهدف <strong>${goalText}</strong>:
          <strong>${counts.reach}</strong> وصول + <strong>${counts.targeted}</strong> مستهدف + <strong>${counts.niche}</strong> متخصص
        </p>
        <p style="margin:0; opacity:.75">
          نصيحة: بدّل بين المجموعات (1 → 2 → 3) لتقليل التكرار وزيادة قابلية الاكتشاف.
        </p>
      </div>
    `;
  }

  function renderSets(sets) {
    return sets.map(set => {
      const allLine = set.all.join(" ");

      return `
        <div class="block">
          <h3>${set.name}</h3>

          <div class="tags">
            <strong>جاهز للنسخ:</strong><br/>
            ${allLine}
          </div>

          <div class="copybar">
            <button class="btn small primary" type="button" data-copy="${encodeURIComponent(allLine)}">نسخ المجموعة</button>
          </div>

          <details style="margin-top:10px;">
            <summary>تفاصيل التوزيع</summary>
            <div style="margin-top:8px; line-height:2;">
              <div><strong>وصول:</strong> ${set.reach.join(" ")}</div>
              <div><strong>مستهدف:</strong> ${set.targeted.join(" ")}</div>
              <div><strong>متخصص:</strong> ${set.niche.join(" ")}</div>
            </div>
          </details>
        </div>
      `;
    }).join("");
  }

  function renderLeadMagnet() {
    return `
      <div class="block" style="border-color: rgba(0,119,255,0.25);">
        <strong>تريد نسخة أدق لحسابك؟</strong>
        <p style="margin:8px 0; opacity:.9; line-height:1.9">
          أعطِنا رابط حساب إنستغرام + نوع المحتوى، ونرجع لك:
          <strong>خطة تدوير أسبوعية</strong> + <strong>هاشتاغات مخصصة</strong> + <strong>تحسين بروفايل</strong>.
        </p>
        <a class="btn primary" href="/contact/">اطلب تحليل مخصص</a>
      </div>
    `;
  }

  function run() {
    const text = topicEl.value.trim();
    if (!text) {
      resultsEl.innerHTML = `<div class="block"><strong>اكتب وصف المحتوى أولًا.</strong></div>`;
      return;
    }

    const size = sizeEl.value;
    const goal = goalEl.value;

    const counts = splitCounts(size, goal);
    const pools = buildPools(text);

    // دعم إضافي للمبيعات
    if (goal === "sales") {
      pools.targeted = uniq(pools.targeted.concat(["#متجر_الكتروني","#اطلب_الآن","#عروض","#شراء","#shopnow","#ecommerce"]));
      pools.niche = uniq(pools.niche.concat(["#تحويل_عملاء","#قمع_مبيعات","#landingpage"]));
    }

    const sets = makeRotationSets(pools, counts);

    resultsEl.innerHTML =
      renderSmartHeader(pools.detectedLabels, counts, goal) +
      renderSets(sets) +
      renderLeadMagnet();

    // ربط أزرار النسخ
    resultsEl.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        const t = decodeURIComponent(btn.getAttribute("data-copy") || "");
        copyText(t);
      });
    });

    // تتبع استخدام بسيط (بدون سيرفر)
    try {
      const k = "viva_tool_hashtag_analyzer_runs";
      const n = parseInt(localStorage.getItem(k) || "0", 10) + 1;
      localStorage.setItem(k, String(n));
    } catch {}
  }

  function reset() {
    topicEl.value = "";
    resultsEl.innerHTML = "";
    topicEl.focus();
  }

  runBtn.addEventListener("click", run);
  resetBtn?.addEventListener("click", reset);
})();
