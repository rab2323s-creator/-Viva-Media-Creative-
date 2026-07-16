(() => {
  'use strict';

  /*
   * Viva Media Creative — Influencer Campaign Cost Calculator
   * Estimation model only. It deliberately avoids promising an exact creator fee.
   * Pricing values are centralized below for easy future calibration.
   */

  const CONFIG = {
    whatsappNumber: '4915565678291',
    email: 'info@vivamediacreative.com',
    supabase: {
      url: 'https://qpihjqzyxkpmlegijkmt.supabase.co',
      publishableKey: 'sb_publishable_GXP75aI8EF5i0czaZENTBA_huxSaeum',
      table: 'influencer_leads'
    }
  };

  const MARKETS = {
    sa: { label: 'السعودية', code: 'SAR', symbol: 'ر.س', locale: 'ar-SA', fromSar: 1, marketIndex: 1 },
    ae: { label: 'الإمارات', code: 'AED', symbol: 'د.إ', locale: 'ar-AE', fromSar: 0.98, marketIndex: 1.03 },
    kw: { label: 'الكويت', code: 'KWD', symbol: 'د.ك', locale: 'ar-KW', fromSar: 0.082, marketIndex: 1.02, decimals: 0 },
    qa: { label: 'قطر', code: 'QAR', symbol: 'ر.ق', locale: 'ar-QA', fromSar: 0.97, marketIndex: 0.96 },
    eg: { label: 'مصر', code: 'EGP', symbol: 'ج.م', locale: 'ar-EG', fromSar: 12.8, marketIndex: 0.25 }
  };

  // Baseline branded short-video fee per creator in SAR-equivalent value.
  // Local market index and currency conversion are applied afterward.
  const VIDEO_BASE_SAR = {
    nano:      { min: 650,   likely: 1100,  max: 1900 },
    micro:     { min: 1500,  likely: 3200,  max: 6500 },
    mid:       { min: 5000,  likely: 9500,  max: 18000 },
    macro:     { min: 12000, likely: 22000, max: 40000 },
    mega:      { min: 26000, likely: 48000, max: 90000 },
    celebrity: { min: 60000, likely: 110000,max: 220000 }
  };

  const PLATFORM_FORMAT_MULTIPLIERS = {
    instagram: {
      reel:  { min: 1, likely: 1, max: 1 },
      story: { min: 0.20, likely: 0.25, max: 0.32 },
      post:  { min: 0.48, likely: 0.58, max: 0.70 },
      live:  { min: 1.25, likely: 1.50, max: 1.85 }
    },
    tiktok: {
      reel:  { min: 0.88, likely: 0.95, max: 1.05 },
      story: null,
      post: null,
      live:  { min: 1.10, likely: 1.35, max: 1.70 }
    },
    snapchat: {
      reel: null,
      story: { min: 0.24, likely: 0.30, max: 0.38 },
      post: null,
      live: null
    }
  };

  const PLATFORM_LABELS = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    snapchat: 'Snapchat'
  };

  const TIER_LABELS = {
    nano: 'Nano (1K–10K)',
    micro: 'Micro (10K–100K)',
    mid: 'Mid-tier (100K–500K)',
    macro: 'Macro (500K–1M)',
    mega: 'Mega (1M–3M)',
    celebrity: 'Celebrity (3M+)'
  };

  const TIER_VIEW_BANDS = {
    nano: [1500, 12000], micro: [5000, 75000], mid: [25000, 250000],
    macro: [70000, 600000], mega: [180000, 1500000], celebrity: [400000, 5000000]
  };

  const CPM_SAR = {
    instagram: { min: 18, likely: 34, max: 58 },
    tiktok:    { min: 14, likely: 27, max: 48 },
    snapchat:  { min: 12, likely: 24, max: 44 }
  };

  const ENGAGEMENT_MULT = {
    unknown: { min: 0.96, likely: 1, max: 1.05 },
    low: { min: 0.78, likely: 0.84, max: 0.90 },
    average: { min: 0.95, likely: 1, max: 1.06 },
    strong: { min: 1.06, likely: 1.12, max: 1.20 },
    exceptional: { min: 1.15, likely: 1.24, max: 1.35 }
  };

  const AUDIENCE_MULT = {
    unknown: { min: 0.94, likely: 1, max: 1.06 },
    below30: { min: 0.72, likely: 0.80, max: 0.88 },
    '30to50': { min: 0.88, likely: 0.94, max: 1 },
    '50to70': { min: 0.98, likely: 1.05, max: 1.12 },
    above70: { min: 1.06, likely: 1.14, max: 1.24 }
  };

  const INDUSTRY_MULT = {
    general: 1, food: 0.98, beauty: 1.07, fashion: 1.05,
    technology: 1.08, healthcare: 1.12, finance: 1.18,
    realestate: 1.12, luxury: 1.20, education: 1.02
  };

  const SEASON_MULT = {
    normal: { min: 1, likely: 1, max: 1 },
    high: { min: 1.05, likely: 1.10, max: 1.17 },
    ramadan: { min: 1.08, likely: 1.15, max: 1.25 },
    national: { min: 1.06, likely: 1.12, max: 1.20 },
    shopping: { min: 1.04, likely: 1.09, max: 1.16 },
    urgent: { min: 1.08, likely: 1.16, max: 1.25 }
  };

  const SELECTION_MULT = {
    flexible: { min: 0.96, likely: 1, max: 1.04 },
    specific: { min: 1.02, likely: 1.08, max: 1.16 },
    celebrityDemand: { min: 1.12, likely: 1.24, max: 1.42 }
  };

  const USAGE_RATES = {
    organic: { 30: 0.04, 90: 0.08, 180: 0.14, 365: 0.22 },
    paidSocial: { 30: 0.16, 90: 0.28, 180: 0.42, 365: 0.62 },
    allDigital: { 30: 0.24, 90: 0.40, 180: 0.58, 365: 0.82 }
  };

  const EXCLUSIVITY_RATES = {
    direct: { 7: 0.03, 30: 0.09, 90: 0.20, 180: 0.34 },
    category: { 7: 0.06, 30: 0.16, 90: 0.34, 180: 0.56 }
  };

  const WHITELISTING_RATES = { 30: 0.10, 90: 0.18, 180: 0.28 };

  const PRODUCTION_SAR = {
    creator: { min: 0, likely: 0, max: 0 },
    edited: { min: 350, likely: 700, max: 1300 },
    professional: { min: 1800, likely: 3500, max: 7000 },
    premium: { min: 5500, likely: 10000, max: 22000 }
  };

  const REVISION_RATE = { 1: 0, 2: 0.04, 3: 0.09 };

  const el = id => document.getElementById(id);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const numeric = (id, fallback = 0) => {
    const value = Number(el(id)?.value);
    return Number.isFinite(value) ? value : fallback;
  };
  const checked = id => Boolean(el(id)?.checked);

  const moneyRange = (min, likely, max) => ({ min, likely, max });
  const addRanges = (...ranges) => ranges.reduce((sum, range) => ({
    min: sum.min + (range?.min || 0),
    likely: sum.likely + (range?.likely || 0),
    max: sum.max + (range?.max || 0)
  }), moneyRange(0, 0, 0));
  const multiplyRange = (range, multiplier) => ({
    min: range.min * (multiplier?.min ?? multiplier),
    likely: range.likely * (multiplier?.likely ?? multiplier),
    max: range.max * (multiplier?.max ?? multiplier)
  });
  const scaleRange = (range, factor) => multiplyRange(range, factor);

  function formatMoney(value, market) {
    const decimals = market.code === 'KWD' && Math.abs(value) < 100 ? 1 : 0;
    return `${Math.round(value * (10 ** decimals)) / (10 ** decimals)}`
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ` ${market.symbol}`;
  }

  function convertSarRange(range, market) {
    const factor = market.marketIndex * market.fromSar;
    return scaleRange(range, factor);
  }

  function getBundleDiscount(totalFormatsPerCreator, tier) {
    if (tier === 'celebrity' || totalFormatsPerCreator < 3) return 1;
    if (totalFormatsPerCreator >= 12) return 0.90;
    if (totalFormatsPerCreator >= 7) return 0.94;
    if (totalFormatsPerCreator >= 4) return 0.97;
    return 1;
  }

  function getSupportedCounts(platform, rawCounts) {
    const map = PLATFORM_FORMAT_MULTIPLIERS[platform];
    return Object.fromEntries(Object.entries(rawCounts).map(([type, count]) => [type, map[type] ? count : 0]));
  }

  function calculateFollowerBasedContent({ platform, tier, counts }) {
    const base = VIDEO_BASE_SAR[tier];
    const platformMap = PLATFORM_FORMAT_MULTIPLIERS[platform];
    let total = moneyRange(0, 0, 0);

    Object.entries(counts).forEach(([format, count]) => {
      if (!count || !platformMap[format]) return;
      const unit = multiplyRange(base, platformMap[format]);
      total = addRanges(total, scaleRange(unit, count));
    });
    return total;
  }

  function calculateViewBasedVideo({ platform, tier, averageViews, reelCount }) {
    if (!averageViews || reelCount <= 0) return null;
    const band = TIER_VIEW_BANDS[tier];
    const safeViews = clamp(averageViews, band[0] * 0.45, band[1] * 2.2);
    const cpm = CPM_SAR[platform];
    return {
      min: (safeViews / 1000) * cpm.min * reelCount,
      likely: (safeViews / 1000) * cpm.likely * reelCount,
      max: (safeViews / 1000) * cpm.max * reelCount
    };
  }

  function blendContentEstimates(followerBased, viewBased, reelShare) {
    if (!viewBased || reelShare <= 0) return followerBased;
    // Views influence video pricing, but never fully replace tier/context pricing.
    const weight = 0.38;
    const blendedVideoAdjustment = {
      min: followerBased.min * (1 - weight) + viewBased.min * weight,
      likely: followerBased.likely * (1 - weight) + viewBased.likely * weight,
      max: followerBased.max * (1 - weight) + viewBased.max * weight
    };
    return {
      min: clamp(blendedVideoAdjustment.min, followerBased.min * 0.75, followerBased.min * 1.45),
      likely: clamp(blendedVideoAdjustment.likely, followerBased.likely * 0.78, followerBased.likely * 1.55),
      max: clamp(blendedVideoAdjustment.max, followerBased.max * 0.82, followerBased.max * 1.65)
    };
  }

  function calculateProduction({ level, videoCount, influencerCount, market }) {
    if (level === 'creator' || videoCount === 0) return moneyRange(0, 0, 0);
    const unit = convertSarRange(PRODUCTION_SAR[level], market);
    // One production setup can cover several assets; do not multiply blindly by every deliverable.
    const productionUnits = Math.max(1, Math.ceil(videoCount / 2)) * Math.min(influencerCount, 4);
    return scaleRange(unit, productionUnits);
  }

  function calculateManagement({ level, creatorFees, influencerCount, days, market }) {
    if (level === 'none') return moneyRange(0, 0, 0);
    const durationFactor = days <= 14 ? 1 : days <= 30 ? 1.12 : days <= 60 ? 1.24 : 1.36;
    const creatorFactor = 1 + Math.max(0, influencerCount - 3) * 0.035;
    const rate = level === 'basic'
      ? { min: 0.06, likely: 0.08, max: 0.10 }
      : { min: 0.10, likely: 0.13, max: 0.16 };
    const minimumSar = level === 'basic'
      ? { min: 750, likely: 1200, max: 1800 }
      : { min: 1500, likely: 2600, max: 4200 };
    const percentage = multiplyRange(creatorFees, rate);
    const minimum = scaleRange(convertSarRange(minimumSar, market), durationFactor * creatorFactor);
    return {
      min: Math.max(percentage.min, minimum.min),
      likely: Math.max(percentage.likely, minimum.likely),
      max: Math.max(percentage.max, minimum.max)
    };
  }

  function calculate() {
    const marketKey = el('market').value;
    const market = MARKETS[marketKey];
    const platform = el('platform').value;
    const tier = el('influencerSize').value;
    const influencerCount = clamp(Math.round(numeric('influencerCount', 1)), 1, 50);
    const averageViews = clamp(numeric('averageViews', 0), 0, 100000000);
    const days = numeric('campaignDays', 14);

    const rawCounts = {
      reel: clamp(Math.round(numeric('reelCount')), 0, 30),
      story: clamp(Math.round(numeric('storyCount')), 0, 60),
      post: clamp(Math.round(numeric('postCount')), 0, 20),
      live: clamp(Math.round(numeric('liveCount')), 0, 10)
    };
    const counts = getSupportedCounts(platform, rawCounts);
    const formatsPerCreator = Object.values(counts).reduce((a, b) => a + b, 0);
    if (formatsPerCreator === 0) throw new Error('أضف مخرجًا واحدًا على الأقل متوافقًا مع المنصة المختارة.');

    let perCreatorContent = calculateFollowerBasedContent({ platform, tier, counts });
    const viewBased = calculateViewBasedVideo({ platform, tier, averageViews, reelCount: counts.reel });
    perCreatorContent = blendContentEstimates(perCreatorContent, viewBased, counts.reel / formatsPerCreator);

    const bundleDiscount = getBundleDiscount(formatsPerCreator, tier);
    perCreatorContent = scaleRange(perCreatorContent, bundleDiscount);

    const qualityMult = {
      min: clamp(ENGAGEMENT_MULT[el('engagementQuality').value].min * AUDIENCE_MULT[el('audienceMatch').value].min, 0.65, 1.35),
      likely: clamp(ENGAGEMENT_MULT[el('engagementQuality').value].likely * AUDIENCE_MULT[el('audienceMatch').value].likely, 0.70, 1.45),
      max: clamp(ENGAGEMENT_MULT[el('engagementQuality').value].max * AUDIENCE_MULT[el('audienceMatch').value].max, 0.75, 1.60)
    };
    perCreatorContent = multiplyRange(perCreatorContent, qualityMult);
    perCreatorContent = scaleRange(perCreatorContent, INDUSTRY_MULT[el('industry').value] || 1);
    perCreatorContent = multiplyRange(perCreatorContent, SEASON_MULT[el('season').value]);
    perCreatorContent = multiplyRange(perCreatorContent, SELECTION_MULT[el('creatorSelection').value]);

    let creatorFees = scaleRange(convertSarRange(perCreatorContent, market), influencerCount);
    const revisionRate = REVISION_RATE[numeric('revisionRounds', 1)] || 0;
    const revisions = scaleRange(creatorFees, revisionRate);

    const rightsBase = creatorFees; // Rights are based only on creator content fees, not production/management.
    const usage = checked('usageRights')
      ? scaleRange(rightsBase, USAGE_RATES[el('usageChannel').value][numeric('usageDuration', 30)])
      : moneyRange(0, 0, 0);
    const exclusivity = checked('exclusivity')
      ? scaleRange(rightsBase, EXCLUSIVITY_RATES[el('exclusivityScope').value][numeric('exclusivityDuration', 7)])
      : moneyRange(0, 0, 0);
    const whitelisting = checked('whitelisting')
      ? scaleRange(rightsBase, WHITELISTING_RATES[numeric('whitelistingDuration', 30)])
      : moneyRange(0, 0, 0);

    const totalVideoCount = counts.reel * influencerCount;
    const production = calculateProduction({ level: el('productionLevel').value, videoCount: totalVideoCount, influencerCount, market });
    const management = calculateManagement({ level: el('managementLevel').value, creatorFees, influencerCount, days, market });
    const paidMediaValue = clamp(numeric('paidMediaBudget', 0), 0, 100000000);
    const paidMedia = moneyRange(paidMediaValue, paidMediaValue, paidMediaValue);

    const total = addRanges(creatorFees, revisions, production, usage, exclusivity, whitelisting, management, paidMedia);
    total.likely = clamp(total.likely, total.min, total.max);

    const rows = [
      { label: 'رسوم المؤثرين والمحتوى', range: creatorFees },
      revisionRate ? { label: 'جولات تعديل إضافية', range: revisions } : null,
      production.max ? { label: 'إنتاج ومونتاج إضافي', range: production } : null,
      usage.max ? { label: 'حقوق استخدام المحتوى', range: usage } : null,
      exclusivity.max ? { label: 'حصرية ضد المنافسين', range: exclusivity } : null,
      whitelisting.max ? { label: 'Whitelisting / Spark Ads', range: whitelisting } : null,
      management.max ? { label: 'إدارة الحملة والمتابعة', range: management } : null,
      paidMediaValue ? { label: 'ميزانية الإعلانات الممولة', range: paidMedia } : null
    ].filter(Boolean);

    return {
      marketKey, market, platform, tier, influencerCount, averageViews, days,
      counts, formatsPerCreator, totalDeliverables: formatsPerCreator * influencerCount,
      creatorFees, total, rows, bundleDiscount,
      goal: el('goal').value,
      industry: el('industry').value,
      accuracy: averageViews > 0 ? 'enhanced' : 'standard'
    };
  }

  function getRecommendations(out) {
    const tips = [];
    if (!out.averageViews) tips.push('اطلب متوسط مشاهدات آخر 10 فيديوهات قبل اعتماد الميزانية النهائية.');
    if (out.goal === 'sales' || out.goal === 'leads') tips.push('استخدم كود خصم أو رابط UTM مستقل لكل مؤثر لقياس التحويل.');
    if (out.goal === 'awareness') tips.push('وزّع الميزانية على أكثر من مؤثر Micro أو Mid-tier قبل الانتقال إلى اسم كبير.');
    if (out.platform === 'instagram') tips.push('اجمع بين الفيديو للانتشار وStories للتحويل والرسائل المباشرة.');
    if (out.platform === 'tiktok') tips.push('قيّم المؤثر حسب المشاهدات المعتادة وجودة الفكرة، وليس عدد المتابعين فقط.');
    if (out.platform === 'snapchat') tips.push('استخدم سلسلة قصص قصيرة مع تكرار العرض ونداء إجراء واضح.');
    if (checked('usageRights')) tips.push('ثبّت مدة الاستخدام والقنوات الإعلانية بوضوح داخل العقد.');
    if (checked('exclusivity')) tips.push('احصر الحصرية في المنافسين المباشرين وأقصر مدة ضرورية لتجنب زيادة السعر.');
    return tips.slice(0, 4);
  }

  function buildSummary(out) {
    const formatParts = [];
    if (out.counts.reel) formatParts.push(`${out.counts.reel} فيديو`);
    if (out.counts.story) formatParts.push(`${out.counts.story} Story`);
    if (out.counts.post) formatParts.push(`${out.counts.post} منشور`);
    if (out.counts.live) formatParts.push(`${out.counts.live} Live`);

    return {
      marketLabel: out.market.label,
      platformLabel: PLATFORM_LABELS[out.platform],
      tierLabel: TIER_LABELS[out.tier],
      influencerCount: out.influencerCount,
      contentMix: formatParts.join(' + '),
      totalDeliverables: out.totalDeliverables,
      rangeLabel: `${formatMoney(out.total.min, out.market)} — ${formatMoney(out.total.max, out.market)}`,
      likelyLabel: formatMoney(out.total.likely, out.market),
      averageViews: out.averageViews || 'غير مدخل'
    };
  }

  function render(out) {
    const summary = buildSummary(out);
    el('results').hidden = false;
    el('formError').hidden = true;
    el('copyBtn').disabled = false;
    el('printBtn').disabled = false;

    el('budgetRange').textContent = summary.rangeLabel;
    el('likelyEstimate').textContent = summary.likelyLabel;
    el('creatorFeesResult').textContent = `${formatMoney(out.creatorFees.min, out.market)} — ${formatMoney(out.creatorFees.max, out.market)}`;
    el('perInfluencer').textContent = formatMoney(out.total.likely / out.influencerCount, out.market);
    el('totalDeliverables').textContent = String(out.totalDeliverables);

    const spread = (out.total.max - out.total.min) / Math.max(out.total.likely, 1);
    const pill = el('rangePill');
    if (out.accuracy === 'enhanced' && spread < 0.9) {
      pill.textContent = 'دقة محسّنة بالمشاهدات';
      pill.className = 'pill ok';
    } else if (spread < 1.2) {
      pill.textContent = 'نطاق تقديري متوازن';
      pill.className = 'pill warn';
    } else {
      pill.textContent = 'النطاق واسع حسب اسم المؤثر';
      pill.className = 'pill bad';
    }

    el('accuracyNotice').innerHTML = out.accuracy === 'enhanced'
      ? '<strong>دقة أفضل:</strong> تم دمج متوسط المشاهدات مع فئة المؤثر، مع إبقاء حدود تمنع القفزات غير المنطقية.'
      : '<strong>تقدير مبدئي:</strong> النتيجة مبنية على فئة المؤثر. إدخال متوسط المشاهدات يجعل التقدير أقرب للواقع.';

    el('breakdown').innerHTML = out.rows.map(row => `
      <tr>
        <td>${escapeHtml(row.label)}</td>
        <td>${formatMoney(row.range.min, out.market)}</td>
        <td><strong>${formatMoney(row.range.likely, out.market)}</strong></td>
        <td>${formatMoney(row.range.max, out.market)}</td>
      </tr>`).join('');

    el('quickRec').textContent = `توصية لحملة ${PLATFORM_LABELS[out.platform]} في ${out.market.label}`;
    el('recommendationList').innerHTML = getRecommendations(out).map(tip => `<li>${escapeHtml(tip)}</li>`).join('');

    const message = [
      'مرحبًا Viva Media Creative،',
      'أرغب في عرض سعر رسمي وقائمة مؤثرين مناسبة.',
      '',
      `الدولة: ${summary.marketLabel}`,
      `المنصة: ${summary.platformLabel}`,
      `الفئة: ${summary.tierLabel}`,
      `عدد المؤثرين: ${summary.influencerCount}`,
      `محتوى كل مؤثر: ${summary.contentMix}`,
      `متوسط المشاهدات: ${summary.averageViews}`,
      `التقدير الأقرب: ${summary.likelyLabel}`,
      `النطاق الإرشادي: ${summary.rangeLabel}`,
      '',
      'أرجو إرسال الخيارات المناسبة والتكلفة النهائية.'
    ].join('\n');

    el('waBtn').href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    el('mailBtn').href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`طلب عرض حملة مؤثرين — ${summary.marketLabel}`)}&body=${encodeURIComponent(message)}`;

    window.__vmcEstimate = { out, summary, message };
    el('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
  }

  function updatePlatformCompatibility() {
    const platform = el('platform').value;
    const supported = PLATFORM_FORMAT_MULTIPLIERS[platform];
    const labels = document.querySelectorAll('[data-format]');
    labels.forEach(label => {
      const format = label.dataset.format;
      const input = label.querySelector('input');
      const active = Boolean(supported[format]);
      label.style.opacity = active ? '1' : '.42';
      input.disabled = !active;
      if (!active) input.value = 0;
    });

    if (platform === 'tiktok') {
      if (numeric('reelCount') === 0) el('reelCount').value = 1;
      el('platformHint').textContent = 'TikTok: يتم احتساب الفيديو والبث المباشر فقط.';
    } else if (platform === 'snapchat') {
      if (numeric('storyCount') === 0) el('storyCount').value = 4;
      el('platformHint').textContent = 'Snapchat: يتم احتساب عدد إطارات Stories لكل مؤثر.';
    } else {
      if (numeric('reelCount') === 0 && numeric('storyCount') === 0) {
        el('reelCount').value = 1;
        el('storyCount').value = 3;
      }
      el('platformHint').textContent = 'Instagram: يمكنك دمج Reels وStories والمنشورات والبث المباشر.';
    }
  }

  function bindConditionalToggle(checkId, fieldsId) {
    const control = el(checkId);
    const fields = el(fieldsId);
    if (!control || !fields) return;
    const sync = () => { fields.hidden = !control.checked; };
    control.addEventListener('change', sync);
    sync();
  }

  async function copyCurrentSummary() {
    const data = window.__vmcEstimate;
    if (!data) return;
    const text = [
      'ملخص تقدير حملة المؤثرين — Viva Media Creative',
      `الدولة: ${data.summary.marketLabel}`,
      `المنصة: ${data.summary.platformLabel}`,
      `الفئة: ${data.summary.tierLabel}`,
      `عدد المؤثرين: ${data.summary.influencerCount}`,
      `المحتوى لكل مؤثر: ${data.summary.contentMix}`,
      `التقدير الأقرب: ${data.summary.likelyLabel}`,
      `النطاق: ${data.summary.rangeLabel}`
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      const btn = el('copyBtn');
      const old = btn.textContent;
      btn.textContent = 'تم النسخ ✓';
      setTimeout(() => { btn.textContent = old; }, 1300);
    } catch {
      window.prompt('انسخ الملخص:', text);
    }
  }

  function initOptionalLeadForm() {
    const leadForm = el('leadForm');
    if (!leadForm) return;
    const leadOut = el('leadOut');
    const copyLeadMsg = el('copyLeadMsg');

    leadForm.addEventListener('submit', async event => {
      event.preventDefault();
      const estimate = window.__vmcEstimate;
      const message = estimate?.message || 'أرغب في عرض سعر رسمي وقائمة مؤثرين مناسبة.';
      const leadData = {
        name: el('name')?.value?.trim() || null,
        email: el('email')?.value?.trim() || null,
        whatsapp: el('whats')?.value?.trim() || null,
        notes: el('notes')?.value?.trim() || null,
        market: estimate?.summary?.marketLabel || null,
        platform: estimate?.summary?.platformLabel || null,
        influencer_size: estimate?.summary?.tierLabel || null,
        deliverables: estimate?.summary?.totalDeliverables || null,
        budget_range: estimate?.summary?.rangeLabel || null
      };

      try {
        if (!window.supabase?.createClient) throw new Error('Supabase library unavailable');
        const client = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.publishableKey);
        const { error } = await client.from(CONFIG.supabase.table).insert([leadData]);
        if (error) throw error;
        if (leadOut) {
          leadOut.hidden = false;
          leadOut.textContent = 'تم إرسال طلبك بنجاح. سنراجع التفاصيل ونتواصل معك.';
        }
        if (copyLeadMsg) {
          copyLeadMsg.disabled = false;
          copyLeadMsg.onclick = () => navigator.clipboard.writeText(message);
        }
      } catch (error) {
        console.error(error);
        alert('تعذر إرسال الطلب الآن. استخدم زر واتساب أو البريد لإرسال التفاصيل مباشرة.');
      }
    });
  }

  function init() {
    const form = el('calcForm');
    if (!form) return;

    el('platform').addEventListener('change', updatePlatformCompatibility);
    bindConditionalToggle('usageRights', 'usageFields');
    bindConditionalToggle('exclusivity', 'exclusivityFields');
    bindConditionalToggle('whitelisting', 'whitelistingFields');

    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        render(calculate());
      } catch (error) {
        const box = el('formError');
        box.textContent = error.message || 'تعذر حساب التقدير. راجع البيانات المدخلة.';
        box.hidden = false;
      }
    });

    el('copyBtn').addEventListener('click', copyCurrentSummary);
    el('printBtn').addEventListener('click', () => window.print());
    el('resetBtn').addEventListener('click', () => {
      form.reset();
      el('results').hidden = true;
      el('formError').hidden = true;
      el('copyBtn').disabled = true;
      el('printBtn').disabled = true;
      window.__vmcEstimate = null;
      updatePlatformCompatibility();
      ['usageRights', 'exclusivity', 'whitelisting'].forEach(id => el(id)?.dispatchEvent(new Event('change')));
    });

    const year = el('y');
    if (year) year.textContent = String(new Date().getFullYear());
    updatePlatformCompatibility();
    initOptionalLeadForm();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
