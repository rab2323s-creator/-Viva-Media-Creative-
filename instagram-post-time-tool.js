(function () {
  "use strict";

  const STORAGE_KEY = "vmc_instagram_time_tool_v1";

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
    { key: "w1", start: 8, end: 10, label: "08:00 - 10:00" },
    { key: "w2", start: 10, end: 12, label: "10:00 - 12:00" },
    { key: "w3", start: 12, end: 14, label: "12:00 - 14:00" },
    { key: "w4", start: 14, end: 16, label: "14:00 - 16:00" },
    { key: "w5", start: 16, end: 18, label: "16:00 - 18:00" },
    { key: "w6", start: 18, end: 20, label: "18:00 - 20:00" },
    { key: "w7", start: 20, end: 22, label: "20:00 - 22:00" },
    { key: "w8", start: 22, end: 24, label: "22:00 - 00:00" }
  ];

  const REGION_GROUPS = {
    gulf: {
      label: "الخليج العربي",
      utc: 3.5,
      countries: ["السعودية", "الإمارات", "الكويت", "قطر", "البحرين", "عُمان"],
      preferredWindows: {
        weekday: { w5: 9, w6: 16, w7: 17, w8: 8, w3: 6 },
        weekend: { w5: 8, w6: 15, w7: 18, w8: 12, w3: 4 }
      }
    },
    egypt: {
      label: "مصر والسودان",
      utc: 2,
      countries: ["مصر", "السودان"],
      preferredWindows: {
        weekday: { w3: 11, w5: 10, w6: 15, w7: 12, w2: 5 },
        weekend: { w3: 9, w5: 9, w6: 13, w7: 11, w2: 4 }
      }
    },
    levant: {
      label: "بلاد الشام والعراق",
      utc: 3,
      countries: ["الأردن", "لبنان", "فلسطين", "سوريا", "العراق"],
      preferredWindows: {
        weekday: { w3: 8, w5: 10, w6: 15, w7: 14, w2: 5 },
        weekend: { w3: 7, w5: 9, w6: 14, w7: 14, w8: 7 }
      }
    },
    maghreb: {
      label: "المغرب العربي",
      utc: 1,
      countries: ["المغرب", "الجزائر", "تونس", "ليبيا", "موريتانيا"],
      preferredWindows: {
        weekday: { w3: 10, w4: 8, w5: 11, w6: 13, w7: 9 },
        weekend: { w3: 8, w4: 7, w5: 10, w6: 12, w7: 10 }
      }
    }
  };

  const GOAL_DAY_WEIGHTS = {
    reach:    { sat: 4, sun: 6, mon: 8, tue: 12, wed: 11, thu: 13, fri: 5 },
    engagement:{ sat: 6, sun: 7, mon: 8, tue: 10, wed: 10, thu: 11, fri: 7 },
    sales:    { sat: 6, sun: 8, mon: 9, tue: 10, wed: 12, thu: 14, fri: 8 },
    saves:    { sat: 5, sun: 7, mon: 9, tue: 12, wed: 12, thu: 10, fri: 6 },
    authority:{ sat: 5, sun: 8, mon: 11, tue: 12, wed: 13, thu: 10, fri: 4 }
  };

  const CONTENT_DAY_BONUS = {
    reels:    { sat: 3, sun: 3, mon: 2, tue: 2, wed: 2, thu: 3, fri: 4 },
    carousel: { sat: 1, sun: 2, mon: 4, tue: 5, wed: 5, thu: 4, fri: 1 },
    single:   { sat: 2, sun: 2, mon: 3, tue: 4, wed: 4, thu: 4, fri: 2 },
    story:    { sat: 2, sun: 3, mon: 3, tue: 3, wed: 3, thu: 3, fri: 2 },
    mixed:    { sat: 2, sun: 3, mon: 3, tue: 4, wed: 4, thu: 4, fri: 2 }
  };

  const WEEKEND_DAYS = new Set(["fri", "sat"]);

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
        saveToStorage();
      });
      el.addEventListener("change", function () {
        updateDistributionLabels();
        saveToStorage();
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
      Number(ELS.distGulf.value) +
      Number(ELS.distEgypt.value) +
      Number(ELS.distLevant.value) +
      Number(ELS.distMaghreb.value);

    ELS.distributionNote.textContent = `المجموع الحالي: ${total}%`;
    ELS.distributionNote.style.color =
      total === 100 ? "#b6fff4" :
      total > 100 ? "#fecaca" :
      "#fde68a";
  }

  function getContext() {
    const total =
      Number(ELS.distGulf.value) +
      Number(ELS.distEgypt.value) +
      Number(ELS.distLevant.value) +
      Number(ELS.distMaghreb.value);

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
        gulf: Number(ELS.distGulf.value) / safeTotal,
        egypt: Number(ELS.distEgypt.value) / safeTotal,
        levant: Number(ELS.distLevant.value) / safeTotal,
        maghreb: Number(ELS.distMaghreb.value) / safeTotal
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
        const score = scoreWindow(day, window, ctx);
        scoredSlots.push({
          dayKey: day.key,
          dayLabel: day.label,
          windowKey: window.key,
          windowLabel: window.label,
          start: window.start,
          end: window.end,
          score: round(score),
          focus: suggestFocus(window, ctx)
        });
      });
    });

    scoredSlots.sort(function (a, b) { return b.score - a.score; });

    const topOverall = scoredSlots[0];
    const topThree = pickTopUniqueSlots(scoredSlots, 3);
    const topDays = computeBestDays(scoredSlots);
    const weeklyPlan = buildWeeklyPlan(scoredSlots, ctx);
    const confidence = computeConfidence(topOverall.score, ctx);
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

  function scoreWindow(day, window, ctx) {
    let score = 34;

    score += dayGoalScore(day.key, ctx.goalType);
    score += contentDayScore(day.key, ctx.contentType);
    score += distributionWindowScore(day, window, ctx);
    score += accountTypeScore(window, ctx.accountType, ctx.goalType);
    score += audienceTypeScore(day, window, ctx.audienceType);
    score += contentTypeScore(window, ctx.contentType);
    score += contentDepthScore(window, ctx.contentDepth);
    score += accountStageScore(window, ctx.accountStage);
    score += postingFrequencyScore(day, window, ctx.postingFrequency);
    score += seasonScore(day, window, ctx.seasonType);
    score += weekendModeScore(day, window, ctx.weekendMode);
    score += competitionScore(window, ctx.competitionLevel, ctx.goalType, ctx.contentType);

    if (ctx.primaryGroup && REGION_GROUPS[ctx.primaryGroup]) {
      score += primaryGroupPriorityBoost(day, window, ctx.primaryGroup);
    }

    if (ctx.rawDistributionTotal !== 100) {
      score -= Math.min(10, Math.abs(100 - ctx.rawDistributionTotal) * 0.15);
    }

    return clamp(score, 25, 99);
  }

  function dayGoalScore(dayKey, goalType) {
    return GOAL_DAY_WEIGHTS[goalType][dayKey] || 0;
  }

  function contentDayScore(dayKey, contentType) {
    return CONTENT_DAY_BONUS[contentType][dayKey] || 0;
  }

  function distributionWindowScore(day, window, ctx) {
    let score = 0;
    const isWeekend = WEEKEND_DAYS.has(day.key);

    Object.keys(ctx.distribution).forEach(function (groupKey) {
      const weight = ctx.distribution[groupKey];
      const group = REGION_GROUPS[groupKey];
      const map = isWeekend ? group.preferredWindows.weekend : group.preferredWindows.weekday;
      const windowScore = map[window.key] || 0;
      score += windowScore * weight * 2.15;
    });

    return score;
  }

  function primaryGroupPriorityBoost(day, window, primaryGroup) {
    const isWeekend = WEEKEND_DAYS.has(day.key);
    const map = isWeekend
      ? REGION_GROUPS[primaryGroup].preferredWindows.weekend
      : REGION_GROUPS[primaryGroup].preferredWindows.weekday;

    return (map[window.key] || 0) * 0.7;
  }

  function accountTypeScore(window, accountType, goalType) {
    let score = 0;

    if (accountType === "creator") {
      if (window.start >= 18 && window.start < 22) score += 6;
      if (goalType === "engagement") score += 2;
    }

    if (accountType === "brand") {
      if (window.start >= 12 && window.start < 20) score += 5;
      if (goalType === "authority") score += 2;
    }

    if (accountType === "store") {
      if (window.start >= 16 && window.start < 22) score += 7;
      if (goalType === "sales") score += 4;
    }

    if (accountType === "service") {
      if (window.start >= 10 && window.start < 18) score += 5;
      if (goalType === "sales" || goalType === "authority") score += 2;
    }

    if (accountType === "personal") {
      if (window.start >= 18 && window.start < 22) score += 5;
    }

    return score;
  }

  function audienceTypeScore(day, window, audienceType) {
    let score = 0;

    if (audienceType === "students") {
      if (window.start >= 18) score += 8;
      if (window.start === 12) score += 3;
      if (day.key === "fri" || day.key === "sat") score += 2;
    }

    if (audienceType === "workers") {
      if (window.start === 12 || window.start === 18 || window.start === 20) score += 7;
      if (window.start === 8) score += 2;
    }

    if (audienceType === "parents") {
      if (window.start === 10 || window.start === 12 || window.start === 20) score += 6;
      if (window.start === 22) score -= 2;
    }

    if (audienceType === "business") {
      if (window.start === 10 || window.start === 12 || window.start === 14) score += 8;
      if (window.start >= 20) score -= 3;
      if (day.key === "fri" || day.key === "sat") score -= 2;
    }

    if (audienceType === "night") {
      if (window.start >= 20) score += 10;
      if (window.start < 12) score -= 2;
    }

    if (audienceType === "mixed") {
      if (window.start === 18 || window.start === 20 || window.start === 12) score += 5;
    }

    return score;
  }

  function contentTypeScore(window, contentType) {
    let score = 0;

    if (contentType === "reels") {
      if (window.start === 18 || window.start === 20) score += 8;
      if (window.start === 16) score += 4;
    }

    if (contentType === "carousel") {
      if (window.start === 12 || window.start === 18) score += 7;
      if (window.start === 20) score += 3;
    }

    if (contentType === "single") {
      if (window.start === 12 || window.start === 18 || window.start === 20) score += 5;
    }

    if (contentType === "story") {
      if (window.start === 10 || window.start === 12 || window.start === 18 || window.start === 20) score += 5;
    }

    if (contentType === "mixed") {
      if (window.start === 12 || window.start === 18 || window.start === 20) score += 6;
    }

    return score;
  }

  function contentDepthScore(window, contentDepth) {
    let score = 0;

    if (contentDepth === "light") {
      if (window.start === 18 || window.start === 20 || window.start === 22) score += 5;
    }

    if (contentDepth === "balanced") {
      if (window.start === 12 || window.start === 18 || window.start === 20) score += 4;
    }

    if (contentDepth === "deep") {
      if (window.start === 10 || window.start === 12 || window.start === 18) score += 7;
      if (window.start === 22) score -= 2;
    }

    if (contentDepth === "emotional") {
      if (window.start === 18 || window.start === 20 || window.start === 22) score += 6;
    }

    if (contentDepth === "promotional") {
      if (window.start === 16 || window.start === 18 || window.start === 20) score += 7;
    }

    return score;
  }

  function accountStageScore(window, accountStage) {
    let score = 0;

    if (accountStage === "new") {
      if (window.start === 18 || window.start === 20) score += 4;
    }

    if (accountStage === "growing") {
      if (window.start === 12 || window.start === 18 || window.start === 20) score += 4;
    }

    if (accountStage === "established") {
      if (window.start === 12 || window.start === 16 || window.start === 18 || window.start === 20) score += 3;
    }

    if (accountStage === "large") {
      if (window.start === 10 || window.start === 12 || window.start === 18 || window.start === 20) score += 3;
      if (window.start === 22) score += 1;
    }

    return score;
  }

  function postingFrequencyScore(day, window, postingFrequency) {
    let score = 0;

    if (postingFrequency === "1") {
      if (day.key === "tue" || day.key === "wed" || day.key === "thu") score += 5;
      if (window.start === 18 || window.start === 20) score += 3;
    }

    if (postingFrequency === "3") {
      if (day.key === "mon" || day.key === "tue" || day.key === "wed" || day.key === "thu") score += 3;
      if (window.start === 12 || window.start === 18 || window.start === 20) score += 3;
    }

    if (postingFrequency === "5") {
      if (window.start === 12 || window.start === 16 || window.start === 18 || window.start === 20) score += 3;
    }

    if (postingFrequency === "8") {
      if (window.start === 10 || window.start === 12 || window.start === 16 || window.start === 18 || window.start === 20) score += 2;
    }

    return score;
  }

  function seasonScore(day, window, seasonType) {
    let score = 0;

    if (seasonType === "ramadan") {
      if (window.start === 20 || window.start === 22) score += 10;
      if (window.start === 12) score -= 2;
    }

    if (seasonType === "eid") {
      if (window.start === 18 || window.start === 20 || window.start === 22) score += 7;
      if (day.key === "fri" || day.key === "sat" || day.key === "sun") score += 2;
    }

    if (seasonType === "summer") {
      if (window.start === 20 || window.start === 22) score += 5;
      if (window.start === 10) score -= 1;
    }

    if (seasonType === "winter") {
      if (window.start === 18 || window.start === 20) score += 4;
      if (window.start === 22) score -= 1;
    }

    if (seasonType === "backtoschool") {
      if (window.start === 12 || window.start === 18 || window.start === 20) score += 4;
      if (audienceWouldLikeSchoolPattern(day, window)) score += 3;
    }

    if (seasonType === "shopping") {
      if (window.start === 16 || window.start === 18 || window.start === 20) score += 7;
      if (day.key === "thu" || day.key === "fri") score += 3;
    }

    return score;
  }

  function audienceWouldLikeSchoolPattern(day, window) {
    return (day.key === "mon" || day.key === "tue" || day.key === "wed") && (window.start === 12 || window.start === 18);
  }

  function weekendModeScore(day, window, weekendMode) {
    let score = 0;

    if (weekendMode === "strong") {
      if (day.key === "fri" || day.key === "sat") score += 6;
      if (window.start === 18 || window.start === 20) score += 2;
    }

    if (weekendMode === "weak") {
      if (day.key === "fri" || day.key === "sat") score -= 5;
      if (day.key === "mon" || day.key === "tue" || day.key === "wed" || day.key === "thu") score += 2;
    }

    return score;
  }

  function competitionScore(window, competitionLevel, goalType, contentType) {
    let score = 0;

    if (competitionLevel === "high") {
      if (window.start === 18 || window.start === 20) score -= 2;
      if (goalType === "reach" && contentType === "reels") score += 1;
    }

    if (competitionLevel === "avoid") {
      if (window.start === 18 || window.start === 20) score -= 6;
      if (window.start === 16 || window.start === 12) score += 4;
      if (window.start === 10) score += 2;
    }

    return score;
  }

  function computeBestDays(scoredSlots) {
    const dayMap = new Map();

    scoredSlots.forEach(function (slot) {
      if (!dayMap.has(slot.dayKey)) {
        dayMap.set(slot.dayKey, { label: slot.dayLabel, total: 0, count: 0 });
      }
      const item = dayMap.get(slot.dayKey);
      item.total += slot.score;
      item.count += 1;
    });

    const averages = Array.from(dayMap.entries()).map(function ([dayKey, item]) {
      return {
        dayKey,
        label: item.label,
        avg: round(item.total / item.count)
      };
    });

    averages.sort(function (a, b) { return b.avg - a.avg; });
    return averages.slice(0, 3);
  }

  function buildWeeklyPlan(scoredSlots, ctx) {
    return DAYS.map(function (day) {
      const daySlots = scoredSlots
        .filter(function (slot) { return slot.dayKey === day.key; })
        .sort(function (a, b) { return b.score - a.score; });

      const primary = daySlots[0];
      const secondary = daySlots.find(function (slot) {
        return slot.windowKey !== primary.windowKey;
      }) || daySlots[1] || primary;

      return {
        dayKey: day.key,
        dayLabel: day.label,
        primaryWindow: primary.windowLabel,
        secondaryWindow: secondary.windowLabel,
        primaryScore: primary.score,
        secondaryScore: secondary.score,
        focus: suggestDayFocus(day.key, ctx)
      };
    });
  }

  function pickTopUniqueSlots(scoredSlots, limit) {
    const usedDays = new Set();
    const results = [];

    for (let i = 0; i < scoredSlots.length; i++) {
      const slot = scoredSlots[i];
      const dayCount = results.filter(function (r) { return r.dayKey === slot.dayKey; }).length;

      if (dayCount >= 1 && results.length < 2) continue;

      results.push(slot);
      usedDays.add(slot.dayKey);

      if (results.length >= limit) break;
    }

    return results;
  }

  function computeConfidence(topScore, ctx) {
    let confidence = 58;

    confidence += (topScore - 50) * 0.9;

    if (ctx.rawDistributionTotal === 100) confidence += 5;
    else confidence -= 4;

    if (ctx.contentType !== "mixed") confidence += 3;
    if (ctx.goalType !== "reach") confidence += 2;
    if (ctx.accountStage === "established" || ctx.accountStage === "large") confidence += 2;
    if (ctx.competitionLevel === "avoid") confidence -= 1;

    confidence = clamp(Math.round(confidence), 52, 96);
    return confidence;
  }

  function buildReasons(topOverall, topDays, ctx) {
    const reasons = [];
    const groupName = REGION_GROUPS[ctx.primaryGroup].label;

    reasons.push(`تم إعطاء أولوية للمجموعة الزمنية الأساسية: ${groupName}.`);
    reasons.push(`أفضل نافذة خرجت هي ${topOverall.dayLabel} ${topOverall.windowLabel} لأنها تحقق توازنًا قويًا بين توقيت النشاط، نوع الجمهور، والهدف التسويقي.`);
    reasons.push(`أفضل الأيام لديك هي: ${topDays.map(function (d) { return d.label; }).join("، ")}.`);

    if (ctx.contentType === "reels") {
      reasons.push("تم ترجيح ساعات المساء أكثر لأن الريلز يستفيد عادة من النشاط السريع والمشاهدة المتدفقة.");
    }

    if (ctx.contentType === "carousel" || ctx.contentDepth === "deep") {
      reasons.push("تم تعزيز نوافذ الظهيرة والمساء المبكر لأن المحتوى التعليمي أو الكاروسيل يحتاج إلى وقت تركيز أفضل.");
    }

    if (ctx.goalType === "sales") {
      reasons.push("تم تعزيز نوافذ ما بعد الظهر والمساء لأنها مناسبة أكثر للرسائل واتخاذ القرار الشرائي.");
    }

    if (ctx.audienceType === "workers") {
      reasons.push("تم منح نقاط إضافية لفترات الغداء وبعد انتهاء الدوام لأن جمهور الموظفين يتفاعل غالبًا في هذه الساعات.");
    }

    if (ctx.audienceType === "students") {
      reasons.push("تم دعم ساعات المساء بشكل أكبر لأن جمهور الطلاب يميل إلى التفاعل بعد الدراسة.");
    }

    if (ctx.seasonType === "ramadan") {
      reasons.push("تم تعديل التوصيات لصالح المساء المتأخر لأن سلوك التفاعل في رمضان يختلف عن بقية السنة.");
    }

    if (ctx.competitionLevel === "avoid") {
      reasons.push("تم تخفيف الاعتماد على الذروة التقليدية لتجنب الزحام الشديد في ساعات النشر الأكثر ازدحامًا.");
    }

    return reasons.slice(0, 7);
  }

  function suggestFocus(window, ctx) {
    const type = ctx.contentType;
    const goal = ctx.goalType;

    if (type === "reels" && (window.start === 18 || window.start === 20)) {
      return "ريلز سريع / ترند / جذب وصول";
    }

    if (type === "carousel" && (window.start === 12 || window.start === 18)) {
      return "كاروسيل تعليمي / حفظ ومشاركة";
    }

    if (goal === "sales" && (window.start === 16 || window.start === 18 || window.start === 20)) {
      return "عرض / CTA / رسائل";
    }

    if (goal === "authority") {
      return "محتوى ثقة / خبرة / قيمة";
    }

    if (type === "story") {
      return "ستوري تفاعلي / أسئلة / استطلاع";
    }

    return "منشور رئيسي / تفاعل";
  }

  function suggestDayFocus(dayKey, ctx) {
    if (ctx.goalType === "sales" && (dayKey === "wed" || dayKey === "thu")) {
      return "محتوى بيعي أو دعوة واضحة للتحويل";
    }

    if (ctx.goalType === "reach" && (dayKey === "thu" || dayKey === "fri")) {
      return "محتوى واسع الانتشار أو ريلز";
    }

    if (ctx.goalType === "saves") {
      return "محتوى تعليمي قابل للحفظ";
    }

    if (ctx.goalType === "authority") {
      return "محتوى يرسخ الخبرة والهوية";
    }

    return "محتوى متوازن حسب الخطة";
  }

  function renderResults(analysis, ctx) {
    ELS.resultsWrap.hidden = false;

    ELS.topWindow.textContent = `${analysis.topOverall.dayLabel} | ${analysis.topOverall.windowLabel}`;
    ELS.topWindowMeta.textContent = `أفضل توقيت أساسي ضمن تحليل السوق: ${REGION_GROUPS[ctx.primaryGroup].label}`;

    ELS.bestDays.textContent = analysis.topDays.map(function (day) { return day.label; }).join("، ");
    ELS.bestDaysMeta.textContent = `متوسط قوة الأيام: ${analysis.topDays.map(function (d) { return `${d.label} (${d.avg})`; }).join(" | ")}`;

    ELS.confidenceScore.textContent = `${analysis.confidence}%`;
    ELS.confidenceMeta.textContent = `تقدير الثقة مبني على وضوح الإعدادات، منطق التوقيت، وتوزيع الجمهور.`;

    renderTopThree(analysis.topThree);
    renderReasons(analysis.reasons);
    renderWeeklyPlan(analysis.weeklyPlan);
  }

  function renderTopThree(topThree) {
    ELS.topThree.innerHTML = topThree.map(function (slot, index) {
      return `
        <div class="top-box">
          <span class="rank">${index + 1}</span>
          <h4>${slot.dayLabel}</h4>
          <p><strong>${slot.windowLabel}</strong></p>
          <p>درجة التوصية: ${slot.score}</p>
          <p>${slot.focus}</p>
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
          <td>${item.primaryWindow} <br><span class="muted">درجة: ${item.primaryScore}</span></td>
          <td>${item.secondaryWindow} <br><span class="muted">درجة: ${item.secondaryScore}</span></td>
          <td>${item.focus}</td>
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

    const distributionText = [
      `الخليج ${Math.round(ctx.distribution.gulf * 100)}%`,
      `مصر والسودان ${Math.round(ctx.distribution.egypt * 100)}%`,
      `الشام والعراق ${Math.round(ctx.distribution.levant * 100)}%`,
      `المغرب العربي ${Math.round(ctx.distribution.maghreb * 100)}%`
    ].join(" | ");

    const weekly = analysis.weeklyPlan.map(function (item) {
      return `${item.dayLabel}: ${item.primaryWindow} (بديل: ${item.secondaryWindow})`;
    }).join("\n");

    return [
      "أفضل وقت للنشر على إنستغرام - Viva Media Creative",
      "---------------------------------------------",
      `المجموعة الزمنية الأساسية: ${REGION_GROUPS[ctx.primaryGroup].label}`,
      `نوع الحساب: ${textForAccount(ctx.accountType)}`,
      `نوع الجمهور: ${textForAudience(ctx.audienceType)}`,
      `نوع المحتوى: ${textForContent(ctx.contentType)}`,
      `الهدف: ${textForGoal(ctx.goalType)}`,
      `الموسم: ${textForSeason(ctx.seasonType)}`,
      `توزيع الجمهور: ${distributionText}`,
      "",
      `أفضل نافذة أساسية: ${analysis.topOverall.dayLabel} | ${analysis.topOverall.windowLabel}`,
      `أفضل الأيام: ${analysis.topDays.map(function (d) { return d.label; }).join("، ")}`,
      `درجة الثقة: ${analysis.confidence}%`,
      "",
      "أفضل 3 نوافذ:",
      analysis.topThree.map(function (slot, i) {
        return `${i + 1}) ${slot.dayLabel} - ${slot.windowLabel} - درجة ${slot.score}`;
      }).join("\n"),
      "",
      "خطة النشر الأسبوعية:",
      weekly,
      "",
      "أسباب التوصية:",
      analysis.reasons.map(function (r) { return `- ${r}`; }).join("\n")
    ].join("\n");
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
      parents: "عائلات / أهالٍ",
      business: "B2B / رواد أعمال",
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
    if (!raw) {
      ELS.accountStage.value = "growing";
      return;
    }

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

  init();
})();
