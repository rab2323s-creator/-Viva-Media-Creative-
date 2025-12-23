 (() => {
  // عناصر الصفحة
  const topicEl = document.getElementById("topicInput");
  const sizeEl = document.getElementById("accountSize");
  const goalEl = document.getElementById("goal");
  const resultsEl = document.getElementById("results");
  const runBtn = document.getElementById("runBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (!topicEl || !sizeEl || !goalEl || !resultsEl || !runBtn) {
    // إذا IDs غير موجودة، لا نكسر الصفحة
    console.warn("Hashtag tool: missing elements. Check IDs in HTML.");
    return;
  }

  // قاموس موسّع (عربي/إنجليزي) — قابل للتوسيع بسهولة
  const DB = [
    {
      keys: ["تسويق", "marketing", "digital", "سوشال", "social", "محتوى", "content"],
      tags: [
        "#تسويق", "#تسويق_رقمي", "#تسويق_الكتروني", "#ادارة_حسابات",
        "#marketing", "#digitalmarketing", "#socialmediamarketing", "#contentmarketing",
        "#branding", "#seo", "#growth", "#strategy"
      ]
    },
    {
      keys: ["تصوير", "فيديو", "مونتاج", "camera", "photography", "video", "edit"],
      tags: [
        "#تصوير", "#تصوير_احترافي", "#تصوير_منتجات", "#صناعة_محتوى",
        "#photography", "#videography", "#productphotography", "#contentcreator",
        "#filmmaking", "#videoediting", "#reels", "#cinematic"
      ]
    },
    {
      keys: ["سفر", "travel", "رحلات", "explore", "tour"],
      tags: [
        "#سفر", "#رحلات", "#سياحة", "#مغامرة",
        "#travel", "#travellife", "#explore", "#adventure", "#wanderlust"
      ]
    },
    {
      keys: ["انستغرام", "instagram", "ريلز", "reels"],
      tags: ["#انستغرام", "#ريلز", "#reelsinstagram", "#instagramreels", "#creator", "#creators"]
    },
    {
      keys: ["مشروع", "بيزنس", "متجر", "business", "store", "ecommerce", "منتج"],
      tags: ["#مشروع_صغير", "#بيزنس", "#متجر_الكتروني", "#رواد_اعمال", "#ecommerce", "#smallbusiness", "#entrepreneur"]
    }
  ];

  // هاشتاغات عامة جدًا (تقلل الدقة) نفلترها أو نستخدمها قليلًا
  const TOO_GENERIC = new Set([
    "#love", "#instagood", "#photooftheday", "#fashion", "#happy", "#beautiful",
    "#follow", "#like4like", "#fyp", "#viral"
  ]);

  // توليد سلاج بسيط (للأمان فقط)
  function uniq(arr) {
    return [...new Set(arr)];
  }

  function normalizeText(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // استخراج كلمات مفتاحية من النص
  function extractKeywords(text) {
    const t = normalizeText(text);
    if (!t) return [];
    const parts = t.split(" ");
    // فلترة كلمات قصيرة جدًا
    return uniq(parts.filter(w => w.length >= 3)).slice(0, 18);
  }

  // بناء قائمة tags من DB بناءً على match مرن
  function buildTagPool(text) {
    const t = normalizeText(text);
    const kws = extractKeywords(text);

    let pool = [];
    for (const item of DB) {
      const hit = item.keys.some(k => t.includes(k.toLowerCase()));
      if (hit) pool = pool.concat(item.tags);
    }

    // لو ما في matches، نولّد هاشتاغات من كلمات المستخدم (عربي/إنجليزي)
    // مثال: "تصوير منتجات" => #تصوير_منتجات (بشكل تقريبي)
    const generated = kws.map(w => {
      // لو كلمة عربية، نحاول نضيف # + الكلمة
      if (/[\u0600-\u06FF]/.test(w)) return "#" + w;
      return "#" + w.replace(/\s+/g, "");
    });

    pool = pool.concat(generated);

    // تنظيف + إزالة العام جدًا
    pool = uniq(pool)
      .map(x => x.trim())
      .filter(x => x.startsWith("#") && x.length >= 3)
      .filter(x => !TOO_GENERIC.has(x.toLowerCase()));

    return pool;
  }

  // توزيع حسب حجم الحساب + الهدف
  function splitCounts(size, goal) {
    // high = منافسة عالية، mid = متوسطة، niche = متخصصة
    // الهدف يؤثر: للوصول نزيد mid/high قليلًا، للتفاعل نزيد niche، للمبيعات نزيد niche + business
    let high, mid, niche;

    if (size === "small") { high = 3; mid = 8; niche = 14; }
    else if (size === "large") { high = 8; mid = 10; niche = 10; }
    else { high = 5; mid = 10; niche = 12; }

    if (goal === "reach") { high += 1; mid += 2; niche -= 3; }
    if (goal === "engagement") { niche += 2; mid -= 1; }
    if (goal === "sales") { niche += 2; high -= 1; }
    if (goal === "brand") { mid += 1; niche -= 1; }

    // لا نخلي الأرقام سلبية
    high = Math.max(2, high);
    mid = Math.max(5, mid);
    niche = Math.max(8, niche);

    // سقف إجمالي 28 (عشان يطلع نظيف)
    const total = high + mid + niche;
    if (total > 28) {
      const extra = total - 28;
      niche = Math.max(8, niche - extra);
    }
    return { high, mid, niche };
  }

  // خلط بسيط
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // إعداد 3 مجموعات تدوير لتفادي التكرار
  function rotationSets(tags, counts) {
    // نقسم tag pool إلى 3 مجموعات مختلفة قدر الإمكان
    const shuffled = shuffle(tags);
    const chunk = Math.ceil(shuffled.length / 3);
    const sets = [
      shuffled.slice(0, chunk),
      shuffled.slice(chunk, chunk * 2),
      shuffled.slice(chunk * 2)
    ].map(set => uniq(set));

    // لكل مجموعة نختار high/mid/niche من نفس المجموعة أو من الاحتياط
    const all = uniq(tags);

    return sets.map((set, idx) => {
      const local = set.length ? set : all;

      // لا يوجد عندنا حقيقة منافسة، فنحاكيها: كلمات قصيرة/عامة = high غالبًا
      const sorted = local.slice().sort((a, b) => a.length - b.length);

      const high = sorted.slice(0, counts.high);
      const rest = sorted.slice(counts.high);

      const mid = rest.slice(0, counts.mid);
      const niche = rest.slice(counts.mid, counts.mid + counts.niche);

      // إذا نقصت، نكمل من all
      const need = (counts.high + counts.mid + counts.niche) - (high.length + mid.length + niche.length);
      const fill = need > 0 ? all.filter(t => !high.includes(t) && !mid.includes(t) && !niche.includes(t)).slice(0, need) : [];

      return {
        name: `مجموعة ${idx + 1}`,
        high,
        mid,
        niche,
        all: uniq([...high, ...mid, ...niche, ...fill]).slice(0, 28)
      };
    });
  }

  function copyText(text) {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      // إشعار بسيط
      const old = runBtn.textContent;
      runBtn.textContent = "✅ تم النسخ";
      setTimeout(() => (runBtn.textContent = old), 900);
    }).catch(() => {
      alert("لم أستطع النسخ تلقائيًا. انسخ يدويًا.");
    });
  }

  function render(sets) {
    const blocks = sets.map(set => {
      const allLine = set.all.join(" ");
      const caption = allLine; // ممكن تخليه أقل لو تحب
      const comment = allLine; // نفس الشيء

      return `
        <div class="block">
          <h3>${set.name}</h3>
          <div class="tags"><strong>جاهز للنسخ:</strong><br/>${allLine}</div>
          <div class="copybar">
            <button class="btn small primary" data-copy="${encodeURIComponent(caption)}" type="button">نسخ كابشن</button>
            <button class="btn small ghost" data-copy="${encodeURIComponent(comment)}" type="button">نسخ للتعليق الأول</button>
          </div>
          <details style="margin-top:10px;">
            <summary>تفاصيل التوزيع</summary>
            <div style="margin-top:8px; line-height:2;">
              <div><strong>قوية:</strong> ${set.high.join(" ")}</div>
              <div><strong>متوسطة:</strong> ${set.mid.join(" ")}</div>
              <div><strong>متخصصة:</strong> ${set.niche.join(" ")}</div>
            </div>
          </details>
        </div>
      `;
    }).join("");

    resultsEl.innerHTML = blocks;

    // ربط أزرار النسخ
    resultsEl.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        const t = decodeURIComponent(btn.getAttribute("data-copy") || "");
        copyText(t);
      });
    });
  }

  function run() {
    const text = topicEl.value.trim();
    if (!text) {
      resultsEl.innerHTML = `<div class="block"><strong>اكتب وصف المحتوى أولًا.</strong></div>`;
      return;
    }

    const size = sizeEl.value;
    const goal = goalEl.value;

    const pool = buildTagPool(text);

    // دعم خاص للمبيعات: أضف business tags خفيفة
    if (goal === "sales") {
      pool.push("#متجر_الكتروني", "#شراء", "#طلب", "#ecommerce", "#shopnow", "#smallbusiness");
    }

    const counts = splitCounts(size, goal);
    const sets = rotationSets(pool, counts);

    render(sets);

    // (اختياري) تتبع استخدام بسيط عبر localStorage
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

