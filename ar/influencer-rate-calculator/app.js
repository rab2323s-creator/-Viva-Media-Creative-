'use strict';

(() => {
  const E = window.CreatorPricingEngine;
  const D = window.CreatorPricingData;
  if (!E || !D) throw new Error('Pricing engine files were not loaded.');

  const $ = id => document.getElementById(id);
  const num = (id, fallback=0) => {
    const el=$(id);
    if (!el || el.value==='') return fallback;
    const v=Number(el.value);
    return Number.isFinite(v) ? v : fallback;
  };
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  const FORMAT_HINTS = {
    instagram:{
      reel:'Reel واحد. متوسط مشاهدات آخر 10 Reels هو أهم مدخل بعد حجم الحساب.',
      story:'Story واحدة. استخدم متوسط Reach / Views للـStories.',
      post:'منشور ثابت واحد. المشاهدات لا تدخل مباشرة في هذا Format.',
      carousel:'Carousel واحد. المشاهدات لا تدخل مباشرة في هذا Format.',
      live:'جلسة Live واحدة. أدخل متوسط المشاهدات / الحضور إذا كان متاحًا.'
    },
    tiktok:{
      video:'فيديو TikTok واحد. المشاهدات لها وزن 75% داخل Hybrid Anchor.',
      live:'جلسة TikTok Live واحدة.'
    },
    youtube:{
      short:'YouTube Short واحد. المشاهدات أهم من عدد المشتركين.',
      integration:'دمج إعلاني داخل فيديو طويل. المشاهدات لها وزن مرتفع جدًا.',
      dedicated:'فيديو طويل مخصص للبراند. المشاهدات هي العامل الأقوى.',
      live:'بث مباشر برعاية أو مخصص للبراند.'
    }
  };

  let currentStep=1;
  let lastResult=null;

  function gather(){
    return {
      market:$('market').value,
      platform:$('platform').value,
      contentType:$('contentType').value,
      followers:num('followers',100000),
      engagement:num('engagementRate',0),
      views:num('averageViews',0),
      storyViews:num('storyViews',0),
      audiencePct:num('audienceMatch',0),
      niche:$('niche').value,
      creatorProfile:$('creatorProfile').value,
      collaborations:num('collaborations',0),
      demand:$('demand').value,
      usage:$('usageRights').checked,
      usageChannel:$('usageChannel').value,
      usageDuration:$('usageDuration').value,
      exclusivity:$('exclusivity').checked,
      exclusivityScope:$('exclusivityScope').value,
      exclusivityDuration:$('exclusivityDuration').value,
      whitelisting:$('whitelisting').checked,
      whitelistDuration:$('whitelistDuration').value,
      production:$('production').value,
      revisions:$('revisionRounds').value,
      rush:$('rush').value
    };
  }

  function validate(d){
    if (d.followers<1000 || d.followers>100000000) return 'أدخل عدد متابعين بين 1,000 و100,000,000.';
    if (d.engagement<0 || d.engagement>30) return 'أدخل معدل تفاعل بين 0% و30%.';
    if (d.audiencePct<0 || d.audiencePct>100) return 'نسبة الجمهور المحلي يجب أن تكون بين 0% و100%.';
    return '';
  }

  function showStep(step){
    currentStep=clamp(step,1,3);
    document.querySelectorAll('.wizard-pane').forEach(p=>p.hidden=Number(p.dataset.step)!==currentStep);
    document.querySelectorAll('.step').forEach(btn=>{
      const n=Number(btn.dataset.stepJump);
      btn.classList.toggle('active',n===currentStep);
      btn.classList.toggle('done',n<currentStep);
    });
    $('prevStep').hidden=currentStep===1;
    $('nextStep').textContent=currentStep===3?'احسب سعري':'التالي';
  }

  function populateNiches(){
    $('niche').innerHTML=Object.entries(D.niches).map(([key,label])=>`<option value="${key}">${label}</option>`).join('');
  }

  function updateContentOptions(){
    const platform=$('platform').value;
    const old=$('contentType').value;
    $('contentType').innerHTML=Object.entries(D.content[platform])
      .map(([key,item])=>`<option value="${key}">${item.label}</option>`).join('');
    if (D.content[platform][old]) $('contentType').value=old;
    updateFormatHint();
    updateEngagementHint();
    updateTierHint();
  }

  function updateFormatHint(){
    const p=$('platform').value,t=$('contentType').value;
    $('formatHint').textContent=FORMAT_HINTS[p]?.[t] || '';
    $('storyViewsWrap').hidden=!(p==='instagram' && t==='story');
    if (p==='instagram' && t==='story') $('averageViews').closest('div').hidden=true;
    else $('averageViews').closest('div').hidden=false;
    updatePerformanceHint();
  }

  function updateEngagementHint(){
    const p=$('platform').value;
    $('engagementMethodHint').textContent=
      p==='instagram'
        ? 'Instagram: استخدم معدل Insights ثابتًا أو (التفاعلات ÷ المتابعين × 100).'
        : p==='tiktok'
          ? 'TikTok: الأفضل استخدام (الإعجابات + التعليقات + المشاركات) ÷ المشاهدات × 100.'
          : 'YouTube: الأفضل استخدام (الإعجابات + التعليقات) ÷ المشاهدات × 100.';
  }

  function updateTierHint(){
    const followers=clamp(num('followers',100000),1000,100000000);
    const temp=E.seedCore({
      market:$('market').value,platform:$('platform').value,contentType:$('contentType').value,
      followers,niche:$('niche')?.value || 'general'
    });
    const benchmark=temp.engagement.benchmark;
    $('tierHint').textContent=`تصنيف عرضي: ${E.displayTier(followers)} • لا يستخدم كفاصل سعري • Benchmark التفاعل ≈ ${benchmark.toFixed(1)}%`;
    updatePerformanceHint();
  }

  function updatePerformanceHint(){
    if (!$('contentType').value) return;
    const r=E.seedCore(gather());
    const parts=[];
    if (r.format.viewMode){
      parts.push(`المشاهدات المتوقعة تقريبًا لهذا الحجم: ${Math.round(r.views.expected).toLocaleString('ar-SA')}`);
      if (r.views.available) parts.push(`أداؤك الحالي ≈ ${Math.round(r.views.performance*100)}% من Benchmark المشاهدات`);
    }
    parts.push(`تأثير التفاعل محصور بين ${Math.round(D.engagementCorrection.min*100)}% و${Math.round(D.engagementCorrection.max*100)}% من السعر الأساسي`);
    $('performanceHint').textContent=parts.join(' • ');
  }

  function toggleFields(check,wrap){
    $(wrap).hidden=!$(check).checked;
  }

  function fmt(v,market){
    return E.formatCurrency(v,market);
  }

  function renderResult(r){
    lastResult=r;
    const m=r.d.market;

    $('fairRate').textContent=fmt(r.fairPublishingRate,m);
    $('marketMedian').textContent=fmt(r.marketMedian,m);
    $('minimumRate').textContent=fmt(r.doNotGoBelow,m);
    $('recommendedAsk').textContent=fmt(r.recommendedAsk,m);
    $('premiumCeiling').textContent=fmt(r.premiumCeiling,m);

    $('tierBadge').textContent=`${r.displayTier} — للعرض فقط`;
    $('qualityBadge').textContent=`جودة التقدير: ${r.quality.label} ${r.quality.score}/100`;
    $('benchmarkBadge').textContent=r.calibration.applied
      ? `معايرة فعلية: ${r.calibration.rawCount} صفقة`
      : 'Benchmark محافظ';

    $('pricingPower').textContent=r.pricingPower.score+'/100';
    $('pricingPowerLabel').textContent=r.pricingPower.label;
    $('pricingPowerBar').style.width=r.pricingPower.score+'%';

    $('marketP25').textContent=fmt(r.marketP25,m);
    $('rangeFair').textContent=fmt(r.fairPublishingRate,m);
    $('marketP75').textContent=fmt(r.marketP75,m);
    const marker=clamp((r.fairPublishingRate-r.marketP25)/Math.max(1,r.marketP75-r.marketP25)*100,2,98);
    $('rangeMarker').style.left=marker+'%';

    if (r.format.viewMode){
      $('viewsScore').textContent=r.observedViews ? (r.viewPerformance>=1.5?'ممتاز':r.viewPerformance>=1.12?'قوي':r.viewPerformance<.65?'منخفض':'طبيعي') : 'غير مدخل';
      $('viewsDetail').textContent=r.observedViews
        ? `${Math.round(r.observedViews).toLocaleString('ar-SA')} فعلي مقابل ${Math.round(r.expectedViews).toLocaleString('ar-SA')} متوقع`
        : `المتوقع ≈ ${Math.round(r.expectedViews).toLocaleString('ar-SA')}`;
    } else {
      $('viewsScore').textContent='غير مطبق';
      $('viewsDetail').textContent='هذا النوع يعتمد على منحنى الحساب أكثر.';
    }

    $('engagementScore').textContent=r.engagement.label;
    $('engagementDetail').textContent=r.d.engagement
      ? `${r.d.engagement}% مقابل Benchmark ${r.engagement.benchmark.toFixed(1)}%`
      : `Benchmark ≈ ${r.engagement.benchmark.toFixed(1)}%`;

    $('audienceScore').textContent=r.audience.label;
    $('audienceDetail').textContent=r.d.audiencePct
      ? `${r.d.audiencePct}% داخل ${D.markets[m].label}`
      : 'لم تُدخل النسبة';

    $('qualityScore').textContent=r.quality.score+'/100';
    $('qualityDetail').textContent=r.calibration.applied
      ? `يستخدم ${r.calibration.rawCount} صفقة مقارنة`
      : 'Seed benchmark — أضف صفقات فعلية لرفع الجودة';

    $('pricingReasons').innerHTML=r.reasons.map(x=>`<li>${x}</li>`).join('');

    const viewWeightText=r.format.viewMode
      ? (r.observedViews ? `${Math.round(r.viewWeight*100)}%` : '0% لعدم إدخال المشاهدات')
      : 'غير مطبق';
    const calibrationText=r.calibration.applied
      ? `${Math.round(r.calibration.trust*100)}% وزن للبيانات الفعلية`
      : `غير مطبقة (${r.calibration.rawCount} صفقات فقط)`;

    const modelRows=[
      ['Follower / Market Anchor',fmt(r.anchor,m)],
      ['وزن المشاهدات في الحساب',viewWeightText],
      ['المشاهدات المتوقعة',r.format.viewMode?Math.round(r.expectedViews).toLocaleString('ar-SA'):'—'],
      ['View Anchor',r.format.viewMode&&r.observedViews?fmt(r.viewAnchor,m):'—'],
      ['تصحيح التفاعل','× '+r.engagement.factor.toFixed(3)],
      ['تصحيح الجمهور المحلي','× '+r.audience.factor.toFixed(3)],
      ['عامل المجال','× '+r.nicheFactor.toFixed(3)],
      ['معايرة الصفقات',calibrationText],
      ['Ask Factor','× '+r.askFactor.toFixed(3)]
    ];
    $('modelBreakdown').innerHTML=modelRows.map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join('');

    const commercialRows=[
      ['Fair Publishing Rate',r.fairPublishingRate],
      ['هامش بدء التفاوض',Math.max(0,r.recommendedAsk-r.fairPublishingRate)],
      ...r.commercialExtras.rows
    ];
    $('commercialBreakdown').innerHTML=commercialRows.map(row=>`<tr><td>${row[0] || row.label}</td><td>${fmt(row[1] ?? row.value,m)}</td></tr>`).join('')
      + `<tr><td><strong>Recommended Commercial Quote</strong></td><td><strong>${fmt(r.commercialQuote,m)}</strong></td></tr>`;

    $('commercialQuoteCard').hidden=r.commercialExtras.total<=0;
    $('commercialQuote').textContent=fmt(r.commercialQuote,m);

    $('offerCurrency').textContent=D.markets[m].symbol;
    $('brandOffer').value='';
    $('offerResult').hidden=true;

    renderRateCard(r);
    $('results').hidden=false;
    $('results').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function baseForRateCard(d){
    return {
      ...d,
      usage:false,exclusivity:false,whitelisting:false,production:'standard',revisions:'1',rush:'normal'
    };
  }

  function renderRateCard(r){
    const d=baseForRateCard(r.d);
    const cards=Object.keys(D.content[d.platform]).map(type=>{
      const x=E.calculate({...d,contentType:type});
      return {type,label:D.content[d.platform][type].label,fair:x.fairPublishingRate,ask:x.recommendedAsk};
    });
    if (d.platform==='instagram'){
      const reel=cards.find(x=>x.type==='reel');
      const story=cards.find(x=>x.type==='story');
      if (reel && story){
        cards.push({type:'bundle',label:'Reel + 3 Stories',fair:(reel.fair+story.fair*3)*.94,ask:(reel.ask+story.ask*3)*.94});
      }
    }
    $('rateCardGrid').innerHTML=cards.map(x=>`
      <div class="rate-item rate-item-v3">
        <span>${x.label}<small>Fair ${fmt(x.fair,d.market)}</small></span>
        <strong>${fmt(x.ask,d.market)}</strong>
      </div>`).join('');
  }

  function analyzeOffer(){
    if (!lastResult) return;
    const offer=num('brandOffer',0);
    const box=$('offerResult');
    if (!offer){
      box.className='offer-result warn';
      box.innerHTML='<strong>أدخل قيمة عرض البراند أولًا.</strong>';
      box.hidden=false;
      return;
    }
    const target=lastResult.commercialQuote;
    const floor=lastResult.commercialMinimum;
    const fair=lastResult.fairPublishingRate+lastResult.commercialExtras.total;
    let cls='good',title='',detail='';

    if (offer<floor){
      cls='bad';
      const pct=Math.round((1-offer/Math.max(1,floor))*100);
      title=`العرض أقل من الحد الأدنى المقترح بحوالي ${pct}%.`;
      detail=`الحد الأدنى مع الشروط الحالية: ${fmt(floor,lastResult.d.market)}. ابدأ Counter Offer من ${fmt(target,lastResult.d.market)}.`;
    } else if (offer<fair*.95){
      cls='warn';
      title='العرض مقبول كبداية لكنه أقل من القيمة العادلة.';
      detail=`القيمة العادلة مع الإضافات تقارب ${fmt(fair,lastResult.d.market)}، وRecommended Quote هو ${fmt(target,lastResult.d.market)}.`;
    } else if (offer<=target*1.12){
      cls='good';
      title='العرض ضمن النطاق الجيد.';
      detail=`العرض قريب من نطاق التفاوض المقترح. راجع نطاق العمل والحقوق قبل الموافقة النهائية.`;
    } else {
      cls='good';
      title='العرض أعلى من السعر المقترح.';
      detail='سعريًا العرض قوي؛ تأكد أن الشروط والمدة والحقوق واضحة في العقد.';
    }
    box.className=`offer-result ${cls}`;
    box.innerHTML=`<strong>${title}</strong><div>${detail}</div>`;
    box.hidden=false;
  }

  function summaryText(r){
    return [
      'Creator Pricing Engine V3',
      `السوق: ${D.markets[r.d.market].label}`,
      `المنصة: ${r.d.platform}`,
      `المحتوى: ${r.format.label}`,
      `المتابعون: ${Math.round(r.d.followers).toLocaleString('ar-SA')}`,
      `Market Median: ${fmt(r.marketMedian,r.d.market)}`,
      `Fair Publishing Rate: ${fmt(r.fairPublishingRate,r.d.market)}`,
      `لا تنزل عن: ${fmt(r.doNotGoBelow,r.d.market)}`,
      `Recommended Ask: ${fmt(r.recommendedAsk,r.d.market)}`,
      `Premium Ceiling: ${fmt(r.premiumCeiling,r.d.market)}`,
      `Commercial Quote: ${fmt(r.commercialQuote,r.d.market)}`,
      `جودة التقدير: ${r.quality.label} (${r.quality.score}/100)`,
      `Pricing Power: ${r.pricingPower.score}/100`,
      '',
      'النتيجة تقديرية وليست عرض سعر ملزمًا.'
    ].join('\n');
  }

  function rateCardText(){
    if (!lastResult) return '';
    const lines=[...document.querySelectorAll('#rateCardGrid .rate-item')].map(el=>{
      const label=el.querySelector('span').childNodes[0].textContent.trim();
      const price=el.querySelector('strong').textContent;
      return `${label}: ${price}`;
    });
    return [`Rate Card — ${D.markets[lastResult.d.market].label}`,...lines,'','أسعار بدء تفاوض تقديرية.'].join('\n');
  }

  async function copyText(text,button,original){
    try{
      await navigator.clipboard.writeText(text);
      button.textContent='تم النسخ';
      setTimeout(()=>button.textContent=original,1300);
    }catch{
      alert('تعذر النسخ تلقائيًا.');
    }
  }

  $('platform').addEventListener('change',updateContentOptions);
  $('market').addEventListener('change',()=>{updateTierHint();updatePerformanceHint();});
  $('contentType').addEventListener('change',updateFormatHint);
  $('followers').addEventListener('input',updateTierHint);
  $('engagementRate').addEventListener('input',updatePerformanceHint);
  $('averageViews').addEventListener('input',updatePerformanceHint);
  $('storyViews').addEventListener('input',updatePerformanceHint);
  $('audienceMatch').addEventListener('input',updatePerformanceHint);
  $('niche').addEventListener('change',()=>{updateTierHint();updatePerformanceHint();});

  $('usageRights').addEventListener('change',()=>toggleFields('usageRights','usageFields'));
  $('exclusivity').addEventListener('change',()=>toggleFields('exclusivity','exclusivityFields'));
  $('whitelisting').addEventListener('change',()=>toggleFields('whitelisting','whitelistingFields'));

  document.querySelectorAll('[data-step-jump]').forEach(btn=>btn.addEventListener('click',()=>showStep(Number(btn.dataset.stepJump))));
  $('prevStep').addEventListener('click',()=>showStep(currentStep-1));
  $('nextStep').addEventListener('click',()=>{
    $('formError').hidden=true;
    if (currentStep<3){showStep(currentStep+1);return;}
    const d=gather(),error=validate(d);
    if (error){
      $('formError').textContent=error;
      $('formError').hidden=false;
      return;
    }
    renderResult(E.calculate(d));
  });

  $('checkOffer').addEventListener('click',analyzeOffer);
  $('copyRateCard').addEventListener('click',()=>copyText(rateCardText(),$('copyRateCard'),'نسخ Rate Card'));
  $('copySummary').addEventListener('click',()=>lastResult&&copyText(summaryText(lastResult),$('copySummary'),'نسخ ملخص السعر'));
  $('printResult').addEventListener('click',()=>window.print());
  $('recalculate').addEventListener('click',()=>{showStep(1);$('calculator').scrollIntoView({behavior:'smooth',block:'start'});});

  populateNiches();
  updateContentOptions();
  updateEngagementHint();
  updateTierHint();
  updatePerformanceHint();
  toggleFields('usageRights','usageFields');
  toggleFields('exclusivity','exclusivityFields');
  toggleFields('whitelisting','whitelistingFields');
  showStep(1);
})();
