# Roadmap — The Hive, Inc. v1.0

Day 1 = 2026-09-22. Target: public soft launch on Google Play ≈ 2026-10-22.
Source: spec §12 ([design spec](docs/superpowers/specs/2026-09-22-the-hive-inc-design.md)). Tick items as they're done. The working loop is in [workflows/workflow.md](workflows/workflow.md).

## Milestones

| Date | Milestone |
|---|---|
| 2026-09-23 (day 2) | Monetization spike verdict: the Godot plugins work on a device, or we have a fallback |
| 2026-09-30 (≈ day 9) | Closed test starts: 12+ testers opted in, and the 14-day clock begins |
| 2026-10-14 (≈ day 23) | 14 consecutive tester days complete |
| 2026-10-15 (≈ day 24) | **Decision gate:** launch with IAP, or ads-only (IAP in v1.1). Apply for production access |
| 2026-10-22 (≈ day 31) | **Public soft launch on Google Play** |

---

## Days 1–2 · 2026-09-22 → 09-23 · Foundation + monetization spike

### Android monetization spike (do first: risk §13)
- [ ] Export signed Android test build
- [ ] Install/run on physical Android device
- [ ] Spike Play Billing plugin with test product
- [ ] Spike AdMob rewarded test ad + reward callback
- [ ] Spike UMP consent flow
- [ ] Pin known-good Godot/plugin versions
- [ ] Record versions, setup steps and quirks in `workflows/workflow.md` → Lessons learned

> Billing needs a Play Console app with this build on the **internal testing** track, one test product and a license-tester account (owner). AdMob uses Google's public test ad unit IDs, so no AdMob account is needed yet.

### Engineering (Claude)
- [ ] Godot project scaffold (`game/`), autoloads `Game`, `Events`, `Services`
- [ ] GUT installed, and a headless test command recorded in CLAUDE.md
- [ ] Data files: `honey_tiers`, `hives`, `vehicles`, `research`, `epic_research`, `boosts`, `products`, `pests`, `milestones`, `daily_gift`, `config` (seeded from wiki reference data for initial tuning)
- [ ] `sim/game_state.gd` + serialization round-trip test
- [ ] `sim/economy.gd` (honey rate, ship rate, income, CV) + tests
- [ ] `sim/tick.gd` `advance(state, dt)` + determinism test
- [ ] `sim/offline.gd` + offline ≈ online equivalence test
- [ ] `sim/prestige.gd` (Swarm payout, reset/keep lists) + tests
- [ ] `sim/actions.gd` (buy hive, buy vehicle, research) + tests
- [ ] `sim/bignum_format.gd` + tests
- [ ] Service interfaces + fakes (all 8)

### Owner
- [x] Register Google Play Console ($25) — done 2026-09-22
- [ ] Create the app, upload the spike build to internal testing, create 1 test product, add a license tester
- [ ] Physical Android phone ready (developer mode + USB debugging)
- [ ] Start recruiting 12+ testers
- [ ] Create Firebase project (Blaze plan)
- [ ] Make Higgsfield style samples (spec §9.2)

---

## Days 3–7 · 2026-09-24 → 09-28 · Core game playable

### Engineering
- [ ] Apiary screen (meadow, 4 hive plots, Brood Comb, depot/road, store shed) with placeholder art
- [ ] HUD: cash, Golden Nectar, income/sec, capacity bar (green/amber/red), boost chips
- [ ] Release button + pooled bee sprites (cap 30) + Buzz Bonus
- [ ] Hives tab (upgrade in place, 12 tiers)
- [ ] Fleet tab (slots, 10 tiers)
- [ ] Honey tiers + Upgrade Honey pop-up
- [ ] Research tab (common, ~40 items, 8 tiers)
- [ ] Queen's Brood (auto-hatch)
- [ ] Local save (rotating 2 backups) + schema_version/migrations
- [ ] Offline catch-up wired to ClockService
- [ ] Pacing-bot test (§5.10) running against current data
- [ ] Debug menu (time-skip, grant currency, reset save)

### Owner
- [ ] Review builds on device
- [ ] Start hive, bee and background art

---

## Days 8–9 · 2026-09-29 → 09-30 · Meta systems + closed test

### Engineering
- [ ] Swarm (prestige) screen with projected gain + before/after
- [ ] Epic research (12 items)
- [ ] Boosts (slots, refresh rule, 6 types)
- [ ] Pests (wasp, hornet)
- [ ] Welcome Back pop-up
- [ ] Signed AAB → **closed test track**

### Owner
- [ ] Invite testers to the closed test (14-day clock starts)
- [ ] Set up AdMob account + real ad units

---

## Days 10–16 · 2026-10-01 → 10-07 · Backend, ads, tutorial

### Engineering
- [ ] Firebase anonymous auth (REST)
- [ ] Firestore cloud save + conflict rule + "Keep which save?" prompt
- [ ] `firestore.rules` + emulator tests
- [ ] Remote Config overrides by key path + `min_supported_version`
- [ ] `serverTime` Cloud Function + ClockService real implementation
- [ ] AdMob rewarded: Ad Boost, Welcome Back ×2, Free Nectar, Hornet ×3 + daily caps
- [ ] UMP consent in production flow
- [ ] Tutorial (~8 steps, mascot)
- [ ] First art swap

### Owner
- [ ] Deliver art batches
- [ ] Create Play Billing products (`nectar_pack_1`–`5`, `pro_permit`, `honey_jar`)

---

## Days 17–22 · 2026-10-08 → 10-13 · Purchases + retention systems

### Engineering
- [ ] Play Billing real implementation + restore on startup
- [ ] `verifyPurchase` Cloud Function (idempotent by token) + emulator tests
- [ ] Pro Permit
- [ ] Honey Jar (piggy bank)
- [ ] Daily Gift (7-day cycle, pause on miss)
- [ ] Milestones
- [ ] Sentry crash reporting
- [ ] Analytics events (spec §8)

### Owner
- [ ] Test purchases on device with a license-tester account

---

## Days 23–26 · 2026-10-14 → 10-17 · Polish + store readiness

### Engineering
- [ ] Full art pass
- [ ] Tuning from tester data (Remote Config, then fold back into JSON)
- [ ] Store listing assets (icon, feature graphic, screenshots)

### Owner
- [ ] Privacy policy page
- [ ] Data Safety form
- [ ] Content rating questionnaire

### ≈ Day 24 · 2026-10-15 · Decision gate
- [ ] IAP solid? → launch with IAP. Otherwise → launch ads-only and ship IAP in v1.1 (≈ 2 weeks later)
- [ ] Owner: apply for production access (14 tester days done)

---

## Days 28–31 · 2026-10-19 → 10-22 · Release

- [ ] Release candidate build
- [ ] Fixes from the RC
- [ ] **Public soft launch on Google Play**

---

## After launch

1. iOS port (StoreKit, Apple sign-in)
2. v1.2: contracts + multiplier currency
3. Co-op and artifacts

## Risk watchlist (spec §13)

| Risk | Watch for | Mitigation |
|---|---|---|
| Play review takes longer than 7 days | Production access not granted by day 28 | Closed test starts by day 9, and the build stays stable during review |
| Godot mobile plugins break | Spike fails on day 1–2 | Pin versions, try alternative plugins, fallback behind service interfaces |
| Inconsistent AI art | Style drift between batches | Style guide + reference sheet + fixed seed/prompt template |
| Economy too fast or slow | Pacing-bot misses, tester feedback | Pacing tests + Remote Config tuning |
| Scope creep | Anything from the §2 non-goals | Non-goals are binding for v1.0 |
