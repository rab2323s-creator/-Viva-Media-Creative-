'use strict';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const geometricMean=(a,b)=>Math.sqrt(Math.max(0,a)*Math.max(0,b));

const MARKETS={
 sa:{label:'السعودية',code:'SAR',symbol:'ر.س',locale:'ar-SA'},
 ae:{label:'الإمارات',code:'AED',symbol:'د.إ',locale:'ar-AE'},
 kw:{label:'الكويت',code:'KWD',symbol:'د.ك',locale:'ar-KW'},
 qa:{label:'قطر',code:'QAR',symbol:'ر.ق',locale:'ar-QA'},
 eg:{label:'مصر',code:'EGP',symbol:'ج.م',locale:'ar-EG'}
};
const TIER_ORDER=['nano','micro','mid','macro','mega','celebrity'];
const TIERS={
 nano:{label:'Nano',min:1000,max:9999}, micro:{label:'Micro',min:10000,max:99999},
 mid:{label:'Mid-tier',min:100000,max:499999}, macro:{label:'Macro',min:500000,max:999999},
 mega:{label:'Mega',min:1000000,max:2999999}, celebrity:{label:'Celebrity',min:3000000,max:100000000}
};

// Platform-specific engagement benchmarks. YouTube is preferably engagement / views.
const ENGAGEMENT_BENCHMARKS={
 instagram:{nano:4.5,micro:3.2,mid:2.4,macro:1.8,mega:1.4,celebrity:1.1},
 tiktok:{nano:5.2,micro:4.6,mid:4.1,macro:3.7,mega:3.4,celebrity:3.1},
 youtube:{nano:4.8,micro:4.4,mid:4.0,macro:3.6,mega:3.3,celebrity:3.0}
};

// Typical view-to-follower/subscriber ratios by platform, format and tier.
const VIEW_BENCHMARKS={
 instagram:{
  reel:{nano:.55,micro:.38,mid:.28,macro:.21,mega:.16,celebrity:.12},
  story:{nano:.20,micro:.16,mid:.13,macro:.10,mega:.08,celebrity:.06},
  live:{nano:.16,micro:.12,mid:.09,macro:.07,mega:.055,celebrity:.04}
 },
 tiktok:{
  video:{nano:.90,micro:.65,mid:.50,macro:.38,mega:.30,celebrity:.22},
  live:{nano:.22,micro:.17,mid:.13,macro:.10,mega:.08,celebrity:.06}
 },
 youtube:{
  short:{nano:.70,micro:.55,mid:.42,macro:.33,mega:.26,celebrity:.20},
  integration:{nano:.35,micro:.28,mid:.22,macro:.18,mega:.14,celebrity:.10},
  dedicated:{nano:.38,micro:.30,mid:.24,macro:.19,mega:.15,celebrity:.11},
  live:{nano:.24,micro:.20,mid:.16,macro:.13,mega:.10,celebrity:.08}
 }
};

const VIEW_CPM={
 sa:{instagram:{reel:[28,58],story:[22,48],live:[32,70]},tiktok:{video:[24,58],live:[30,68]},youtube:{short:[34,78],integration:[75,155],dedicated:[95,210],live:[70,160]}},
 ae:{instagram:{reel:[34,78],story:[28,60],live:[38,86]},tiktok:{video:[32,76],live:[38,88]},youtube:{short:[42,92],integration:[90,185],dedicated:[115,245],live:[85,195]}},
 kw:{instagram:{reel:[2.3,5.6],story:[1.8,4.2],live:[2.8,6.3]},tiktok:{video:[2.1,5.4],live:[2.6,6.0]},youtube:{short:[3.0,7.0],integration:[6.5,14.0],dedicated:[8.0,18.0],live:[6.2,14.5]}},
 qa:{instagram:{reel:[27,60],story:[22,49],live:[31,71]},tiktok:{video:[25,59],live:[31,70]},youtube:{short:[36,82],integration:[78,165],dedicated:[100,220],live:[74,170]}},
 eg:{instagram:{reel:[70,180],story:[55,140],live:[85,210]},tiktok:{video:[65,175],live:[80,205]},youtube:{short:[95,240],integration:[210,520],dedicated:[280,700],live:[200,540]}}
};

const CONTENT={
 instagram:{
  reel:{label:'Instagram Reel',viewMode:'reel',viewWeight:.45,hint:'Reel واحد. أضف متوسط مشاهدات آخر 10 Reels لرفع الدقة.'},
  story:{label:'Instagram Story',viewMode:'story',viewWeight:.50,usesStoryViews:true,hint:'سعر Story واحدة. أدخل متوسط مشاهدات Stories.'},
  post:{label:'Instagram Post',viewMode:null,viewWeight:0,hint:'منشور ثابت واحد.'},
  carousel:{label:'Instagram Carousel',viewMode:null,viewWeight:0,hint:'Carousel واحد متعدد الشرائح.'},
  live:{label:'Instagram Live',viewMode:'live',viewWeight:.45,hint:'جلسة Live واحدة.'}
 },
 tiktok:{
  video:{label:'TikTok Video',viewMode:'video',viewWeight:.55,hint:'فيديو TikTok واحد. المشاهدات عامل رئيسي.'},
  live:{label:'TikTok Live',viewMode:'live',viewWeight:.50,hint:'جلسة Live واحدة.'}
 },
 youtube:{
  short:{label:'YouTube Short',viewMode:'short',viewWeight:.58,hint:'Short واحد.'},
  integration:{label:'YouTube Integration',viewMode:'integration',viewWeight:.68,hint:'دمج إعلاني داخل فيديو طويل؛ المشاهدات أهم من المشتركين.'},
  dedicated:{label:'Dedicated YouTube Video',viewMode:'dedicated',viewWeight:.72,hint:'فيديو طويل كامل مخصص للبراند.'},
  live:{label:'YouTube Live',viewMode:'live',viewWeight:.65,hint:'بث مباشر برعاية أو مخصص للبراند.'}
 }
};

