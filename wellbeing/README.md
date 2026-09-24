# Physical Wellbeing (శారీరిక)

A React + TypeScript module implementing `spec.md`'s Yoga / Vyayam / Dhyana
module, restyled to match **KREEDA**'s shared folk-art design system (aged-paper
cream, thick flat maroon outlines, no gradients/shadows, Fraunces + Manrope +
Tiro Telugu type, Kreedu the mascot) — the same visual language as the
Chaturangam module.

Fully offline: all content ships as local TypeScript data, the plan builder is
a deterministic rule-based engine (no ML, no network calls), and all user data
(profile, plan, session history, mood) is stored in `localStorage` only.

## Running it

```bash
npm install
npm run dev      # http://localhost:3002
npm run build    # production build to dist/ (single self-contained index.html)
npm run lint      # tsc --noEmit
```

`kreeda.html` (the hub) links directly to `wellbeing/dist/index.html`, so
`npm run build` must be run at least once before the hub's "Physical
Wellbeing" card works.

## Structure

- `src/data/{yoga,vyayam,dhyana}Practices.ts` — the practice library: 4
  loosening drills + 2 Surya Namaskar variants + 30 asanas + 4 pranayama
  (Yoga); Dand/Baithak progressions, Sapate and mobility drills (Vyayam);
  7 meditation practices spanning Buddhist/Vedic/Jain/Yogic traditions
  (Dhyana) — each with steps, benefits ("traditionally associated with…"),
  cautions, contraindications and sources, per the spec's schema (§6.1).
- `src/data/sectionContent.ts` — history timelines, fun facts and spread-map
  pin data per section, plus Vyayam's equipment/coach-only heritage cards
  (Mudgar, Gada, Kushti, Mallakhamb, Kalaripayattu — content-only, never
  added to a plan).
- `src/engine/planEngine.ts` — the six-step plan pipeline from spec §7.2:
  **filter** (hard contraindication rule) → **gate** (fitness level +
  session-count unlocks) → **score** (focus-tag matching, seeded tie-break)
  → **template** (warm-up/main/cool-down time budget) → **scale**
  (ardhashakti intensity, softened by age/BMI) → **schedule** (weekly layout,
  alternating Yoga/Vyayam days, minimum 2 Vyayam days, standalone evening
  Dhyana for stress/sleep/focus goals, at least one rest day at 7 days/week).
- `src/engine/storage.ts` — local persistence and streak calculation.
- `src/components/PlanBuilder.tsx` — the 5-step stepper (Focus → Body Data →
  Health Checklist → Time → Review), enforcing the mandatory doctor-consult
  acknowledgment before a plan can be generated (spec §8.2).
- `src/components/SessionPlayer.tsx` — step-by-step session flow with a
  silent countdown timer (Web Audio bell tone, no bundled audio files) for
  held/timed practices and a self-paced "Mark Complete" flow for rep/round
  based ones; mood check before/after, feeding the ardhashakti feedback loop
  in `PostSessionCheck.tsx`.
- `src/components/{ModuleHome,SectionHome,PlanOverview,Progress}.tsx` — the
  remaining screens from spec §9 (Module Home, Section Home with
  History/Fun Facts/Library/Map tabs, weekly Plan Overview, Progress).

## Safety rules enforced

- Contraindication filtering runs first, before any scoring/selection logic.
- A ticked health-checklist item blocks progression through the Plan Builder
  until the doctor-consult notice is explicitly acknowledged.
- Benefits are phrased as "traditionally associated with…", never as a cure.
- Advanced/inverted asanas (Sirsasana, Sarvangasana, Chakrasana, Natarajasana)
  and Sapate are gated behind both fitness level and session-count unlocks.
- Height/weight only soften intensity — no calorie counts or diet advice.
- A first-launch disclaimer must be acknowledged before using the module.

## Known gaps vs. `spec.md`

- Several `sources` entries are placeholder `"TBD — verify"` refs for claims
  the spec itself flags as needing verification (Vyayam history, Dhyana
  lineages) — see spec §12's open items. Every entry still has *a* source
  field populated, satisfying §8.7 structurally, but the citations need a
  real pass against books/academic sources before shipping.
- Guided Dhyana audio is a generated bell tone, not the pre-recorded
  3/5/10/20-minute tracks spec'd in §5.4.
- Illustrations/animations per practice are not included (spec §12).
