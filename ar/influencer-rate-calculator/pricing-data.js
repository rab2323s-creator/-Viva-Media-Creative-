'use strict';

(function(root, factory){
  const data = typeof module !== 'undefined' && module.exports
    ? require('./pricing-data.js')
    : root.CreatorPricingData;
  const deals = typeof module !== 'undefined' && module.exports
    ? require('./deal-data.js')
    : (root.CREATOR_DEAL_DATA || []);
  const api = factory(data, deals);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.CreatorPricingEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(DATA, DEFAULT_DEALS){
  if (!DATA) throw new Error('CreatorPricingData is required.');

  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  const safeNumber = (v,fallback=0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  const logSafe = v => Math.log(Math.max(1e-9,v));

  function logInterpolate(points, values, x){
    x = Math.max(1, safeNumber(x, points[0]));
    if (x <= points[0]){
      const slope = (logSafe(values[1])-logSafe(values[0]))/(logSafe(points[1])-logSafe(points[0]));
      return values[0] * Math.pow(x/points[0], clamp(slope,.12,.75));
    }
    const last = points.length-1;
    if (x >= points[last]){
      const slope = (logSafe(values[last])-logSafe(values[last-1]))/(logSafe(points[last])-logSafe(points[last-1]));
      return values[last] * Math.pow(x/points[last], clamp(slope,.08,.45));
    }
    for (let i=0;i<last;i++){
      if (x >= points[i] && x <= points[i+1]){
        const t=(logSafe(x)-logSafe(points[i]))/(logSafe(points[i+1])-logSafe(points[i]));
        return Math.exp(logSafe(values[i])+(logSafe(values[i+1])-logSafe(values[i]))*t);
      }
    }
    return values[last];
  }

  function normalizeData(input={}){
    const platform = DATA.content[input.platform] ? input.platform : 'instagram';
    const defaultType = Object.keys(DATA.content[platform])[0];
    const contentType = DATA.content[platform][input.contentType] ? input.contentType : defaultType;
    return {
      market: DATA.markets[input.market] ? input.market : 'sa',
      platform,
      contentType,
      followers: clamp(safeNumber(input.followers,50000),1000,100000000),
      engagement: clamp(safeNumber(input.engagement,0),0,30),
      views: clamp(safeNumber(input.views,0),0,100000000),
      storyViews: clamp(safeNumber(input.storyViews,0),0,100000000),
      audiencePct: clamp(safeNumber(input.audiencePct ?? input.audience,0),0,100),
      niche: DATA.niches[input.niche] ? input.niche : 'general',
      creatorProfile: ['digital','expert','publicFigure','celebrity'].includes(input.creatorProfile || input.profile) ? (input.creatorProfile || input.profile) : 'digital',
      demand: ['normal','busy','high'].includes(input.demand) ? input.demand : 'normal',
      collaborations: clamp(Math.round(safeNumber(input.collaborations,0)),0,100),
      usage: !!input.usage,
      usageChannel: DATA.commercial.usageChannel[input.usageChannel] != null ? input.usageChannel : 'organic',
      usageDuration: String(input.usageDuration || '30'),
      exclusivity: !!input.exclusivity,
      exclusivityScope: DATA.commercial.exclusivityScope[input.exclusivityScope] != null ? input.exclusivityScope : 'direct',
      exclusivityDuration: String(input.exclusivityDuration || '30'),
      whitelisting: !!input.whitelisting,
      whitelistDuration: String(input.whitelistDuration || '30'),
      production: DATA.commercial.production[input.production] != null ? input.production : 'standard',
      revisions: String(input.revisions || '1'),
      rush: DATA.commercial.rush[input.rush] != null ? input.rush : 'normal'
    };
  }

  function displayTier(followers){
    if (followers < 10000) return 'Nano';
    if (followers < 100000) return 'Micro';
    if (followers < 500000) return 'Mid-tier';
    if (followers < 1000000) return 'Macro';
    if (followers < 3000000) return 'Mega';
    return 'Celebrity';
  }

  function formatCurrency(value, market){
    const m=DATA.markets[market] || DATA.markets.sa;
    const digits = market === 'kw' && Math.abs(value) < 100 ? 1 : 0;
    return Number(value || 0).toLocaleString(m.locale,{maximumFractionDigits:digits,minimumFractionDigits:0})+' '+m.symbol;
  }

  function followerAnchor(d){
    const curve = DATA.followerCurves[d.market][d.platform][d.contentType];
    const base = logInterpolate(DATA.followersPoints,curve,d.followers);
    return base * DATA.nicheFactors[d.market][d.niche];
  }

  function engagementBenchmark(d){
    return logInterpolate(DATA.followersPoints,DATA.engagementCurves[d.platform],d.followers);
  }

  function engagementMetric(d){
    const benchmark = engagementBenchmark(d);
    if (!d.engagement) return {benchmark,ratio:0,factor:1,label:'غير مدخل',score:50};
    const ratio=d.engagement/benchmark;
    const cfg=DATA.engagementCorrection;
    const factor=clamp(1+(ratio-1)*cfg.slope,cfg.min,cfg.max);
    let label='ضمن المتوسط';
    if (ratio>=1.45) label='ممتاز';
    else if (ratio>=1.12) label='قوي';
    else if (ratio<.72) label='منخفض';
    const score=clamp(68+(ratio-1)*28,12,100);
    return {benchmark,ratio,factor,label,score};
  }

  function audienceMetric(percent){
    if (!percent) return {factor:.98,label:'غير معروف',score:48};
    let factor=1,label='متوسط';
    if (percent<20){factor=.85;label='منخفض جدًا';}
    else if (percent<40){factor=.92;label='منخفض';}
    else if (percent<60){factor=.98;label='متوسط';}
    else if (percent<75){factor=1.04;label='جيد';}
    else if (percent<90){factor=1.09;label='قوي';}
    else {factor=1.13;label='ممتاز';}
    return {factor,label,score:clamp(30+percent*.78,30,100)};
  }

  function viewMetric(d, anchor){
    const format=DATA.content[d.platform][d.contentType];
    if (!format.viewMode) return {
      applicable:false, available:false, observed:0, expected:0, expectedRatio:0,
      performance:1, anchor, label:'غير مطبق', score:60
    };
    const ratioCurve=DATA.viewRatioCurves[d.platform][format.viewMode];
    const expectedRatio=logInterpolate(DATA.followersPoints,ratioCurve,d.followers);
    const expected=Math.max(1,d.followers*expectedRatio);
    const observed=format.usesStoryViews ? d.storyViews : d.views;
    if (!observed) return {
      applicable:true, available:false, observed:0, expected, expectedRatio,
      performance:0, anchor, label:'غير مدخل', score:50
    };

    const performance=observed/expected;
    const valuePer1k=DATA.viewValuePer1k[d.market][d.platform][format.viewMode];
    const monetaryAnchor=(observed/1000)*valuePer1k*DATA.nicheFactors[d.market][d.niche];
    const performanceAnchor=anchor*Math.pow(Math.max(.05,performance),.55);
    let viewAnchor=Math.sqrt(Math.max(1,monetaryAnchor)*Math.max(1,performanceAnchor));
    viewAnchor=clamp(viewAnchor,anchor*DATA.viewAnchorCaps[0],anchor*DATA.viewAnchorCaps[1]);

    let label='طبيعي';
    if (performance>=1.50) label='ممتاز';
    else if (performance>=1.12) label='قوي';
    else if (performance<.65) label='منخفض';
    const score=clamp(68+(performance-1)*25,10,100);
    return {applicable:true,available:true,observed,expected,expectedRatio,performance,anchor:viewAnchor,monetaryAnchor,performanceAnchor,valuePer1k,label,score};
  }

  function seedCore(input){
    const d=normalizeData(input);
    const format=DATA.content[d.platform][d.contentType];
    const anchor=followerAnchor(d);
    const views=viewMetric(d,anchor);
    const engagement=engagementMetric(d);
    const audience=audienceMetric(d.audiencePct);
    const viewWeight=format.viewMode && views.available ? format.viewWeight : 0;

    const blended=anchor*(1-viewWeight)+views.anchor*viewWeight;
    let fairSeed=blended*engagement.factor*audience.factor;
    fairSeed=clamp(fairSeed,anchor*.62,anchor*1.55);

    const dispersion=format.dispersion;
    const marketMedianSeed=anchor;
    const marketP25Seed=marketMedianSeed*dispersion[0];
    const marketP75Seed=marketMedianSeed*dispersion[1];
    return {d,format,anchor,views,engagement,audience,viewWeight,blended,fairSeed,marketMedianSeed,marketP25Seed,marketP75Seed};
  }

  function dateWeight(dateValue, now=new Date()){
    const dt=new Date(dateValue);
    if (Number.isNaN(dt.getTime())) return .25;
    const days=Math.max(0,(now-dt)/86400000);
    if (days<=90) return 1;
    if (days<=180) return .90;
    if (days<=365) return .75;
    if (days<=730) return .50;
    return .25;
  }

  function weightedQuantile(items, q){
    if (!items.length) return null;
    const sorted=items.slice().sort((a,b)=>a.value-b.value);
    const total=sorted.reduce((s,x)=>s+x.weight,0);
    if (!total) return sorted[Math.floor((sorted.length-1)*q)].value;
    const target=total*q;
    let acc=0;
    for (const item of sorted){
      acc+=item.weight;
      if (acc>=target) return item.value;
    }
    return sorted[sorted.length-1].value;
  }

  function comparableDeals(d, currentSeedMedian, dealData=DEFAULT_DEALS){
    const currentView = DATA.content[d.platform][d.contentType].usesStoryViews ? d.storyViews : d.views;
    const candidates=[];
    for (const raw of (dealData || [])){
      if (!raw || raw.market!==d.market || raw.platform!==d.platform || raw.contentType!==d.contentType) continue;
      const fee=safeNumber(raw.finalPublishingFee,0);
      const followers=safeNumber(raw.followers,0);
      if (!(fee>0 && followers>=1000)) continue;
      const dd=normalizeData({
        market:raw.market,platform:raw.platform,contentType:raw.contentType,
        followers,engagement:raw.engagement,views:raw.averageViews ?? raw.views,
        storyViews:raw.storyViews,audiencePct:raw.audiencePct,niche:raw.niche || 'general'
      });
      const dealSeed=seedCore(dd).marketMedianSeed;
      if (!(dealSeed>0)) continue;

      const followerDistance=Math.abs(Math.log(dd.followers/d.followers));
      const followerSimilarity=Math.exp(-followerDistance*.95);
      if (followerSimilarity<.12) continue;

      let nicheSimilarity=.48;
      if (dd.niche===d.niche) nicheSimilarity=1;
      else if (dd.niche==='general' || d.niche==='general') nicheSimilarity=.68;

      let viewSimilarity=1;
      const dealFormat=DATA.content[dd.platform][dd.contentType];
      const dealView=dealFormat.usesStoryViews ? dd.storyViews : dd.views;
      if (currentView>0 && dealView>0){
        viewSimilarity=Math.exp(-Math.abs(Math.log(dealView/currentView))*.30);
      }

      const freshness=dateWeight(raw.date);
      const weight=followerSimilarity*nicheSimilarity*viewSimilarity*freshness;
      if (weight<.06) continue;

      const normalizedFee=fee*(currentSeedMedian/dealSeed);
      candidates.push({value:normalizedFee,weight,raw});
    }
    return candidates;
  }

  function calibrationFor(core, dealData=DEFAULT_DEALS){
    const cfg=DATA.calibration;
    const comps=comparableDeals(core.d,core.marketMedianSeed,dealData);
    const rawCount=comps.length;
    const effectiveCount=comps.reduce((s,x)=>s+x.weight,0);
    if (rawCount<cfg.minDeals){
      return {
        applied:false,factor:1,rawCount,effectiveCount,trust:0,
        marketMedian:core.marketMedianSeed,marketP25:core.marketP25Seed,marketP75:core.marketP75Seed,
        basis: rawCount ? 'seed_with_insufficient_deals' : 'seed_only'
      };
    }

    const q25=weightedQuantile(comps,.25);
    const q50=weightedQuantile(comps,.50);
    const q75=weightedQuantile(comps,.75);
    const trust=clamp(cfg.maxBlend*(effectiveCount/cfg.fullTrustDeals),.10,cfg.maxBlend);
    const blend=(seed,actual)=>seed*(1-trust)+actual*trust;
    const median=blend(core.marketMedianSeed,q50);
    let p25=blend(core.marketP25Seed,q25);
    let p75=blend(core.marketP75Seed,q75);
    p25=Math.min(p25,median*.97);
    p75=Math.max(p75,median*1.03);
    const factor=clamp(median/core.marketMedianSeed,cfg.factorClamp[0],cfg.factorClamp[1]);
    return {
      applied:true,factor,rawCount,effectiveCount,trust,q25,q50,q75,
      marketMedian:core.marketMedianSeed*factor,
      marketP25:p25,
      marketP75:p75,
      basis:'blended_real_deals'
    };
  }

  function estimateQuality(core,calibration){
    let score=46;
    if (core.engagement.ratio>0) score+=10;
    if (core.format.viewMode){
      if (core.views.available) score+=20;
    } else score+=12;
    if (core.d.audiencePct>0) score+=10;
    if (core.d.niche!=='general') score+=4;

    if (calibration.applied){
      score+=clamp(4+calibration.effectiveCount*.75,4,14);
    }
    let cap=82;
    if (calibration.rawCount>=DATA.calibration.minDeals) cap=90;
    if (calibration.effectiveCount>=12) cap=96;
    score=Math.round(clamp(score,50,cap));
    let label='متوسطة';
    if (score>=88) label='عالية جدًا';
    else if (score>=80) label='عالية';
    else if (score<65) label='محدودة';
    return {score,label,cap};
  }

  function collaborationsBump(count){
    let bump=0;
    for (const [minimum,value] of DATA.ask.collaborations){
      if (count>=minimum) bump=value;
    }
    return bump;
  }

  function askFactor(d){
    const cfg=DATA.ask;
    const raw=cfg.base+(cfg.demand[d.demand]||0)+collaborationsBump(d.collaborations)+(cfg.profile[d.creatorProfile]||0);
    return clamp(raw,1,cfg.max);
  }

  function pricingPowerScore(core){
    const d=core.d;
    const viewScore=core.format.viewMode ? (core.views.available ? core.views.score : 48) : 62;
    const engagementScore=core.engagement.ratio ? core.engagement.score : 50;
    const audienceScore=core.audience.score;
    const collabScore=clamp(38+d.collaborations*7,38,100);
    const demandScore={normal:55,busy:78,high:96}[d.demand];
    const score=Math.round(
      viewScore*.35+
      engagementScore*.20+
      audienceScore*.25+
      collabScore*.10+
      demandScore*.10
    );
    let label='قوة تفاوض متوسطة';
    if (score>=85) label='قوة تفاوض ممتازة';
    else if (score>=74) label='قوة تفاوض قوية';
    else if (score<55) label='قوة تفاوض محدودة';
    return {score,label};
  }

  function commercialExtras(base,d){
    const cfg=DATA.commercial;
    const rows=[];
    let total=0;
    const add=(label,amount)=>{
      if (amount>0){rows.push({label,value:amount});total+=amount;}
    };
    if (d.usage){
      add('حقوق استخدام المحتوى',base*(cfg.usageChannel[d.usageChannel]||0)*(cfg.usageDuration[d.usageDuration]||1));
    }
    if (d.exclusivity){
      add('الحصرية ضد المنافسين',base*(cfg.exclusivityScope[d.exclusivityScope]||0)*(cfg.exclusivityDuration[d.exclusivityDuration]||1));
    }
    if (d.whitelisting){
      add('Whitelisting / Spark Ads',base*(cfg.whitelistingDuration[d.whitelistDuration]||0));
    }
    add('إنتاج إضافي',base*(cfg.production[d.production]||0));
    add('جولات تعديل إضافية',base*(cfg.revisions[d.revisions]||0));
    add('تنفيذ سريع / عاجل',base*(cfg.rush[d.rush]||0));
    return {rows,total};
  }

  function calculate(input, options={}){
    const core=seedCore(input);
    const calibration=calibrationFor(core,options.deals || DEFAULT_DEALS);
    const d=core.d;
    const marketMedian=calibration.marketMedian;
    const marketP25=calibration.marketP25;
    const marketP75=calibration.marketP75;

    let fairPublishingRate=core.fairSeed*calibration.factor;
    fairPublishingRate=clamp(fairPublishingRate,marketMedian*.64,marketMedian*1.52);

    const quality=estimateQuality(core,calibration);
    const minimumFactor=.78+(quality.score/100)*.035;
    const doNotGoBelow=Math.min(fairPublishingRate,Math.max(marketP25*.92,fairPublishingRate*minimumFactor));

    const askMult=askFactor(d);
    const recommendedAsk=fairPublishingRate*askMult;
    const premiumCeiling=Math.min(
      fairPublishingRate*1.38,
      Math.max(recommendedAsk*1.12,marketP75*1.03)
    );

    const power=pricingPowerScore(core);
    const extras=commercialExtras(fairPublishingRate,d);
    const commercialQuote=recommendedAsk+extras.total;
    const commercialMinimum=doNotGoBelow+commercialExtras(doNotGoBelow,d).total;

    const reasons=[];
    if (core.views.applicable){
      if (!core.views.available) reasons.push('متوسط المشاهدات غير مدخل؛ السعر يعتمد أكثر على منحنى حجم الحساب.');
      else if (core.views.performance>=1.12) reasons.push(`مشاهداتك أعلى من الأداء المتوقع لحساب بهذا الحجم (${Math.round(core.views.expected).toLocaleString('en-US')} مشاهدة تقريبًا).`);
      else if (core.views.performance<.65) reasons.push('المشاهدات أقل من المتوقع للحجم، لذلك خُفّض السعر بدل الاعتماد على المتابعين فقط.');
      else reasons.push('المشاهدات قريبة من الأداء المتوقع لحساب مشابه.');
    }
    if (core.engagement.ratio){
      if (core.engagement.ratio>=1.12) reasons.push('معدل التفاعل أعلى من Benchmark المنصة، وتأثيره على السعر محدود عمدًا.');
      else if (core.engagement.ratio<.72) reasons.push('التفاعل أقل من Benchmark، لكن تأثيره محدود حتى لا يكرر أثر المشاهدات.');
      else reasons.push('التفاعل ضمن النطاق المعتاد ولا يغيّر السعر بشكل كبير.');
    } else reasons.push('إضافة معدل التفاعل ترفع جودة التقدير، لكنها لن تضاعف السعر.');
    if (d.audiencePct>=75) reasons.push('نسبة الجمهور المحلي قوية وتدعم القيمة التجارية داخل السوق.');
    else if (d.audiencePct>0 && d.audiencePct<40) reasons.push('نسبة الجمهور المحلي منخفضة، لذلك تم تخفيض Fair Rate.');
    if (d.niche!=='general') reasons.push(`تم استخدام Benchmark مجال "${DATA.niches[d.niche]}" بتأثير محافظ.`);
    if (calibration.applied) reasons.push(`تمت معايرة Benchmark ببيانات ${calibration.rawCount} صفقة فعلية قابلة للمقارنة.`);
    else reasons.push('لا توجد صفقات فعلية كافية داخل ملف المعايرة؛ النتيجة تستخدم Benchmark محافظ كبداية.');
    if (extras.total>0) reasons.push('الحقوق والشروط التجارية أضيفت بعد Fair Publishing Rate ولم تدخل في تقييم قيمة الحساب.');

    return {
      version:DATA.version,
      benchmarkDate:DATA.benchmarkDate,
      d,
      format:core.format,
      displayTier:displayTier(d.followers),
      marketMedian,
      marketP25,
      marketP75,
      fairPublishingRate,
      doNotGoBelow,
      recommendedAsk,
      premiumCeiling,
      commercialQuote,
      commercialMinimum,
      commercialExtras:extras,
      anchor:core.anchor*calibration.factor,
      seedAnchor:core.anchor,
      expectedViews:core.views.expected,
      observedViews:core.views.observed,
      viewPerformance:core.views.performance,
      viewAnchor:core.views.anchor*calibration.factor,
      viewWeight:core.viewWeight,
      engagement:core.engagement,
      audience:core.audience,
      nicheFactor:DATA.nicheFactors[d.market][d.niche],
      askFactor:askMult,
      pricingPower:power,
      quality,
      calibration,
      reasons:reasons.slice(0,8)
    };
  }

  function benchmarkContinuity(input, followerA, followerB){
    const a=calculate({...input,followers:followerA});
    const b=calculate({...input,followers:followerB});
    return {a:a.marketMedian,b:b.marketMedian,ratio:b.marketMedian/a.marketMedian};
  }

  return {
    DATA,
    normalizeData,
    logInterpolate,
    displayTier,
    formatCurrency,
    seedCore,
    calibrationFor,
    calculate,
    benchmarkContinuity,
    weightedQuantile,
    dateWeight
  };
});
