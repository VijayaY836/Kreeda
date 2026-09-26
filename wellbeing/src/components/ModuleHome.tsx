import React from 'react';
import { Section, ViewTab, WeeklyPlan } from '../types';
import { SECTION_CONTENT } from '../data/sectionContent';
import { SunMedallionIcon, MaceIcon, OmSpiralIcon } from './FolkArtMotifs';

interface ModuleHomeProps {
  plan: WeeklyPlan | null;
  onOpenSection: (section: Section) => void;
  onNavigate: (tab: ViewTab) => void;
  onStartTodaySession: (dayIndex: number) => void;
}

// Shared illustrated frame from the KREEDA hub. Resolved at runtime relative to
// dist/index.html (like Header's hub links) rather than imported, so the hub and
// this module always show the same file and it isn't inlined twice.
const HUB_BG = '../../physical-wellbeing1.png';

const SECTION_META: Record<Section, { icon: React.ReactNode; accent: string; letter: string }> = {
  yoga: { icon: <SunMedallionIcon size={40} color="#1F3B2E" />, accent: 'var(--color-evergreen)', letter: 'A' },
  vyayam: { icon: <MaceIcon size={40} color="#A8402E" />, accent: 'var(--color-brick)', letter: 'B' },
  dhyana: { icon: <OmSpiralIcon size={40} color="#1F3A5C" />, accent: 'var(--color-navy)', letter: 'C' },
};

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const ModuleHome: React.FC<ModuleHomeProps> = ({ plan, onOpenSection, onNavigate, onStartTodaySession }) => {
  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0..Sun=6
  const todaySession = plan?.days.find(d => d.dayIndex === todayIndex);
  const canStartToday = !!todaySession && (todaySession.items.length > 0 || !!todaySession.standaloneDhyana);

  return (
    <div className="hub-hero">
      <img className="hub-bg" src={HUB_BG} alt="" />

      <div className="hub-content">
        <a className="hub-pill hub-home-link" href="../../kreeda-home.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          Home
        </a>

        <div className="hub-controls">
          <button className="hub-pill" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9Z" /></svg>
            Languages
            <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <button className="hub-avatar" type="button" aria-label="Account">A</button>
        </div>

        <div className="hub-header">
          <h1 className="hub-masthead">Physical Wellbeing</h1>
        </div>

        <div className="hub-cards">
          <div className="hub-grid">
            {(['yoga', 'vyayam', 'dhyana'] as Section[]).map(section => {
              const content = SECTION_CONTENT[section];
              const meta = SECTION_META[section];
              return (
                <article
                  key={section}
                  className="hub-card"
                  style={{ '--accent': meta.accent } as React.CSSProperties}
                  onClick={() => onOpenSection(section)}
                >
                  <div className="hub-illustration">
                    {content.heroImage ? <img src={content.heroImage} alt="" /> : meta.icon}
                  </div>
                  <div className="hub-card-body">
                    <p className="hub-eyebrow">Section {meta.letter} · <span className="font-telugu">{content.nativeName}</span></p>
                    <h2>{content.title}</h2>
                    <p className="hub-tagline">{content.tagline}</p>
                    <div className="hub-cta">
                      <span className="hub-flourish" />
                      <button className="hub-arrow" type="button" aria-label={`Explore ${content.title}`}><ArrowIcon /></button>
                      <span className="hub-flourish" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hub-actions">
            {plan && canStartToday ? (
              <button className="hub-primary" type="button" onClick={() => onStartTodaySession(todayIndex)}>
                Start today's session
              </button>
            ) : (
              <button className="hub-primary" type="button" onClick={() => onNavigate(plan ? 'PLAN_OVERVIEW' : 'PLAN_BUILDER')}>
                {plan ? 'View my weekly plan' : 'Build my plan'}
              </button>
            )}
            {plan && canStartToday && (
              <button className="hub-pill" type="button" onClick={() => onNavigate('PLAN_OVERVIEW')}>Weekly plan</button>
            )}
            <button className="hub-pill" type="button" onClick={() => onNavigate('PROGRESS')}>Progress</button>
          </div>
        </div>
      </div>
    </div>
  );
};
