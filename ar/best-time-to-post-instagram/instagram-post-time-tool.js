 (function () {
  "use strict";

  const STORAGE_KEY = "vmc_instagram_time_tool_v2";

  const DAYS = [
    { key: "sat", label: "السبت" },
    { key: "sun", label: "الأحد" },
    { key: "mon", label: "الاثنين" },
    { key: "tue", label: "الثلاثاء" },
    { key: "wed", label: "الأربعاء" },
    { key: "thu", label: "الخميس" },
    { key: "fri", label: "الجمعة" }
  ];

  const TIME_WINDOWS = [
    { key: "w1", start: 8,  end: 10, label: "08:00 - 10:00" },
    { key: "w2", start: 10, end: 12, label: "10:00 - 12:00" },
    { key: "w3", start: 12, end: 14, label: "12:00 - 14:00" },
    { key: "w4", start: 14, end: 16, label: "14:00 - 16:00" },
    { key: "w5", start: 16, end: 18, label: "16:00 - 18:00" },
    { key: "w6", start: 18, end: 20, label: "18:00 - 20:00" },
    { key: "w7", start: 20, end: 22, label: "20:00 - 22:00" },
    { key: "w8", start: 22, end: 24, label: "22:00 - 00:00" }
  ];
 
    
  const WEEKEND_DAYS = new Set(["fri", "sat"]);
  const WINDOW_BASELINE = {
  w1: 38,
  w2: 54,
  w3: 67,
  w4: 70,
  w5: 75,
  w6: 81,
  w7: 83,
  w8: 63
};
const CALIBRATION = {
  weights: {
    audience: 0.22,
    content: 0.18,
    goal: 0.15,
    regional: 0.14,
    day: 0.10,
    seasonal: 0.08,
    competition: 0.10,
    maturity: 0.05,
    psychological: 0.08,
    consistency: 0.05
  },
  penalties: {
    distribution: 1,
    baseline: 1,
    uniformity: 1
  },
  bonuses: {
    contrast: 1,
    synergy: 1,
    dayInteraction: 1,
    dayVariation: 1,
    primaryTieBreaker: 1
  }
};
 const REGION_GROUPS = {
  gulf: {
    label: "الخليج العربي",
    countries: ["السعودية", "الإمارات", "الكويت", "قطر", "البحرين", "عُمان"],
    weekday: { w1: 28, w2: 42, w3: 58, w4: 66, w5: 76, w6: 84, w7: 86, w8: 74 },
    weekend: { w1: 24, w2: 36, w3: 52, w4: 62, w5: 74, w6: 86, w7: 90, w8: 80 }
  },
  egypt: {
    label: "مصر والسودان",
    countries: ["مصر", "السودان"],
    weekday: { w1: 38, w2: 56, w3: 70, w4: 72, w5: 76, w6: 80, w7: 76, w8: 56 },
    weekend: { w1: 32, w2: 48, w3: 64, w4: 68, w5: 74, w6: 79, w7: 77, w8: 60 }
  },
  levant: {
    label: "بلاد الشام والعراق",
    countries: ["الأردن", "لبنان", "فلسطين", "سوريا", "العراق"],
    weekday: { w1: 34, w2: 50, w3: 66, w4: 70, w5: 77, w6: 82, w7: 80, w8: 62 },
    weekend: { w1: 28, w2: 44, w3: 60, w4: 65, w5: 74, w6: 81, w7: 82, w8: 68 }
  },
  maghreb: {
    label: "المغرب العربي",
    countries: ["المغرب", "الجزائر", "تونس", "ليبيا", "موريتانيا"],
    weekday: { w1: 42, w2: 60, w3: 74, w4: 76, w5: 78, w6: 79, w7: 68, w8: 46 },
    weekend: { w1: 34, w2: 52, w3: 68, w4: 71, w5: 76, w6: 78, w7: 70, w8: 50 }
  }
};
const AUDIENCE_PROFILES = {
  mixed: {
    w1: 44, w2: 55, w3: 67, w4: 71, w5: 76, w6: 79, w7: 74, w8: 60
  },
  students: {
    w1: 22, w2: 28, w3: 46, w4: 52, w5: 68, w6: 81, w7: 86, w8: 76
  },
  workers: {
    w1: 30, w2: 42, w3: 73, w4: 62, w5: 78, w6: 83, w7: 69, w8: 44
  },
  parents: {
    w1: 36, w2: 58, w3: 72, w4: 69, w5: 73, w6: 77, w7: 68, w8: 46
  },
  business: {
    w1: 66, w2: 86, w3: 82, w4: 70, w5: 56, w6: 40, w7: 21, w8: 10
  },
  night: {
    w1: 16, w2: 24, w3: 38, w4: 50, w5: 66, w6: 80, w7: 91, w8: 90
  }
};

 const CONTENT_PROFILES = {
  reels: {
    w1: 30, w2: 40, w3: 52, w4: 60, w5: 74, w6: 82, w7: 84, w8: 72
  },
  carousel: {
    w1: 46, w2: 74, w3: 84, w4: 80, w5: 68, w6: 64, w7: 50, w8: 24
  },
  single: {
    w1: 40, w2: 58, w3: 70, w4: 72, w5: 74, w6: 76, w7: 66, w8: 40
  },
  story: {
    w1: 44, w2: 58, w3: 68, w4: 78, w5: 82, w6: 76, w7: 64, w8: 42
  },
  mixed: {
    w1: 38, w2: 56, w3: 68, w4: 72, w5: 74, w6: 76, w7: 68, w8: 44
  }
};

const GOAL_PROFILES = {
  reach: {
    w1: 34, w2: 48, w3: 62, w4: 68, w5: 76, w6: 84, w7: 86, w8: 70
  },
  engagement: {
    w1: 40, w2: 54, w3: 68, w4: 72, w5: 77, w6: 82, w7: 81, w8: 62
  },
  sales: {
    w1: 26, w2: 40, w3: 58, w4: 72, w5: 84, w6: 88, w7: 76, w8: 46
  },
  saves: {
    w1: 50, w2: 76, w3: 84, w4: 79, w5: 68, w6: 71, w7: 54, w8: 24
  },
  authority: {
    w1: 58, w2: 86, w3: 90, w4: 82, w5: 66, w6: 62, w7: 44, w8: 18
  }
};

  const DEPTH_PROFILES = {
  light: {
    w1: 30, w2: 40, w3: 52, w4: 58, w5: 70, w6: 80, w7: 84, w8: 74
  },
  balanced: {
    w1: 40, w2: 58, w3: 70, w4: 72, w5: 74, w6: 78, w7: 72, w8: 48
  },
  deep: {
    w1: 54, w2: 82, w3: 90, w4: 84, w5: 70, w6: 64, w7: 44, w8: 18
  },
  emotional: {
    w1: 28, w2: 36, w3: 50, w4: 60, w5: 72, w6: 82, w7: 88, w8: 80
  },
  promotional: {
    w1: 24, w2: 38, w3: 54, w4: 68, w5: 82, w6: 86, w7: 76, w8: 40
  }
};
  const ACCOUNT_STAGE_PROFILE = {
    new:         { w1: 34, w2: 48, w3: 60, w4: 64, w5: 74, w6: 86, w7: 88, w8: 65 },
    growing:     { w1: 39, w2: 58, w3: 70, w4: 72, w5: 78, w6: 84, w7: 83, w8: 57 },
    established: { w1: 46, w2: 68, w3: 76, w4: 76, w5: 78, w6: 81, w7: 74, w8: 48 },
    large:       { w1: 50, w2: 71, w3: 78, w4: 77, w5: 79, w6: 79, w7: 71, w8: 46 }
  };

 const ACCOUNT_TYPE_PROFILE = {
  creator: {
    w1: 26, w2: 40, w3: 56, w4: 64, w5: 76, w6: 84, w7: 88, w8: 74
  },
  brand: {
    w1: 42, w2: 60, w3: 72, w4: 74, w5: 76, w6: 78, w7: 68, w8: 40
  },
  store: {
    w1: 24, w2: 36, w3: 52, w4: 70, w5: 84, w6: 88, w7: 78, w8: 42
  },
  service: {
    w1: 50, w2: 76, w3: 84, w4: 80, w5: 70, w6: 62, w7: 46, w8: 20
  },
  personal: {
    w1: 36, w2: 50, w3: 64, w4: 68, w5: 74, w6: 80, w7: 76, w8: 58
  }
};

const DAY_QUALITY = {
  reach: {
    sat: 60, sun: 66, mon: 72, tue: 79, wed: 81, thu: 83, fri: 68
  },
  engagement: {
    sat: 64, sun: 68, mon: 72, tue: 77, wed: 79, thu: 81, fri: 71
  },
  sales: {
    sat: 58, sun: 65, mon: 73, tue: 78, wed: 82, thu: 85, fri: 70
  },
  saves: {
    sat: 60, sun: 68, mon: 78, tue: 83, wed: 84, thu: 78, fri: 61
  },
  authority: {
    sat: 56, sun: 70, mon: 81, tue: 85, wed: 86, thu: 77, fri: 54
  }
};

  const ELS = {
    form: document.getElementById("toolForm"),
    primaryGroup: document.getElementById("primaryGroup"),
    accountType: document.getElementById("accountType"),
    audienceType: document.getElementById("audienceType"),
    contentType: document.getElementById("contentType"),
    goalType: document.getElementById("goalType"),
    contentDepth: document.getElementById("contentDepth"),
    accountStage: document.getElementById("accountStage"),
    postingFrequency: document.getElementById("postingFrequency"),
    seasonType: document.getElementById("seasonType"),
    competitionLevel: document.getElementById("competitionLevel"),
    weekendMode: document.getElementById("weekendMode"),
    debugTableBody: document.getElementById("debugTableBody"),
    distGulf: document.getElementById("distGulf"),
    distEgypt: document.getElementById("distEgypt"),
    distLevant: document.getElementById("distLevant"),
    distMaghreb: document.getElementById("distMaghreb"),
    distGulfValue: document.getElementById("distGulfValue"),
    distEgyptValue: document.getElementById("distEgyptValue"),
    distLevantValue: document.getElementById("distLevantValue"),
    distMaghrebValue: document.getElementById("distMaghrebValue"),
    distributionNote: document.getElementById("distributionNote"),

    resultsWrap: document.getElementById("resultsWrap"),
    topWindow: document.getElementById("topWindow"),
    topWindowMeta: document.getElementById("topWindowMeta"),
    bestDays: document.getElementById("bestDays"),
    bestDaysMeta: document.getElementById("bestDaysMeta"),
    confidenceScore: document.getElementById("confidenceScore"),
    confidenceMeta: document.getElementById("confidenceMeta"),
    topThree: document.getElementById("topThree"),
    reasonsList: document.getElementById("reasonsList"),
    weeklyPlanBody: document.getElementById("weeklyPlanBody"),
    copyReportBtn: document.getElementById("copyReportBtn"),
    resetBtn: document.getElementById("resetBtn")
  };

  function init() {
    bindEvents();
    hydrateFromStorage();
    updateDistributionLabels();
    computeAndRender();
  }

  function bindEvents() {
    ELS.form.addEventListener("submit", function (e) {
      e.preventDefault();
      computeAndRender();
    });

    ELS.resetBtn.addEventListener("click", function () {
      resetForm();
      computeAndRender();
    });

    ELS.copyReportBtn.addEventListener("click", copyReport);

    [
      ELS.primaryGroup, ELS.accountType, ELS.audienceType, ELS.contentType,
      ELS.goalType, ELS.contentDepth, ELS.accountStage, ELS.postingFrequency,
      ELS.seasonType, ELS.competitionLevel, ELS.weekendMode,
      ELS.distGulf, ELS.distEgypt, ELS.distLevant, ELS.distMaghreb
    ].forEach(function (el) {
      el.addEventListener("input", function () {
        updateDistributionLabels();
        computeAndRender();
      });
      el.addEventListener("change", function () {
        updateDistributionLabels();
        computeAndRender();
      });
    });
  }

  function resetForm() {
    ELS.primaryGroup.value = "gulf";
    ELS.accountType.value = "creator";
    ELS.audienceType.value = "mixed";
    ELS.contentType.value = "reels";
    ELS.goalType.value = "reach";
    ELS.contentDepth.value = "balanced";
    ELS.accountStage.value = "growing";
    ELS.postingFrequency.value = "3";
    ELS.seasonType.value = "normal";
    ELS.competitionLevel.value = "normal";
    ELS.weekendMode.value = "balanced";

    ELS.distGulf.value = 40;
    ELS.distEgypt.value = 25;
    ELS.distLevant.value = 20;
    ELS.distMaghreb.value = 15;

    saveToStorage();
    updateDistributionLabels();
  }

  function updateDistributionLabels() {
    ELS.distGulfValue.textContent = `${ELS.distGulf.value}%`;
    ELS.distEgyptValue.textContent = `${ELS.distEgypt.value}%`;
    ELS.distLevantValue.textContent = `${ELS.distLevant.value}%`;
    ELS.distMaghrebValue.textContent = `${ELS.distMaghreb.value}%`;

    const total =
      num(ELS.distGulf.value) +
      num(ELS.distEgypt.value) +
      num(ELS.distLevant.value) +
      num(ELS.distMaghreb.value);

    ELS.distributionNote.textContent = `المجموع الحالي: ${total}%`;
    ELS.distributionNote.style.color =
      total === 100 ? "#b6fff4" :
      total > 100 ? "#fecaca" :
      "#fde68a";
  }

  function getContext() {
    const total =
      num(ELS.distGulf.value) +
      num(ELS.distEgypt.value) +
      num(ELS.distLevant.value) +
      num(ELS.distMaghreb.value);

    const safeTotal = total > 0 ? total : 100;

    return {
      primaryGroup: ELS.primaryGroup.value,
      accountType: ELS.accountType.value,
      audienceType: ELS.audienceType.value,
      contentType: ELS.contentType.value,
      goalType: ELS.goalType.value,
      contentDepth: ELS.contentDepth.value,
      accountStage: ELS.accountStage.value,
      postingFrequency: ELS.postingFrequency.value,
      seasonType: ELS.seasonType.value,
      competitionLevel: ELS.competitionLevel.value,
      weekendMode: ELS.weekendMode.value,
      distribution: {
        gulf: num(ELS.distGulf.value) / safeTotal,
        egypt: num(ELS.distEgypt.value) / safeTotal,
        levant: num(ELS.distLevant.value) / safeTotal,
        maghreb: num(ELS.distMaghreb.value) / safeTotal
      },
      rawDistributionTotal: total
    };
  }

  function computeAndRender() {
    const ctx = getContext();
    const analysis = analyze(ctx);
    renderResults(analysis, ctx);
    saveToStorage();
  }

  function analyze(ctx) {
    const scoredSlots = [];

    DAYS.forEach(function (day) {
      TIME_WINDOWS.forEach(function (window) {
        const breakdown = calculateWindowBreakdown(day, window, ctx);
        scoredSlots.push({
          dayKey: day.key,
          dayLabel: day.label,
          windowKey: window.key,
          windowLabel: window.label,
          start: window.start,
          end: window.end,
          total: breakdown.total,
          breakdown: breakdown,
          focus: suggestFocus(window, ctx, breakdown)
        });
      });
    });

    scoredSlots.sort(function (a, b) {
      return b.total - a.total;
    });

    const topOverall = scoredSlots[0];
    const topThree = pickTopUniqueSlots(scoredSlots, 3);
    const topDays = computeBestDays(scoredSlots);
    const weeklyPlan = buildWeeklyPlan(scoredSlots, ctx);
   const confidence = computeConfidence(scoredSlots, topOverall, ctx);
    const reasons = buildReasons(topOverall, topDays, ctx);

    return {
      scoredSlots,
      topOverall,
      topThree,
      topDays,
      weeklyPlan,
      confidence,
      reasons
    };
  }
function calculateWindowBreakdown(day, window, ctx) {
  const audience = getAudienceActivityScore(day, window, ctx);
  const content = getContentFitScore(day, window, ctx);
  const goal = getGoalMatchScore(day, window, ctx);
  const regional = getRegionalOverlapScore(day, window, ctx);
  const dayQuality = getDayQualityScore(day, ctx);
  const seasonal = getSeasonalAdjustmentScore(day, window, ctx);
  const competition = getCompetitionPressureScore(day, window, ctx);
  const maturity = getAccountMaturityScore(day, window, ctx);
  const psychological = getPsychologicalContextScore(day, window, ctx);
  const consistency = getPostingFrequencyScore(day, window, ctx);

  const audienceDelta = relativeProfileDelta([
    { profile: AUDIENCE_PROFILES[ctx.audienceType], weight: 1 }
  ], window.key, 1.0);

  const contentDelta = relativeProfileDelta([
    { profile: CONTENT_PROFILES[ctx.contentType], weight: 0.55 },
    { profile: DEPTH_PROFILES[ctx.contentDepth], weight: 0.25 },
    { profile: ACCOUNT_TYPE_PROFILE[ctx.accountType], weight: 0.20 }
  ], window.key, 1.0);

  const goalDelta = relativeProfileDelta([
    { profile: GOAL_PROFILES[ctx.goalType], weight: 1 }
  ], window.key, 1.0);

  const maturityDelta = relativeProfileDelta([
    { profile: ACCOUNT_STAGE_PROFILE[ctx.accountStage], weight: 1 }
  ], window.key, 0.8);

  const regionalDelta = getRegionalRelativeDelta(day, window, ctx);
  const dayDelta = getDayRelativeDelta(day, ctx);

  const seasonalDelta = seasonal - 60;
  const competitionDelta = competition - 70;
  const psychologicalDelta = psychological - 58;
  const consistencyDelta = consistency - 60;

  let total =
    60 +
    audienceDelta * CALIBRATION.weights.audience +
    contentDelta * CALIBRATION.weights.content +
    goalDelta * CALIBRATION.weights.goal +
    regionalDelta * CALIBRATION.weights.regional +
    dayDelta * CALIBRATION.weights.day +
    seasonalDelta * CALIBRATION.weights.seasonal +
    competitionDelta * CALIBRATION.weights.competition +
    maturityDelta * CALIBRATION.weights.maturity +
    psychologicalDelta * CALIBRATION.weights.psychological +
    consistencyDelta * CALIBRATION.weights.consistency;

  const synergyBonus = getScenarioSynergyBonus(day, window, ctx, {
    audience, content, goal, regional, dayQuality,
    seasonal, competition, maturity, psychological, consistency
  });

  const primaryTieBreaker = getPrimaryGroupTieBreaker(day, window, ctx);
  const dayWindowBonus = getDayWindowInteraction(day, window, ctx);
  const dayVariationOffset = getDayVariationOffset(day, window, ctx);
  const uniformityPenalty = getUniformityPenalty(window, ctx);
  const distributionPenalty = getDistributionPenalty(ctx);
  const baselinePenalty = getWindowBaselinePenalty(window, ctx);

  const contrastBonus = getScenarioContrastBonus(window, ctx, {
    audience,
    content,
    goal,
    regional,
    dayQuality,
    seasonal,
    competition,
    maturity,
    psychological,
    consistency
  });

  const multiplier = getScenarioWindowMultiplier(window, ctx);

  total += synergyBonus * CALIBRATION.bonuses.synergy;
  total += primaryTieBreaker * CALIBRATION.bonuses.primaryTieBreaker;
  total += dayWindowBonus * CALIBRATION.bonuses.dayInteraction;
  total += dayVariationOffset * CALIBRATION.bonuses.dayVariation;
  total -= uniformityPenalty * CALIBRATION.penalties.uniformity;
  total -= distributionPenalty * CALIBRATION.penalties.distribution;
  total -= baselinePenalty * CALIBRATION.penalties.baseline;
  total += contrastBonus * CALIBRATION.bonuses.contrast;

  total = total * multiplier;

  return {
    total: clamp(round(total), 20, 99),
    audience: round(audience),
    content: round(content),
    goal: round(goal),
    regional: round(regional),
    dayQuality: round(dayQuality),
    seasonal: round(seasonal),
    competition: round(competition),
    maturity: round(maturity),
    psychological: round(psychological),
    consistency: round(consistency),

    debug: {
      audienceDelta: round(audienceDelta),
      contentDelta: round(contentDelta),
      goalDelta: round(goalDelta),
      regionalDelta: round(regionalDelta),
      dayDelta: round(dayDelta),
      seasonalDelta: round(seasonalDelta),
      competitionDelta: round(competitionDelta),
      maturityDelta: round(maturityDelta),
      psychologicalDelta: round(psychologicalDelta),
      consistencyDelta: round(consistencyDelta),
      synergyBonus: round(synergyBonus),
      primaryTieBreaker: round(primaryTieBreaker),
      dayWindowBonus: round(dayWindowBonus),
      dayVariationOffset: round(dayVariationOffset),
      uniformityPenalty: round(uniformityPenalty),
      distributionPenalty: round(distributionPenalty),
      baselinePenalty: round(baselinePenalty),
      contrastBonus: round(contrastBonus),
      multiplier: round(multiplier)
    }
  };
}
  function getAudienceActivityScore(day, window, ctx) {
    let score = AUDIENCE_PROFILES[ctx.audienceType][window.key];

  if (ctx.audienceType === "students") {
  if (day.key === "fri" || day.key === "sat") {
    if (window.start === 18 || window.start === 20) score += 4;
    if (window.start === 22) score += 2;
  }
}
    if (ctx.audienceType === "workers") {
      if (day.key === "mon" || day.key === "tue" || day.key === "wed" || day.key === "thu") {
        if (window.start === 12 || window.start === 18) score += 5;
      }
    }

    if (ctx.audienceType === "business") {
      if (day.key === "fri") score -= 8;
      if (window.start >= 20) score -= 8;
    }

    if (ctx.audienceType === "parents") {
      if (window.start === 10 || window.start === 12 || window.start === 20) score += 4;
      if (window.start === 22) score -= 5;
    }

    if (ctx.weekendMode === "strong" && WEEKEND_DAYS.has(day.key)) score += 4;
    if (ctx.weekendMode === "weak" && WEEKEND_DAYS.has(day.key)) score -= 5;

    return clamp(score, 10, 98);
  }

  function getContentFitScore(day, window, ctx) {
    let score =
      CONTENT_PROFILES[ctx.contentType][window.key] * 0.55 +
      DEPTH_PROFILES[ctx.contentDepth][window.key] * 0.25 +
      ACCOUNT_TYPE_PROFILE[ctx.accountType][window.key] * 0.20;

    if (ctx.contentType === "carousel" && ctx.contentDepth === "deep") {
      if (window.start === 10 || window.start === 12 || window.start === 14) score += 8;
      if (window.start >= 22) score -= 8;
    }

   if (ctx.contentType === "reels" && ctx.contentDepth === "light") {
  if (window.start === 16 || window.start === 18 || window.start === 20) score += 4;
  if (window.start === 22) score += 1;
}
    if (ctx.contentType === "story") {
      if (window.start === 14 || window.start === 16) score += 6;
    }

    return clamp(score, 12, 97);
  }

  function getGoalMatchScore(day, window, ctx) {
    let score = GOAL_PROFILES[ctx.goalType][window.key];

    if (ctx.goalType === "sales") {
      if (ctx.accountType === "store") score += 4;
      if (window.start === 16 || window.start === 18) score += 5;
      if (window.start === 22) score -= 6;
    }

    if (ctx.goalType === "authority") {
      if (ctx.contentDepth === "deep" || ctx.contentType === "carousel") score += 5;
      if (window.start === 10 || window.start === 12) score += 5;
      if (window.start >= 20) score -= 6;
    }

    if (ctx.goalType === "saves") {
      if (ctx.contentDepth === "deep" || ctx.contentType === "carousel") score += 7;
      if (window.start === 12 || window.start === 14) score += 4;
    }

   if (ctx.goalType === "reach") {
  if (ctx.contentType === "reels") {
    if (window.start === 18 || window.start === 20) score += 4;
    if (window.start === 22) score += 1;
  }
}
    return clamp(score, 10, 98);
  }

function getRegionalOverlapScore(day, window, ctx) {
  const dayType = WEEKEND_DAYS.has(day.key) ? "weekend" : "weekday";

  let score = 0;
  let strongestGroup = null;
  let strongestWeight = 0;

  Object.keys(ctx.distribution).forEach(function (groupKey) {
    const weight = ctx.distribution[groupKey];
    const value = REGION_GROUPS[groupKey][dayType][window.key];

    score += value * weight;

    if (weight > strongestWeight) {
      strongestWeight = weight;
      strongestGroup = groupKey;
    }
  });

  if (strongestGroup) {
    const dominantValue = REGION_GROUPS[strongestGroup][dayType][window.key];
    score += (dominantValue - 50) * 0.20;
  }

  if (ctx.primaryGroup) {
    const primaryValue = REGION_GROUPS[ctx.primaryGroup][dayType][window.key];
    score += (primaryValue - 50) * 0.12;
  }

  return clamp(score, 10, 98);
}

  function getDayQualityScore(day, ctx) {
    let score = DAY_QUALITY[ctx.goalType][day.key];

    if (ctx.contentType === "reels" && (day.key === "thu" || day.key === "fri")) score += 2;
    if (ctx.contentType === "carousel" && (day.key === "mon" || day.key === "tue" || day.key === "wed")) score += 4;
    if (ctx.audienceType === "business" && (day.key === "fri" || day.key === "sat")) score -= 7;
    if (ctx.accountType === "store" && day.key === "thu") score += 3;

    return clamp(score, 15, 97);
  }
const PRESET_PERSONAS = {
  local_store: {
    label: "متجر محلي",
    accountType: "store",
    audienceType: "workers",
    contentType: "single",
    goalType: "sales",
    contentDepth: "promotional",
    accountStage: "growing",
    postingFrequency: "3",
    competitionLevel: "normal",
    weekendMode: "balanced"
  },
  edu_creator: {
    label: "صانع محتوى تعليمي",
    accountType: "creator",
    audienceType: "mixed",
    contentType: "carousel",
    goalType: "saves",
    contentDepth: "deep",
    accountStage: "growing",
    postingFrequency: "3",
    competitionLevel: "normal",
    weekendMode: "balanced"
  },
  entertainment_creator: {
    label: "صانع محتوى ترفيهي",
    accountType: "creator",
    audienceType: "students",
    contentType: "reels",
    goalType: "reach",
    contentDepth: "light",
    accountStage: "growing",
    postingFrequency: "5",
    competitionLevel: "normal",
    weekendMode: "strong"
  },
  service_business: {
    label: "خدمات / عيادة / مؤسسة",
    accountType: "service",
    audienceType: "business",
    contentType: "carousel",
    goalType: "authority",
    contentDepth: "deep",
    accountStage: "established",
    postingFrequency: "3",
    competitionLevel: "avoid",
    weekendMode: "weak"
  }
};

  function applyPreset(presetKey) {
  const preset = PRESET_PERSONAS[presetKey];
  if (!preset) return;

  ELS.accountType.value = preset.accountType;
  ELS.audienceType.value = preset.audienceType;
  ELS.contentType.value = preset.contentType;
  ELS.goalType.value = preset.goalType;
  ELS.contentDepth.value = preset.contentDepth;
  ELS.accountStage.value = preset.accountStage;
  ELS.postingFrequency.value = preset.postingFrequency;
  ELS.competitionLevel.value = preset.competitionLevel;
  ELS.weekendMode.value = preset.weekendMode;

  computeAndRender();
}
  
  function getSeasonalAdjustmentScore(day, window, ctx) {
    let score = 60;

    if (ctx.seasonType === "normal") {
      score += 0;
    }

    if (ctx.seasonType === "ramadan") {
      if (window.start === 20) score += 22;
      if (window.start === 22) score += 28;
      if (window.start === 12) score -= 8;
      if (window.start === 10) score -= 12;
    }

    if (ctx.seasonType === "eid") {
      if (window.start === 18 || window.start === 20 || window.start === 22) score += 14;
      if (WEEKEND_DAYS.has(day.key) || day.key === "sun") score += 5;
    }

    if (ctx.seasonType === "summer") {
      if (window.start === 20 || window.start === 22) score += 10;
      if (window.start === 10) score -= 5;
    }

    if (ctx.seasonType === "winter") {
      if (window.start === 18 || window.start === 20) score += 7;
      if (window.start === 22) score -= 4;
    }

    if (ctx.seasonType === "backtoschool") {
      if (window.start === 12 || window.start === 18) score += 9;
      if (ctx.audienceType === "students") score += 5;
    }

    if (ctx.seasonType === "shopping") {
      if (window.start === 16 || window.start === 18 || window.start === 20) score += 14;
      if (ctx.goalType === "sales") score += 7;
    }

    return clamp(score, 18, 98);
  }

function getCompetitionPressureScore(day, window, ctx) {
  let score = 70;

  const isPrime = window.start === 18 || window.start === 20;
  const isShoulder = window.start === 16 || window.start === 14;
  const isBusinessHour = window.start === 10 || window.start === 12;
  const isLate = window.start === 22;

  if (ctx.competitionLevel === "normal") {
    if (isPrime) score -= 8;
    if (isShoulder) score += 6;
    if (isBusinessHour) score += 3;
  }

  if (ctx.competitionLevel === "high") {
    if (isPrime) score -= 18;
    if (isShoulder) score += 10;
    if (isBusinessHour) score += 8;
    if (isLate) score -= 4;
  }

  if (ctx.competitionLevel === "avoid") {
    if (isPrime) score -= 28;
    if (isShoulder) score += 16;
    if (isBusinessHour) score += 12;
    if (isLate) score -= 8;
  }

  if (ctx.goalType === "reach" && ctx.contentType === "reels" && isPrime) {
    score += 4;
  }

  if (ctx.goalType === "sales" && (window.start === 16 || window.start === 18)) {
    score += 6;
  }

  return clamp(score, 10, 95);
}

  function getAccountMaturityScore(day, window, ctx) {
    let score = ACCOUNT_STAGE_PROFILE[ctx.accountStage][window.key];

    if (ctx.accountStage === "new") {
      if (window.start === 18 || window.start === 20) score += 4;
    }

    if (ctx.accountStage === "large") {
      if (window.start === 10 || window.start === 12 || window.start === 16) score += 4;
    }

    return clamp(score, 20, 96);
  }

  function getPsychologicalContextScore(day, window, ctx) {
    let score = 58;

    const isMorning = window.start === 8 || window.start === 10;
    const isLunch = window.start === 12 || window.start === 14;
    const isAfterWork = window.start === 16 || window.start === 18;
    const isEvening = window.start === 20;
    const isLate = window.start === 22;

    if (ctx.goalType === "authority" || ctx.goalType === "saves") {
      if (isMorning || isLunch) score += 18;
      if (isLate) score -= 16;
    }

    if (ctx.goalType === "sales") {
      if (isAfterWork || isEvening) score += 18;
      if (isMorning) score -= 8;
    }

    if (ctx.contentDepth === "deep") {
      if (isMorning || isLunch) score += 14;
      if (isLate) score -= 20;
    }

    if (ctx.contentDepth === "emotional") {
      if (isAfterWork || isEvening || isLate) score += 12;
    }

    if (ctx.audienceType === "business") {
      if (isMorning || isLunch) score += 18;
      if (isEvening || isLate) score -= 18;
    }

    if (ctx.audienceType === "students" || ctx.audienceType === "night") {
      if (isEvening || isLate) score += 14;
      if (isMorning) score -= 10;
    }

    if (ctx.accountType === "service") {
      if (isMorning || isLunch) score += 10;
    }

    return clamp(score, 8, 98);
  }

  function getPostingFrequencyScore(day, window, ctx) {
    let score = 60;

    if (ctx.postingFrequency === "1") {
  if (day.key === "tue" || day.key === "wed" || day.key === "thu") score += 8;
  if (window.start === 16 || window.start === 18) score += 3;
}

    if (ctx.postingFrequency === "3") {
      if (day.key === "mon" || day.key === "tue" || day.key === "wed" || day.key === "thu") score += 8;
      if (window.start === 12 || window.start === 16 || window.start === 18) score += 5;
    }

    if (ctx.postingFrequency === "5") {
      if (window.start === 10 || window.start === 12 || window.start === 16 || window.start === 18) score += 5;
      if (window.start === 20) score += 3;
    }

    if (ctx.postingFrequency === "8") {
      if (window.start === 10 || window.start === 12 || window.start === 14 || window.start === 16 || window.start === 18) score += 7;
      if (window.start === 22) score -= 6;
    }

    return clamp(score, 20, 95);
  }

function getScenarioSynergyBonus(day, window, ctx, b) {
  let bonus = 0;
  const s = window.start;
  const isMorning = s === 8 || s === 10;
  const isMid = s === 12 || s === 14;
  const isAfternoon = s === 16 || s === 18;
  const isEvening = s === 20;
  const isLate = s === 22;

  if (ctx.audienceType === "business" && ctx.goalType === "authority") {
    if (isMorning || isMid) bonus += 6;
    if (isEvening || isLate) bonus -= 4;
  }

  if (ctx.accountType === "store" && ctx.goalType === "sales") {
    if (isAfternoon) bonus += 6;
    if (isLate) bonus -= 3;
  }

  if (ctx.contentType === "carousel" && ctx.contentDepth === "deep") {
    if (isMorning || isMid) bonus += 6;
    if (isEvening || isLate) bonus -= 5;
  }

  if (ctx.contentType === "reels" && ctx.goalType === "reach") {
    if (s === 18 || s === 20) bonus += 5;
    if (isMorning) bonus -= 2;
  }

  if (ctx.seasonType === "ramadan") {
    if (s === 20 || s === 22) bonus += 6;
    if (s === 10) bonus -= 4;
  }

  if (ctx.audienceType === "parents" && ctx.accountType === "service") {
    if (s === 10 || s === 12 || s === 20) bonus += 4;
  }

  if (ctx.competitionLevel === "avoid") {
    if ((s === 12 || s === 14 || s === 16) && (b.goal >= 68 || b.content >= 68)) {
      bonus += 5;
    }
    if (s === 20) {
      bonus -= 4;
    }
  }

  if (ctx.weekendMode === "strong" && WEEKEND_DAYS.has(day.key)) {
    if (s === 18 || s === 20) bonus += 4;
  }

  if (ctx.goalType === "authority" && ctx.contentDepth === "deep") {
    if (s === 10 || s === 12) bonus += 5;
    if (s >= 20) bonus -= 5;
  }

  if (ctx.goalType === "saves" && (ctx.contentType === "carousel" || ctx.contentDepth === "deep")) {
    if (s === 12 || s === 14) bonus += 5;
    if (s === 22) bonus -= 4;
  }

  if (ctx.audienceType === "students" && ctx.contentType === "reels") {
    if (s === 18 || s === 20) bonus += 4;
    if (s === 8) bonus -= 3;
  }

  return clamp(bonus, -12, 12);
}
function getPrimaryGroupTieBreaker(day, window, ctx) {
  const dayType = WEEKEND_DAYS.has(day.key) ? "weekend" : "weekday";
  const primaryValue = REGION_GROUPS[ctx.primaryGroup][dayType][window.key];
  return (primaryValue - 50) * 0.12;
}

function getUniformityPenalty(window, ctx) {
  let penalty = 0;

  const isPrime = window.start === 18 || window.start === 20;
  const isLate = window.start === 22;
  const isMid = window.start === 12 || window.start === 14 || window.start === 16;
  const isMorning = window.start === 8 || window.start === 10;

  if (window.start === 20) penalty += 12;
if (window.start === 18) penalty += 8;
  if (window.start === 22) penalty += 5;

  if (ctx.contentType === "reels" && ctx.goalType === "reach" && isPrime) {
    penalty -= 4;
  }

  if (ctx.audienceType === "students" && (isPrime || isLate)) {
    penalty -= 3;
  }

  if (ctx.audienceType === "night" && (isPrime || isLate)) {
    penalty -= 5;
  }

  if (ctx.goalType === "sales" && (window.start === 16 || window.start === 18)) {
    penalty -= 3;
  }

  if (ctx.goalType === "authority" || ctx.goalType === "saves") {
    if (isPrime) penalty += 4;
    if (isLate) penalty += 8;
    if (isMorning || isMid) penalty -= 3;
  }

  if (ctx.audienceType === "business") {
    if (isPrime) penalty += 8;
    if (isLate) penalty += 10;
    if (isMorning || isMid) penalty -= 4;
  }

  if (ctx.competitionLevel === "high") {
    if (isPrime) penalty += 8;
    if (isLate) penalty += 4;
  }

  if (ctx.competitionLevel === "avoid") {
    if (isPrime) penalty += 14;
    if (isLate) penalty += 8;
    if (isMid) penalty -= 4;
  }

  return Math.max(0, penalty);
}

  function getDistributionPenalty(ctx) {
    if (ctx.rawDistributionTotal === 100) return 0;
    return Math.min(9, Math.abs(100 - ctx.rawDistributionTotal) * 0.15);
  }

function computeBestDays(scoredSlots) {
  const map = new Map();

  scoredSlots.forEach(function (slot) {
    if (!map.has(slot.dayKey)) {
      map.set(slot.dayKey, {
        dayKey: slot.dayKey,
        label: slot.dayLabel,
        scores: []
      });
    }
    map.get(slot.dayKey).scores.push(slot.total);
  });

  const days = Array.from(map.values()).map(function (item) {
    const sorted = item.scores.slice().sort(function (a, b) { return b - a; });
    const top1 = sorted[0] || 0;
    const top2 = sorted[1] || 0;
    const top3 = sorted[2] || 0;
    const spread = top1 - (sorted[4] || top3 || top1);

    return {
      dayKey: item.dayKey,
      label: item.label,
      avg: round((top1 * 0.45) + (top2 * 0.30) + (top3 * 0.15) + (spread * 0.10))
    };
  });

  days.sort(function (a, b) { return b.avg - a.avg; });
  return days.slice(0, 3);
}

function buildWeeklyPlan(scoredSlots, ctx) {
  const usedPrimaryWindows = {};
  const plan = [];

  DAYS.forEach(function (day) {
    const daySlots = scoredSlots
      .filter(function (slot) { return slot.dayKey === day.key; })
      .sort(function (a, b) { return b.total - a.total; });

    let primary = daySlots[0];

    for (let i = 0; i < daySlots.length; i++) {
      const candidate = daySlots[i];
      const count = usedPrimaryWindows[candidate.windowKey] || 0;
      const scoreGap = primary.total - candidate.total;

      if (count < 3) {
        if (i === 0 || scoreGap <= 1.5) {
          primary = candidate;
          break;
        }
      }
    }

    usedPrimaryWindows[primary.windowKey] = (usedPrimaryWindows[primary.windowKey] || 0) + 1;

    const secondary = daySlots.find(function (slot) {
      return slot.windowKey !== primary.windowKey;
    }) || daySlots[1] || primary;

    plan.push({
      dayLabel: day.label,
      primaryWindow: primary.windowLabel,
      secondaryWindow: secondary.windowLabel,
      primaryScore: primary.total,
      secondaryScore: secondary.total,
      focus: suggestDayFocus(day.key, ctx, primary)
    });
  });

  return plan;
}

function pickTopUniqueSlots(scoredSlots, limit) {
  const results = [];
  const usedDays = new Set();
  const usedWindows = new Set();

  for (let i = 0; i < scoredSlots.length; i++) {
    const slot = scoredSlots[i];

    if (usedDays.has(slot.dayKey)) continue;
    if (usedWindows.has(slot.windowKey) && results.length < limit - 1) continue;

    results.push(slot);
    usedDays.add(slot.dayKey);
    usedWindows.add(slot.windowKey);

    if (results.length >= limit) break;
  }

  return results;
}

function computeConfidence(scoredSlots, topOverall, ctx) {
  const second = scoredSlots[1] || topOverall;
  const third = scoredSlots[2] || topOverall;
  const fifth = scoredSlots[4] || third;

  const gap1 = topOverall.total - second.total;
  const gap2 = topOverall.total - third.total;
  const gap5 = topOverall.total - fifth.total;

  let confidence = 50;

  confidence += Math.min(12, gap1 * 2.0);
  confidence += Math.min(8, gap2 * 1.2);
  confidence += Math.min(6, gap5 * 0.8);

  const breakdown = topOverall.breakdown;
  const consistencyOfFactors =
    (breakdown.audience + breakdown.content + breakdown.goal + breakdown.regional) / 4;

  confidence += (consistencyOfFactors - 50) * 0.08;

  if (ctx.rawDistributionTotal === 100) confidence += 4;
  else confidence -= 5;

  if (ctx.audienceType === "mixed") confidence -= 2;
  if (ctx.contentType === "mixed") confidence -= 2;
  if (ctx.goalType === "reach" && ctx.contentType === "reels") confidence -= 1;

  if (gap1 < 1.5) confidence -= 8;
  if (gap2 < 2) confidence -= 5;

  return clamp(Math.round(confidence), 35, 94);
}

  function buildReasons(topOverall, topDays, ctx) {
    const b = topOverall.breakdown;
    const reasons = [];

    reasons.push(`النافذة الأعلى كانت ${topOverall.dayLabel} ${topOverall.windowLabel} لأن مجموعها التحليلي وصل إلى ${topOverall.total}/100.`);
    reasons.push(`نشاط الجمهور في هذه النافذة حصل على ${b.audience}/100، وهو مؤشر قوي على أن جمهور ${textForAudience(ctx.audienceType)} يكون أكثر استعدادًا للتفاعل هنا.`);
    reasons.push(`ملاءمة نوع المحتوى سجلت ${b.content}/100 لأن ${textForContent(ctx.contentType)} مع طبيعة المحتوى ${textForDepth(ctx.contentDepth)} ينسجم مع هذا التوقيت.`);
    reasons.push(`توافق الهدف التسويقي وصل إلى ${b.goal}/100، لذلك النافذة مناسبة لهدف ${textForGoal(ctx.goalType)} وليس مجرد وقت شائع عشوائي.`);
    reasons.push(`التطابق الجغرافي سجل ${b.regional}/100 بناءً على توزيع جمهورك بين ${distributionSummary(ctx)}.`);
    reasons.push(`أفضل الأيام لديك هي: ${topDays.map(function (d) { return `${d.label} (${d.avg})`; }).join("، ")}.`);

    if (ctx.competitionLevel === "avoid") {
      reasons.push("تم تخفيض أوزان أوقات الذروة المزدحمة ورفع الأوقات المتوازنة الأقل تشبعًا بالمنافسين.");
    }

    if (ctx.seasonType === "ramadan") {
      reasons.push("تم تعديل المنطق سلوكيًا لرمضان بحيث ترتفع قيمة الساعات المتأخرة بعد الإفطار أكثر من الأيام العادية.");
    }

    if (ctx.audienceType === "business") {
      reasons.push("لأن الجمهور مهني/أعمال، تم إعطاء وزن أكبر لساعات الانتباه الواعي داخل اليوم وتقليل الاعتماد على الليل.");
    }

    return reasons.slice(0, 8);
  }

  function suggestFocus(window, ctx, breakdown) {
    if (ctx.goalType === "sales" && (window.start === 16 || window.start === 18 || window.start === 20)) {
      return "عرض / CTA / رسائل / تحويل";
    }

    if (ctx.goalType === "authority" && (window.start === 10 || window.start === 12)) {
      return "محتوى خبرة / بناء ثقة / إثبات معرفة";
    }

    if (ctx.goalType === "saves" && (ctx.contentType === "carousel" || ctx.contentDepth === "deep")) {
      return "كاروسيل تعليمي / نقاط قابلة للحفظ";
    }

    if (ctx.contentType === "reels" && breakdown.audience >= 75) {
      return "ريلز سريع / Hook قوي / انتشار";
    }

    if (ctx.contentType === "story") {
      return "ستوري تفاعلي / أسئلة / Poll";
    }

    if (ctx.contentDepth === "emotional") {
      return "محتوى قصصي / عاطفي / مشاركة";
    }

    return "منشور رئيسي متوازن";
  }

function suggestDayFocus(dayKey, ctx, primary) {
  if (ctx.goalType === "sales" && (primary.start === 16 || primary.start === 18 || primary.start === 20)) {
    return "محتوى بيعي مباشر أو دعوة واضحة للتحويل";
  }

  if (ctx.goalType === "authority" && (primary.start === 10 || primary.start === 12 || primary.start === 14)) {
    return "محتوى يرسخ الخبرة والهوية";
  }

  if (ctx.goalType === "reach" && ctx.contentType === "reels") {
    return "ريلز أو محتوى سريع الانتشار";
  }

  if (ctx.contentType === "story") {
    return "تفاعل قصير ومستمر";
  }

  if (ctx.contentDepth === "deep") {
    return "محتوى تعليمي أو تحليلي";
  }

  return primary.focus || "محتوى متوازن حسب الخطة";
}
function renderDebugTable(scoredSlots) {
  if (!ELS.debugTableBody) return;

  const top = scoredSlots.slice(0, 8);

  ELS.debugTableBody.innerHTML = top.map(function (slot, index) {
    const d = slot.breakdown.debug || {};

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${slot.dayLabel}</td>
        <td>${slot.windowLabel}</td>
        <td><strong>${slot.total}</strong></td>
        <td>${d.audienceDelta ?? "—"}</td>
        <td>${d.contentDelta ?? "—"}</td>
        <td>${d.goalDelta ?? "—"}</td>
        <td>${d.regionalDelta ?? "—"}</td>
        <td>${d.contrastBonus ?? "—"}</td>
        <td>${d.dayWindowBonus ?? "—"}</td>
        <td>${d.uniformityPenalty ?? "—"}</td>
      </tr>
    `;
  }).join("");
}
  function renderResults(analysis, ctx) {
    ELS.resultsWrap.hidden = false;

    ELS.topWindow.textContent = `${analysis.topOverall.dayLabel} | ${analysis.topOverall.windowLabel}`;
    ELS.topWindowMeta.textContent =
      `النتيجة التحليلية: ${analysis.topOverall.total}/100 | جمهورك الأساسي: ${REGION_GROUPS[ctx.primaryGroup].label}`;

    ELS.bestDays.textContent = analysis.topDays.map(function (d) { return d.label; }).join("، ");
    ELS.bestDaysMeta.textContent =
      `متوسط الأيام الأقوى: ${analysis.topDays.map(function (d) { return `${d.label} (${d.avg})`; }).join(" | ")}`;

    ELS.confidenceScore.textContent = `${analysis.confidence}%`;
    ELS.confidenceMeta.textContent = "تعتمد الثقة على وضوح المدخلات، التوزيع الجغرافي، وتماسك المؤشرات الفرعية.";

    renderTopThree(analysis.topThree);
    renderReasons(analysis.reasons);
    renderWeeklyPlan(analysis.weeklyPlan);
   renderDebugTable(analysis.scoredSlots);
  }

  function renderTopThree(topThree) {
    ELS.topThree.innerHTML = topThree.map(function (slot, i) {
      return `
        <div class="top-box">
          <span class="rank">${i + 1}</span>
          <h4>${slot.dayLabel}</h4>
          <p><strong>${slot.windowLabel}</strong></p>
          <p>النتيجة النهائية: ${slot.total}/100</p>
          <p>الجمهور: ${slot.breakdown.audience} | المحتوى: ${slot.breakdown.content} | الهدف: ${slot.breakdown.goal}</p>
          <p>${escapeHtml(slot.focus)}</p>
        </div>
      `;
    }).join("");
  }

  function renderReasons(reasons) {
    ELS.reasonsList.innerHTML = reasons.map(function (reason) {
      return `<li>${escapeHtml(reason)}</li>`;
    }).join("");
  }

  function renderWeeklyPlan(weeklyPlan) {
    ELS.weeklyPlanBody.innerHTML = weeklyPlan.map(function (item) {
      return `
        <tr>
          <td>${item.dayLabel}</td>
          <td>${item.primaryWindow}<br><span class="muted">درجة: ${item.primaryScore}</span></td>
          <td>${item.secondaryWindow}<br><span class="muted">درجة: ${item.secondaryScore}</span></td>
          <td>${escapeHtml(item.focus)}</td>
        </tr>
      `;
    }).join("");
  }

  function copyReport() {
    const report = buildTextReport();
    navigator.clipboard.writeText(report).then(function () {
      ELS.copyReportBtn.textContent = "تم نسخ التقرير";
      setTimeout(function () {
        ELS.copyReportBtn.textContent = "نسخ التقرير";
      }, 1800);
    }).catch(function () {
      ELS.copyReportBtn.textContent = "تعذر النسخ";
      setTimeout(function () {
        ELS.copyReportBtn.textContent = "نسخ التقرير";
      }, 1800);
    });
  }

  function buildTextReport() {
    const ctx = getContext();
    const analysis = analyze(ctx);
    const top = analysis.topOverall;

    return [
      "أفضل وقت للنشر على إنستغرام - Viva Media Creative",
      "------------------------------------------------",
      `المجموعة الأساسية: ${REGION_GROUPS[ctx.primaryGroup].label}`,
      `نوع الحساب: ${textForAccount(ctx.accountType)}`,
      `نوع الجمهور: ${textForAudience(ctx.audienceType)}`,
      `نوع المحتوى: ${textForContent(ctx.contentType)}`,
      `الهدف: ${textForGoal(ctx.goalType)}`,
      `طبيعة المحتوى: ${textForDepth(ctx.contentDepth)}`,
      `مرحلة الحساب: ${textForStage(ctx.accountStage)}`,
      `الموسم: ${textForSeason(ctx.seasonType)}`,
      `التوزيع الجغرافي: ${distributionSummary(ctx)}`,
      "",
      `أفضل نافذة: ${top.dayLabel} | ${top.windowLabel}`,
      `النتيجة النهائية: ${top.total}/100`,
      `درجة الثقة: ${analysis.confidence}%`,
      "",
      "تفكيك النتيجة:",
      `- نشاط الجمهور: ${top.breakdown.audience}`,
      `- ملاءمة المحتوى: ${top.breakdown.content}`,
      `- توافق الهدف: ${top.breakdown.goal}`,
      `- التطابق الجغرافي: ${top.breakdown.regional}`,
      `- جودة اليوم: ${top.breakdown.dayQuality}`,
      `- أثر الموسم: ${top.breakdown.seasonal}`,
      `- ضغط المنافسة: ${top.breakdown.competition}`,
      `- نضج الحساب: ${top.breakdown.maturity}`,
      `- السياق النفسي: ${top.breakdown.psychological}`,
      `- انتظام الخطة: ${top.breakdown.consistency}`,
      "",
      "أفضل 3 نوافذ:",
      analysis.topThree.map(function (slot, i) {
        return `${i + 1}) ${slot.dayLabel} - ${slot.windowLabel} - ${slot.total}/100`;
      }).join("\n"),
      "",
      "الخطة الأسبوعية:",
      analysis.weeklyPlan.map(function (item) {
        return `${item.dayLabel}: ${item.primaryWindow} | بديل: ${item.secondaryWindow}`;
      }).join("\n"),
      "",
      "أسباب التوصية:",
      analysis.reasons.map(function (r) { return `- ${r}`; }).join("\n")
    ].join("\n");
  }

  function distributionSummary(ctx) {
    return [
      `الخليج ${Math.round(ctx.distribution.gulf * 100)}%`,
      `مصر والسودان ${Math.round(ctx.distribution.egypt * 100)}%`,
      `الشام والعراق ${Math.round(ctx.distribution.levant * 100)}%`,
      `المغرب العربي ${Math.round(ctx.distribution.maghreb * 100)}%`
    ].join(" | ");
  }

  function textForAccount(value) {
    return {
      creator: "صانع محتوى / مؤثر",
      brand: "علامة تجارية / شركة",
      store: "متجر / مبيعات مباشرة",
      service: "خدمات / مؤسسة",
      personal: "شخصي احترافي"
    }[value] || value;
  }

  function textForAudience(value) {
    return {
      mixed: "مختلط",
      students: "طلاب",
      workers: "موظفون",
      parents: "أهالٍ / عائلات",
      business: "رواد أعمال / B2B",
      night: "نشط ليلًا"
    }[value] || value;
  }

  function textForContent(value) {
    return {
      reels: "ريلز",
      carousel: "كاروسيل",
      single: "منشور ثابت",
      story: "ستوري",
      mixed: "مزيج محتوى"
    }[value] || value;
  }

  function textForGoal(value) {
    return {
      reach: "الوصول والانتشار",
      engagement: "التفاعل",
      sales: "المبيعات والرسائل",
      saves: "الحفظ والمشاركة",
      authority: "بناء الثقة والهوية"
    }[value] || value;
  }

  function textForDepth(value) {
    return {
      light: "خفيف / سريع",
      balanced: "متوازن",
      deep: "تعليمي / عميق",
      emotional: "عاطفي / قصصي",
      promotional: "بيعي / ترويجي"
    }[value] || value;
  }

  function textForStage(value) {
    return {
      new: "جديد",
      growing: "ينمو",
      established: "مستقر",
      large: "كبير / قوي"
    }[value] || value;
  }

  function textForSeason(value) {
    return {
      normal: "عادي",
      ramadan: "رمضان",
      eid: "العيد / إجازات",
      summer: "الصيف",
      winter: "الشتاء",
      backtoschool: "العودة للدراسة",
      shopping: "موسم عروض / تسوق"
    }[value] || value;
  }

  function saveToStorage() {
    const data = {
      primaryGroup: ELS.primaryGroup.value,
      accountType: ELS.accountType.value,
      audienceType: ELS.audienceType.value,
      contentType: ELS.contentType.value,
      goalType: ELS.goalType.value,
      contentDepth: ELS.contentDepth.value,
      accountStage: ELS.accountStage.value,
      postingFrequency: ELS.postingFrequency.value,
      seasonType: ELS.seasonType.value,
      competitionLevel: ELS.competitionLevel.value,
      weekendMode: ELS.weekendMode.value,
      distGulf: ELS.distGulf.value,
      distEgypt: ELS.distEgypt.value,
      distLevant: ELS.distLevant.value,
      distMaghreb: ELS.distMaghreb.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function hydrateFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      setValue(ELS.primaryGroup, data.primaryGroup, "gulf");
      setValue(ELS.accountType, data.accountType, "creator");
      setValue(ELS.audienceType, data.audienceType, "mixed");
      setValue(ELS.contentType, data.contentType, "reels");
      setValue(ELS.goalType, data.goalType, "reach");
      setValue(ELS.contentDepth, data.contentDepth, "balanced");
      setValue(ELS.accountStage, data.accountStage, "growing");
      setValue(ELS.postingFrequency, data.postingFrequency, "3");
      setValue(ELS.seasonType, data.seasonType, "normal");
      setValue(ELS.competitionLevel, data.competitionLevel, "normal");
      setValue(ELS.weekendMode, data.weekendMode, "balanced");
      setValue(ELS.distGulf, data.distGulf, "40");
      setValue(ELS.distEgypt, data.distEgypt, "25");
      setValue(ELS.distLevant, data.distLevant, "20");
      setValue(ELS.distMaghreb, data.distMaghreb, "15");
    } catch (err) {
      console.error("Storage parse error", err);
    }
  }

  function setValue(el, value, fallback) {
    el.value = value != null ? value : fallback;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
  }

  function round(num) {
    return Math.round(num * 10) / 10;
  }

  function num(value) {
  return Number(value || 0);
}

function meanValues(obj) {
  const vals = Object.values(obj);
  return vals.reduce(function (sum, n) { return sum + n; }, 0) / vals.length;
}

function weightedWindowValue(parts, windowKey) {
  return parts.reduce(function (sum, part) {
    return sum + (part.profile[windowKey] * part.weight);
  }, 0);
}

function weightedWindowMean(parts) {
  return parts.reduce(function (sum, part) {
    return sum + (meanValues(part.profile) * part.weight);
  }, 0);
}

function relativeProfileDelta(parts, windowKey, scale) {
  const value = weightedWindowValue(parts, windowKey);
  const avg = weightedWindowMean(parts);
  return (value - avg) * (scale || 1);
}

function getRegionalRelativeDelta(day, window, ctx) {
  const dayType = WEEKEND_DAYS.has(day.key) ? "weekend" : "weekday";

  let current = 0;
  Object.keys(ctx.distribution).forEach(function (groupKey) {
    current += REGION_GROUPS[groupKey][dayType][window.key] * ctx.distribution[groupKey];
  });

  const allWindows = TIME_WINDOWS.map(function (w) {
    let score = 0;
    Object.keys(ctx.distribution).forEach(function (groupKey) {
      score += REGION_GROUPS[groupKey][dayType][w.key] * ctx.distribution[groupKey];
    });
    return score;
  });

  const avg = allWindows.reduce(function (sum, n) { return sum + n; }, 0) / allWindows.length;
  return current - avg;
}

function getDayRelativeDelta(day, ctx) {
  const profile = DAY_QUALITY[ctx.goalType];
  return profile[day.key] - meanValues(profile);
}

function getWindowBaselinePenalty(window, ctx) {
  let penalty = Math.max(0, (WINDOW_BASELINE[window.key] - 65) * 0.22);

  if (ctx.goalType === "reach" && ctx.contentType === "reels" && (window.start === 18 || window.start === 20)) {
    penalty *= 0.45;
  }

  if (ctx.audienceType === "night" && window.start >= 20) {
    penalty *= 0.65;
  }

  if (ctx.audienceType === "business" && (window.start === 10 || window.start === 12)) {
    penalty *= 0.55;
  }

  return penalty;
}
  const CALIBRATION = {
  weights: {
    audience: 0.22,
    content: 0.18,
    goal: 0.15,
    regional: 0.14,
    day: 0.10,
    seasonal: 0.08,
    competition: 0.10,
    maturity: 0.05,
    psychological: 0.08,
    consistency: 0.05
  },
  penalties: {
    distribution: 1,
    baseline: 1,
    uniformity: 1
  },
  bonuses: {
    contrast: 1,
    synergy: 1,
    dayInteraction: 1,
    dayVariation: 1,
    primaryTieBreaker: 1
  }
};

function getScenarioWindowMultiplier(window, ctx) {
  let multiplier = 1;
  const s = window.start;

  if ((ctx.goalType === "authority" || ctx.goalType === "saves") &&
      (ctx.contentDepth === "deep" || ctx.contentType === "carousel")) {
    if (s === 10 || s === 12 || s === 14) multiplier += 0.10;
    if (s >= 20) multiplier -= 0.12;
  }

  if (ctx.goalType === "reach" && ctx.contentType === "reels") {
    if (s === 18 || s === 20) multiplier += 0.08;
    if (s === 8 || s === 10) multiplier -= 0.05;
  }

  if (ctx.audienceType === "business" || ctx.accountType === "service") {
    if (s === 10 || s === 12) multiplier += 0.08;
    if (s >= 20) multiplier -= 0.15;
  }

  if (ctx.goalType === "sales" &&
      (ctx.accountType === "store" || ctx.contentDepth === "promotional")) {
    if (s === 16 || s === 18) multiplier += 0.10;
    if (s === 22) multiplier -= 0.10;
  }

  if (ctx.audienceType === "students" && (s === 18 || s === 20 || s === 22)) {
    multiplier += 0.06;
  }

  return clamp(multiplier, 0.78, 1.18);
}
function getGenericWindowScore(windowKey) {
  const profiles = [
    AUDIENCE_PROFILES.mixed,
    CONTENT_PROFILES.mixed,
    GOAL_PROFILES.engagement,
    ACCOUNT_TYPE_PROFILE.personal,
    ACCOUNT_STAGE_PROFILE.growing
  ];

  const total = profiles.reduce(function (sum, profile) {
    return sum + profile[windowKey];
  }, 0);

  return total / profiles.length;
}

function getScenarioContrastBonus(window, ctx, breakdown) {

  const generic = getGenericWindowScore(window.key);

  const scenarioSpecific =
    breakdown.audience * 0.32 +
    breakdown.content * 0.26 +
    breakdown.goal * 0.22 +
    breakdown.regional * 0.20;

  const contrast = scenarioSpecific - generic;

  if (contrast > 8) return 12;
  if (contrast > 5) return 8;
  if (contrast > 2) return 4;

  if (contrast < -8) return -10;
  if (contrast < -5) return -6;
  if (contrast < -2) return -3;

  return 0;
}

function getDayWindowInteraction(day, window, ctx) {
  let bonus = 0;
  const s = window.start;

  if (ctx.goalType === "authority") {
    if ((day.key === "mon" || day.key === "tue" || day.key === "wed") && (s === 10 || s === 12 || s === 14)) {
      bonus += 5;
    }
  }

  if (ctx.goalType === "sales") {
    if ((day.key === "wed" || day.key === "thu") && (s === 16 || s === 18)) {
      bonus += 5;
    }
  }

  if (ctx.goalType === "reach") {
    if ((day.key === "thu" || day.key === "fri") && (s === 18 || s === 20)) {
      bonus += 4;
    }
  }

  if (ctx.audienceType === "business") {
    if ((day.key === "mon" || day.key === "tue") && (s === 10 || s === 12)) {
      bonus += 4;
    }
    if (day.key === "fri" && s >= 18) {
      bonus -= 5;
    }
  }

  if (ctx.audienceType === "students") {
    if ((day.key === "fri" || day.key === "sat") && (s === 18 || s === 20)) {
      bonus += 4;
    }
    if (day.key === "mon" && s === 8) {
      bonus -= 3;
    }
  }

  if (ctx.accountType === "service") {
    if ((day.key === "sun" || day.key === "mon" || day.key === "tue") && (s === 10 || s === 12)) {
      bonus += 4;
    }
  }

  return bonus;
}
 function getDayVariationOffset(day, window, ctx) {
  let offset = 0;
  const s = window.start;

  // تنويع خفيف لأيام العمل
  if (day.key === "mon") {
    if (s === 16) offset += 1.2;
    if (s === 20) offset -= 1.2;
  }

  if (day.key === "tue") {
    if (s === 18) offset += 1.0;
  }

  if (day.key === "wed") {
    if (s === 16) offset += 0.8;
    if (s === 18) offset += 0.6;
  }

  if (day.key === "thu") {
    if (s === 18) offset += 1.4;
    if (s === 20) offset += 0.8;
  }

  if (day.key === "fri") {
    if (s === 18) offset += 1.0;
    if (s === 22) offset += 0.6;
    if (ctx.audienceType === "business") offset -= 1.4;
  }

  if (day.key === "sat") {
    if (s === 16) offset += 0.8;
    if (s === 18) offset += 0.6;
  }

  if (day.key === "sun") {
    if (s === 16) offset += 0.9;
    if (s === 10 && (ctx.goalType === "authority" || ctx.accountType === "service")) {
      offset += 0.8;
    }
  }

  // تعزيز بسيط حسب نوع الهدف
  if (ctx.goalType === "reach" && (s === 18 || s === 20)) {
    offset += 0.4;
  }

  if ((ctx.goalType === "authority" || ctx.goalType === "saves") && (s === 10 || s === 12 || s === 14)) {
    offset += 0.5;
  }

  if (ctx.goalType === "sales" && (s === 16 || s === 18)) {
    offset += 0.5;
  }

  return round(offset);
}
init();
})();
