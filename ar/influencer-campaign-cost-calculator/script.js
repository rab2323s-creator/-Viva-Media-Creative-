  <script>
    // ============================
    // Pricing model (editable)
    // ============================
    // IMPORTANT: These are market-wide ESTIMATION ranges, not official influencer prices.


    // Base price per deliverable (min/max) by market -> platform -> influencer size -> content type
    // You can tune these numbers later from one place.
    const BASE = {
      gcc: {
        instagram: {
          nano:  { story:[250,650],  post:[600,1600], reel:[1400,4200], live:[2500,7000] },
          micro: { story:[500,1400], post:[1500,4500], reel:[4500,14000], live:[9000,24000] },
          macro: { story:[1200,3500],post:[4500,12000],reel:[12000,35000],live:[25000,60000] },
          mega:  { story:[2500,7000],post:[9000,22000],reel:[25000,80000],live:[60000,140000] }
        },
        tiktok: {
          nano:  { story:[0,0],      post:[0,0],      reel:[1200,3800], live:[2200,6500] },
          micro: { story:[0,0],      post:[0,0],      reel:[4000,12500],live:[8500,22000] },
          macro: { story:[0,0],      post:[0,0],      reel:[11000,32000],live:[24000,56000] },
          mega:  { story:[0,0],      post:[0,0],      reel:[24000,78000],live:[56000,130000] }
        },
        snapchat: {
          nano:  { story:[350,900],  post:[0,0],      reel:[0,0],       live:[0,0] },
          micro: { story:[900,2500], post:[0,0],      reel:[0,0],       live:[0,0] },
          macro: { story:[2200,6000],post:[0,0],      reel:[0,0],       live:[0,0] },
          mega:  { story:[4500,12000],post:[0,0],     reel:[0,0],       live:[0,0] }
        }
      },
      eg: {
        instagram: {
          nano:  { story:[120,350],  post:[350,900],  reel:[900,2800],  live:[1400,4200] },
          micro: { story:[250,750],  post:[900,2600],  reel:[2500,9000], live:[4500,14000] },
          macro: { story:[600,1800], post:[2600,7000], reel:[8000,25000],live:[14000,36000] },
          mega:  { story:[1200,3500],post:[6000,16000],reel:[18000,55000],live:[35000,90000] }
        },
        tiktok: {
          nano:  { story:[0,0],      post:[0,0],      reel:[800,2500],   live:[1200,3800] },
          micro: { story:[0,0],      post:[0,0],      reel:[2200,8000],  live:[4000,12000] },
          macro: { story:[0,0],      post:[0,0],      reel:[7000,22000], live:[12000,30000] },
          mega:  { story:[0,0],      post:[0,0],      reel:[15000,48000],live:[28000,75000] }
        },
        snapchat: {
          nano:  { story:[150,450],  post:[0,0],      reel:[0,0],       live:[0,0] },
          micro: { story:[350,1100], post:[0,0],      reel:[0,0],       live:[0,0] },
          macro: { story:[900,2600], post:[0,0],      reel:[0,0],       live:[0,0] },
          mega:  { story:[1800,5200],post:[0,0],      reel:[0,0],       live:[0,0] }
        }
      }
    };

    // Multipliers
    const COMPLEXITY_MULT = {
      conservative: { min: 0.90, max: 0.95 },
      typical:      { min: 1.00, max: 1.00 },
      premium:      { min: 1.08, max: 1.18 }
    };

    const DURATION_MULT = (days) => {
      // More days usually means more coordination + possible reposts/extra rounds.
      if (days <= 7) return { min: 1.00, max: 1.00 };
      if (days <= 14) return { min: 1.03, max: 1.06 };
      if (days <= 30) return { min: 1.06, max: 1.12 };
      return { min: 1.10, max: 1.18 };
    };

    const ADDONS = {
      usageRights:  { min: 1.15, max: 1.60 },
      exclusivity:  { min: 1.12, max: 1.55 },
      whitelisting: { min: 1.10, max: 1.35 },
      production:   { min: 1.08, max: 1.25 }
    };

    // Volume discount (bundles) - applies to base influencer fees only
    function volumeDiscount(n) {
      if (n >= 20) return { min: 0.88, max: 0.94 };
      if (n >= 10) return { min: 0.92, max: 0.97 };
      if (n >= 6)  return { min: 0.95, max: 0.99 };
      return { min: 1.00, max: 1.00 };
    }

    // ============================
    // Helpers
    // ============================
    function fmt(n, cur) {
      const x = Math.round(n);
      // Arabic thousands separator
      return x.toLocaleString('ar-EG') + ' ' + (cur.symbol || cur.code);
    }

    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

    function getBase(market, platform, size, type){
      const p = (BASE[market]||{})[platform];
      if (!p) return [0,0];
      const s = p[size];
      if (!s) return [0,0];
      return s[type] || [0,0];
    }

    function isSupported(platform, type) {
      // TikTok doesn't have "story" or "post" in our model.
      if (platform === 'tiktok' && (type === 'story' || type === 'post')) return false;
      if (platform === 'snapchat' && type !== 'story') return false;
      // Live on Snapchat is not modeled.
      if (platform === 'snapchat' && type === 'live') return false;
      return true;
    }

    function suggestPlan({goal, platform, market, size}){
      // Output a simple, actionable recommendation.
      // (No hard promises.)
      const isGcc = market === 'gcc';
      const platformName = platform === 'instagram' ? 'إنستغرام' : platform === 'tiktok' ? 'تيك توك' : 'سناب شات';

      const tips = [];
      if (goal === 'awareness') tips.push('ابدأ بعدة Micro/Nano لاختبار الرسائل قبل التوسيع.');
      if (goal === 'engagement') tips.push('ادمج Reel/فيديو + Stories بأسئلة/تصويت لرفع التفاعل.');
      if (goal === 'leads') tips.push('ركّز على Stories مع CTA واضح + رابط/واتساب + كود خاص.');
      if (goal === 'sales') tips.push('استخدم كود خصم + تتبع UTM + إعادة استخدام أفضل فيديو كإعلان ممول.');
      if (goal === 'launch') tips.push('امزج Macro للضجة + Micro للتكرار + جدول نشر مكثف أسبوعين.');

      // Market nuance
      if (isGcc) tips.push('في الخليج غالبًا ترتفع الأسعار في المواسم (خصوصًا رمضان) — اختر “مستوى سوق مرتفع” للتقدير.');
      else tips.push('في مصر الجودة/الانتشار يختلفان جدًا — تأكد من الجمهور الحقيقي قبل الدفع.');

      // Platform nuance
      if (platform === 'snapchat') tips.push('سناب ممتاز للعروض والـ CTA السريع عبر القصص، واحرص على تكرار الرسالة.');
      if (platform === 'tiktok') tips.push('تيك توك يحتاج فكرة قوية في أول ثانيتين — ركّز على “Hook” واضح.');
      if (platform === 'instagram') tips.push('إنستغرام: Reels للانتشار + Stories للتحويل والرسائل.');

      return { title: `خطة مبدئية لـ ${platformName}`, bullets: tips.slice(0,4) };
    }

    function buildPackages({goal, platform}){
      // Packages are heuristic templates (not prices) to drive conversion.
      // We keep them platform-aware.
      const rows = [];

      const base = platform === 'snapchat'
        ? {
            basic:  '2 مؤثر Nano/Micro + 8 قصص (Story Frames)',
            growth: '4 مؤثرين Micro + 20 قصة + تكرار عرض/CTA',
            premium:'1 Macro + 6 Micro + 40 قصة + تغطية أسبوعين'
          }
        : {
            basic:  '1 Micro + 1 فيديو + 3 قصص (أو 1 Post)',
            growth: '3 Micro + 3 فيديو + 9 قصص + كود خصم لكل مؤثر',
            premium:'1 Macro + 5 Micro + 6 فيديو + 15 قصة + إعادة استخدام أفضل فيديو كإعلان'
          };

      const when = {
        awareness: {
          b:'اختبار سريع + أول بيانات.',
          g:'زيادة انتشار مع تنويع.',
          p:'دفعة قوية لبراند/افتتاح.'
        },
        engagement: {
          b:'رفع تفاعل محتوى واحد.',
          g:'تفاعل مستمر أسبوعين.',
          p:'تفاعل + وصول واسع.'
        },
        leads: {
          b:'جمع Leads محدود.',
          g:'Leads ثابتة مع CTA.',
          p:'Lead machine + إعادة استهداف.'
        },
        sales: {
          b:'مبيعات تجريبية.',
          g:'تحسين تحويل مع أكواد.',
          p:'مبيعات + حملات ممولة.'
        },
        launch: {
          b:'تهيئة قبل الإطلاق.',
          g:'أسبوعين إطلاق.',
          p:'إطلاق ضخم متعدد مؤثرين.'
        }
      };

      const w = when[goal] || when.awareness;
      rows.push({name:'Basic', dist: base.basic, why: w.b});
      rows.push({name:'Growth', dist: base.growth, why: w.g});
      rows.push({name:'Premium', dist: base.premium, why: w.p});
      return rows;
    }

    function buildWhatsappMessage(summary){
      const lines = [
        'مرحبًا Viva Media Creative 👋',
        'أريد عرض سعر رسمي + قائمة مؤثرين مناسبة لحملة مؤثرين.',
        '',
        `السوق: ${summary.marketLabel}`,
        `المنصة: ${summary.platformLabel}`,
        `الهدف: ${summary.goalLabel}`,
        `حجم المؤثر: ${summary.sizeLabel}`,
        `نوع المحتوى: ${summary.typeLabel}`,
        `عدد المخرجات: ${summary.deliverables}`,
        `مدة الحملة: ${summary.days} يوم`,
        `إضافات: ${summary.addonsLabel || 'بدون'}`,
        `تقدير الميزانية (Range): ${summary.rangeLabel}`,
        '',
        summary.industry ? `المجال: ${summary.industry}` : '',
        'أرسلوا لي الخيارات المناسبة وخطة مقترحة. شكرًا 🙏'
      ].filter(Boolean);
      return lines.join('\n');
    }

    // ============================
    // UI wiring
    // ============================
    const el = (id) => document.getElementById(id);
   const supabaseUrl = "https://qpihjqzyxkpmlegijkmt.supabase.co";
