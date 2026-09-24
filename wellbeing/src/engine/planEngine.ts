import {
  Practice, UserProfile, WeeklyPlan, DaySession, PlanSlotItem,
  FeedbackRating, PracticeProgress, Level, FitnessLevel,
} from '../types';
import { ALL_PRACTICES, getPractice } from '../data/practices';

// ---------------- small deterministic RNG (seeded tie-break, spec §7.2) ----------------

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ---------------- STEP 1 — FILTER (hard contraindication rule, spec §8.1) ----------------

export function filterByContraindications(practices: Practice[], profile: UserProfile): Practice[] {
  if (profile.healthChecklist.length === 0) return practices;
  return practices.filter(p => !p.contraindications.some(c => profile.healthChecklist.includes(c)));
}

// ---------------- STEP 2 — GATE (level + unlocks) ----------------

const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };

function allowedLevels(fitnessLevel: FitnessLevel): Level[] {
  const rank = LEVEL_RANK[fitnessLevel];
  return (['beginner', 'intermediate', 'advanced'] as Level[]).filter(l => LEVEL_RANK[l] <= rank);
}

export function gateByLevelAndUnlocks(practices: Practice[], profile: UserProfile, totalSessionsCompleted: number): Practice[] {
  const levels = allowedLevels(profile.fitnessLevel);
  return practices.filter(p => levels.includes(p.level) && p.unlock_after_sessions <= totalSessionsCompleted);
}

// ---------------- STEP 3 — SCORE ----------------

export function scorePractice(practice: Practice, profile: UserProfile): number {
  if (profile.focusAreas.length === 0) return 0;
  return practice.focus_tags.filter(t => profile.focusAreas.includes(t)).length;
}

function rankPractices(practices: Practice[], profile: UserProfile, rng: () => number): Practice[] {
  const scored = practices.map(p => ({ p, score: scorePractice(p, profile), tie: rng() }));
  scored.sort((a, b) => (b.score - a.score) || (b.tie - a.tie));
  return scored.map(s => s.p);
}

// ---------------- Intensity — ardhashakti scaling (spec §7.5) ----------------

function levelFactor(level: FitnessLevel): number {
  return { beginner: 0.6, intermediate: 0.8, advanced: 1.0 }[level];
}

export function startingIntensity(practice: Practice, profile: UserProfile): { durationSec: number | null; reps: number | null; rounds: number | null } {
  let factor = levelFactor(profile.fitnessLevel);
  if (profile.age != null && profile.age >= 55) factor -= 0.1;
  if (profile.heightCm != null && profile.weightKg != null) {
    // Body data softens intensity only (spec §7.7) — never used for calorie/weight targets.
    const bmi = profile.weightKg / Math.pow(profile.heightCm / 100, 2);
    if (bmi >= 30) factor -= 0.1;
  }
  factor = Math.max(0.4, Math.min(1, factor));

  const scale = (range?: { min: number | null; default: number | null; max: number | null }) => {
    if (!range || range.default == null) return null;
    const raw = Math.round(range.default * factor);
    const min = range.min ?? raw;
    const max = range.max ?? raw;
    return Math.min(max, Math.max(min, raw));
  };

  return {
    durationSec: scale(practice.duration_sec),
    reps: scale(practice.reps),
    rounds: scale(practice.rounds),
  };
}

export function applyFeedback(progress: PracticeProgress, rating: FeedbackRating, practice: Practice): PracticeProgress {
  const range = practice.reps ?? practice.rounds ?? practice.duration_sec;
  const max = range?.max ?? progress.currentRepsOrDuration;
  const min = range?.min ?? progress.currentRepsOrDuration;
  let next = progress.currentRepsOrDuration;
  let consecutive = progress.consecutiveAboutRight;

  if (rating === 'too_easy') {
    next = Math.min(max, Math.round(next * 1.12));
    consecutive = 0;
  } else if (rating === 'too_hard') {
    next = Math.max(min, Math.round(next * 0.8));
    consecutive = 0;
  } else {
    consecutive += 1;
    if (consecutive >= 3) {
      next = Math.min(max, Math.round(next * 1.06));
      consecutive = 0;
    }
  }

  return {
    sessionsCompleted: progress.sessionsCompleted + 1,
    lastRating: rating,
    consecutiveAboutRight: consecutive,
    currentRepsOrDuration: next,
  };
}

// ---------------- duration estimation, for the session player's timer ----------------

function estimatePracticeSeconds(practice: Practice, intensity: { durationSec: number | null; reps: number | null; rounds: number | null }): number {
  if (intensity.durationSec != null) return intensity.durationSec;
  if (practice.category === 'surya_namaskar' && intensity.rounds != null) return intensity.rounds * 50;
  if (practice.category === 'pranayama' && intensity.rounds != null) return intensity.rounds * 9;
  if (intensity.reps != null) return intensity.reps * 3;
  if (intensity.rounds != null) return intensity.rounds * 30;
  return 30;
}

