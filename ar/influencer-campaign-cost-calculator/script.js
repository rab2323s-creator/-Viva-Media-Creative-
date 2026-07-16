 'use strict';

const $ = (id) => document.getElementById(id);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const num = (id, fallback = 0) => {
  const value = Number($(id)?.value);
  return Number.isFinite(value) ? value : fallback;
};

const MARKETS = {
  sa: { label:'السعودية', code:'SAR', symbol:'ر.س', locale:'ar-SA', factor:1.00, production:1.00 },
  ae: { label:'الإمارات', code:'AED', symbol:'د.إ', locale:'ar-AE', factor:1.08, production:1.10 },
  kw: { label:'الكويت', code:'KWD', symbol:'د.ك', locale:'ar-KW', factor:0.082, production:0.080 },
  qa: { label:'قطر', code:'QAR', symbol:'ر.ق', locale:'ar-QA', factor:0.97, production:0.95 },
  eg: { label:'مصر', code:'EGP', symbol:'ج.م', locale:'ar-EG', factor:1.00, production:1.00 }
};

// SAR-equivalent reference ranges per creator, per deliverable.
const TIER_RATES = {
  nano:      { minFollowers:1000, maxFollowers:9999, shortVideo:[450,1400], story:[90,260], post:[300,850], longVideo:[900,2500], live:[700,2200], textPost:[120,420] },
  micro:     { minFollowers:10000, maxFollowers:99999, shortVideo:[1200,5000], story:[220,850], post:[700,2600], longVideo:[2200,9000], live:[1800,6500], textPost:[300,1200] },
  mid:       { minFollowers:100000, maxFollowers:499999, shortVideo:[4500,15000], story:[700,2600], post:[2400,8500], longVideo:[8500,28000], live:[6000,20000], textPost:[900,4000] },
  macro:     { minFollowers:500000, maxFollowers:999999, shortVideo:[12000,30000], story:[2000,6500], post:[6500,18000], longVideo:[22000,60000], live:[16000,45000], textPost:[3000,9000] },
  mega:      { minFollowers:1000000, maxFollowers:2999999, shortVideo:[26000,65000], story:[5000,14000], post:[14000,38000], longVideo:[45000,120000], live:[35000,90000], textPost:[6500,18000] },
  celebrity: { minFollowers:3000000, maxFollowers:100000000, shortVideo:[55000,160000], story:[11000,35000], post:[30000,90000], longVideo:[90000,280000], live:[70000,200000], textPost:[14000,50000] }
};

// Independent Egypt market ranges in EGP per creator, per deliverable.
const EGYPT_TIER_RATES = {
  nano:      { shortVideo:[1800,4500], story:[450,1100], post:[900,2200], longVideo:[3500,8500], live:[2500,6500], textPost:[500,1400] },
  micro:     { shortVideo:[4000,12000], story:[1100,3000], post:[2200,6000], longVideo:[8000,22000], live:[6000,16000], textPost:[1200,3500] },
  mid:       { shortVideo:[12000,30000], story:[3000,7000], post:[6000,15000], longVideo:[22000,55000], live:[15000,40000], textPost:[3500,9000] },
  macro:     { shortVideo:[30000,80000], story:[7000,18000], post:[15000,35000], longVideo:[55000,140000], live:[40000,100000], textPost:[9000,22000] },
  mega:      { shortVideo:[70000,200000], story:[18000,45000], post:[35000,90000], longVideo:[130000,320000], live:[90000,250000], textPost:[22000,60000] },
  celebrity: { shortVideo:[150000,500000], story:[40000,120000], post:[80000,250000], longVideo:[280000,750000], live:[200000,650000], textPost:[50000,160000] }
};

const CREATOR_PROFILE_MULT = { digital:1.00, expert:1.08, publicFigure:1.18, celebrity:1.35 };