const PRICE_BENCHMARKS={"sa":{"instagram":{"reel":{"nano":[500,850,1500],"micro":[1400,2900,5600],"mid":[5000,9200,17000],"macro":[13500,22000,34000],"mega":[28000,46000,72000],"celebrity":[60000,105000,180000]},"story":{"nano":[100,180,320],"micro":[310,640,1250],"mid":[1100,2000,3750],"macro":[3100,5050,7800],"mega":[6700,11000,17300],"celebrity":[14400,25200,43200]},"post":{"nano":[290,490,870],"micro":[840,1750,3350],"mid":[3100,5700,10500],"macro":[8650,14100,21800],"mega":[18200,29900,46800],"celebrity":[39600,69300,118800]},"carousel":{"nano":[340,580,1000],"micro":[1000,2100,4050],"mid":[3700,6800,12600],"macro":[10300,16700,25800],"mega":[21800,35900,56200],"celebrity":[48000,84000,144000]},"live":{"nano":[560,950,1700],"micro":[1650,3400,6600],"mid":[6100,11200,20700],"macro":[16900,27500,42500],"mega":[35800,58900,92200],"celebrity":[78000,136500,234000]}},"tiktok":{"video":{"nano":[460,790,1400],"micro":[1500,3150,6050],"mid":[5150,9500,17500],"macro":[13200,21500,33300],"mega":[26000,42600,66700],"celebrity":[54400,95200,163200]},"live":{"nano":[530,890,1600],"micro":[1650,3450,6700],"mid":[5850,10800,20000],"macro":[15300,24900,38500],"mega":[30600,50200,78600],"celebrity":[63700,111400,191000]}},"youtube":{"short":{"nano":[560,950,1650],"micro":[1650,3400,6550],"mid":[6000,11000,20400],"macro":[16600,27100,41800],"mega":[35300,58000,90800],"celebrity":[77600,135800,232800]},"integration":{"nano":[820,1400,2450],"micro":[2600,5400,10400],"mid":[10300,19000,35100],"macro":[30800,50100,77500],"mega":[69700,114600,179400],"celebrity":[162200,283800,486500]},"dedicated":{"nano":[1400,2400,4200],"micro":[4550,9400,18100],"mid":[18800,34600,64000],"macro":[58000,94400,146000],"mega":[135000,221900,347300],"celebrity":[321200,562100,963500]},"live":{"nano":[930,1600,2800],"micro":[2950,6150,11900],"mid":[11700,21500,39600],"macro":[34300,56000,86500],"mega":[77200,126800,198400],"celebrity":[178100,311600,534200]}}},"ae":{"instagram":{"reel":{"nano":[500,950,1700],"micro":[1500,3200,6000],"mid":[5500,10000,18000],"macro":[14500,23500,36000],"mega":[30000,50000,78000],"celebrity":[65000,115000,195000]},"story":{"nano":[100,200,360],"micro":[330,700,1300],"mid":[1200,2200,3950],"macro":[3350,5400,8300],"mega":[7200,12000,18700],"celebrity":[15600,27600,46800]},"post":{"nano":[290,550,990],"micro":[900,1900,3600],"mid":[3400,6200,11200],"macro":[9300,15000,23000],"mega":[19500,32500,50700],"celebrity":[42900,75900,128700]},"carousel":{"nano":[340,650,1150],"micro":[1100,2300,4300],"mid":[4050,7400,13300],"macro":[11000,17900,27400],"mega":[23400,39000,60800],"celebrity":[52000,92000,156000]},"live":{"nano":[560,1050,1900],"micro":[1750,3800,7100],"mid":[6700,12200,22000],"macro":[18100,29400,45000],"mega":[38400,64000,99800],"celebrity":[84500,149500,253500]}},"tiktok":{"video":{"nano":[450,860,1550],"micro":[1600,3350,6300],"mid":[5500,10000,18000],"macro":[13800,22300,34200],"mega":[27000,45000,70200],"celebrity":[57200,101200,171600]},"live":{"nano":[510,970,1750],"micro":[1750,3700,6950],"mid":[6250,11400,20500],"macro":[16000,25900,39600],"mega":[31800,53000,82700],"celebrity":[67000,118400,200800]}},"youtube":{"short":{"nano":[570,1100,1950],"micro":[1800,3800,7150],"mid":[6700,12200,22000],"macro":[18200,29400,45100],"mega":[38600,64300,100200],"celebrity":[85600,151500,256900]},"integration":{"nano":[840,1600,2850],"micro":[2850,6050,11300],"mid":[11600,21100,37900],"macro":[33700,54600,83600],"mega":[76100,126900,198000],"celebrity":[179000,316700,537000]},"dedicated":{"nano":[1450,2700,4850],"micro":[4950,10500,19800],"mid":[21100,38300,69000],"macro":[63400,102800,157500],"mega":[147400,245700,383300],"celebrity":[354500,627200,1063500]},"live":{"nano":[950,1800,3200],"micro":[3250,6900,13000],"mid":[13100,23800,42800],"macro":[37600,60900,93300],"mega":[84200,140400,219000],"celebrity":[196600,347800,589700]}}},"kw":{"instagram":{"reel":{"nano":[40.0,70.0,125],"micro":[105,220,430],"mid":[390,720,1300],"macro":[1050,1650,2600],"mega":[2300,3700,5800],"celebrity":[4900,8000,14000]},"story":{"nano":[8.5,14.5,26.0],"micro":[23.0,48.5,94.5],"mid":[86.0,158,286],"macro":[242,380,598],"mega":[552,888,1392],"celebrity":[1176,1920,3360]},"post":{"nano":[23.0,40.5,72.5],"micro":[63.0,132,258],"mid":[242,446,806],"macro":[672,1056,1664],"mega":[1495,2405,3770],"celebrity":[3234,5280,9240]},"carousel":{"nano":[27.0,47.5,85.0],"micro":[75.5,158,310],"mid":[289,533,962],"macro":[798,1254,1976],"mega":[1794,2886,4524],"celebrity":[3920,6400,11200]},"live":{"nano":[45.0,78.5,140],"micro":[124,260,507],"mid":[476,878,1586],"macro":[1312,2062,3250],"mega":[2944,4736,7424],"celebrity":[6370,10400,18200]}},"tiktok":{"video":{"nano":[37.5,65.5,117],"micro":[115,240,470],"mid":[406,749,1352],"macro":[1037,1630,2569],"mega":[2153,3463,5429],"celebrity":[4484,7322,12813]},"live":{"nano":[42.5,74.5,133],"micro":[127,265,519],"mid":[462,854,1541],"macro":[1201,1888,2974],"mega":[2536,4079,6394],"celebrity":[5249,8570,14997]}},"youtube":{"short":{"nano":[44.0,77.0,138],"micro":[121,254,497],"mid":[463,854,1542],"macro":[1279,2010,3167],"mega":[2874,4623,7247],"celebrity":[6277,10248,17934]},"integration":{"nano":[65.0,114,203],"micro":[193,404,790],"mid":[799,1474,2662],"macro":[2370,3725,5870],"mega":[5675,9130,14312],"celebrity":[13120,21420,37485]},"dedicated":{"nano":[111,195,348],"micro":[336,705,1377],"mid":[1454,2684,4846],"macro":[4465,7017,11057],"mega":[10988,17677,27710],"celebrity":[25982,42420,74235]},"live":{"nano":[73.5,129,230],"micro":[220,462,903],"mid":[901,1663,3003],"macro":[2646,4158,6552],"mega":[6279,10101,15834],"celebrity":[14406,23520,41160]}}},"qa":{"instagram":{"reel":{"nano":[450,800,1450],"micro":[1250,2600,5100],"mid":[4600,8500,15700],"macro":[12500,20000,31000],"mega":[26000,42500,67000],"celebrity":[56000,95000,165000]},"story":{"nano":[90,170,300],"micro":[280,570,1100],"mid":[1000,1850,3450],"macro":[2900,4600,7150],"mega":[6250,10200,16100],"celebrity":[13400,22800,39600]},"post":{"nano":[260,460,840],"micro":[750,1550,3050],"mid":[2850,5250,9750],"macro":[8000,12800,19800],"mega":[16900,27600,43600],"celebrity":[37000,62700,108900]},"carousel":{"nano":[310,540,990],"micro":[900,1850,3650],"mid":[3400,6300,11600],"macro":[9500,15200,23600],"mega":[20300,33200,52300],"celebrity":[44800,76000,132000]},"live":{"nano":[500,900,1600],"micro":[1500,3050,6000],"mid":[5600,10400,19200],"macro":[15600,25000,38800],"mega":[33300,54400,85800],"celebrity":[72800,123500,214500]}},"tiktok":{"video":{"nano":[410,730,1350],"micro":[1350,2800,5450],"mid":[4700,8650,16000],"macro":[12100,19400,30000],"mega":[23900,39000,61500],"celebrity":[50300,85300,148100]},"live":{"nano":[470,830,1500],"micro":[1500,3100,6050],"mid":[5350,9900,18300],"macro":[14000,22400,34800],"mega":[28100,46000,72400],"celebrity":[58800,99800,173300]}},"youtube":{"short":{"nano":[500,890,1600],"micro":[1450,3050,5950],"mid":[5500,10200,18800],"macro":[15400,24600,38100],"mega":[32800,53600,84500],"celebrity":[72400,122900,213400]},"integration":{"nano":[740,1300,2400],"micro":[2300,4800,9450],"mid":[9500,17600,32500],"macro":[28500,45600,70600],"mega":[64800,105900,166900],"celebrity":[151400,256800,446000]},"dedicated":{"nano":[1250,2250,4050],"micro":[4050,8400,16500],"mid":[17300,32000,59100],"macro":[53700,85900,133100],"mega":[125400,205000,323100],"celebrity":[299800,508500,883200]},"live":{"nano":[830,1500,2700],"micro":[2650,5500,10800],"mid":[10700,19800,36600],"macro":[31800,50900,78900],"mega":[71700,117100,184700],"celebrity":[166200,282000,489700]}}},"eg":{"instagram":{"reel":{"nano":[1800,3200,5200],"micro":[4500,8000,14000],"mid":[14000,23000,38000],"macro":[35000,58000,95000],"mega":[80000,135000,230000],"celebrity":[180000,320000,580000]},"story":{"nano":[380,670,1100],"micro":[990,1750,3100],"mid":[3100,5050,8350],"macro":[8050,13300,21800],"mega":[19200,32400,55200],"celebrity":[43200,76800,139200]},"post":{"nano":[1050,1850,3000],"micro":[2700,4800,8400],"mid":[8700,14300,23600],"macro":[22400,37100,60800],"mega":[52000,87800,149500],"celebrity":[118800,211200,382800]},"carousel":{"nano":[1200,2200,3550],"micro":[3250,5750,10100],"mid":[10400,17000,28100],"macro":[26600,44100,72200],"mega":[62400,105300,179400],"celebrity":[144000,256000,464000]},"live":{"nano":[2000,3600,5800],"micro":[5300,9450,16500],"mid":[17100,28100,46400],"macro":[43800,72500,118800],"mega":[102400,172800,294400],"celebrity":[234000,416000,754000]}},"tiktok":{"video":{"nano":[1550,2750,4500],"micro":[4550,8050,14100],"mid":[13400,22100,36500],"macro":[31900,52900,86600],"mega":[69100,116600,198700],"celebrity":[152100,270300,490000]},"live":{"nano":[1750,3150,5100],"micro":[5000,8900,15600],"mid":[15300,25200,41600],"macro":[37000,61200,100300],"mega":[81400,137400,234000],"celebrity":[178000,316400,573500]}},"youtube":{"short":{"nano":[1900,3350,5450],"micro":[4950,8800,15400],"mid":[15800,26000,42900],"macro":[40600,67300,110200],"mega":[95200,160600,273700],"celebrity":[219600,390400,707600]},"integration":{"nano":[2800,4950,8050],"micro":[7900,14000,24500],"mid":[27300,44800,74100],"macro":[75200,124700,204200],"mega":[188000,317200,540500],"celebrity":[459000,816000,1479000]},"dedicated":{"nano":[4750,8500,13800],"micro":[13700,24400,42700],"mid":[49700,81600,134900],"macro":[141800,234900,384800],"mega":[364000,614200,1046500],"celebrity":[909000,1616000,2929000]},"live":{"nano":[3150,5600,9100],"micro":[9000,16000,28000],"mid":[30800,50600,83600],"macro":[84000,139200,228000],"mega":[208000,351000,598000],"celebrity":[504000,896000,1624000]}}}};

