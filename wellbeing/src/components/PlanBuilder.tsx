import React, { useState } from 'react';
import { UserProfile, FocusTag, Contraindication, FitnessLevel, MeditationMinutes } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { ArrowLeft, ArrowRight, AlertTriangle, Check } from 'lucide-react';

// Record<FocusTag, string> makes this exhaustive at compile time — adding a
// new FocusTag without a label here is a type error, so "Goals" can never
// drift from the actual focus_tags the plan engine matches against.
const FOCUS_LABELS: Record<FocusTag, string> = {
  back_stiffness: 'Back stiffness',
  desk_posture: 'Desk posture',
  flexibility: 'Flexibility',
  strength: 'Strength',
  stamina: 'Stamina',
  balance: 'Balance',
  stress: 'Stress',
  sleep: 'Sleep',
  digestion: 'Digestion',
  focus: 'Focus',
  mood: 'Mood',
};
const FOCUS_OPTIONS = (Object.keys(FOCUS_LABELS) as FocusTag[]).map(tag => ({ tag, label: FOCUS_LABELS[tag] }));

const CONTRA_OPTIONS: { tag: Contraindication; label: string }[] = [
  { tag: 'high_bp', label: 'High blood pressure' },
  { tag: 'heart_condition', label: 'Heart condition' },
  { tag: 'back_disc', label: 'Back / disc issue' },
  { tag: 'knee', label: 'Knee issue' },
  { tag: 'shoulder', label: 'Shoulder issue' },
  { tag: 'neck', label: 'Neck issue' },
  { tag: 'hernia', label: 'Hernia' },
  { tag: 'vertigo', label: 'Vertigo' },
  { tag: 'pregnancy', label: 'Pregnancy' },
  { tag: 'recent_surgery', label: 'Recent surgery' },
  { tag: 'eye_condition', label: 'Eye condition' },
];

const YOGA_COUNT_OPTIONS = [3, 4, 5, 6, 8, 10];
const VYAYAM_COUNT_OPTIONS = [2, 3, 4, 5, 6];
const MEDITATION_OPTIONS: MeditationMinutes[] = [3, 5, 10, 20];

const DEFAULT_DRAFT: UserProfile = {
  focusAreas: [],
  age: null,
  heightCm: null,
  weightKg: null,
  fitnessLevel: 'beginner',
  yogaAsanaCount: 6,
  vyayamItemCount: 3,
  meditationMinutes: 5,
  daysPerWeek: 4,
  healthChecklist: [],
  acknowledgedDoctorNotice: false,
};

interface PlanBuilderProps {
  initialProfile: UserProfile | null;
  onCancel: () => void;
  onComplete: (profile: UserProfile) => void;
}

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

