# The Hive, Inc. — Project Guide

A commercial, portrait-mode idle/incremental game for Android about building a beekeeping empire, built in Godot 4. Bees fill hives, hives make honey, a fleet ships honey for cash, cash buys hives/fleet/research, and players "Swarm" (prestige) for Legacy Pollen. Target: public soft launch on Google Play ≈ 2026-10-22.

- **Design spec (source of truth):** [docs/superpowers/specs/2026-09-22-the-hive-inc-design.md](docs/superpowers/specs/2026-09-22-the-hive-inc-design.md)
- **Roadmap / progress tracker:** [roadmap.md](roadmap.md)
- **How we work (SOP):** [workflows/workflow.md](workflows/workflow.md)

If this guide and the spec disagree, the spec wins. Update the guide.

## Hard rules

1. **Originality.** Mechanics and mathematical formulas may be used as references. Reference balance data from `.tmp/egg_inc_wiki.json` may be used for analysis and initial tuning, while all names, text, UI composition, artwork, audiovisual presentation, and final game identity remain original. (Spec §1.)
2. **v1.0 non-goals are binding** (spec §2): no contracts, co-op, artifacts, leaderboards, subscriptions, interstitial/banner ads, iOS or localization in v1.0.
3. **`sim/` never touches Nodes.** The simulation is pure GDScript with no scene-tree access. `advance(state, dt)` is deterministic: the same input always gives the same output. Randomness takes an explicit seed, and time comes in as an argument, never from reading a clock.
4. **No hardcoded balance values.** Every tuning number lives in `game/data/*.json`, and Remote Config can override it by key path (e.g. `honey_tiers.3.value`).
5. **No hardcoded player-facing text.** Every string goes in `game/locale/en.csv` and is referenced by key.
6. **Secrets stay out of git.** API keys go in `.env`, and signing keys, `google-services.json` and similar files are gitignored. Never commit them.

## Stack

- **Engine:** Godot 4 (latest stable 4.x), GDScript. Pin the exact version after the day 1–2 spike.
- **Tests:** GUT (Godot Unit Test).
- **Backend:** Firebase called over REST (Auth, Firestore, Remote Config, Functions). Cloud Functions are in TypeScript.
- **Monetization:** AdMob rewarded ads (with UMP consent) and Google Play Billing.
- **Crashes:** Sentry Godot SDK.

## Layout (spec §4.1)

```
game/                 Godot project root
  data/               balance JSON: the single source of balance truth
  src/sim/            pure simulation (game_state, economy, tick, offline, prestige, actions, bignum_format)
  src/services/       interfaces/ · fake/ · real/
  src/ui/             scenes + scripts per screen/panel
  src/autoload/       Game (state owner), Events (signal bus), Services (locator)
  assets/             art/audio (placeholders until Higgsfield art lands)
  locale/en.csv       every player-facing string
  tests/              GUT tests
firebase/             functions/ (verifyPurchase, serverTime), firestore.rules
tools/                Node scripts (e.g. scrape_wiki.js)
workflows/            SOPs
.tmp/                 disposable intermediates (wiki scrape lives here)
```

## Conventions

- **Dependencies point downward only:** UI → sim → data. Sim never calls UI, and data files know nothing about code.
- **Every external system sits behind a service interface** (Save, Auth, Ads, IAP, Analytics, RemoteConfig, Clock, Crash). The editor and tests use fakes, and Android builds use the real implementations. Build and test against the fake first.
- **Numbers are 64-bit floats.** All display formatting goes through `bignum_format.gd` (K, M, B, T, then aa, ab…).
- **The simulation ticks at a fixed 10 Hz** in the `Game` autoload, independent of frame rate.
- **The UI redraws on `Events.state_changed`.** Screens don't poll state and don't talk to each other directly.
- **Art paths live in data files,** so swapping placeholder art for final art never requires a code change.
- **Save schema is versioned** (`schema_version` plus a list of migration functions). Never change the save shape without adding a migration.

## Commands

_Fill in when scaffolded. Record the exact, verified commands here, never guessed flags._

- Run GUT tests headless: `TBD`
- Export signed Android build (AAB/APK): `TBD`
- Install on device: `TBD`
- Firebase emulator + function tests: `TBD`
- Re-scrape the reference wiki: `node tools/scrape_wiki.js --site egg-inc.fandom.com --out .tmp/egg_inc_wiki.json`

## Environment

- Windows 11. The Bash tool is Git Bash, and PowerShell is also available. Use the right syntax for each.
- Node.js is available and already used by `tools/scrape_wiki.js`. Build on existing project tooling, and don't add Python unless it's needed.
- `.tmp/` is disposable and gitignored. Anything the owner needs to see goes to a cloud deliverable or a committed doc.

## Who does what

- **Owner (Ramsy):** product direction, QA on real devices, all art (Higgsfield, following spec §9.2), Play Console, Firebase, AdMob accounts, testers, store listing, legal forms.
- **Claude:** all code, tests, data files, Cloud Functions, build scripts, and keeping `roadmap.md` and `workflows/workflow.md` current.

When a task needs an owner action (an account, a key, a device test), say so clearly and continue with whatever doesn't depend on it.
