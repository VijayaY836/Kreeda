import React, { useState } from 'react';
import { UserProfile, FocusTag, Contraindication, FitnessLevel, DailyTimeMinutes } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { ArrowLeft, ArrowRight, AlertTriangle, Check } from 'lucide-react';

const FOCUS_OPTIONS: { tag: FocusTag; label: string }[] = [
  { tag: 'back_stiffness', label: 'Back stiffness' },
  { tag: 'desk_posture', label: 'Desk posture' },
  { tag: 'flexibility', label: 'Flexibility' },
  { tag: 'strength', label: 'Strength' },
  { tag: 'stamina', label: 'Stamina' },
  { tag: 'balance', label: 'Balance' },
  { tag: 'stress', label: 'Stress' },
  { tag: 'sleep', label: 'Sleep' },
  { tag: 'digestion', label: 'Digestion' },
  { tag: 'focus', label: 'Focus' },
  { tag: 'mood', label: 'Mood' },
];

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

const TIME_OPTIONS: DailyTimeMinutes[] = [10, 15, 20, 30, 45];

const DEFAULT_DRAFT: UserProfile = {
  focusAreas: [],
  age: null,
  heightCm: null,
  weightKg: null,
  fitnessLevel: 'beginner',
  dailyTimeMinutes: 20,
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

  const steps = ['Focus', 'Body Data', 'Health Checklist', 'Time', 'Review'];
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
      <button onClick={back} className="inline-flex items-center gap-1.5 text-[#5C140F] font-bold text-sm mb-4 cursor-pointer hover:underline">
        <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Back to Physical Wellbeing' : 'Previous step'}
      </button>

      {/* Stepper indicator */}
      <div className="flex items-center gap-1.5 mb-6">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-1.5">
            <div className={`w-6 h-6 flex items-center justify-center text-[11px] font-extrabold border-2 border-[#5C140F] shrink-0 ${
              i < step ? 'bg-[#5F8F3B] text-white' : i === step ? 'bg-[#D8401F] text-white' : 'bg-[#E4D19E] text-[#5C140F]'
            }`}>
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-[#5C140F]/30" />}
          </div>
        ))}
      </div>
      <h2 className="font-fraunces text-xl font-bold text-[#5C140F] mb-4">{steps[step]}</h2>

      <FolkArtFrame className="mb-5">
        {step === 0 && (
          <div>
            <p className="text-sm text-[#6B4E3D] font-semibold mb-3">What would you like your plan to focus on? Pick as many as apply.</p>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map(opt => {
                const active = draft.focusAreas.includes(opt.tag);
                return (
                  <button
                    key={opt.tag}
                    onClick={() => setDraft(d => ({ ...d, focusAreas: toggle(d.focusAreas, opt.tag) }))}
                    className={`px-3.5 py-2 text-xs font-bold border-2 border-[#5C140F] cursor-pointer ${
                      active ? 'bg-[#D8401F] text-white' : 'bg-white text-[#5C140F] hover:bg-[#F6ECD2]'
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
              <label className="text-xs font-bold text-[#5C140F]">
                Age
                <input
                  type="number" min={5} max={100} placeholder="—"
                  value={draft.age ?? ''}
                  onChange={e => setDraft(d => ({ ...d, age: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-1 w-full border-2 border-[#5C140F] px-2 py-1.5 text-sm font-semibold bg-white"
                />
              </label>
              <label className="text-xs font-bold text-[#5C140F]">
                Height (cm)
                <input
                  type="number" min={80} max={230} placeholder="—"
                  value={draft.heightCm ?? ''}
                  onChange={e => setDraft(d => ({ ...d, heightCm: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-1 w-full border-2 border-[#5C140F] px-2 py-1.5 text-sm font-semibold bg-white"
                />
              </label>
              <label className="text-xs font-bold text-[#5C140F]">
                Weight (kg)
                <input
                  type="number" min={20} max={250} placeholder="—"
                  value={draft.weightKg ?? ''}
                  onChange={e => setDraft(d => ({ ...d, weightKg: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-1 w-full border-2 border-[#5C140F] px-2 py-1.5 text-sm font-semibold bg-white"
                />
              </label>
            </div>
            <p className="text-[11px] text-[#6B4E3D]">Height and weight are only used to soften intensity — never to generate calorie counts, weight-loss targets or diet advice.</p>

            <div>
              <p className="text-xs font-bold text-[#5C140F] mb-1.5">Fitness level</p>
              <div className="flex gap-2">
                {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setDraft(d => ({ ...d, fitnessLevel: lvl }))}
                    className={`flex-1 py-2 text-xs font-bold uppercase border-2 border-[#5C140F] cursor-pointer capitalize ${
                      draft.fitnessLevel === lvl ? 'bg-[#5C140F] text-white' : 'bg-white text-[#5C140F] hover:bg-[#F6ECD2]'
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
            <p className="text-sm text-[#6B4E3D] font-semibold mb-3">Tick anything that applies to you — this is used to filter out unsafe practices before anything else.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {CONTRA_OPTIONS.map(opt => {
                const active = draft.healthChecklist.includes(opt.tag);
                return (
                  <button
                    key={opt.tag}
                    onClick={() => setDraft(d => ({ ...d, healthChecklist: toggle(d.healthChecklist, opt.tag), acknowledgedDoctorNotice: false }))}
                    className={`px-3.5 py-2 text-xs font-bold border-2 border-[#5C140F] cursor-pointer ${
                      active ? 'bg-[#D8401F] text-white' : 'bg-white text-[#5C140F] hover:bg-[#F6ECD2]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setDraft(d => ({ ...d, healthChecklist: [], acknowledgedDoctorNotice: true }))}
              className={`px-3.5 py-2 text-xs font-bold border-2 border-[#5C140F] cursor-pointer ${
                !hasHealthConcerns && draft.acknowledgedDoctorNotice ? 'bg-[#5F8F3B] text-white' : 'bg-white text-[#5C140F] hover:bg-[#F6ECD2]'
              }`}
            >
              None of these apply to me
            </button>

            {hasHealthConcerns && (
              <div className="mt-4 p-3.5 bg-[#F7E3D6] border-2 border-[#D8401F] flex gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#D8401F] shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#5C140F] mb-1.5">Please consult a doctor before starting.</p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#2B1B12] cursor-pointer">
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
              <p className="text-xs font-bold text-[#5C140F] mb-1.5">Daily time available</p>
              <div className="flex gap-2 flex-wrap">
                {TIME_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => setDraft(d => ({ ...d, dailyTimeMinutes: t }))}
                    className={`px-4 py-2 text-xs font-bold border-2 border-[#5C140F] cursor-pointer ${
                      draft.dailyTimeMinutes === t ? 'bg-[#D8401F] text-white' : 'bg-white text-[#5C140F] hover:bg-[#F6ECD2]'
                    }`}
                  >
                    {t} min
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#5C140F] mb-1.5">Days per week: {draft.daysPerWeek}</p>
              <input
                type="range" min={3} max={7} step={1}
                value={draft.daysPerWeek}
                onChange={e => setDraft(d => ({ ...d, daysPerWeek: Number(e.target.value) }))}
                className="w-full accent-[#D8401F]"
              />
              <div className="flex justify-between text-[10px] text-[#6B4E3D] font-bold"><span>3</span><span>7</span></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2.5 text-sm text-[#2B1B12]">
            <ReviewRow label="Focus areas" value={draft.focusAreas.length ? draft.focusAreas.join(', ') : 'None selected'} />
            <ReviewRow label="Age / Height / Weight" value={`${draft.age ?? '—'} / ${draft.heightCm ?? '—'} cm / ${draft.weightKg ?? '—'} kg`} />
            <ReviewRow label="Fitness level" value={draft.fitnessLevel} />
            <ReviewRow label="Health checklist" value={draft.healthChecklist.length ? draft.healthChecklist.join(', ') : 'None'} />
            <ReviewRow label="Daily time" value={`${draft.dailyTimeMinutes} minutes`} />
            <ReviewRow label="Days per week" value={String(draft.daysPerWeek)} />
            <p className="text-[11px] text-[#6B4E3D] pt-2 border-t border-dashed border-[#5C140F]">
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
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#5C140F] text-white border-2 border-[#5C140F] font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onComplete(draft)}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#D8401F] text-white border-2 border-[#5C140F] font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#B83215]"
          >
            Generate My Plan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const ReviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1 border-b border-[#5C140F]/15">
    <span className="font-bold text-[#6B4E3D]">{label}</span>
    <span className="text-right capitalize">{value}</span>
  </div>
);
