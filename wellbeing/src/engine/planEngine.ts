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

// ---------------- duration estimation, for filling the time budget ----------------

function estimatePracticeSeconds(practice: Practice, intensity: { durationSec: number | null; reps: number | null; rounds: number | null }): number {
  if (intensity.durationSec != null) return intensity.durationSec;
  if (practice.category === 'surya_namaskar' && intensity.rounds != null) return intensity.rounds * 50;
  if (practice.category === 'pranayama' && intensity.rounds != null) return intensity.rounds * 9;
  if (intensity.reps != null) return intensity.reps * 3;
  if (intensity.rounds != null) return intensity.rounds * 30;
  return 30;
}

function toSlotItem(practice: Practice, profile: UserProfile, slot: PlanSlotItem['slot']): PlanSlotItem {
  const intensity = startingIntensity(practice, profile);
  return {
    practiceId: practice.id,
    slot,
    durationSec: estimatePracticeSeconds(practice, intensity),
    reps: intensity.reps,
    rounds: intensity.rounds,
  };
}

// ---------------- STEP 4/5 — TEMPLATE + SCALE (session template, spec §7.3) ----------------

function buildSession(
  emphasis: 'yoga' | 'vyayam',
  budgetSec: number,
  profile: UserProfile,
  rankedYoga: Practice[],
  rankedVyayam: Practice[],
  rankedDhyana: Practice[],
): PlanSlotItem[] {
  const items: PlanSlotItem[] = [];
  const warmupBudget = budgetSec * 0.15;
  const mainBudget = budgetSec * 0.625;
  const cooldownBudget = budgetSec * 0.225;

  // Warm-up: CYP loosening for a yoga day, Vyayam mobility drills for a vyayam day.
  const warmupPool = emphasis === 'yoga'
    ? rankedYoga.filter(p => p.category === 'loosening')
    : rankedVyayam.filter(p => p.category === 'mobility');
  const capToWarmupBudget = (item: PlanSlotItem): PlanSlotItem => (
    { ...item, durationSec: Math.min(item.durationSec, Math.round(warmupBudget)) }
  );
  if (warmupPool.length > 0) {
    items.push(capToWarmupBudget(toSlotItem(warmupPool[0], profile, 'warmup')));
  } else {
    const fallback = rankedYoga.find(p => p.category === 'loosening');
    if (fallback) items.push(capToWarmupBudget(toSlotItem(fallback, profile, 'warmup')));
  }

  // Main block: highest-scoring practices from the emphasised section, filling the time budget.
  const mainPool = (emphasis === 'yoga'
    ? rankedYoga.filter(p => p.category === 'asana' || p.category === 'surya_namaskar')
    : rankedVyayam.filter(p => ['dand', 'baithak', 'sapate'].includes(p.category))
  );
  // Cap the count too — filling the budget with many very short holds (e.g.
  // a dozen 15s asanas) technically fits the time but makes for a choppy,
  // unrealistic session. Real classes hold fewer poses for longer.
  const MAX_MAIN_ITEMS = 8;
  let used = 0;
  for (const practice of mainPool) {
    if (used >= mainBudget || items.filter(i => i.slot === 'main').length >= MAX_MAIN_ITEMS) break;
    const item = toSlotItem(practice, profile, 'main');
    items.push(item);
    used += item.durationSec;
  }
  if (items.filter(i => i.slot === 'main').length === 0 && mainPool.length > 0) {
    items.push(toSlotItem(mainPool[0], profile, 'main'));
  }

  // Cool-down: pranayama/Shavasana + a Dhyana practice — every session ends with Dhyana (spec §7.4).
  const stressGoals = profile.focusAreas.some(f => ['stress', 'sleep', 'focus'].includes(f));
  const cooldownYoga = rankedYoga.find(p => p.category === 'pranayama') ?? getPractice('shavasana');
  if (cooldownYoga && !profile.healthChecklist.some(c => cooldownYoga.contraindications.includes(c))) {
    items.push(toSlotItem(cooldownYoga, profile, 'cooldown'));
  }
  const dhyanaPick = rankedDhyana[0] ?? getPractice('anapana');
  if (dhyanaPick) {
    const item = toSlotItem(dhyanaPick, profile, 'cooldown');
    // Stress/sleep/focus goals increase the Dhyana share of cool-down (spec §7.4).
    if (stressGoals) item.durationSec = Math.max(item.durationSec, Math.round(cooldownBudget * 0.6));
    items.push(item);
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

  const vyayamAvailable = rankedVyayam.some(p => ['dand', 'baithak', 'sapate'].includes(p.category));
  const emphasisPattern = planEmphasis(profile.daysPerWeek, vyayamAvailable);
  const dayIndices = spreadDayIndices(profile.daysPerWeek);

  const stressGoals = profile.focusAreas.some(f => ['stress', 'sleep', 'focus'].includes(f));
  const budgetSec = profile.dailyTimeMinutes * 60;

  const restStandaloneDhyana = () => {
    if (!stressGoals) return undefined;
    const dhyanaPick = rankedDhyana[1] ?? rankedDhyana[0] ?? getPractice('anapana');
    return dhyanaPick ? toSlotItem(dhyanaPick, profile, 'standalone') : undefined;
  };

  const scheduledDays: DaySession[] = dayIndices.map((dayIndex, i) => {
    const emphasis = emphasisPattern[i];
    if (emphasis === 'rest') {
      return { dayIndex, emphasis: 'rest', items: [], standaloneDhyana: restStandaloneDhyana() };
    }
    const items = buildSession(emphasis, budgetSec, profile, rankedYoga, rankedVyayam, rankedDhyana);
    const session: DaySession = { dayIndex, emphasis, items };
    if (stressGoals) {
      const dhyanaPick = rankedDhyana[1] ?? rankedDhyana[0];
      if (dhyanaPick) session.standaloneDhyana = toSlotItem(dhyanaPick, profile, 'standalone');
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
