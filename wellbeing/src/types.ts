// ---------- Core content model (spec §6.1) ----------

export type Section = 'yoga' | 'vyayam' | 'dhyana';

export type Category =
  | 'loosening'
  | 'surya_namaskar'
  | 'asana'
  | 'pranayama'
  | 'dand'
  | 'baithak'
  | 'sapate'
  | 'mobility'
  | 'meditation';

export type PostureGroup = 'standing' | 'sitting' | 'prone' | 'supine' | 'inverted' | null;

export type Level = 'beginner' | 'intermediate' | 'advanced';

export type FocusTag =
  | 'back_stiffness'
  | 'desk_posture'
  | 'flexibility'
  | 'strength'
  | 'stamina'
  | 'balance'
  | 'stress'
  | 'sleep'
  | 'digestion'
  | 'focus'
  | 'mood';

export type ComponentTag =
  | 'flexibility'
  | 'strength'
  | 'endurance'
  | 'cardio'
  | 'balance'
  | 'breathing'
  | 'mind';

export type Contraindication =
  | 'high_bp'
  | 'heart_condition'
  | 'back_disc'
  | 'knee'
  | 'shoulder'
  | 'neck'
  | 'hernia'
  | 'vertigo'
  | 'pregnancy'
  | 'recent_surgery'
  | 'eye_condition';

export interface Range {
  min: number | null;
  default: number | null;
  max: number | null;
}

export interface SourceRef {
  title: string;
  ref: string;
}

export interface Practice {
  id: string;
  section: Section;
  category: Category;
  name: string;
  name_iast?: string;
  name_english: string;
  posture_group: PostureGroup;
  tradition?: string;
  level: Level;
  unlock_after_sessions: number;
  focus_tags: FocusTag[];
  component_tags: ComponentTag[];
  duration_sec?: Range;
  reps?: Range;
  rounds?: Range;
  steps: string[];
  benefits: string[];
  cautions: string[];
  contraindications: Contraindication[];
  variants?: string[];
  sources: SourceRef[];
}

// ---------- Section content (history / fun facts / map) ----------

export interface TimelineEvent {
  era: string;
  title: string;
  text: string;
}

export interface MapPin {
  id: string;
  x: number; // percent
  y: number; // percent
  place: string;
  name: string;
  fact: string;
  how: string;
}

export interface SectionContent {
  section: Section;
  title: string;
  nativeName: string;
  tagline: string;
  color: string; // css var name
  timeline: TimelineEvent[];
  funFacts: string[];
  mapCaption: string;
  mapPath: boolean;
  pins: MapPin[];
  sources: SourceRef[];
}

export interface HeritageCard {
  id: string;
  name: string;
  name_english: string;
  blurb: string;
  why_not_in_plan: string;
}

// ---------- User profile & plan builder (spec §7) ----------

export type FitnessLevel = Level;
export type DailyTimeMinutes = 10 | 15 | 20 | 30 | 45;

export interface UserProfile {
  focusAreas: FocusTag[];
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  fitnessLevel: FitnessLevel;
  dailyTimeMinutes: DailyTimeMinutes;
  daysPerWeek: number; // 3-7
  healthChecklist: Contraindication[];
  acknowledgedDoctorNotice: boolean;
}

export type FeedbackRating = 'too_easy' | 'about_right' | 'too_hard';
export type Mood = 'great' | 'good' | 'okay' | 'low' | 'stressed';

export interface PlanSlotItem {
  practiceId: string;
  slot: 'warmup' | 'main' | 'cooldown' | 'standalone';
  durationSec: number;
  reps: number | null;
  rounds: number | null;
}

export interface DaySession {
  dayIndex: number; // 0-6 (Mon..Sun)
  emphasis: 'yoga' | 'vyayam' | 'rest';
  items: PlanSlotItem[];
  standaloneDhyana?: PlanSlotItem;
}

export interface WeeklyPlan {
  generatedAt: string;
  profile: UserProfile;
  days: DaySession[];
}

export interface PracticeProgress {
  sessionsCompleted: number;
  lastRating: FeedbackRating | null;
  consecutiveAboutRight: number;
  currentRepsOrDuration: number;
}

export interface SessionLogEntry {
  date: string;
  dayIndex: number;
  moodBefore: Mood | null;
  moodAfter: Mood | null;
  ratings: Record<string, FeedbackRating>;
}

export interface WellbeingState {
  onboarded: boolean;
  disclaimerAcknowledged: boolean;
  profile: UserProfile | null;
  plan: WeeklyPlan | null;
  progress: Record<string, PracticeProgress>;
  history: SessionLogEntry[];
  streak: number;
  lastSessionDate: string | null;
  unlockedMilestones: string[];
}

export type ViewTab =
  | 'HOME'
  | 'SECTION'
  | 'PRACTICE_DETAIL'
  | 'PLAN_BUILDER'
  | 'PLAN_OVERVIEW'
  | 'SESSION_PLAYER'
  | 'POST_SESSION'
  | 'PROGRESS';