function toSlotItem(practice: Practice, profile: UserProfile, slot: PlanSlotItem['slot'], forcedDurationSec?: number): PlanSlotItem {
  const intensity = startingIntensity(practice, profile);
  return {
    practiceId: practice.id,
    slot,
    durationSec: forcedDurationSec ?? estimatePracticeSeconds(practice, intensity),
    reps: intensity.reps,
    rounds: intensity.rounds,
  };
}

// Spreads a ranked pool across `groups` sessions, `perGroup` items each,
// cycling through the pool before ever repeating an item — so as long as
// groups * perGroup >= pool.length, every matched practice appears in the
// week at least once instead of the same top-N being cloned onto every day.
function distributeRoundRobin<T>(pool: T[], groups: number, perGroup: number): T[][] {
  const result: T[][] = Array.from({ length: groups }, () => []);
  if (pool.length === 0 || groups === 0 || perGroup <= 0) return result;
  let idx = 0;
  for (let g = 0; g < groups; g++) {
    for (let s = 0; s < perGroup; s++) {
      result[g].push(pool[idx % pool.length]);
      idx++;
    }
  }
  return result;
}

// ---------------- STEP 4/5 — TEMPLATE + SCALE (session template, spec §7.3) ----------------

function buildSession(
  emphasis: 'yoga' | 'vyayam',
  mainPractices: Practice[],
  profile: UserProfile,
  rankedYoga: Practice[],
  rankedVyayam: Practice[],
): PlanSlotItem[] {
  const items: PlanSlotItem[] = [];

  // Warm-up: CYP loosening for a yoga day, Vyayam mobility drills for a vyayam day.
  const warmupPool = emphasis === 'yoga'
    ? rankedYoga.filter(p => p.category === 'loosening')
    : rankedVyayam.filter(p => p.category === 'mobility');
  if (warmupPool.length > 0) {
    items.push(toSlotItem(warmupPool[0], profile, 'warmup'));
  } else {
    const fallback = rankedYoga.find(p => p.category === 'loosening');
    if (fallback) items.push(toSlotItem(fallback, profile, 'warmup'));
  }

  // Main block: exactly the practices this day was assigned by the
  // round-robin distribution over every focus-tag-matched practice.
  for (const practice of mainPractices) {
    items.push(toSlotItem(practice, profile, 'main'));
  }

  // Cool-down: pranayama/Shavasana + a Dhyana practice — every session ends with Dhyana (spec §7.4).
  const cooldownYoga = rankedYoga.find(p => p.category === 'pranayama') ?? getPractice('shavasana');
  if (cooldownYoga && !profile.healthChecklist.some(c => cooldownYoga.contraindications.includes(c))) {
    items.push(toSlotItem(cooldownYoga, profile, 'cooldown'));
  }

  return items;
}

// ---------------- STEP 6 — SCHEDULE (weekly layout, spec §7.4) ----------------

function spreadDayIndices(daysPerWeek: number): number[] {
  // Even spread across a 7-day week (Mon=0..Sun=6).
  const indices: number[] = [];
  for (let i = 0; i < daysPerWeek; i++) {
    indices.push(Math.round((i * 7) / daysPerWeek));
  }
  return Array.from(new Set(indices)).slice(0, daysPerWeek);
}

function planEmphasis(daysPerWeek: number, vyayamAvailable: boolean): ('yoga' | 'vyayam' | 'rest')[] {
  const slots: ('yoga' | 'vyayam' | 'rest')[] = [];
  let vyayamCount = 0;
  const minVyayam = vyayamAvailable && daysPerWeek >= 3 ? 2 : 0;

  for (let i = 0; i < daysPerWeek; i++) {
    if (daysPerWeek === 7 && i === daysPerWeek - 1) {
      slots.push('rest'); // at least one rest/light day when 7 days/week (spec §7.4)
      continue;
    }
    const isVyayamTurn = vyayamAvailable && i % 2 === 1;
    slots.push(isVyayamTurn ? 'vyayam' : 'yoga');
    if (isVyayamTurn) vyayamCount++;
  }

  // Top up to the minimum vyayam days by converting the earliest yoga days.
  if (vyayamAvailable) {
    for (let i = 0; i < slots.length && vyayamCount < minVyayam; i++) {
      if (slots[i] === 'yoga') {
        slots[i] = 'vyayam';
        vyayamCount++;
      }
    }
  }
  return slots;
}