const PLATFORM_MULT = {
  instagram:{ shortVideo:1.00, story:1.00, post:1.00, longVideo:0, live:1.00, textPost:0 },
  tiktok:{ shortVideo:0.95, story:0, post:0, longVideo:0, live:0.95, textPost:0 },
  snapchat:{ shortVideo:0, story:1.10, post:0, longVideo:0, live:0, textPost:0 },
  youtube:{ shortVideo:1.05, story:0, post:0.65, longVideo:1.35, live:1.25, textPost:0 },
  x:{ shortVideo:0.80, story:0, post:0, longVideo:0, live:0.80, textPost:0.75 },
  facebook:{ shortVideo:0.82, story:0.65, post:0.72, longVideo:0.90, live:0.90, textPost:0.62 }
};

const CPM = {
  instagram:{ min:28, max:72 }, tiktok:{ min:20, max:60 }, snapchat:{ min:18, max:52 },
  youtube:{ min:38, max:105 }, x:{ min:16, max:45 }, facebook:{ min:14, max:40 }
};
const INDUSTRY = { general:1, food:1, beauty:1.08, fashion:1.06, technology:1.10, healthcare:1.12, finance:1.18, realestate:1.12, luxury:1.22, education:1.03, automotive:1.12, travel:1.06 };
const SEASON = { normal:1, high:1.10, ramadan:1.14, national:1.10, shopping:1.08, urgent:1.16 };
const DEMAND = { flexible:0.97, specific:1.06, high:1.16 };
const GOAL = { awareness:1, engagement:1.02, leads:1.04, sales:1.06, launch:1.08, ugc:0.92 };

function tierForFollowers(followers){
  return Object.entries(TIER_RATES).find(([,v]) => followers >= v.minFollowers && followers <= v.maxFollowers)?.[0] || 'celebrity';
}
function tierLabel(t){ return ({nano:'Nano',micro:'Micro',mid:'Mid-tier',macro:'Macro',mega:'Mega',celebrity:'Celebrity'})[t]; }
function fmt(value, market){
  const m = MARKETS[market];
  const digits = market === 'kw' ? 0 : 0;
  return Math.round(value).toLocaleString(m.locale,{maximumFractionDigits:digits}) + ' ' + m.symbol;
}
function likely(min,max){ return Math.sqrt(Math.max(0,min)*Math.max(0,max)); }
function bundleDiscount(totalPerCreator, tier){
  if (['mega','celebrity'].includes(tier)) return 1;
  if (totalPerCreator >= 12) return 0.90;
  if (totalPerCreator >= 7) return 0.94;
  if (totalPerCreator >= 4) return 0.97;
  return 1;
}
function engagementMultiplier(rate, tier){
  if (!rate) return 1;
  const benchmark = ({nano:5.0,micro:3.5,mid:2.5,macro:1.8,mega:1.2,celebrity:0.8})[tier];
  return clamp(0.90 + (rate / benchmark) * 0.10, 0.82, 1.22);
}
function audienceMultiplier(percent){
  if (!percent) return 0.95;
  if (percent < 20) return 0.80;
  if (percent < 40) return 0.92;
  if (percent < 60) return 1.00;
  if (percent < 75) return 1.08;
  if (percent < 90) return 1.15;
  return 1.22;
}
function productionCost(level, market, videos, creators){
  const marketBases = market === 'eg'
    ? { creator:[0,0], edited:[800,2500], professional:[5000,15000], premium:[15000,50000] }
    : { creator:[0,0], edited:[350,1100], professional:[1800,6500], premium:[6000,22000] };
  const base = marketBases[level] || [0,0];
  let units = 0;
  if(level === 'edited') units = Math.max(0, videos);
  else if(level === 'professional') units = Math.max(1, creators);
  else if(level === 'premium') units = Math.max(creators, Math.ceil(videos / 2));
  const factor = market === 'eg' ? 1 : MARKETS[market].production;
  return { min:base[0]*units*factor, max:base[1]*units*factor };
}
function addRow(rows,label,min,max){ if(max > 0.5 || min > 0.5) rows.push({label,min,mid:likely(min,max),max}); }

