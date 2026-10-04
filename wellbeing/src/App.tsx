import React, { useCallback, useEffect, useState } from 'react';
import { Section, ViewTab, UserProfile, Mood, FeedbackRating, PracticeProgress, SessionLogEntry, DaySession, Practice } from './types';
import { loadState, saveState, computeStreak, isoDate } from './engine/storage';
import { buildWeeklyPlan, applyFeedback, startingIntensity, estimatePracticeSeconds } from './engine/planEngine';
import { ALL_PRACTICES, getPractice } from './data/practices';

import { Header } from './components/Header';
import { Disclaimer } from './components/Disclaimer';
import { ModuleHome } from './components/ModuleHome';
import { SectionHome } from './components/SectionHome';
import { SectionCard } from './components/SectionCard';
import { TodayPlan } from './components/TodayPlan';
import { SECTION_CONTENT } from './data/sectionContent';
import { PlanBuilder } from './components/PlanBuilder';
import { PlanOverview } from './components/PlanOverview';
import { SessionPlayer } from './components/SessionPlayer';
import { PostSessionCheck } from './components/PostSessionCheck';
import { ProgressView } from './components/Progress';
import { MoodLog } from './components/MoodLog';
import { LotusIcon } from './components/FolkArtMotifs';

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState<ViewTab>('HOME');
  const [section, setSection] = useState<Section | null>(null);
  // Yoga / Vyayam / Dhyana open in a card over the Exercises page (HOME)
  const [sectionOpen, setSectionOpen] = useState(false);
  // Today's Plan ('plan', or 'builder' while building one) and Mood also open in cards
  // ... and so do the session player ('session') and its check-in afterwards ('post')
  const [homeCard, setHomeCard] = useState<null | 'plan' | 'builder' | 'mood' | 'session' | 'post'>(null);
  const closeHomeCard = useCallback(() => setHomeCard(null), []);
  // a session started from the Today's Plan card returns there when it's left
  const [sessionFromCard, setSessionFromCard] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [pendingMoodBefore, setPendingMoodBefore] = useState<Mood | null>(null);
  // A single Library exercise played through the same SessionPlayer. It is not
  // part of the weekly plan, so it never touches plan history or progress.
  const [soloSession, setSoloSession] = useState<DaySession | null>(null);
  const [returnToLibrary, setReturnToLibrary] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const handleNavigate = (next: ViewTab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSection = (s: Section) => {
    setSection(s);
    setReturnToLibrary(false);
    setSectionOpen(true);
  };
  const handleCloseSection = useCallback(() => setSectionOpen(false), []);

  const handleBuildPlan = (profile: UserProfile) => {
    const plan = buildWeeklyPlan(profile, state.history.length);
    setState(s => ({ ...s, profile, plan, onboarded: true }));
    // built from the Today's Plan card: stay in the card and show the new plan
    if (homeCard === 'builder') setHomeCard('plan');
    else handleNavigate('PLAN_OVERVIEW');
  };

  const handleStartSession = (dayIndex: number) => {
    setSoloSession(null);
    setActiveDayIndex(dayIndex);
    setSessionFromCard(homeCard === 'plan');
    // from the Exercises page (Today's Plan card) the session plays in a card;
    // from the My Plan page it keeps its own full page
    if (tab === 'HOME') { setHomeCard('session'); return; }
    setHomeCard(null);
    handleNavigate('SESSION_PLAYER');
  };
  const handleSessionExit = () => {
    if (sessionFromCard) { setHomeCard('plan'); handleNavigate('HOME'); }
    else handleNavigate('PLAN_OVERVIEW');
  };

  const handleStartPractice = (practice: Practice) => {
    const intensity = state.profile
      ? startingIntensity(practice, state.profile)
      : {
          durationSec: practice.duration_sec?.default ?? null,
          reps: practice.reps?.default ?? null,
          rounds: practice.rounds?.default ?? null,
        };
    setSoloSession({
      dayIndex: -1,
      emphasis: practice.section === 'vyayam' ? 'vyayam' : 'yoga',
      items: [{
        practiceId: practice.id,
        slot: 'main',
        durationSec: estimatePracticeSeconds(practice, intensity),
        reps: intensity.reps,
        rounds: intensity.rounds,
      }],
    });
    // from a section card's Library: play it in a card, then return to that Library
    setSectionOpen(false);
    setHomeCard('session');
  };

  // back from a single Library exercise: the section card reopens on its Library
  const handleSoloExit = () => {
    setSoloSession(null);
    setReturnToLibrary(true);
    setSectionOpen(true);
    setHomeCard(null);
    handleNavigate('HOME');
  };

  // the session card: leaving returns to where it was started from; finishing a
  // plan session moves on to the check-in in the same card
  const handleCardSessionExit = useCallback(() => {
    if (soloSession) { handleSoloExit(); return; }
    setHomeCard(sessionFromCard ? 'plan' : null);
  }, [soloSession, sessionFromCard]); // eslint-disable-line react-hooks/exhaustive-deps
  const handleCardSessionComplete = (moodBefore: Mood | null) => {
    if (soloSession) { handleSoloExit(); return; }
    setPendingMoodBefore(moodBefore);
    setHomeCard('post');
  };

  const handleSessionComplete = (moodBefore: Mood | null) => {
    setPendingMoodBefore(moodBefore);
    handleNavigate('POST_SESSION');
  };

  const handlePostSessionSubmit = (rating: FeedbackRating, moodAfter: Mood) => {
    const daySession = state.plan?.days.find(d => d.dayIndex === activeDayIndex);
    const beforeTotal = state.history.length;

    setState(s => {
      const newProgress: Record<string, PracticeProgress> = { ...s.progress };
      const mainItems = daySession?.items.filter(i => i.slot === 'main') ?? [];
      for (const item of mainItems) {
        const practice = getPractice(item.practiceId);
        if (!practice) continue;
        const existing: PracticeProgress = newProgress[item.practiceId] ?? {
          sessionsCompleted: 0, lastRating: null, consecutiveAboutRight: 0,
          currentRepsOrDuration: item.reps ?? item.rounds ?? item.durationSec,
        };
        newProgress[item.practiceId] = applyFeedback(existing, rating, practice);
      }

      const entry: SessionLogEntry = {
        date: isoDate(new Date()),
        dayIndex: activeDayIndex ?? 0,
        moodBefore: pendingMoodBefore,
        moodAfter,
        ratings: Object.fromEntries(mainItems.map(i => [i.practiceId, rating])),
      };
      const history = [...s.history, entry];
      const afterTotal = history.length;

      const newlyUnlocked = ALL_PRACTICES
        .filter(p => p.unlock_after_sessions > beforeTotal && p.unlock_after_sessions <= afterTotal)
        .map(p => p.id)
        .filter(id => !s.unlockedMilestones.includes(id));

      return {
        ...s,
        progress: newProgress,
        history,
        streak: computeStreak(s.streak, s.lastSessionDate),
        lastSessionDate: isoDate(new Date()),
        unlockedMilestones: [...s.unlockedMilestones, ...newlyUnlocked],
      };
    });

    setPendingMoodBefore(null);
    setActiveDayIndex(null);
    setHomeCard(null);
    handleNavigate('HOME');
  };

  const activeSession = state.plan?.days.find(d => d.dayIndex === activeDayIndex);

  const handleMoodSave = (mood: Mood, note: string) => {
    const recordedAt = new Date().toISOString();
    setState(s => ({
      ...s,
      moodLog: [
        ...s.moodLog,
        { id: `${recordedAt}-${Math.random().toString(36).slice(2, 8)}`, recordedAt, mood, note },
      ],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1E8D2] text-[#2A241E] font-manrope">
      {tab !== 'HOME' && <Header currentTab={tab} hasPlan={!!state.plan} onNavigate={handleNavigate} />}

      <main className="flex-1 w-full">
        {tab === 'HOME' && (
          <ModuleHome
            plan={state.plan}
            onOpenSection={handleOpenSection}
            onNavigate={handleNavigate}
            onOpenToday={() => setHomeCard(state.plan ? 'plan' : 'builder')}
            onOpenMood={() => setHomeCard('mood')}
          />
        )}

        {tab === 'HOME' && sectionOpen && section && (
          <SectionCard label={SECTION_CONTENT[section].title} onClose={handleCloseSection}>
            <SectionHome
              section={section}
              totalSessionsCompleted={state.history.length}
              onBack={handleCloseSection}
              initialTab={returnToLibrary ? 'library' : undefined}
              onStartPractice={handleStartPractice}
              inCard
            />
          </SectionCard>
        )}

        {tab === 'HOME' && homeCard === 'plan' && state.plan && (
          <SectionCard label="Today's Plan" size="compact" onClose={closeHomeCard}>
            <TodayPlan plan={state.plan} onStartSession={handleStartSession} onEditInputs={() => setHomeCard('builder')} />
          </SectionCard>
        )}

        {tab === 'HOME' && homeCard === 'builder' && (
          <SectionCard label="Build your plan" onClose={closeHomeCard}>
            <PlanBuilder
              initialProfile={state.profile}
              onCancel={() => setHomeCard(state.plan ? 'plan' : null)}
              onComplete={handleBuildPlan}
              inCard
            />
          </SectionCard>
        )}

        {tab === 'HOME' && homeCard === 'mood' && (
          <SectionCard label="Mood" size="compact" onClose={closeHomeCard}>
            <MoodLog entries={state.moodLog} onBack={closeHomeCard} onSave={handleMoodSave} inCard />
          </SectionCard>
        )}

        {tab === 'HOME' && homeCard === 'session' && (soloSession || activeSession) && (
          <SectionCard label="Practice session" closeOnBackdrop={false} onClose={handleCardSessionExit}>
            <SessionPlayer
              session={(soloSession ?? activeSession)!}
              onExit={handleCardSessionExit}
              onComplete={handleCardSessionComplete}
              inCard
            />
          </SectionCard>
        )}

        {tab === 'HOME' && homeCard === 'post' && (
          <SectionCard label="Session complete" size="compact" closeOnBackdrop={false} onClose={() => { setHomeCard(null); setActiveDayIndex(null); }}>
            <PostSessionCheck onSubmit={handlePostSessionSubmit} />
          </SectionCard>
        )}

        {tab === 'PLAN_BUILDER' && (
          <PlanBuilder
            initialProfile={state.profile}
            onCancel={() => handleNavigate(state.plan ? 'PLAN_OVERVIEW' : 'HOME')}
            onComplete={handleBuildPlan}
          />
        )}

        {tab === 'PLAN_OVERVIEW' && state.plan && (
          <PlanOverview
            plan={state.plan}
            onBack={() => handleNavigate('HOME')}
            onStartSession={handleStartSession}
            onRebuild={() => handleNavigate('PLAN_BUILDER')}
          />
        )}

        {tab === 'SESSION_PLAYER' && soloSession && (
          <SessionPlayer session={soloSession} onExit={handleSoloExit} onComplete={handleSoloExit} />
        )}

        {tab === 'SESSION_PLAYER' && !soloSession && activeSession && (
          <SessionPlayer
            session={activeSession}
            onExit={handleSessionExit}
            onComplete={handleSessionComplete}
          />
        )}

        {tab === 'POST_SESSION' && <PostSessionCheck onSubmit={handlePostSessionSubmit} />}

        {tab === 'PROGRESS' && <ProgressView state={state} onBack={() => handleNavigate('HOME')} />}

        {tab === 'MOOD_LOG' && (
          <MoodLog entries={state.moodLog} onBack={() => handleNavigate('HOME')} onSave={handleMoodSave} />
        )}
      </main>

      {tab !== 'HOME' && (
      <footer className="mt-12 bg-[#FBF3E2] border-t border-[#C7A467]/60 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-[#1F3B2E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F1E8D2] border border-[#C7A467]/70 rounded-xl flex items-center justify-center">
              <LotusIcon size={18} color="#C0524A" />
            </div>
            <div>
              <p className="font-fraunces font-bold text-sm">PHYSICAL WELLBEING (శారీరిక)</p>
              <p className="text-[11px] text-[#1F3B2E]/80">Yoga, Vyayam and Dhyana, tuned to your body with the ardhashakti principle.</p>
            </div>
          </div>
          <div className="text-[10px] text-[#1F3B2E]/70 font-mono">100% Offline · Rule-Based Plan Engine · No Data Leaves Your Device</div>
        </div>
      </footer>
      )}

      {!state.disclaimerAcknowledged && (
        <Disclaimer onAcknowledge={() => setState(s => ({ ...s, disclaimerAcknowledged: true }))} />
      )}
    </div>
  );
}
