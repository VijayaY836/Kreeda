import { WellbeingState } from '../types';

const STORAGE_KEY = 'kreeda.wellbeing.state.v1';

export const DEFAULT_STATE: WellbeingState = {
  onboarded: false,
  disclaimerAcknowledged: false,
  profile: null,
  plan: null,
  progress: {},
  history: [],
  moodLog: [],
  streak: 0,
  lastSessionDate: null,
  unlockedMilestones: [],
};

export function loadState(): WellbeingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    const profile = parsed.profile ? { dailyMinutes: 20, ...parsed.profile } : null;
    const plan = parsed.plan
      ? { ...parsed.plan, profile: { dailyMinutes: 20, ...parsed.plan.profile } }
      : null;
    return { ...DEFAULT_STATE, ...parsed, profile, plan };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: WellbeingState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private browsing, quota) — the session continues in-memory only.
  }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeStreak(prevStreak: number, lastSessionDate: string | null, today: Date = new Date()): number {
  if (!lastSessionDate) return 1;
  const last = new Date(lastSessionDate);
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000);
  if (diffDays <= 0) return prevStreak; // already logged today
  if (diffDays === 1) return prevStreak + 1;
  return 1; // streak broken
}

export { isoDate };