function gather(){
  return {
    market:$('market').value, platform:$('platform').value, goal:$('goal').value, industry:$('industry').value,
    days:num('campaignDays',14), season:$('season').value, creators:clamp(num('influencerCount',1),1,100),
    followers:clamp(num('followers',50000),1000,100000000), views:clamp(num('averageViews',0),0,100000000), storyViews:clamp(num('storyViews',0),0,100000000), creatorProfile:$('creatorProfile').value,
    engagement:clamp(num('engagementRate',0),0,30), audience:clamp(num('audienceMatch',60),0,100), demand:$('creatorDemand').value,
    counts:{ shortVideo:clamp(num('shortVideoCount'),0,30), story:clamp(num('storyCount'),0,90), post:clamp(num('postCount'),0,30), longVideo:clamp(num('longVideoCount'),0,10), live:clamp(num('liveCount'),0,10), textPost:clamp(num('textPostCount'),0,30)},
    production:$('productionLevel').value, revisions:num('revisionRounds',1), management:$('managementLevel').value,
    paidMedia:Math.max(0,num('paidMediaBudget',0)),
    usage:$('usageRights').checked, usageChannel:$('usageChannel').value, usageDuration:num('usageDuration',30),
    exclusivity:$('exclusivity').checked, exclusivityScope:$('exclusivityScope').value, exclusivityDuration:num('exclusivityDuration',7),
    whitelist:$('whitelisting').checked, whitelistDuration:num('whitelistingDuration',30)
  };
}

function validate(d){
  if(Object.values(d.counts).reduce((a,b)=>a+b,0) < 1) return 'أضف مخرجًا واحدًا على الأقل لكل مؤثر.';
  const supported = PLATFORM_MULT[d.platform];
  for(const [type,count] of Object.entries(d.counts)) if(count > 0 && !supported[type]) return 'يوجد نوع محتوى غير متوافق مع المنصة المختارة.';
  return '';
}