const INDUSTRY={general:1.00,food:1.00,beauty:1.07,fashion:1.05,technology:1.10,healthcare:1.11,finance:1.16,realestate:1.11,luxury:1.19,education:1.03,automotive:1.11,travel:1.05};
const PROFILE={digital:1.00,expert:1.07,publicFigure:1.16,celebrity:1.30};
const DEMAND={normal:1.00,busy:1.07,high:1.14};
const RUSH={normal:1.00,fast:1.07,urgent:1.15};
const USAGE_CHANNEL={organic:.08,paidSocial:.22,allDigital:.32};
const USAGE_DURATION={30:1,90:1.45,180:1.85,365:2.45};
const EXCLUSIVITY_SCOPE={direct:.08,category:.14};
const EXCLUSIVITY_DURATION={7:.65,30:1,90:1.75,180:2.6};
const WHITELIST_DURATION={30:.14,90:.23,180:.34};

function tierForFollowers(followers){return Object.entries(TIERS).find(([,t])=>followers>=t.min&&followers<=t.max)?.[0]||'celebrity';}
function fmt(value,market){const m=MARKETS[market];const digits=market==='kw'&&Math.abs(value)<100?1:0;return Number(value||0).toLocaleString(m.locale,{maximumFractionDigits:digits})+' '+m.symbol;}
function normalizeData(input={}){
 const platform=CONTENT[input.platform]?input.platform:'instagram';
 const defaultContent=Object.keys(CONTENT[platform])[0];
 return {
  market:MARKETS[input.market]?input.market:'sa', platform, contentType:CONTENT[platform][input.contentType]?input.contentType:defaultContent,
  followers:clamp(Number(input.followers)||50000,1000,100000000), engagement:clamp(Number(input.engagement)||0,0,30),
  views:clamp(Number(input.views)||0,0,100000000), storyViews:clamp(Number(input.storyViews)||0,0,100000000), audience:clamp(Number(input.audience)||0,0,100),
  industry:INDUSTRY[input.industry]?input.industry:'general', profile:PROFILE[input.profile]?input.profile:'digital', demand:DEMAND[input.demand]?input.demand:'normal',
  usage:!!input.usage,usageChannel:USAGE_CHANNEL[input.usageChannel]!=null?input.usageChannel:'organic',usageDuration:Number(input.usageDuration)||30,
  exclusivity:!!input.exclusivity,exclusivityScope:EXCLUSIVITY_SCOPE[input.exclusivityScope]!=null?input.exclusivityScope:'direct',exclusivityDuration:Number(input.exclusivityDuration)||7,
  whitelisting:!!input.whitelisting,whitelistDuration:Number(input.whitelistDuration)||30,revisions:clamp(Number(input.revisions)||1,1,3),rush:RUSH[input.rush]?input.rush:'normal'
 };
}
function engagementMetrics(rate,platform,tier){
 const benchmark=ENGAGEMENT_BENCHMARKS[platform][tier];
 if(!rate)return {benchmark,ratio:0,mult:.96,label:'غير مكتمل',score:50};
 const ratio=rate/benchmark; const mult=clamp(.88+ratio*.12,.78,1.25); const score=clamp(70+(ratio-1)*30,10,100);
 let label='ضمن المتوسط'; if(ratio>=1.55)label='ممتاز'; else if(ratio>=1.15)label='قوي'; else if(ratio<.72)label='منخفض';
 return {benchmark,ratio,mult,label,score};
}
function viewMetrics(d,tier,format){
 if(!format.viewMode)return {available:false,benchmark:0,ratio:0,performance:1,label:'غير مطبق',score:60,value:0};
 const observed=format.usesStoryViews?d.storyViews:d.views;
 const benchmark=VIEW_BENCHMARKS[d.platform][format.viewMode][tier];
 if(!observed)return {available:false,benchmark,ratio:0,performance:0,label:'غير مدخل',score:50,value:0};
 const ratio=observed/Math.max(1,d.followers); const performance=ratio/benchmark; const score=clamp(70+(performance-1)*25,8,100);
 let label='طبيعي'; if(performance>=1.6)label='ممتاز'; else if(performance>=1.15)label='قوي'; else if(performance<.62)label='منخفض';
 const cpm=VIEW_CPM[d.market][d.platform][format.viewMode]; const value=(observed/1000)*geometricMean(cpm[0],cpm[1]);
 return {available:true,observed,benchmark,ratio,performance,label,score,value};
}
function audienceMetrics(percent){
 if(!percent)return {mult:.94,label:'غير معروف',score:45};
 let mult,label; if(percent<20){mult=.82;label='منخفض جدًا';}else if(percent<40){mult=.92;label='منخفض';}else if(percent<60){mult=1;label='متوسط';}else if(percent<75){mult=1.07;label='جيد';}else if(percent<90){mult=1.13;label='قوي';}else{mult=1.18;label='ممتاز';}
 return {mult,label,score:clamp(30+percent*.78,30,100)};
}
function extrasForBase(base,d){
 let usage=0,exclusivity=0,whitelisting=0,revisions=0,rush=0; const rows=[];
 if(d.usage){usage=base*USAGE_CHANNEL[d.usageChannel]*(USAGE_DURATION[d.usageDuration]||1);rows.push({label:'حقوق استخدام المحتوى',value:usage});}
 if(d.exclusivity){exclusivity=base*EXCLUSIVITY_SCOPE[d.exclusivityScope]*(EXCLUSIVITY_DURATION[d.exclusivityDuration]||1);rows.push({label:'الحصرية',value:exclusivity});}
 if(d.whitelisting){whitelisting=base*(WHITELIST_DURATION[d.whitelistDuration]||.14);rows.push({label:'Whitelisting / Spark Ads',value:whitelisting});}
 if(d.revisions===2)revisions=base*.035; else if(d.revisions>=3)revisions=base*.075; if(revisions)rows.push({label:'جولات تعديل إضافية',value:revisions});
 if(d.rush!=='normal'){rush=base*((RUSH[d.rush]||1)-1);rows.push({label:'تنفيذ سريع / عاجل',value:rush});}
 return {usage,exclusivity,whitelisting,revisions,rush,rows,total:usage+exclusivity+whitelisting+revisions+rush};
}
function creatorPricingScore(d,engagement,views,audience){
 const engagementPoints=25*(engagement.score/100);
 const viewPoints=views.available?30*(views.score/100):15;
 const audiencePoints=20*(audience.score/100);
 const industryPremium=(INDUSTRY[d.industry]-1)/.19; const industryPoints=5*clamp(.45+industryPremium*.55,.35,1);
 const demandPoints={normal:5,busy:8,high:10}[d.demand]; const profilePoints={digital:3,expert:4,publicFigure:4.5,celebrity:5}[d.profile];
 const score=Math.round(clamp(engagementPoints+viewPoints+audiencePoints+industryPoints+demandPoints+profilePoints,20,100));
 let label='نامٍ'; if(score>=88)label='قوة تسعير استثنائية'; else if(score>=76)label='قوة تسعير عالية'; else if(score>=62)label='قوة تسعير جيدة'; else if(score<45)label='قوة تسعير محدودة';
 return {score,label,components:{engagement:Math.round(engagementPoints),views:Math.round(viewPoints),audience:Math.round(audiencePoints),industry:Math.round(industryPoints),demand:demandPoints,profile:profilePoints}};
}
function estimateQuality(d,format,views){
 let q=48; if(d.engagement>0)q+=15; if(format.viewMode){if(views.available)q+=20;}else q+=12; if(d.audience>0)q+=10; if(d.industry!=='general')q+=4; if(d.profile!=='digital')q+=2;
 return clamp(q,50,96);
}
function calculate(input,forcedContentType=null){
 const d=normalizeData(input); if(forcedContentType&&CONTENT[d.platform][forcedContentType])d.contentType=forcedContentType;
 const tier=tierForFollowers(d.followers),format=CONTENT[d.platform][d.contentType], marketRange=PRICE_BENCHMARKS[d.market][d.platform][d.contentType][tier];
 const marketLow=marketRange[0],marketAverage=marketRange[1],marketHigh=marketRange[2];
 const engagement=engagementMetrics(d.engagement,d.platform,tier),views=viewMetrics(d,tier,format),audience=audienceMetrics(d.audience);
 let performanceAnchor=marketAverage;
 if(format.viewMode&&views.available){
   // A creator at the platform/tier view benchmark stays anchored to Market Average.
   // Above/below-benchmark views move only the creator-specific fair rate, with diminishing returns.
   const viewPerformanceFactor=clamp(Math.pow(Math.max(.05,views.performance),.72),.48,2.15);
   const viewValue=marketAverage*viewPerformanceFactor;
   performanceAnchor=marketAverage*(1-format.viewWeight)+viewValue*format.viewWeight;
 }
 const nonViewFactor=engagement.mult*audience.mult*INDUSTRY[d.industry]*PROFILE[d.profile]*DEMAND[d.demand];
 let fairBase=performanceAnchor*clamp(nonViewFactor,.68,1.72);
 fairBase=clamp(fairBase,marketLow*.62,marketHigh*1.62);
 const fairExtras=extrasForBase(fairBase,d), marketExtras=extrasForBase(marketAverage,d);
 const fair=fairBase+fairExtras.total, marketCommercialAverage=marketAverage+marketExtras.total;
 const lowBase=Math.max(marketLow*.72,fairBase*.74); const highBase=Math.max(fairBase*1.28,marketHigh*.92);
 const low=lowBase+extrasForBase(lowBase,d).total, high=highBase+extrasForBase(highBase,d).total;
 const score=creatorPricingScore(d,engagement,views,audience), quality=estimateQuality(d,format,views);
 const reasons=[];
 if(engagement.ratio>=1.15)reasons.push(`تفاعلك أعلى من Benchmark ${d.platform} لفئة ${TIERS[tier].label}.`); else if(engagement.ratio>0&&engagement.ratio<.72)reasons.push(`تفاعلك أقل من Benchmark ${d.platform} لفئتك، فتم تخفيض السعر الشخصي دون تغيير متوسط السوق.`); else if(d.engagement)reasons.push('تفاعلك قريب من Benchmark المنصة والفئة.'); else reasons.push('لم تدخل معدل تفاعل، لذلك بقي جزء من التقدير محافظًا.');
 if(format.viewMode){if(views.available&&views.performance>=1.15)reasons.push('مشاهداتك أعلى من النسبة المعتادة لحجم حسابك وتدعم سعرًا أعلى.');else if(views.available&&views.performance<.62)reasons.push('المشاهدات أقل من Benchmark الحجم؛ لذلك لا نعتمد على المتابعين وحدهم.');else if(views.available)reasons.push('المشاهدات قريبة من Benchmark المنصة والفئة.');else reasons.push('إضافة متوسط المشاهدات سترفع جودة التقدير، خصوصًا لهذا النوع من المحتوى.');}
 if(d.audience>=75)reasons.push('الجمهور المحلي قوي ويرفع القيمة التجارية للحساب.');else if(d.audience&&d.audience<40)reasons.push('نسبة الجمهور المحلي منخفضة وقد تقلل قيمة التعاون داخل هذا السوق.');
 if(d.profile==='expert')reasons.push('التخصص المهني يعطي Premium محدودًا عند وجود ملاءمة قوية مع البراند.'); if(d.demand==='high')reasons.push('ارتفاع الطلب على الحساب يرفع قوة التفاوض.'); if(fairExtras.total>0)reasons.push('الحقوق والشروط التجارية سُعّرت منفصلة عن سعر النشر الأساسي.');
 let position='قريب من السوق',positionHint='سعرك الشخصي قريب من Benchmark السوق.'; const positionRatio=fair/Math.max(1,marketCommercialAverage); if(positionRatio>=1.18){position='أعلى من السوق';positionHint='أداء الحساب وشروطه يدعمان Premium.';}else if(positionRatio<=.85){position='أقل من السوق';positionHint='بيانات الأداء الحالية تدعم تسعيرًا أكثر تحفظًا.';}
 return {d,tier,format,marketLow,marketAverage,marketHigh,marketCommercialAverage,fairBase,fair,low,high,fairExtras,marketExtras,engagement,views,audience,score,quality,reasons:reasons.slice(0,7),position,positionHint};
}

