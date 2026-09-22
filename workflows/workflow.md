# Workflow — Building The Hive, Inc.

The standard operating procedure for every working session on this project. Read [CLAUDE.md](../CLAUDE.md) for the rules and [roadmap.md](../roadmap.md) for what's next.

## Objective

Ship The Hive, Inc. v1.0 to Google Play by ≈ 2026-10-22 without breaking the architecture rules, keeping balance tunable and progress/purchases safe.

## Inputs (read at the start of every session)

1. [roadmap.md](../roadmap.md): find the current phase and the first unchecked item.
2. The spec section that item cites: [design spec](../docs/superpowers/specs/2026-09-22-the-hive-inc-design.md).
3. The **Lessons learned** section at the bottom of this file.

## 1. Feature loop (the default for any roadmap item)

1. **Pick** the next unchecked roadmap item. If it's blocked on an owner action, say so and take the next unblocked item.
2. **Read** the spec section. If the spec is silent or ambiguous, ask the owner before inventing behavior.
3. **Data first:** add or adjust the values in `game/data/*.json`. For initial numbers, analyze `.tmp/egg_inc_wiki.json` (reference only: numbers and formulas may be adapted, never names or text). Note the source of each seeded value in a comment or commit message.
4. **Test first:** write GUT tests for the `sim/` behavior. Run them and confirm they fail.
5. **Implement `sim/`** until the tests pass. Pure GDScript, no Nodes, deterministic.
6. **Implement the UI** against fake services. Strings go in `locale/en.csv`, art paths come from data, and redraws happen on `Events.state_changed`.
7. **Run the full test suite.** Everything must be green before moving on.
8. **Owner review:** tell the owner what to look at (in the editor or on a device build) and what "correct" looks like.
9. **Commit** with a clear message, only when the owner has asked for commits or a standing instruction allows it.
10. **Tick the roadmap item** and add any lesson learned below.

## 2. Service integration loop (ads, billing, auth, save, analytics, remote config, crash)

1. Define or confirm the interface in `src/services/interfaces/`.
2. Write the fake in `src/services/fake/` and make the game work end to end with it, including the failure paths: no network, ad not loaded, purchase pending or failed.
3. Write the real implementation in `src/services/real/`.
4. Verify it on a physical Android device. Emulators don't count for ads or billing.
5. Record the plugin version, setup steps and quirks under **Lessons learned**.

Never grant a reward without the provider's success callback. Never grant a purchase without server verification (spec §7.4).

## 3. Balance tuning loop

1. Change the values in `game/data/*.json`, never in code.
2. Run the pacing-bot tests (spec §5.10): first hive < 1 min, first vehicle < 3 min, tier 2 ≈ 10 min, first Swarm (≥ 5 pollen) ≈ 2–3 h.
3. If a target moves, record the before and after timings in the commit message.
4. For live tuning during the closed test, push the override through Firebase Remote Config (by key path). Then fold the final values back into the bundled JSON.

## 4. Art swap loop

1. The owner delivers PNGs from Higgsfield, with transparent backgrounds at 2× target size (spec §9.3).
2. Check them against the style guide (spec §9.2): ¾ top-down view, soft cel shading, dark-brown outline, light from the top-left.
3. Drop each file at the path its data file references. No code changes should be needed. If one is, that's a bug in the data-driven setup: fix it.
4. Check sizing and anchors in the editor, then on a device.

## 5. Release loop

1. Bump the version code and version name.
2. Export a signed AAB. The keystore lives outside git.
3. Upload it to the right Play track (internal → closed test → production).
4. Write short release notes for testers.
5. Collect feedback (the Google Form linked in Settings) and turn it into roadmap items.
6. **Day-24 gate:** if in-app purchases are solid, launch with them. Otherwise launch ads-only and ship IAP in v1.1.

## 6. Edge cases

- **An owner action is blocking:** name the exact action and where it's done (e.g. "Play Console → Monetize → Products"), then continue with unblocked work.
- **The spec is wrong or impossible:** propose the change, get owner approval, and update the spec *first*, then the code.
- **A plugin breaks on the pinned Godot version:** don't upgrade Godot mid-sprint. Find a plugin version that works, or wrap a fallback behind the service interface.
- **A paid or rate-limited API** (Play Developer API, Firebase quotas): check with the owner before running bulk calls.
- **The wiki scrape is stale or missing:** re-run `node tools/scrape_wiki.js --site egg-inc.fandom.com --out .tmp/egg_inc_wiki.json`.

## Lessons learned

_Add dated entries as they come up: rate limits, plugin quirks, Godot or Android gotchas, commands that work._

- 2026-09-22: The Fandom wiki API doesn't have TextExtracts enabled. `scrape_wiki.js` uses `action=parse` (one page per request) with a 120 ms delay.