function calculate(d){
  const tier=tierForFollowers(d.followers), rate=(d.market==='eg'?EGYPT_TIER_RATES[tier]:TIER_RATES[tier]), pm=PLATFORM_MULT[d.platform], marketFactor=MARKETS[d.market].factor;
  const perCreatorDeliverables=Object.values(d.counts).reduce((a,b)=>a+b,0);
  const discount=bundleDiscount(perCreatorDeliverables,tier);
  const quality=clamp(engagementMultiplier(d.engagement,tier)*audienceMultiplier(d.audience)*INDUSTRY[d.industry]*SEASON[d.season]*DEMAND[d.demand]*GOAL[d.goal]*(CREATOR_PROFILE_MULT[d.creatorProfile]||1),0.75,1.75);
  let organicMin=0, organicMax=0;
  const formatRows=[];
  for(const [type,count] of Object.entries(d.counts)){
    if(!count || !pm[type]) continue;
    let min=rate[type][0]*pm[type]*count*d.creators*marketFactor;
    let max=rate[type][1]*pm[type]*count*d.creators*marketFactor;
    min*=discount*quality; max*=discount*quality;
    // Blend follower-card pricing with view-based value for video formats.
    if(d.views>0 && ['shortVideo','longVideo','live'].includes(type)){
      const cpm=CPM[d.platform];
      const viewMin=(d.views/1000)*cpm.min*count*d.creators*marketFactor;
      const viewMax=(d.views/1000)*cpm.max*count*d.creators*marketFactor;
      min=clamp(min*0.48+viewMin*0.52,min*0.65,min*1.35);
      max=clamp(max*0.52+viewMax*0.48,max*0.72,max*1.25);
    }
    if(d.storyViews>0 && type==='story'){
      const storyCpm = d.market==='eg' ? {min:55,max:140} : {min:18,max:48};
      const storyMin=(d.storyViews/1000)*storyCpm.min*count*d.creators*marketFactor;
      const storyMax=(d.storyViews/1000)*storyCpm.max*count*d.creators*marketFactor;
      min=clamp(min*0.50+storyMin*0.50,min*0.68,min*1.35);
      max=clamp(max*0.55+storyMax*0.45,max*0.75,max*1.25);
    }
    organicMin+=min; organicMax+=max;
    formatRows.push({label:({shortVideo:'فيديوهات قصيرة',story:'Stories',post:'منشورات ثابتة',longVideo:'فيديوهات طويلة',live:'بث مباشر',textPost:'منشورات نصية'})[type],min,max});
  }
  // Revision surcharge only beyond the included first round.
  const revisionRate=d.revisions===2?0.035:d.revisions>=3?0.075:0;
  const revisionMin=organicMin*revisionRate, revisionMax=organicMax*revisionRate;
  const videoUnits=(d.counts.shortVideo+d.counts.longVideo+d.counts.live)*d.creators;
  const prod=productionCost(d.production,d.market,videoUnits,d.creators);
  const rightsBaseMin=organicMin, rightsBaseMax=organicMax;
  let usageMin=0,usageMax=0;
  if(d.usage){
    const channelRate={organic:0.08,paidSocial:0.22,allDigital:0.32}[d.usageChannel];
    const durationRate={30:1,90:1.45,180:1.85,365:2.45}[d.usageDuration]||1;
    usageMin=rightsBaseMin*channelRate*durationRate*0.85;
    usageMax=rightsBaseMax*channelRate*durationRate*1.05;
  }
  let exclusiveMin=0,exclusiveMax=0;
  if(d.exclusivity){
    const scope={direct:0.08,category:0.14}[d.exclusivityScope];
    const duration={7:0.65,30:1,90:1.75,180:2.6}[d.exclusivityDuration]||1;
    exclusiveMin=rightsBaseMin*scope*duration*0.85;
    exclusiveMax=rightsBaseMax*scope*duration*1.10;
  }
  let whiteMin=0,whiteMax=0;
  if(d.whitelist){
    const duration={30:0.14,90:0.23,180:0.34}[d.whitelistDuration]||0.14;
    whiteMin=rightsBaseMin*duration*0.85;
    whiteMax=rightsBaseMax*duration*1.10;
  }
  let managementMin=0,managementMax=0;
  if(d.management!=='none'){
    const pct=d.management==='basic'?[0.08,0.12]:[0.13,0.19];
    const subtotal=organicMin+prod.min+usageMin+exclusiveMin+whiteMin;
    const subtotalMax=organicMax+prod.max+usageMax+exclusiveMax+whiteMax;
    const minimum=({sa:900,ae:1000,kw:80,qa:900,eg:2500})[d.market];
    managementMin=Math.max(minimum,subtotal*pct[0]);
    managementMax=Math.max(minimum*1.6,subtotalMax*pct[1]);
  }
  const paid=d.paidMedia;
  const totalMin=organicMin+revisionMin+prod.min+usageMin+exclusiveMin+whiteMin+managementMin+paid;
  const totalMax=organicMax+revisionMax+prod.max+usageMax+exclusiveMax+whiteMax+managementMax+paid;
  const rows=[];
  formatRows.forEach(r=>addRow(rows,r.label,r.min,r.max));
  addRow(rows,'جولات تعديل إضافية',revisionMin,revisionMax);
  addRow(rows,'إنتاج المحتوى',prod.min,prod.max);
  addRow(rows,'حقوق الاستخدام',usageMin,usageMax);
  addRow(rows,'الحصرية',exclusiveMin,exclusiveMax);
  addRow(rows,'Whitelisting / Spark Ads',whiteMin,whiteMax);
  addRow(rows,'إدارة الحملة',managementMin,managementMax);
  if(paid) rows.push({label:'ميزانية إعلانات ممولة',min:paid,mid:paid,max:paid});
  let confidence=55;
  const assumptions=[];
  confidence+=d.views?15:0; if(!d.views) assumptions.push('لم تُدخل متوسط مشاهدات الفيديو؛ تم الاعتماد أكثر على فئة المتابعين.');
  confidence+=d.storyViews?7:0; if(d.counts.story>0 && !d.storyViews) assumptions.push('لم تُدخل متوسط مشاهدات Stories؛ تقدير القصص أقل موثوقية.');
  confidence+=d.engagement?10:0; if(!d.engagement) assumptions.push('نسبة التفاعل غير متوفرة.');
  confidence+=d.audience?10:0;
  confidence+=d.creators<=10?5:2;
  confidence+=d.demand==='flexible'?5:0;
  confidence=clamp(confidence,55,95);
  if(d.demand==='high') assumptions.push('المؤثر المطلوب أو الموسم المزدحم قد يرفع السعر الفعلي.');
  if(tier==='celebrity') assumptions.push('أسعار المشاهير تفاوضية جدًا وقد تتجاوز النطاق حسب الاسم.');
  if(!d.usage) assumptions.push('النتيجة لا تشمل حقوق إعادة الاستخدام المدفوع.');
  return {d,tier,rows,creatorMin:organicMin,creatorMax:organicMax,totalMin,totalMax,totalLikely:likely(totalMin,totalMax),confidence,assumptions,totalDeliverables:perCreatorDeliverables*d.creators};
}

