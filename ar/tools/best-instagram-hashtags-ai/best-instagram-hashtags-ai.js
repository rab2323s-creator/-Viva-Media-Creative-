(() => {
  const aiTopicEl = document.getElementById("aiTopicInput");
  const aiSizeEl = document.getElementById("aiAccountSize");
  const aiGoalEl = document.getElementById("aiGoal");
  const aiResultsEl = document.getElementById("aiResults");
  const aiRunBtn = document.getElementById("aiRunBtn");
  const aiResetBtn = document.getElementById("aiResetBtn");

  if (!aiTopicEl || !aiSizeEl || !aiGoalEl || !aiResultsEl || !aiRunBtn) {
    console.warn("Best Instagram Hashtags AI: missing required elements.");
    return;
  }

  const API_URL = "https://old-water-8caa.rab2323s.workers.dev";

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function uniq(arr) {
    return [...new Set(arr)];
  }

  function normalizeTag(tag) {
    let t = String(tag || "").trim();
    if (!t) return null;

    t = t.replace(/\s+/g, "");
    if (!t.startsWith("#")) t = "#" + t;

    if (t === "#") return null;
    return t;
  }

  function cleanTags(arr) {
    return uniq((arr || []).map(normalizeTag).filter(Boolean)).slice(0, 30);
  }

  function copyText(text, buttonEl = null) {
    if (!text) return;

    navigator.clipboard?.writeText(text).then(() => {
      if (buttonEl) {
        const old = buttonEl.textContent;
        buttonEl.textContent = "✅ تم النسخ";
        setTimeout(() => {
          buttonEl.textContent = old;
        }, 1000);
      }
    }).catch(() => {
      alert("تعذر النسخ التلقائي. انسخ النص يدويًا.");
    });
  }

  async function runAIRequest(text, size, goal) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, size, goal })
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || "AI request failed");
    }

    return await res.json();
  }

  function parseAIResponse(raw) {
    try {
      if (!raw) return null;

      // شكل مباشر قديم
      if (raw.intent && raw.set1 && raw.set2 && raw.set3) {
        return {
          intent: raw.intent,
          hashtags: {
            set1: raw.set1,
            set2: raw.set2,
            set3: raw.set3
          },
          tips: raw.tips || raw.viralTips || [],
          notes: raw.notes || ""
        };
      }

      // شكل مباشر جديد
      if (raw.intent && raw.hashtags) {
        return {
          intent: raw.intent,
          hashtags: {
            set1: raw.hashtags.set1 || raw.set1 || [],
            set2: raw.hashtags.set2 || raw.set2 || [],
            set3: raw.hashtags.set3 || raw.set3 || []
          },
          tips: raw.tips || raw.viralTips || [],
          notes: raw.notes || ""
        };
      }

      // output_text
      if (raw.output_text) {
        const parsed = JSON.parse(raw.output_text);
        return parseAIResponse(parsed);
      }

      // OpenAI-like output array
      if (Array.isArray(raw.output)) {
        const parts = [];

        for (const item of raw.output) {
          if (!item || !Array.isArray(item.content)) continue;
          for (const c of item.content) {
            if (c.type === "output_text" && c.text) {
              parts.push(c.text);
            }
          }
        }

        if (parts.length) {
          const parsed = JSON.parse(parts.join("\n"));
          return parseAIResponse(parsed);
        }
      }
    } catch (err) {
      console.error("AI parse error:", err, raw);
    }

    return null;
  }

  function getGoalLabel(goal) {
    return {
      reach: "زيادة الوصول",
      engagement: "زيادة التفاعل",
      sales: "مبيعات / عملاء",
      brand: "وعي بالعلامة"
    }[goal] || goal;
  }

  function getSizeLabel(size) {
    return {
      small: "حساب صغير",
      medium: "حساب متوسط",
      large: "حساب كبير"
    }[size] || size;
  }

  function renderIntro(intent, size, goal, totalTags) {
    return `
      <div class="block">
        <h3>تحليل ذكي للمحتوى</h3>
        <p style="margin:8px 0; line-height:1.9; opacity:.95;">
          تم فهم المحتوى على أنه:
          <strong>${escapeHtml(intent || "غير محدد")}</strong>
        </p>
        <p style="margin:8px 0; line-height:1.9; opacity:.9;">
          نوع الحساب:
          <strong>${escapeHtml(getSizeLabel(size))}</strong>
          — الهدف:
          <strong>${escapeHtml(getGoalLabel(goal))}</strong>
        </p>
        <p style="margin:0; opacity:.75;">
          تم تجهيز 3 مجموعات هاشتاغات إنستغرام بالذكاء الصناعي، بإجمالي يصل إلى
          <strong>${totalTags}</strong> هاشتاغات متنوعة قابلة للتدوير.
        </p>
      </div>
    `;
  }

  function renderAISet(title, tags) {
    const cleaned = cleanTags(tags);
    const line = cleaned.join(" ");

    return `
      <div class="block">
        <h3>${escapeHtml(title)}</h3>
        <div class="tags">
          <strong>جاهزة للنسخ:</strong><br>
          ${escapeHtml(line)}
        </div>

        <div class="copybar">
          <button class="btn primary" type="button" data-copy="${encodeURIComponent(line)}">
            نسخ المجموعة
          </button>
        </div>

        <details>
          <summary>عرض الهاشتاغات بشكل قائمة</summary>
          <div style="margin-top:10px; line-height:2;">
            ${cleaned.map(tag => `<span style="display:inline-block;margin-left:8px;">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </details>
      </div>
    `;
  }

  function renderTips(tips) {
    const clean = (tips || []).map(t => String(t || "").trim()).filter(Boolean).slice(0, 5);
    if (!clean.length) return "";

    return `
      <div class="block">
        <h3>نصائح سريعة لاستخدام الهاشتاغات</h3>
        <ul style="margin:0; padding-right:18px; line-height:2;">
          ${clean.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  function renderNotes(notes) {
    const text = String(notes || "").trim();
    if (!text) return "";

    return `
      <div class="block">
        <h3>ملاحظة إضافية</h3>
        <p style="margin:0; line-height:1.9;">${escapeHtml(text)}</p>
      </div>
    `;
  }

  function renderLeadBox() {
    return `
      <div class="block" style="border-color: rgba(0,198,255,.22); background: linear-gradient(180deg, rgba(0,119,255,.12), rgba(0,198,255,.05));">
        <h3>تحتاج استراتيجية محتوى كاملة؟</h3>
        <p style="margin:8px 0; line-height:1.9;">
          هذه الأداة تساعدك في اختيار أفضل هاشتاغات إنستغرام بالذكاء الصناعي،
          لكن يمكنك أيضًا طلب تحليل أعمق يشمل المحتوى، الريلز، التفاعل، وتحسين الحساب.
        </p>
        <div class="copybar">
          <a class="btn primary" href="/contact/">اطلب تحليلًا مخصصًا</a>
          <a class="btn ghost" href="/ar/tools/hashtag-analyzer/">جرّب الأداة العادية</a>
        </div>
      </div>
    `;
  }

  function bindCopyButtons() {
    aiResultsEl.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = decodeURIComponent(btn.getAttribute("data-copy") || "");
        copyText(text, btn);
      });
    });
  }

  function trackUsage() {
    try {
      const key = "viva_best_instagram_hashtags_ai_runs";
      const current = parseInt(localStorage.getItem(key) || "0", 10) + 1;
      localStorage.setItem(key, String(current));
    } catch {}
  }

  async function runAITool() {
    const text = aiTopicEl.value.trim();

    if (!text) {
      aiResultsEl.innerHTML = `
        <div class="block">
          <strong>اكتب وصف المحتوى أولًا.</strong>
        </div>
      `;
      return;
    }

    const size = aiSizeEl.value;
    const goal = aiGoalEl.value;

    aiRunBtn.disabled = true;
    const oldText = aiRunBtn.textContent;
    aiRunBtn.textContent = "جاري التوليد...";

    aiResultsEl.innerHTML = `
      <div class="block">
        <strong>يتم الآن تحليل المحتوى وتوليد أفضل هاشتاغات إنستغرام بالذكاء الصناعي...</strong>
      </div>
    `;

    try {
      const raw = await runAIRequest(text, size, goal);
      const data = parseAIResponse(raw);

      if (!data || !data.hashtags) {
        throw new Error("Invalid AI response");
      }

      const set1 = cleanTags(data.hashtags.set1 || []);
      const set2 = cleanTags(data.hashtags.set2 || []);
      const set3 = cleanTags(data.hashtags.set3 || []);

      const totalTags = uniq([...set1, ...set2, ...set3]).length;

      aiResultsEl.innerHTML = `
        ${renderIntro(data.intent, size, goal, totalTags)}
        ${renderAISet("مجموعة 1", set1)}
        ${renderAISet("مجموعة 2", set2)}
        ${renderAISet("مجموعة 3", set3)}
        ${renderTips(data.tips)}
        ${renderNotes(data.notes)}
        ${renderLeadBox()}
      `;

      bindCopyButtons();
      trackUsage();
    } catch (err) {
      console.error(err);
      aiResultsEl.innerHTML = `
        <div class="block">
          <strong>حدث خطأ أثناء توليد الهاشتاغات بالذكاء الصناعي.</strong><br>
          تأكد من أن خدمة الـ Worker تعمل بشكل صحيح، ثم حاول مرة أخرى.
        </div>
      `;
    } finally {
      aiRunBtn.disabled = false;
      aiRunBtn.textContent = oldText;
    }
  }

  function resetAITool() {
    aiTopicEl.value = "";
    aiResultsEl.innerHTML = "";
    aiTopicEl.focus();
  }

  aiRunBtn.addEventListener("click", runAITool);
  aiResetBtn?.addEventListener("click", resetAITool);

  aiTopicEl.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      runAITool();
    }
  });
})();