export const PlanBuilder: React.FC<PlanBuilderProps> = ({ initialProfile, onCancel, onComplete }) => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<UserProfile>(initialProfile ?? DEFAULT_DRAFT);

  const steps = ['Focus', 'Body Data', 'Health Checklist', 'Session Size', 'Review'];
  const hasHealthConcerns = draft.healthChecklist.length > 0;

  const canAdvance = () => {
    // Spec §8.2 — the doctor-consult notice must be explicitly acknowledged
    // before continuing, whether that's via a ticked condition or "None apply".
    if (step === 2) return draft.acknowledgedDoctorNotice;
    return true;
  };

  const next = () => setStep(s => Math.min(steps.length - 1, s + 1));
  const back = () => (step === 0 ? onCancel() : setStep(s => s - 1));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 wb-fade-in">
      <button onClick={back} className="inline-flex items-center gap-1.5 text-[#1F3B2E] font-bold text-sm mb-4 cursor-pointer hover:underline">
        <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Back to Physical Wellbeing' : 'Previous step'}
      </button>

      {/* Stepper indicator */}
      <div className="flex items-center gap-1.5 mb-6">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-1.5">
            <div className={`w-6 h-6 flex items-center justify-center text-[11px] font-semibold border border-[#C7A467]/70 rounded-xl shrink-0 ${
              i < step ? 'bg-[#3F6B4F] text-white' : i === step ? 'bg-[#1F3B2E] text-white' : 'bg-[#EADFC4] text-[#1F3B2E]'
            }`}>
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-[#1F3B2E]/30" />}
          </div>
        ))}
      </div>
      <h2 className="font-fraunces text-xl font-bold text-[#1F3B2E] mb-4">{steps[step]}</h2>

      <FolkArtFrame className="mb-5">
        {step === 0 && (
          <div>
            <p className="text-sm text-[#5C5142] font-semibold mb-3">What would you like your plan to focus on? Pick as many as apply.</p>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map(opt => {
                const active = draft.focusAreas.includes(opt.tag);
                return (
                  <button
                    key={opt.tag}
                    onClick={() => setDraft(d => ({ ...d, focusAreas: toggle(d.focusAreas, opt.tag) }))}
                    className={`px-3.5 py-2 text-xs font-bold border border-[#C7A467]/70 rounded-xl cursor-pointer ${
                      active ? 'bg-[#1F3B2E] text-white' : 'bg-white text-[#1F3B2E] hover:bg-[#F6EFDE]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs font-bold text-[#1F3B2E]">
                Age
                <input
                  type="number" min={5} max={100} placeholder="—"
                  value={draft.age ?? ''}
                  onChange={e => setDraft(d => ({ ...d, age: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-1 w-full border border-[#C7A467]/70 rounded-xl px-2 py-1.5 text-sm font-semibold bg-white"
                />
              </label>
              <label className="text-xs font-bold text-[#1F3B2E]">
                Height (cm)
                <input
                  type="number" min={80} max={230} placeholder="—"
                  value={draft.heightCm ?? ''}
                  onChange={e => setDraft(d => ({ ...d, heightCm: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-1 w-full border border-[#C7A467]/70 rounded-xl px-2 py-1.5 text-sm font-semibold bg-white"
                />
              </label>
              <label className="text-xs font-bold text-[#1F3B2E]">
                Weight (kg)
                <input
                  type="number" min={20} max={250} placeholder="—"
                  value={draft.weightKg ?? ''}
                  onChange={e => setDraft(d => ({ ...d, weightKg: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-1 w-full border border-[#C7A467]/70 rounded-xl px-2 py-1.5 text-sm font-semibold bg-white"
                />
              </label>
            </div>
            <p className="text-[11px] text-[#5C5142]">Height and weight are only used to soften intensity — never to generate calorie counts, weight-loss targets or diet advice.</p>

            <div>
              <p className="text-xs font-bold text-[#1F3B2E] mb-1.5">Fitness level</p>
              <div className="flex gap-2">
                {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setDraft(d => ({ ...d, fitnessLevel: lvl }))}
                    className={`flex-1 py-2 text-xs font-bold uppercase border border-[#C7A467]/70 rounded-xl cursor-pointer capitalize ${
                      draft.fitnessLevel === lvl ? 'bg-[#1F3B2E] text-white' : 'bg-white text-[#1F3B2E] hover:bg-[#F6EFDE]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-[#5C5142] font-semibold mb-3">Tick anything that applies to you — this is used to filter out unsafe practices before anything else.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {CONTRA_OPTIONS.map(opt => {
                const active = draft.healthChecklist.includes(opt.tag);
                return (
                  <button
                    key={opt.tag}
                    onClick={() => setDraft(d => ({ ...d, healthChecklist: toggle(d.healthChecklist, opt.tag), acknowledgedDoctorNotice: false }))}
                    className={`px-3.5 py-2 text-xs font-bold border border-[#C7A467]/70 rounded-xl cursor-pointer ${
                      active ? 'bg-[#1F3B2E] text-white' : 'bg-white text-[#1F3B2E] hover:bg-[#F6EFDE]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setDraft(d => ({ ...d, healthChecklist: [], acknowledgedDoctorNotice: true }))}
              className={`px-3.5 py-2 text-xs font-bold border border-[#C7A467]/70 rounded-xl cursor-pointer ${
                !hasHealthConcerns && draft.acknowledgedDoctorNotice ? 'bg-[#3F6B4F] text-white' : 'bg-white text-[#1F3B2E] hover:bg-[#F6EFDE]'
              }`}
            >
              None of these apply to me
            </button>

            {hasHealthConcerns && (
              <div className="mt-4 p-3.5 bg-[#F7E3D6] border-2 border-[#1F3B2E] flex gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#1F3B2E] shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1F3B2E] mb-1.5">Please consult a doctor before starting.</p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#2A241E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.acknowledgedDoctorNotice}
                      onChange={e => setDraft(d => ({ ...d, acknowledgedDoctorNotice: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    I understand and have consulted (or will consult) a doctor.
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold text-[#1F3B2E] mb-1.5">Yoga asanas per session</p>
              <div className="flex gap-2 flex-wrap">
                {YOGA_COUNT_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setDraft(d => ({ ...d, yogaAsanaCount: n }))}
                    className={`px-4 py-2 text-xs font-bold border border-[#C7A467]/70 rounded-xl cursor-pointer ${
                      draft.yogaAsanaCount === n ? 'bg-[#1F3B2E] text-white' : 'bg-white text-[#1F3B2E] hover:bg-[#F6EFDE]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F3B2E] mb-1.5">Vyayam items per session</p>
              <div className="flex gap-2 flex-wrap">
                {VYAYAM_COUNT_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setDraft(d => ({ ...d, vyayamItemCount: n }))}
                    className={`px-4 py-2 text-xs font-bold border border-[#C7A467]/70 rounded-xl cursor-pointer ${
                      draft.vyayamItemCount === n ? 'bg-[#1F3B2E] text-white' : 'bg-white text-[#1F3B2E] hover:bg-[#F6EFDE]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F3B2E] mb-1.5">Meditation duration</p>
              <div className="flex gap-2 flex-wrap">
                {MEDITATION_OPTIONS.map(m => (
                  <button
                    key={m}
                    onClick={() => setDraft(d => ({ ...d, meditationMinutes: m }))}
                    className={`px-4 py-2 text-xs font-bold border border-[#C7A467]/70 rounded-xl cursor-pointer ${
                      draft.meditationMinutes === m ? 'bg-[#1F3B2E] text-white' : 'bg-white text-[#1F3B2E] hover:bg-[#F6EFDE]'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F3B2E] mb-1.5">Days per week: {draft.daysPerWeek}</p>
              <input
                type="range" min={3} max={7} step={1}
                value={draft.daysPerWeek}
                onChange={e => setDraft(d => ({ ...d, daysPerWeek: Number(e.target.value) }))}
                className="w-full accent-[#1F3B2E]"
              />
              <div className="flex justify-between text-[10px] text-[#5C5142] font-bold"><span>3</span><span>7</span></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2.5 text-sm text-[#2A241E]">
            <ReviewRow label="Focus areas" value={draft.focusAreas.length ? draft.focusAreas.join(', ') : 'None selected'} />
            <ReviewRow label="Age / Height / Weight" value={`${draft.age ?? '—'} / ${draft.heightCm ?? '—'} cm / ${draft.weightKg ?? '—'} kg`} />
            <ReviewRow label="Fitness level" value={draft.fitnessLevel} />
            <ReviewRow label="Health checklist" value={draft.healthChecklist.length ? draft.healthChecklist.join(', ') : 'None'} />
            <ReviewRow label="Yoga asanas / session" value={String(draft.yogaAsanaCount)} />
            <ReviewRow label="Vyayam items / session" value={String(draft.vyayamItemCount)} />
            <ReviewRow label="Meditation duration" value={`${draft.meditationMinutes} minutes`} />
            <ReviewRow label="Days per week" value={String(draft.daysPerWeek)} />
            <p className="text-[11px] text-[#5C5142] pt-2 border-t border-dashed border-[#C7A467]">
              This plan is generated locally by a rule-based engine — no data leaves your device.
            </p>
          </div>
        )}
      </FolkArtFrame>

      <div className="flex justify-end gap-2">
        {step < steps.length - 1 ? (
          <button
            onClick={next}
            disabled={!canAdvance()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1F3B2E] text-white border border-[#C7A467]/70 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onComplete(draft)}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#1F3B2E] text-white border border-[#C7A467]/70 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#2C5040]"
          >
            Generate My Plan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const ReviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1 border-b border-[#C7A467]/15">
    <span className="font-bold text-[#5C5142]">{label}</span>
    <span className="text-right capitalize">{value}</span>
  </div>
);