function recommendations(o){
  const d=o.d, list=[];
  if(['sales','leads'].includes(d.goal) && d.counts.story===0 && ['instagram','snapchat','facebook'].includes(d.platform)) list.push('أضف Stories مع رابط أو كود خصم لرفع فرص التحويل.');
  if(d.goal==='awareness' && d.creators===1 && ['nano','micro'].includes(o.tier)) list.push('للوصول الأوسع، وزّع الميزانية على 3–6 مؤثرين بدل الاعتماد على مؤثر واحد.');
  if(d.views===0) list.push('اطلب متوسط مشاهدات آخر 10 فيديوهات قبل الاتفاق النهائي.');
  if(d.audience<40) list.push('نسبة الجمهور المحلي منخفضة؛ لا تدفع سعرًا مرتفعًا قبل التحقق من ملاءمة الجمهور.');
  if(d.usage && d.usageDuration>90) list.push('اختبر حقوق استخدام أقصر أولًا، ثم مدّد المحتوى الفائز فقط.');
  if(d.exclusivity && d.exclusivityDuration>=90) list.push('الحصرية الطويلة مكلفة؛ حصرها في المنافسين المباشرين يخفض الميزانية.');
  if(d.paidMedia===0 && d.whitelist) list.push('أضف ميزانية إعلانات ممولة؛ Whitelisting وحده لا يشغّل الإعلان.');
  if(!list.length) list.push('توزيع الحملة متوازن مبدئيًا؛ اطلب Insights وعروضًا فعلية للمقارنة.');
  return list.slice(0,5);
}