const supabaseKey = "sb_publishable_GXP75aI8EF5i0czaZENTBA_huxSaeum";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    const calcForm = el('calcForm');
    const results = el('results');
    const budgetRange = el('budgetRange');
    const perDeliverable = el('perDeliverable');
    const breakdown = el('breakdown');
    const copyBtn = el('copyBtn');
    const resetBtn = el('resetBtn');
    const printBtn = el('printBtn');
    const rangePill = el('rangePill');
    const quickRec = el('quickRec');
    const packagesEl = el('packages');
    const waBtn = el('waBtn');
    const mailBtn = el('mailBtn');

    function updateCompatibilityHint(){
      const platform = el('platform').value;
      const type = el('contentType').value;
      const ok = isSupported(platform, type);

      // If not supported, auto-switch to a supported option to reduce confusion.
      if (!ok) {
        if (platform === 'tiktok') el('contentType').value = 'reel';
        if (platform === 'snapchat') el('contentType').value = 'story';
      }
    }

    el('platform').addEventListener('change', updateCompatibilityHint);
    el('contentType').addEventListener('change', updateCompatibilityHint);

    function compute(){
      const market = el('market').value;
      const platform = el('platform').value;
      const goal = el('goal').value;
      const industry = (el('industry').value || '').trim();
      const size = el('influencerSize').value;
      const type = el('contentType').value;
      const deliverables = clamp(parseInt(el('deliverables').value || '1', 10), 1, 120);
      const days = parseInt(el('campaignDays').value, 10);
      const complexity = el('complexity').value;

      const addons = {
        usageRights: el('usageRights').checked,
        exclusivity: el('exclusivity').checked,
        whitelisting: el('whitelisting').checked,
        production: el('production').checked
      };

      if (!isSupported(platform, type)) {
        return { error: 'اختيار غير مدعوم لهذه المنصّة. غيّر نوع المحتوى.' };
      }

      const cur = CURRENCY[market];
      const base = getBase(market, platform, size, type);
      const baseMin = base[0];
      const baseMax = base[1];
      if (!baseMin && !baseMax) {
        return { error: 'لا توجد بيانات تقديرية لهذا الاختيار. جرّب نوع محتوى أو منصّة أخرى.' };
      }

      // Core: deliverables * base
      let min = baseMin * deliverables;
      let max = baseMax * deliverables;

      // Volume discount on base
      const vd = volumeDiscount(deliverables);
      min *= vd.min;
      max *= vd.max;

      // Complexity multiplier
      const cm = COMPLEXITY_MULT[complexity] || COMPLEXITY_MULT.typical;
      min *= cm.min;
      max *= cm.max;

      // Duration multiplier
      const dm = DURATION_MULT(days);
      min *= dm.min;
      max *= dm.max;

      // Add-ons (multiplicative)
      const appliedAddons = [];
      Object.entries(addons).forEach(([k, on]) => {
        if (!on) return;
        const mlt = ADDONS[k];
        if (!mlt) return;
        min *= mlt.min;
        max *= mlt.max;
        appliedAddons.push(k);
      });

      // Guard
      min = Math.max(0, min);
      max = Math.max(min, max);

      // Breakdown table entries
      const rows = [];
      rows.push({
        label: `رسوم المؤثرين (تقريبية) × ${deliverables} مخرج`,
        min: baseMin * deliverables,
        max: baseMax * deliverables
      });

      if (deliverables >= 6) rows.push({ label: 'خصم باقة (Volume) — تقديري', min: -(baseMin * deliverables) * (1 - vd.min), max: -(baseMax * deliverables) * (1 - vd.max) });

      rows.push({ label: `مستوى السوق (${complexity === 'conservative' ? 'متحفّظ' : complexity === 'premium' ? 'مرتفع' : 'متوسط'})`, min: (baseMin * deliverables * vd.min) * (cm.min - 1), max: (baseMax * deliverables * vd.max) * (cm.max - 1) });
      rows.push({ label: `مدة الحملة (${days} يوم)`, min: (baseMin * deliverables * vd.min * cm.min) * (dm.min - 1), max: (baseMax * deliverables * vd.max * cm.max) * (dm.max - 1) });

      const addonLabels = {
        usageRights:'حقوق استخدام',
        exclusivity:'حصرية',
        whitelisting:'Whitelisting/Spark',
        production:'إنتاج'
      };
      appliedAddons.forEach(k => {
        const mlt = ADDONS[k];
        rows.push({ label: `إضافة: ${addonLabels[k]}`, min: min / mlt.min * (mlt.min - 1), max: max / mlt.max * (mlt.max - 1) });
      });

      // Recommendation
      const plan = suggestPlan({goal, platform, market, size});

      // Packages
      const packs = buildPackages({goal, platform});

      // Labels
      const marketLabel = market === 'gcc' ? 'الخليج (GCC)' : 'مصر';
      const platformLabel = platform === 'instagram' ? 'Instagram' : platform === 'tiktok' ? 'TikTok' : 'Snapchat';
      const goalLabel = {
        awareness:'وعي/انتشار',
        engagement:'تفاعل',
        leads:'عملاء محتملون',
        sales:'مبيعات',
        launch:'إطلاق'
      }[goal] || goal;
      const sizeLabel = {
        nano:'Nano', micro:'Micro', macro:'Macro', mega:'Mega'
      }[size] || size;
      const typeLabel = {
        reel:'فيديو قصير', story:'Stories', post:'Post/Carousel', live:'Live'
      }[type] || type;

      const addonsLabel = Object.entries(addons).filter(([,v])=>v).map(([k])=>addonLabels[k]).join(' + ');

      const rangeLabel = `${fmt(min, cur)} — ${fmt(max, cur)}`;

      return {
        min, max, cur, rows,
        plan, packs,
        summary: {
          marketLabel, platformLabel, goalLabel, sizeLabel, typeLabel,
          deliverables, days,
          rangeLabel,
          addonsLabel,
          industry
        }
      };
    }

    function render(out){
      if (out.error) {
        alert(out.error);
        return;
      }

      results.style.display = '';
      copyBtn.disabled = false;
      printBtn.disabled = false;

      budgetRange.textContent = `${fmt(out.min, out.cur)} — ${fmt(out.max, out.cur)}`;
      const avg = (out.min + out.max) / 2;
      perDeliverable.textContent = fmt(avg / out.summary.deliverables, out.cur);

      // Pill based on width of range
      const width = out.max - out.min;
      const ratio = width / Math.max(1, out.min);
      if (ratio <= 0.35) {
        rangePill.textContent = 'نطاق ضيق (أقرب)';
        rangePill.className = 'pill ok';
      } else if (ratio <= 0.75) {
        rangePill.textContent = 'نطاق متوسط';
        rangePill.className = 'pill warn';
      } else {
        rangePill.textContent = 'نطاق واسع (حسب المؤثر)';
        rangePill.className = 'pill bad';
      }

      // Quick rec
      quickRec.textContent = out.plan.title;

      // Breakdown
      breakdown.innerHTML = out.rows.map(r => {
        const minTxt = fmt(r.min, out.cur);
        const maxTxt = fmt(r.max, out.cur);
        return `<tr><td>${r.label}</td><td>${minTxt}</td><td>${maxTxt}</td></tr>`;
      }).join('');

      // Packages
      packagesEl.innerHTML = out.packs.map(p => {
        return `<tr><td><strong>${p.name}</strong></td><td>${p.dist}</td><td class="note">${p.why}</td></tr>`;
      }).join('');

      // Build CTA links
      const msg = buildWhatsappMessage(out.summary);

      // NOTE: Replace this with your official WhatsApp number (international format without +)
      const VIVA_WA_NUMBER = '4915565678291';
      const waHref = `https://wa.me/${VIVA_WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      waBtn.href = waHref;

      const mailSubject = `طلب عرض سعر رسمي — حملة مؤثرين (${out.summary.marketLabel})`;
      const mailBody = msg;
      mailBtn.href = `mailto:info@vivamediacreative.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

      // Copy summary
      copyBtn.onclick = async () => {
        const text = [
          'ملخص حاسبة تكلفة حملة المؤثرين — Viva Media Creative',
          `التقدير: ${out.summary.rangeLabel}`,
          `السوق: ${out.summary.marketLabel} | المنصة: ${out.summary.platformLabel}`,
          `الهدف: ${out.summary.goalLabel} | حجم المؤثر: ${out.summary.sizeLabel}`,
          `نوع المحتوى: ${out.summary.typeLabel} | المخرجات: ${out.summary.deliverables} | المدة: ${out.summary.days} يوم`,
          `الإضافات: ${out.summary.addonsLabel || 'بدون'}`
        ].join('\n');
        try{
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = '✅ تم النسخ';
          setTimeout(()=>copyBtn.textContent='نسخ الملخص', 1200);
        }catch(e){
          alert('تعذر النسخ. يمكنك تحديد النص ونسخه يدويًا.');
        }
      };

      // Print
      printBtn.onclick = () => window.print();

      // Store last summary for lead form
      window.__lastSummary = { summary: out.summary, msg };

      // Update recommendation bullets in UI (optional future)
      const recBullets = out.plan.bullets.map(t => `• ${t}`).join('  ');
      document.getElementById('planPill').title = recBullets;
    }

    calcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      updateCompatibilityHint();
      const out = compute();
      render(out);
    });

    resetBtn.addEventListener('click', () => {
      calcForm.reset();
      results.style.display = 'none';
      copyBtn.disabled = true;
      printBtn.disabled = true;
      window.__lastSummary = null;
      updateCompatibilityHint();
    });

    // Lead form (message builder)
    const leadForm = document.getElementById('leadForm');
    const leadOut = document.getElementById('leadOut');
    const copyLeadMsg = document.getElementById('copyLeadMsg');

    function buildLeadMessage(){
      const name = (document.getElementById('name').value || '').trim();
      const email = (document.getElementById('email').value || '').trim();
      const whats = (document.getElementById('whats').value || '').trim();
      const notes = (document.getElementById('notes').value || '').trim();

      const base = window.__lastSummary?.msg || 'أريد عرض سعر رسمي + قائمة مؤثرين مناسبة.';
      const lines = [
        base,
        '',
        '— بيانات التواصل —',
        `الاسم: ${name}`,
        `البريد: ${email}`,
        whats ? `واتساب: ${whats}` : '',
        notes ? `ملاحظات: ${notes}` : ''
      ].filter(Boolean);

      return lines.join('\n');
    }

   leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const msg = buildLeadMessage();

  const leadData = {
    name: document.getElementById('name').value || null,
    email: document.getElementById('email').value || null,
    whatsapp: document.getElementById('whats').value || null,
    notes: document.getElementById('notes').value || null,

    market: window.__lastSummary?.summary?.marketLabel || null,
    platform: window.__lastSummary?.summary?.platformLabel || null,
    goal: window.__lastSummary?.summary?.goalLabel || null,
    influencer_size: window.__lastSummary?.summary?.sizeLabel || null,
    content_type: window.__lastSummary?.summary?.typeLabel || null,
    deliverables: window.__lastSummary?.summary?.deliverables || null,
    campaign_days: window.__lastSummary?.summary?.days || null,
    budget_range: window.__lastSummary?.summary?.rangeLabel || null,
    industry: window.__lastSummary?.summary?.industry || null
  };

  const { error } = await supabaseClient
    .from('influencer_leads')
    .insert([leadData]);

  if (error) {
    console.error(error);
    alert('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
    return;
  }

  leadOut.style.display = '';
  leadOut.textContent = '✅ تم إرسال طلبك بنجاح. سنراجع التفاصيل ونتواصل معك.\n\n' + msg;

  copyLeadMsg.disabled = false;
  copyLeadMsg.onclick = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      copyLeadMsg.textContent = '✅ تم النسخ';
      setTimeout(() => copyLeadMsg.textContent = 'نسخ الرسالة', 1200);
    } catch (err) {
      alert('تعذر النسخ.');
    }
  };
});

    // Initial
    updateCompatibilityHint();
  </script>
