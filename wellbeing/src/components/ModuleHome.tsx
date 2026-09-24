import React from 'react';
import { Section, ViewTab, WeeklyPlan } from '../types';
import { SECTION_CONTENT } from '../data/sectionContent';
import { KreeduMascot } from './KreeduMascot';
import { FolkArtFrame } from './FolkArtFrame';
import { SunMedallionIcon, MaceIcon, OmSpiralIcon } from './FolkArtMotifs';
import { DAY_LABELS } from '../engine/planEngine';
import { getPractice } from '../data/practices';
import { ArrowRight, Play, Moon } from 'lucide-react';

interface ModuleHomeProps {
  plan: WeeklyPlan | null;
  onOpenSection: (section: Section) => void;
  onNavigate: (tab: ViewTab) => void;
  onStartTodaySession: (dayIndex: number) => void;
}

const SECTION_META: Record<Section, { icon: React.ReactNode; tile: string; letter: string }> = {
  yoga: { icon: <SunMedallionIcon size={34} color="#0E5C58" />, tile: 'bg-[#0E5C58]', letter: 'A' },
  vyayam: { icon: <MaceIcon size={34} color="#D8401F" />, tile: 'bg-[#D8401F]', letter: 'B' },
  dhyana: { icon: <OmSpiralIcon size={34} color="#3E6E9E" />, tile: 'bg-[#3E6E9E]', letter: 'C' },
};

export const ModuleHome: React.FC<ModuleHomeProps> = ({ plan, onOpenSection, onNavigate, onStartTodaySession }) => {
  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0..Sun=6
  const todaySession = plan?.days.find(d => d.dayIndex === todayIndex);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 wb-fade-in">
      {/* Hero */}
      <div className="relative bg-[#0E5C58] text-[#EFDFB8] border-[3px] border-[#5C140F] p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-6 flex-wrap">
          <KreeduMascot size={96} />
          <div className="flex-1 min-w-[240px]">
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-2 bg-[#EFDFB8]/15 border border-[#EFDFB8]/70 text-[10px] font-bold uppercase tracking-widest">
              Yoga &middot; Vyayam &middot; Dhyana &middot; One Personal Plan
            </span>
            <h1 className="font-fraunces text-2xl sm:text-3xl font-extrabold leading-tight mb-2">
              India's complete fitness system — for your body and your mind.
            </h1>
            <p className="text-sm opacity-90 max-w-xl leading-relaxed">
              Flexibility from Yoga, strength from Vyayam, a settled mind from Dhyana — combined into one daily plan,
              paced by the ancient <em>ardhashakti</em> principle: exercise to about half your capacity, and grow from there.
            </p>
            <div className="mt-3 inline-block bg-[#EFA90C] text-[#2B1B12] border-2 border-[#5C140F] px-3 py-1.5 text-xs font-bold">
              Namaste! I'm Kreedu — let's build your plan together.
            </div>
          </div>
        </div>
      </div>

      {/* Today's session, if a plan exists */}
      {plan && (
        <FolkArtFrame bg="bg-[#F6ECD2]" className="mb-8" hasCorners>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B4E3D]">Today &middot; {DAY_LABELS[todayIndex]}</span>
              {todaySession && todaySession.emphasis !== 'rest' ? (
                <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mt-0.5">
                  {todaySession.emphasis === 'yoga' ? 'Yoga-heavy session' : 'Vyayam-heavy session'} &middot; {todaySession.items.length} practices
                </h3>
              ) : (
                <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mt-0.5 flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Rest day{todaySession?.standaloneDhyana ? ' — with an evening Dhyana session' : ''}
                </h3>
              )}
            </div>
            {todaySession && (todaySession.items.length > 0 || todaySession.standaloneDhyana) && (
              <button
                onClick={() => onStartTodaySession(todayIndex)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D8401F] text-white border-2 border-[#5C140F] font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#B83215]"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Session
              </button>
            )}
            {!todaySession && (
              <button
                onClick={() => onNavigate('PLAN_OVERVIEW')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5C140F] text-white border-2 border-[#5C140F] font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                View Weekly Plan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {todaySession && todaySession.items.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {todaySession.items.map((item, i) => {
                const p = getPractice(item.practiceId);
                return p ? (
                  <li key={i} className="text-[11px] font-bold bg-white border border-[#5C140F]/40 px-2 py-1 text-[#5C140F]">
                    {p.name}
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </FolkArtFrame>
      )}

      {/* Section cards */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-fraunces text-xl font-bold text-[#5C140F] whitespace-nowrap">Explore the practices</h2>
        <div className="flex-1 h-[3px]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #5C140F 0 8px, transparent 8px 14px)' }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {(['yoga', 'vyayam', 'dhyana'] as Section[]).map(section => {
          const content = SECTION_CONTENT[section];
          const meta = SECTION_META[section];
          return (
            <div
              key={section}
              onClick={() => onOpenSection(section)}
              className={`relative cursor-pointer border-[3px] border-[#5C140F] p-5 text-[#EFDFB8] overflow-hidden ${meta.tile} transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0_#5C140F]`}
            >
              {content.heroImage && (
                <img src={content.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className={`absolute inset-0 ${meta.tile}`} style={{ opacity: content.heroImage ? 0.78 : 1 }} />
              <div className="relative">
                <span className="absolute -top-1 -right-1 font-fraunces font-black text-xs opacity-60">{meta.letter}</span>
                <div className="w-13 h-13 flex items-center justify-center mb-3 bg-[#EFDFB8]/15 border border-[#EFDFB8]/40">{meta.icon}</div>
                <h3 className="font-fraunces text-lg font-extrabold mb-0.5">{content.title}</h3>
                <p className="font-telugu text-xs opacity-85 mb-2">{content.nativeName}</p>
                <p className="text-[12.5px] leading-snug opacity-90 mb-4">{content.tagline}</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Persistent Build My Plan CTA */}
      <div className="sticky bottom-4 z-10">
        <button
          onClick={() => onNavigate(plan ? 'PLAN_OVERVIEW' : 'PLAN_BUILDER')}
          className="w-full py-4 bg-[#D8401F] hover:bg-[#B83215] text-white border-[3px] border-[#5C140F] font-fraunces font-extrabold text-lg uppercase tracking-wide cursor-pointer shadow-[4px_4px_0_rgba(92,20,15,0.4)] transition-transform hover:-translate-y-0.5"
        >
          {plan ? 'View My Weekly Plan' : 'Build My Plan'}
        </button>
      </div>
    </div>
  );
};