let currentStep=1,lastOutput=null;
function showStep(step){
  currentStep=clamp(step,1,5);
  document.querySelectorAll('.wizard-pane').forEach(p=>p.hidden=Number(p.dataset.step)!==currentStep);
  document.querySelectorAll('[data-step-dot]').forEach(dot=>{ const n=Number(dot.dataset.stepDot); dot.classList.toggle('active',n===currentStep); dot.classList.toggle('done',n<currentStep); });
  $('prevStep').hidden=currentStep===1;
  $('nextStep').textContent=currentStep===5?'احسب النتيجة':'التالي';
  if(currentStep===5) renderReview();
  window.scrollTo({top:$('calculator').offsetTop-10,behavior:'smooth'});
}
function renderReview(){
  const d=gather(), tier=tierForFollowers(d.followers), total=Object.values(d.counts).reduce((a,b)=>a+b,0)*d.creators;
  $('reviewSummary').innerHTML=`<strong>${MARKETS[d.market].label} — ${d.platform}</strong><p class="note">${d.creators} مؤثر • ${tierLabel(tier)} • ${d.followers.toLocaleString('ar-EG')} متابع تقريبًا • ${total} مخرج إجمالي.</p><p class="note">الحقوق: ${d.usage?'مضافة':'غير مضافة'} • الحصرية: ${d.exclusivity?'مضافة':'غير مضافة'} • إدارة الحملة: ${d.management==='none'?'لا':'نعم'}.</p>`;
}
function updatePlatform(){
  const platform=$('platform').value, support=PLATFORM_MULT[platform], names=[];
  document.querySelectorAll('[data-format]').forEach(card=>{ const type=card.dataset.format, ok=!!support[type]; card.classList.toggle('hidden-by-platform',!ok); const input=card.querySelector('input'); if(!ok) input.value=0; else names.push(card.querySelector('strong').textContent); });
  $('platformHint').textContent='الأنواع المتاحة على هذه المنصة: '+names.join('، ')+'.';
}
function updateTier(){ $('tierHint').textContent='الفئة التقديرية: '+tierLabel(tierForFollowers(num('followers',50000))); }
function toggle(id,fields){ $(fields).hidden=!$(id).checked; }

