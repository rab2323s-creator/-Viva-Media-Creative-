'use strict';

const assert = require('assert');
const E = require('./pricing-engine.js');
const D = E.DATA;

let checks=0;
function ok(condition,message){ checks++; assert.ok(condition,message); }
function finitePositive(v,name){ ok(Number.isFinite(v) && v>0,`${name} must be positive finite, got ${v}`); }

const formats=[];
for (const [platform,items] of Object.entries(D.content)){
  for (const type of Object.keys(items)) formats.push([platform,type]);
}

const markets=Object.keys(D.markets);
const followersList=[5000,50000,100000,500000,5000000];
const performanceProfiles=[
  {engagementScale:.45,viewScale:.35,audiencePct:25},
  {engagementScale:1.00,viewScale:1.00,audiencePct:60},
  {engagementScale:1.80,viewScale:2.20,audiencePct:88}
];

let stressCases=0;
for (const market of markets){
  for (const [platform,contentType] of formats){
    for (const followers of followersList){
      for (const perf of performanceProfiles){
        const seed=E.seedCore({market,platform,contentType,followers,niche:'general'});
        const engagement=seed.engagement.benchmark*perf.engagementScale;
        const observed=seed.views.applicable ? seed.views.expected*perf.viewScale : 0;
        const input={
          market,platform,contentType,followers,engagement,
          audiencePct:perf.audiencePct,niche:'general',
          views: D.content[platform][contentType].usesStoryViews ? 0 : observed,
          storyViews: D.content[platform][contentType].usesStoryViews ? observed : 0,
          collaborations:3,demand:'normal'
        };
        const r=E.calculate(input);
        stressCases++;
        finitePositive(r.marketMedian,'marketMedian');
        finitePositive(r.marketP25,'marketP25');
        finitePositive(r.marketP75,'marketP75');
        finitePositive(r.fairPublishingRate,'fairPublishingRate');
        finitePositive(r.doNotGoBelow,'doNotGoBelow');
        finitePositive(r.recommendedAsk,'recommendedAsk');
        finitePositive(r.premiumCeiling,'premiumCeiling');
        ok(r.marketP25 < r.marketMedian, 'P25 must be below median');
        ok(r.marketP75 > r.marketMedian, 'P75 must be above median');
        ok(r.doNotGoBelow <= r.fairPublishingRate + 1e-9,'minimum must not exceed fair');
        ok(r.recommendedAsk >= r.fairPublishingRate,'ask must be >= fair');
        ok(r.premiumCeiling >= r.recommendedAsk - 1e-9,'ceiling must be >= ask');
        ok(r.fairPublishingRate <= r.marketMedian*1.52+1e-6,'fair upper cap');
        ok(r.fairPublishingRate >= r.marketMedian*.64-1e-6,'fair lower cap');
      }
    }
  }
}

// Smooth continuity around former tier boundaries.
for (const market of markets){
  for (const [platform,contentType] of formats){
    for (const boundary of [10000,100000,500000,1000000,3000000]){
      const a=E.calculate({market,platform,contentType,followers:boundary-1,niche:'general'});
      const b=E.calculate({market,platform,contentType,followers:boundary,niche:'general'});
      const ratio=b.marketMedian/a.marketMedian;
      ok(ratio>0.995 && ratio<1.01,`continuity failed ${market}/${platform}/${contentType}@${boundary}: ${ratio}`);
    }
  }
}

// Neutral market medians should grow as follower count grows.
for (const market of markets){
  for (const [platform,contentType] of formats){
    let prev=0;
    for (const followers of [3000,5000,10000,25000,50000,100000,250000,500000,1000000,3000000,5000000,10000000]){
      const r=E.calculate({market,platform,contentType,followers,niche:'general'});
      ok(r.marketMedian>prev,`median not monotonic ${market}/${platform}/${contentType}/${followers}`);
      prev=r.marketMedian;
    }
  }
}

// User-provided calibration sanity check.
const saExample=E.calculate({
  market:'sa',platform:'instagram',contentType:'reel',
  followers:100000,views:50000,engagement:3.0,audiencePct:60,
  niche:'general',creatorProfile:'digital',demand:'normal',collaborations:2
});
ok(saExample.marketMedian>=1700 && saExample.marketMedian<=2100,`Saudi 100K median unexpected ${saExample.marketMedian}`);
ok(saExample.fairPublishingRate>=1800 && saExample.fairPublishingRate<=2600,`Saudi 100K/50K fair unexpected ${saExample.fairPublishingRate}`);
ok(saExample.recommendedAsk<=3000,`Saudi recommended ask too high ${saExample.recommendedAsk}`);