const API={MARKETS,TIERS,CONTENT,PRICE_BENCHMARKS,ENGAGEMENT_BENCHMARKS,VIEW_BENCHMARKS,VIEW_CPM,normalizeData,tierForFollowers,calculate,fmt};
if(typeof module!=='undefined'&&module.exports)module.exports=API;
if(typeof window!=='undefined')window.CreatorPricingEngine=API;

if(typeof document!=='undefined'){
 const $=(id)=>document.getElementById(id); let currentStep=1,lastResult=null;
 const numberValue=(id,fallback=0)=>{const el=$(id);if(!el||el.value==='')return fallback;const v=Number(el.value);return Number.isFinite(v)?v:fallback;};
 function gather(){return {market:$('market').value,platform:$('platform').value,contentType:$('contentType').value,followers:numberValue('followers',50000),engagement:numberValue('engagementRate',0),views:numberValue('averageViews',0),storyViews:numberValue('storyViews',0),audience:numberValue('audienceMatch',60),industry:$('industry').value,profile:$('creatorProfile').value,demand:$('demand').value,usage:$('usageRights').checked,usageChannel:$('usageChannel').value,usageDuration:numberValue('usageDuration',30),exclusivity:$('exclusivity').checked,exclusivityScope:$('exclusivityScope').value,exclusivityDuration:numberValue('exclusivityDuration',7),whitelisting:$('whitelisting').checked,whitelistDuration:numberValue('whitelistDuration',30),revisions:numberValue('revisionRounds',1),rush:$('rush').value};}
 function showStep(step){currentStep=clamp(step,1,3);document.querySelectorAll('.wizard-pane').forEach(p=>p.hidden=Number(p.dataset.step)!==currentStep);document.querySelectorAll('.step').forEach(btn=>{const n=Number(btn.dataset.stepJump);btn.classList.toggle('active',n===currentStep);btn.classList.toggle('done',n<currentStep);});$('prevStep').hidden=currentStep===1;$('nextStep').textContent=currentStep===3?'احسب سعري':'التالي';}
 function updateContentOptions(){const p=$('platform').value,prev=$('contentType').value;$('contentType').innerHTML=Object.entries(CONTENT[p]).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');if(CONTENT[p][prev])$('contentType').value=prev;updateFormatHint();updateEngagementHint();}
 function updateFormatHint(){const p=$('platform').value,t=$('contentType').value,item=CONTENT[p][t];$('formatHint').textContent=item?.hint||'';$('storyViewsWrap').hidden=!(p==='instagram'&&t==='story');}
 function updateEngagementHint(){const p=$('platform').value;const text=p==='instagram'?'Instagram: استخدم (الإعجابات + التعليقات + الحفظ) ÷ المتابعين × 100، أو نفس معدل Insights بشكل ثابت.':p==='tiktok'?'TikTok: استخدم (الإعجابات + التعليقات + المشاركات) ÷ المشاهدات × 100.':'YouTube: استخدم (الإعجابات + التعليقات) ÷ المشاهدات × 100.';$('engagementMethodHint').textContent=text;updateTierHint();}
 function updateTierHint(){const f=clamp(numberValue('followers',50000),1000,100000000),t=tierForFollowers(f),p=$('platform').value;$('tierHint').textContent=`الفئة: ${TIERS[t].label} • Benchmark تفاعل ${p}: ${ENGAGEMENT_BENCHMARKS[p][t]}%`;updatePerformanceHint();}
 function updatePerformanceHint(){const f=clamp(numberValue('followers',50000),1000,100000000),t=tierForFollowers(f),p=$('platform').value,e=numberValue('engagementRate',0),b=ENGAGEMENT_BENCHMARKS[p][t];if(!e){$('performanceHint').textContent='أدخل التفاعل والمشاهدات لتحصل على Creator Pricing Score أدق.';return;}const r=e/b;$('performanceHint').textContent=r>=1.45?'التفاعل أعلى بكثير من Benchmark المنصة والفئة.':r>=1.15?'التفاعل قوي مقارنةً بـBenchmark المنصة والفئة.':r<.72?'التفاعل أقل من Benchmark؛ المشاهدات قد تعوض ذلك إن كانت قوية.':'التفاعل قريب من المستوى المعتاد للمنصة والفئة.';}
 function toggleFields(a,b){$(b).hidden=!$(a).checked;}
 function renderRateCard(r){const d=r.d;const cards=Object.keys(CONTENT[d.platform]).map(type=>{const x=calculate({...d,usage:false,exclusivity:false,whitelisting:false,revisions:1,rush:'normal'},type);return {type,label:CONTENT[d.platform][type].label,fair:x.fairBase};});if(d.platform==='instagram'){const reel=cards.find(x=>x.type==='reel')?.fair||0,story=cards.find(x=>x.type==='story')?.fair||0;cards.push({type:'bundle',label:'Reel + 3 Stories',fair:(reel+story*3)*.94});}$('rateCardGrid').innerHTML=cards.map(x=>`<div class="rate-item"><span>${x.label}</span><strong>${fmt(x.fair,d.market)}</strong></div>`).join('');}
 function renderResult(r){const m=r.d.market;$('results').hidden=false;$('fairRate').textContent=fmt(r.fair,m);$('lowRate').textContent=fmt(r.low,m);$('marketAverage').textContent=fmt(r.marketCommercialAverage,m);$('highRate').textContent=fmt(r.high,m);$('rangeLow').textContent=fmt(r.low,m);$('rangeFair').textContent=fmt(r.fair,m);$('rangeHigh').textContent=fmt(r.high,m);$('rangeMarker').style.left=clamp((r.fair-r.low)/Math.max(1,r.high-r.low)*100,2,98)+'%';$('tierBadge').textContent=`فئة الحساب: ${TIERS[r.tier].label}`;$('confidenceBadge').textContent=`جودة التقدير ${r.quality}%`;$('confidenceScore').textContent=r.quality+'%';$('pricingPosition').textContent=r.position;$('pricingPositionHint').textContent=r.positionHint;$('creatorPricingScore').textContent=r.score.score+'/100';$('creatorPricingLabel').textContent=r.score.label;$('creatorScoreBar').style.width=r.score.score+'%';$('engagementScore').textContent=r.engagement.label;$('engagementDetail').textContent=r.d.engagement?`${r.d.engagement}% مقابل ${r.engagement.benchmark}% Benchmark`:'لم يتم إدخال معدل فعلي';if(r.format.viewMode){$('viewsScore').textContent=r.views.label;$('viewsDetail').textContent=r.views.available?`${Math.round(r.views.ratio*100)}% من حجم الحساب`:'أدخل المشاهدات لرفع الدقة';}else{$('viewsScore').textContent='غير مطبق';$('viewsDetail').textContent='هذا النوع لا يعتمد على المشاهدات مباشرة';}$('audienceScore').textContent=r.audience.label;$('audienceDetail').textContent=`${r.d.audience}% داخل ${MARKETS[m].label}`;$('pricingReasons').innerHTML=r.reasons.map(x=>`<li>${x}</li>`).join('');const rows=[{label:'سعر النشر الأساسي المقترح',value:r.fairBase},...r.fairExtras.rows];$('commercialBreakdown').innerHTML=rows.map(x=>`<tr><td>${x.label}</td><td>${fmt(x.value,m)}</td></tr>`).join('')+`<tr><td><strong>السعر التجاري المقترح</strong></td><td><strong>${fmt(r.fair,m)}</strong></td></tr>`;$('offerCurrency').textContent=MARKETS[m].symbol;$('brandOffer').value='';$('offerResult').hidden=true;renderRateCard(r);lastResult=r;$('results').scrollIntoView({behavior:'smooth',block:'start'});}
 function buildRateCardText(){if(!lastResult)return'';const lines=[...document.querySelectorAll('#rateCardGrid .rate-item')].map(el=>`${el.querySelector('span').textContent}: ${el.querySelector('strong').textContent}`);return [`Rate Card — ${MARKETS[lastResult.d.market].label} / ${lastResult.d.platform}`,...lines,'','الأسعار تقديرية وتخضع لنطاق العمل والحقوق والحصرية.'].join('\n');}
 function buildSummary(r){return ['ملخص تسعير المؤثر',`السوق: ${MARKETS[r.d.market].label}`,`المنصة: ${r.d.platform}`,`نوع المحتوى: ${r.format.label}`,`الفئة: ${TIERS[r.tier].label}`,`Creator Pricing Score: ${r.score.score}/100 — ${r.score.label}`,`السعر العادل: ${fmt(r.fair,r.d.market)}`,`أقل سعر مقترح: ${fmt(r.low,r.d.market)}`,`متوسط السوق المستقل: ${fmt(r.marketCommercialAverage,r.d.market)}`,`أعلى سعر منطقي: ${fmt(r.high,r.d.market)}`,`جودة التقدير: ${r.quality}%`,'','التقدير إرشادي وليس عرض سعر ملزمًا.'].join('\n');}
 async function copyText(text,button,label){try{await navigator.clipboard.writeText(text);button.textContent='تم النسخ';setTimeout(()=>button.textContent=label,1300);}catch{alert('تعذر النسخ تلقائيًا.');}}
 function analyzeOffer(){if(!lastResult)return;const offer=numberValue('brandOffer',0),box=$('offerResult');if(!offer){box.className='offer-result warn';box.innerHTML='<strong>أدخل قيمة عرض البراند أولًا.</strong>';box.hidden=false;return;}const fair=lastResult.fair,ratio=offer/Math.max(1,fair),diff=Math.round(Math.abs(1-ratio)*100);let cls='good',headline,detail;if(ratio<.72){cls='bad';headline=`العرض أقل من سعرك العادل بحوالي ${diff}%.`;detail=`حد تفاوض مناسب: ${fmt(lastResult.low,lastResult.d.market)}. Counter Offer مبدئي: ${fmt(fair*1.08,lastResult.d.market)}.`;}else if(ratio<.90){cls='warn';headline=`العرض أقل من سعرك العادل بحوالي ${diff}%.`;detail=`استهدف نطاق ${fmt(fair*.95,lastResult.d.market)} إلى ${fmt(fair*1.08,lastResult.d.market)}.`;}else if(ratio<=1.18){headline='العرض ضمن النطاق العادل.';detail='راجع الحقوق والحصرية ونطاق العمل قبل الموافقة.';}else{headline=`العرض أعلى من سعرك العادل بحوالي ${diff}%.`;detail='العرض قوي سعريًا؛ راجع الشروط التجارية قبل الاعتماد النهائي.';}box.className=`offer-result ${cls}`;box.innerHTML=`<strong>${headline}</strong><div>${detail}</div>`;box.hidden=false;}
 $('platform').addEventListener('change',updateContentOptions);$('contentType').addEventListener('change',updateFormatHint);$('followers').addEventListener('input',updateTierHint);$('engagementRate').addEventListener('input',updatePerformanceHint);$('usageRights').addEventListener('change',()=>toggleFields('usageRights','usageFields'));$('exclusivity').addEventListener('change',()=>toggleFields('exclusivity','exclusivityFields'));$('whitelisting').addEventListener('change',()=>toggleFields('whitelisting','whitelistingFields'));document.querySelectorAll('[data-step-jump]').forEach(btn=>btn.addEventListener('click',()=>showStep(Number(btn.dataset.stepJump))));$('prevStep').addEventListener('click',()=>showStep(currentStep-1));$('nextStep').addEventListener('click',()=>{if(currentStep<3){showStep(currentStep+1);return;}renderResult(calculate(gather()));});$('checkOffer').addEventListener('click',analyzeOffer);$('copyRateCard').addEventListener('click',()=>copyText(buildRateCardText(),$('copyRateCard'),'نسخ Rate Card'));$('copySummary').addEventListener('click',()=>lastResult&&copyText(buildSummary(lastResult),$('copySummary'),'نسخ ملخص السعر'));$('printResult').addEventListener('click',()=>window.print());$('recalculate').addEventListener('click',()=>{showStep(1);$('calculator').scrollIntoView({behavior:'smooth',block:'start'});});
 updateContentOptions();updateEngagementHint();updateTierHint();toggleFields('usageRights','usageFields');toggleFields('exclusivity','exclusivityFields');toggleFields('whitelisting','whitelistingFields');showStep(1);
}