function renderResult(o){
  const m=o.d.market;
  $('results').hidden=false;
  $('budgetRange').textContent=`${fmt(o.totalMin,m)} — ${fmt(o.totalMax,m)}`;
  $('likelyEstimate').textContent=fmt(o.totalLikely,m);
  $('scenarioLow').textContent=fmt(o.totalMin,m); $('scenarioLikely').textContent=fmt(o.totalLikely,m); $('scenarioHigh').textContent=fmt(o.totalMax,m);
  $('creatorFeesResult').textContent=`${fmt(o.creatorMin,m)} — ${fmt(o.creatorMax,m)}`;
  $('perInfluencer').textContent=fmt(o.totalLikely/o.d.creators,m); $('totalDeliverables').textContent=o.totalDeliverables.toLocaleString('ar-EG');
  const width=(o.totalMax-o.totalMin)/Math.max(1,o.totalMin);
  $('rangePill').textContent=width<0.55?'نطاق قريب':'نطاق مرن حسب المؤثر'; $('rangePill').className=width<0.55?'pill ok':'pill warn';
  $('confidenceScore').textContent=o.confidence+'%'; $('confidenceBar').style.width=o.confidence+'%';
  $('assumptionList').innerHTML=o.assumptions.map(x=>`<li>${x}</li>`).join('');
  $('breakdown').innerHTML=o.rows.map(r=>`<tr><td>${r.label}</td><td>${fmt(r.min,m)}</td><td>${fmt(r.mid,m)}</td><td>${fmt(r.max,m)}</td></tr>`).join('');
  $('quickRec').textContent='توصية لـ '+MARKETS[m].label+' على '+o.d.platform;
  $('recommendationList').innerHTML=recommendations(o).map(x=>`<li>${x}</li>`).join('');
  const msg=buildMessage(o);
  $('waBtn').href='https://wa.me/4915565678291?text='+encodeURIComponent(msg);
  $('mailBtn').href='mailto:info@vivamediacreative.com?subject='+encodeURIComponent('طلب عرض حملة مؤثرين — '+MARKETS[m].label)+'&body='+encodeURIComponent(msg);
  lastOutput=o;
  $('results').scrollIntoView({behavior:'smooth',block:'start'});
}
function buildMessage(o){
  const d=o.d;
  return [`مرحبًا Viva Media Creative،`,`أريد عرض سعر رسمي لحملة مؤثرين.`,`الدولة: ${MARKETS[d.market].label}`,`المنصة: ${d.platform}`,`عدد المؤثرين: ${d.creators}`,`فئة المتابعين: ${tierLabel(o.tier)} (${d.followers.toLocaleString('ar-EG')})`,`نوع الحساب: ${{digital:'مؤثر رقمي',expert:'خبير متخصص',publicFigure:'شخصية عامة',celebrity:'مشهور فني أو إعلامي'}[d.creatorProfile]||'مؤثر رقمي'}`, `إجمالي المخرجات: ${o.totalDeliverables}`,`التقدير: ${fmt(o.totalMin,d.market)} — ${fmt(o.totalMax,d.market)}`,`التقدير الأقرب: ${fmt(o.totalLikely,d.market)}`].join('\n');
}
function optimize(){
  if(!lastOutput) return;
  const budget=num('targetBudget',0), o=lastOutput, box=$('optimizerResults');
  if(!budget){ box.innerHTML='<div class="budget-fit warn">أدخل ميزانيتك أولًا.</div>'; return; }
  const ratio=budget/o.totalLikely, tips=[];
  let cls='good', headline='الميزانية مناسبة للتقدير الحالي.';
  if(ratio<0.65){ cls='bad'; headline='الميزانية أقل بوضوح من التقدير الأقرب.'; tips.push('خفّض عدد المؤثرين أو استخدم فئة أصغر.','احذف الحصرية أو اختصر مدتها.','ابدأ بفيديو واحد وStories ثم وسّع الفائزين.'); }
  else if(ratio<0.9){ cls='warn'; headline='الميزانية قريبة، لكنها تحتاج تعديلًا.'; tips.push('اختر مؤثرين مرنين بدل اسم محدد.','اختصر حقوق الاستخدام إلى 30 يومًا.','خفّض الإنتاج إلى تصوير المؤثر أو مونتاج إضافي فقط.'); }
  else if(ratio>1.45){ headline='الميزانية مريحة ويمكن تحسين التوزيع.'; tips.push('زد عدد مؤثري Micro لاختبار شرائح متعددة.','خصص 15%–25% لترويج أفضل محتوى.','احتفظ باحتياطي 10% للتفاوض والتعديلات.'); }
  else tips.push('قارن 3 عروض فعلية قبل التعاقد.','احتفظ باحتياطي 10% للمفاجآت.');
  box.innerHTML=`<div class="budget-fit ${cls}"><strong>${headline}</strong><p class="note">ميزانيتك تساوي ${Math.round(ratio*100)}% من التقدير الأقرب.</p><ul class="list note">${tips.map(t=>`<li>${t}</li>`).join('')}</ul></div>`;
}

$('nextStep').addEventListener('click',()=>{
  $('formError').hidden=true;
  if(currentStep<5){ showStep(currentStep+1); return; }
  const d=gather(), error=validate(d);
  if(error){ $('formError').textContent=error; $('formError').hidden=false; return; }
  renderResult(calculate(d));
});
$('prevStep').addEventListener('click',()=>showStep(currentStep-1));
$('platform').addEventListener('change',updatePlatform); $('followers').addEventListener('input',updateTier);
$('usageRights').addEventListener('change',()=>toggle('usageRights','usageFields'));
$('exclusivity').addEventListener('change',()=>toggle('exclusivity','exclusivityFields'));
$('whitelisting').addEventListener('change',()=>toggle('whitelisting','whitelistingFields'));
$('optimizeBtn').addEventListener('click',optimize);
$('copyBtn').addEventListener('click',async()=>{ if(!lastOutput)return; try{await navigator.clipboard.writeText(buildMessage(lastOutput)); $('copyBtn').textContent='تم النسخ'; setTimeout(()=>$('copyBtn').textContent='نسخ الملخص',1200);}catch{alert('تعذر النسخ.');} });
$('printBtn').addEventListener('click',()=>window.print());
$('y') && ($('y').textContent=new Date().getFullYear());
updatePlatform(); updateTier(); showStep(1);
