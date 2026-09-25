import React from 'react';
import { CalendarCheck, ChevronRight, CircleUserRound, Heart, Sparkles } from 'lucide-react';
import { Section, ViewTab, WeeklyPlan } from '../types';
import { SECTION_CONTENT } from '../data/sectionContent';
import { MaceIcon, OmSpiralIcon, SunMedallionIcon } from './FolkArtMotifs';

interface ModuleHomeProps {
  plan: WeeklyPlan | null;
  onOpenSection: (section: Section) => void;
  onNavigate: (tab: ViewTab) => void;
  onStartTodaySession: (dayIndex: number) => void;
}

const HUB_BG = '../../bg.png';

const SECTION_META: Record<Section, { icon: React.ReactNode; eyebrow: string; accent: string }> = {
  yoga: {
    icon: <SunMedallionIcon size={42} color="#1F3B2E" />,
    eyebrow: 'Posture · breath · balance',
    accent: '#1F3B2E',
  },
  vyayam: {
    icon: <MaceIcon size={42} color="#A8402E" />,
    eyebrow: 'Strength · stamina · mobility',
    accent: '#A8402E',
  },
  dhyana: {
    icon: <OmSpiralIcon size={42} color="#1F3A5C" />,
    eyebrow: 'Meditation · attention · calm',
    accent: '#1F3A5C',
  },
};

export const ModuleHome: React.FC<ModuleHomeProps> = ({ plan, onOpenSection, onNavigate, onStartTodaySession }) => {
  const todayIndex = (new Date().getDay() + 6) % 7;
  const todaySession = plan?.days.find(day => day.dayIndex === todayIndex);
  const canStartToday = !!todaySession && (todaySession.items.length > 0 || !!todaySession.standaloneDhyana);

  const openToday = () => {
    if (canStartToday) {
      onStartTodaySession(todayIndex);
      return;
    }
    onNavigate(plan ? 'PLAN_OVERVIEW' : 'PLAN_BUILDER');
  };

  return (
    <div className="hub-hero min-h-screen">
      <img className="hub-bg" src={HUB_BG} alt="" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <header className="flex items-center justify-between gap-3 mb-6">
          <a href="../../kreeda-home.html" className="hub-pill hub-home-link" aria-label="Back to KREEDA home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            Home
          </a>

          <h1 className="font-fraunces text-2xl sm:text-4xl font-semibold tracking-[0.08em] text-[#1F3B2E]">EXERCISES</h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate(plan ? 'PLAN_OVERVIEW' : 'PLAN_BUILDER')}
              className="hub-pill"
            >
              <Sparkles className="w-4 h-4" /> My Plan
            </button>
            <button type="button" className="hub-avatar" aria-label="Account profile" title="Account profile">
              <CircleUserRound className="w-5 h-5" />
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-[#C7A467]/80 bg-[#FBF3E2]/95 shadow-[0_18px_45px_rgba(42,30,20,0.12)] overflow-hidden mb-6">
          <div className="px-5 sm:px-8 py-5 text-center border-b border-[#C7A467]/50 bg-[#EADFC4]/70">
            <p className="font-fraunces text-lg sm:text-xl italic text-[#1F3B2E]">“Move with steadiness; breathe with ease.”</p>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#5C5142] mt-1">KREEDA daily reminder</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-px bg-[#C7A467]/50">
            <button type="button" onClick={openToday} className="group bg-[#F6EFDE] hover:bg-white p-5 sm:p-7 text-left cursor-pointer transition-colors">
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold text-[#A8402E] mb-2">
                <CalendarCheck className="w-4 h-4" /> Today's Plan
              </span>
              <span className="flex items-center justify-between gap-4">
                <span>
                  <strong className="block font-fraunces text-xl text-[#1F3B2E]">
                    {canStartToday ? 'Begin today’s practice' : plan ? 'View your weekly schedule' : 'Build your personal schedule'}
                  </strong>
                  <span className="block text-xs text-[#5C5142] mt-1">
                    {canStartToday ? `${todaySession!.items.length + (todaySession!.standaloneDhyana ? 1 : 0)} planned items` : 'Choose concerns, body data and available time'}
                  </span>
                </span>
                <ChevronRight className="w-6 h-6 text-[#1F3B2E] group-hover:translate-x-1 transition-transform shrink-0" />
              </span>
            </button>

            <button type="button" onClick={() => onNavigate('MOOD_LOG')} className="group bg-[#F6EFDE] hover:bg-white p-5 sm:p-7 text-left cursor-pointer transition-colors">
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold text-[#1F3A5C] mb-2">
                <Heart className="w-4 h-4" /> Mood
              </span>
              <span className="flex items-center justify-between gap-4">
                <span>
                  <strong className="block font-fraunces text-xl text-[#1F3B2E]">How are you feeling?</strong>
                  <span className="block text-xs text-[#5C5142] mt-1">Record a private note without changing your plan</span>
                </span>
                <ChevronRight className="w-6 h-6 text-[#1F3B2E] group-hover:translate-x-1 transition-transform shrink-0" />
              </span>
            </button>
          </div>
        </section>

        <section aria-labelledby="practices-heading">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A8402E]">Choose a practice</p>
              <h2 id="practices-heading" className="font-fraunces text-2xl font-semibold text-[#1F3B2E]">Yoga · Vyayamam · Dhyana</h2>
            </div>
            <button type="button" onClick={() => onNavigate('PROGRESS')} className="hub-pill hidden sm:inline-flex">Progress</button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(['yoga', 'vyayam', 'dhyana'] as Section[]).map(section => {
              const content = SECTION_CONTENT[section];
              const meta = SECTION_META[section];
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => onOpenSection(section)}
                  className="group text-left rounded-2xl border border-[#C7A467]/80 bg-[#F6EFDE]/95 overflow-hidden shadow-[0_8px_24px_rgba(42,30,20,0.1)] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(42,30,20,0.14)] transition-all cursor-pointer"
                  style={{ borderTopColor: meta.accent, borderTopWidth: 4 }}
                >
                  <div className="h-36 bg-[#EADFC4] flex items-center justify-center overflow-hidden">
                    {content.heroImage
                      ? <img src={content.heroImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : meta.icon}
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: meta.accent }}>{meta.eyebrow}</span>
                    <span className="flex items-center justify-between gap-3 mt-1">
                      <span>
                        <strong className="font-fraunces text-xl text-[#1F3B2E]">{content.title}</strong>
                        <span className="font-telugu text-sm text-[#5C5142] ml-2">{content.nativeName}</span>
                      </span>
                      <ChevronRight className="w-5 h-5 text-[#1F3B2E] group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