export function buildWeeklyPlan(profile: UserProfile, totalSessionsCompleted: number): WeeklyPlan {
  const contraindicationSafe = filterByContraindications(ALL_PRACTICES, profile);
  const gated = gateByLevelAndUnlocks(contraindicationSafe, profile, totalSessionsCompleted);

  const seed = hashSeed(JSON.stringify(profile));
  const rng = makeRng(seed);

  const yogaPool = gated.filter(p => p.section === 'yoga');
  const vyayamPool = gated.filter(p => p.section === 'vyayam');
  const dhyanaPool = gated.filter(p => p.section === 'dhyana');

  const rankedYoga = rankPractices(yogaPool, profile, rng);
  const rankedVyayam = rankPractices(vyayamPool, profile, rng);
  const rankedDhyana = rankPractices(dhyanaPool, profile, rng);

  // Main-block pools: every gated practice matching at least one selected
  // focus tag (goal) — falls back to the whole category if no goal matches
  // anything (or none were picked), so the plan never comes back empty.
  const matchPool = (ranked: Practice[], categories: string[]) => {
    const inCategory = ranked.filter(p => categories.includes(p.category));
    if (profile.focusAreas.length === 0) return inCategory;
    const matched = inCategory.filter(p => scorePractice(p, profile) > 0);
    return matched.length > 0 ? matched : inCategory;
  };
  const yogaMainPool = matchPool(rankedYoga, ['asana', 'surya_namaskar']);
  const vyayamMainPool = matchPool(rankedVyayam, ['dand', 'baithak', 'sapate']);

  const vyayamAvailable = vyayamMainPool.length > 0;
  const emphasisPattern = planEmphasis(profile.daysPerWeek, vyayamAvailable);
  const dayIndices = spreadDayIndices(profile.daysPerWeek);

  // Round-robin every matched practice across the week's days for that
  // emphasis, so (spec-driven) all of them get scheduled somewhere instead
  // of the same top-N repeating identically on every Yoga/Vyayam day.
  const yogaDayCount = emphasisPattern.filter(e => e === 'yoga').length;
  const vyayamDayCount = emphasisPattern.filter(e => e === 'vyayam').length;
  const yogaSlices = distributeRoundRobin(yogaMainPool, yogaDayCount, profile.yogaAsanaCount);
  const vyayamSlices = distributeRoundRobin(vyayamMainPool, vyayamDayCount, profile.vyayamItemCount);

  const stressGoals = profile.focusAreas.some(f => ['stress', 'sleep', 'focus'].includes(f));
  const meditationSec = profile.meditationMinutes * 60;

  const restStandaloneDhyana = () => {
    if (!stressGoals) return undefined;
    const dhyanaPick = rankedDhyana[1] ?? rankedDhyana[0] ?? getPractice('anapana');
    return dhyanaPick ? toSlotItem(dhyanaPick, profile, 'standalone', meditationSec) : undefined;
  };

  let yogaCursor = 0;
  let vyayamCursor = 0;

  const scheduledDays: DaySession[] = dayIndices.map((dayIndex, i) => {
    const emphasis = emphasisPattern[i];
    if (emphasis === 'rest') {
      return { dayIndex, emphasis: 'rest', items: [], standaloneDhyana: restStandaloneDhyana() };
    }
    const mainPractices = emphasis === 'yoga' ? yogaSlices[yogaCursor++] : vyayamSlices[vyayamCursor++];
    const items = buildSession(emphasis, mainPractices, profile, rankedYoga, rankedVyayam);
    const dhyanaPick = rankedDhyana[0] ?? getPractice('anapana');
    if (dhyanaPick) items.push(toSlotItem(dhyanaPick, profile, 'cooldown', meditationSec));
    const session: DaySession = { dayIndex, emphasis, items };
    if (stressGoals) {
      const standalonePick = rankedDhyana[1] ?? rankedDhyana[0];
      if (standalonePick) session.standaloneDhyana = toSlotItem(standalonePick, profile, 'standalone', meditationSec);
    }
    return session;
  });

  // Days not selected by daysPerWeek are implicit rest days — spec §7.4's
  // stress/sleep/focus standalone-Dhyana rule still applies to them, so they
  // need a real DaySession too, not just an absence PlanOverview infers as rest.
  const scheduledIndices = new Set(dayIndices);
  const impliedRestDays: DaySession[] = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    if (!scheduledIndices.has(dayIndex)) {
      impliedRestDays.push({ dayIndex, emphasis: 'rest', items: [], standaloneDhyana: restStandaloneDhyana() });
    }
  }

  const days = [...scheduledDays, ...impliedRestDays].sort((a, b) => a.dayIndex - b.dayIndex);

  return { generatedAt: new Date().toISOString(), profile, days };
}

export const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
