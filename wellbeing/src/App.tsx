import React, { useEffect, useState } from 'react';
import { Section, ViewTab, UserProfile, Mood, FeedbackRating, PracticeProgress, SessionLogEntry, DaySession, Practice } from './types';
import { loadState, saveState, computeStreak, isoDate } from './engine/storage';
import { buildWeeklyPlan, applyFeedback, startingIntensity, estimatePracticeSeconds } from './engine/planEngine';
import { ALL_PRACTICES, getPractice } from './data/practices';

import { Header } from './components/Header';
import { Disclaimer } from './components/Disclaimer';
import { ModuleHome } from './components/ModuleHome';
import { SectionHome } from './components/SectionHome';
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
    setTab('SECTION');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuildPlan = (profile: UserProfile) => {
    const plan = buildWeeklyPlan(profile, state.history.length);
    setState(s => ({ ...s, profile, plan, onboarded: true }));
    handleNavigate('PLAN_OVERVIEW');
  };

  const handleStartSession = (dayIndex: number) => {
    setSoloSession(null);
    setActiveDayIndex(dayIndex);
    handleNavigate('SESSION_PLAYER');
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
    handleNavigate('SESSION_PLAYER');
  };

  const handleSoloExit = () => {
    setSoloSession(null);
    setReturnToLibrary(true);
    handleNavigate('SECTION');
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
            onStartTodaySession={handleStartSession}
          />
        )}

        {tab === 'SECTION' && section && (
          <SectionHome
            section={section}
            totalSessionsCompleted={state.history.length}
            onBack={() => handleNavigate('HOME')}
            initialTab={returnToLibrary ? 'library' : undefined}
            onStartPractice={handleStartPractice}
          />
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
            onExit={() => handleNavigate('PLAN_OVERVIEW')}
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
