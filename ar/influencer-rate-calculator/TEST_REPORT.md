# TEST REPORT — Creator Pricing Engine V3

Status: **PASS**

- Engine version: `3.0.0`
- Stress scenarios: **825**
- Assertions: **12500**
- JavaScript syntax checks: **PASS**
- HTML ↔ app.js ID audit: **PASS** (no missing referenced IDs)

## Reference case

Saudi Arabia / Instagram Reel / 100,000 followers / 50,000 average views /
3% engagement / 60% Saudi audience / General niche.

- Market Median: **1900 SAR**
- Fair Publishing Rate: **2248 SAR**
- Do Not Go Below: **1818 SAR**
- Recommended Ask: **2473 SAR**
- Premium Ceiling: **2770 SAR**

This is an explicit regression test to prevent the previous ~12,000 SAR outcome for this scenario.

## Real-deal calibration test

A synthetic test dataset is used only inside `tests.js` to verify the calibration math.
It is not included in `deal-data.js` and is not treated as market data.

- Comparable synthetic deals: **14**
- Calibrated Market Median: **1766 SAR**
- Calibrated Fair Rate: **2089 SAR**

## Tested invariants

- No hard pricing jump at 10K / 100K / 500K / 1M / 3M boundaries.
- Market Median increases smoothly with follower count.
- P25 < Median < P75.
- Do Not Go Below never exceeds Fair Rate.
- Recommended Ask never falls below Fair Rate.
- Premium Ceiling never falls below Recommended Ask.
- Extremely high views cannot push Fair Rate beyond the configured cap.
- Engagement correction remains bounded.
- Demand and self-selected creator profile do not alter Fair Publishing Rate.
- Real completed deals can recalibrate the benchmark when enough comparable records exist.