// Views must matter, but remain capped.
const lowViews=E.calculate({market:'sa',platform:'instagram',contentType:'reel',followers:100000,views:12000,engagement:3,audiencePct:60,niche:'general'});
const normalViews=E.calculate({market:'sa',platform:'instagram',contentType:'reel',followers:100000,views:38000,engagement:3,audiencePct:60,niche:'general'});
const hugeViews=E.calculate({market:'sa',platform:'instagram',contentType:'reel',followers:100000,views:500000,engagement:3,audiencePct:60,niche:'general'});
ok(lowViews.fairPublishingRate < normalViews.fairPublishingRate,'views should raise fair');
ok(normalViews.fairPublishingRate < hugeViews.fairPublishingRate,'huge views should raise fair');
ok(hugeViews.fairPublishingRate <= hugeViews.marketMedian*1.52+1e-6,'huge views must respect cap');

// Engagement cannot dominate pricing.
const eLow=E.calculate({market:'sa',platform:'instagram',contentType:'reel',followers:100000,views:38000,engagement:.2,audiencePct:60,niche:'general'});
const eHigh=E.calculate({market:'sa',platform:'instagram',contentType:'reel',followers:100000,views:38000,engagement:15,audiencePct:60,niche:'general'});
ok(eLow.engagement.factor>=D.engagementCorrection.min-1e-9,'engagement lower cap');
ok(eHigh.engagement.factor<=D.engagementCorrection.max+1e-9,'engagement upper cap');
ok(eHigh.fairPublishingRate/eLow.fairPublishingRate < 1.20,'engagement gap too strong');

// Self-reported demand/profile must NOT change fair rate.
const fairBase=E.calculate({market:'sa',platform:'instagram',contentType:'reel',followers:100000,views:50000,engagement:3,audiencePct:60,niche:'general',demand:'normal',creatorProfile:'digital',collaborations:0});
const fairHype=E.calculate({market:'sa',platform:'instagram',contentType:'reel',followers:100000,views:50000,engagement:3,audiencePct:60,niche:'general',demand:'high',creatorProfile:'celebrity',collaborations:20});
ok(Math.abs(fairBase.fairPublishingRate-fairHype.fairPublishingRate)<1e-6,'demand/profile changed fair rate');
ok(fairHype.recommendedAsk>fairBase.recommendedAsk,'demand/profile should affect ask');

// Synthetic real-deal calibration: comparable deals 15% below seed should pull median down,
// but blending/caps prevent unstable overreaction.
const syntheticDeals=[];
for(let i=0;i<14;i++){
  syntheticDeals.push({
    date:'2026-08-'+String(1+(i%15)).padStart(2,'0'),
    market:'sa',platform:'instagram',contentType:'reel',niche:'general',
    followers:90000+i*1800,averageViews:42000+i*700,engagement:3.0,audiencePct:62,
    finalPublishingFee:1600+i*12
  });
}
const calibrated=E.calculate({
  market:'sa',platform:'instagram',contentType:'reel',followers:100000,views:50000,
  engagement:3,audiencePct:60,niche:'general'
},{deals:syntheticDeals});
ok(calibrated.calibration.applied,'real deal calibration should apply');
ok(calibrated.marketMedian<saExample.marketMedian,'lower real deals should pull median down');
ok(calibrated.calibration.factor>=D.calibration.factorClamp[0],'calibration factor lower clamp');
ok(calibrated.calibration.factor<=D.calibration.factorClamp[1],'calibration factor upper clamp');

console.log(JSON.stringify({
  status:'PASS',
  engineVersion:D.version,
  stressCases,
  assertions:checks,
  referenceCase:{
    marketMedian:Math.round(saExample.marketMedian),
    fair:Math.round(saExample.fairPublishingRate),
    minimum:Math.round(saExample.doNotGoBelow),
    ask:Math.round(saExample.recommendedAsk),
    ceiling:Math.round(saExample.premiumCeiling)
  },
  calibratedReference:{
    comparableDeals:calibrated.calibration.rawCount,
    marketMedian:Math.round(calibrated.marketMedian),
    fair:Math.round(calibrated.fairPublishingRate)
  }
},null,2));
