'use strict';

/*
  Add REAL, completed deals only.
  IMPORTANT: finalPublishingFee must exclude usage rights, exclusivity, whitelisting,
  extra production, rush fees and extra revisions so the engine compares like-for-like.

  Example schema (example only — do not uncomment as real data):
  {
    date: '2026-08-01',
    market: 'sa',
    platform: 'instagram',
    contentType: 'reel',
    niche: 'food',
    followers: 100000,
    averageViews: 50000,
    storyViews: 0,
    engagement: 3.2,
    audiencePct: 68,
    finalPublishingFee: 2100
  }
*/
const CREATOR_DEAL_DATA = [];

if (typeof module !== 'undefined' && module.exports) module.exports = CREATOR_DEAL_DATA;
if (typeof window !== 'undefined') window.CREATOR_DEAL_DATA = CREATOR_DEAL_DATA;
