import React, { useMemo, useState } from 'react';
import { Section, Practice } from '../types';
import { SECTION_CONTENT } from '../data/sectionContent';
import { practicesBySection, LIBRARY_GROUPS } from '../data/practices';
import { PracticeCard } from './PracticeCard';
import { PracticeDetailModal } from './PracticeDetailModal';
import { HeritageCards } from './HeritageCards';
import { FolkDivider, SunMedallionIcon, MaceIcon, OmSpiralIcon } from './FolkArtMotifs';
import { ArrowLeft, Sparkles } from 'lucide-react';

// shown faintly on timeline events that have no picture
const SECTION_MOTIF: Record<Section, React.ReactNode> = {
  yoga: <SunMedallionIcon size={40} color="#1F3B2E" />,
  vyayam: <MaceIcon size={40} color="#A8402E" />,
  dhyana: <OmSpiralIcon size={40} color="#1F3A5C" />,
};

export type SectionTab = 'history' | 'facts' | 'library' | 'heritage';

interface SectionHomeProps {
  section: Section;
  totalSessionsCompleted: number;
  initialTab?: SectionTab;
  onBack: () => void;
  onStartPractice: (practice: Practice) => void;
  // shown in a card over the Exercises page, which has its own close button
  inCard?: boolean;
}

export const SectionHome: React.FC<SectionHomeProps> = ({ section, totalSessionsCompleted, initialTab, onBack, onStartPractice, inCard = false }) => {
  const [tab, setTab] = useState<SectionTab>(initialTab ?? 'history');
  const [selected, setSelected] = useState<Practice | null>(null);
  const content = SECTION_CONTENT[section];
  const practices = useMemo(() => practicesBySection(section), [section]);
  const groups = LIBRARY_GROUPS[section];

  const tabs: { key: SectionTab; label: string }[] = [
    { key: 'history', label: 'History' },
    { key: 'facts', label: 'Fun Facts' },
    { key: 'library', label: 'Library' },
    ...(section === 'vyayam' ? [{ key: 'heritage' as SectionTab, label: 'Heritage' }] : []),
  ];

  return (
    <div className={`max-w-6xl mx-auto px-4 wb-fade-in ${inCard ? 'pt-14 pb-6 sm:pt-5 sm:pr-16' : 'py-6'}`}>
      {!inCard && (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[#1F3B2E] font-bold text-sm mb-4 cursor-pointer hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Physical Wellbeing
        </button>
      )}

      <div className="relative mb-5 border border-[#C7A467]/70 rounded-2xl shadow-[0_8px_24px_rgba(42,30,20,0.10)] overflow-hidden">
        {content.heroImage && (
          <img src={content.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ backgroundColor: content.color, opacity: content.heroImage ? 0.72 : 1 }} />
        <div className="relative p-5 text-[#F1E8D2]">
          <h1 className="font-fraunces text-2xl sm:text-3xl font-semibold !text-[#FBF3E2]">{content.title}</h1>
          <p className="font-telugu text-sm opacity-90 !text-[#FBF3E2]">{content.nativeName}</p>
          <p className="text-sm opacity-90 mt-1.5 max-w-xl !text-[#FBF3E2]">{content.tagline}</p>
        </div>
      </div>

      <div className="flex gap-1.5 mb-6 border-b-[3px] border-[#C7A467] overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-b-0 border-[#C7A467] -mb-[3px] cursor-pointer ${
              tab === t.key ? 'bg-[#1F3B2E] text-white' : 'bg-[#EADFC4] text-[#1F3B2E] hover:bg-[#F6EFDE]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'history' && (
        // One vertical timeline: a spine in the section's colour on the left,
        // with a slim card per event beside it (picture as a thumbnail on the right).
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-[11px] w-[3px] rounded-full"
              style={{ background: `linear-gradient(to bottom, transparent, ${content.color} 6%, ${content.color} 94%, transparent)`, opacity: 0.45 }}
            />
            <ol className="relative space-y-3">
              {content.timeline.map((ev, i) => (
                <li
                  key={ev.id ?? i}
                  className="tl-item grid grid-cols-[26px_minmax(0,1fr)] gap-x-3 items-start"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* marker on the spine */}
                  <div className="flex justify-center pt-4">
                    <span
                      className="block w-4 h-4 rounded-full bg-[#FBF3E2] border-[3px] shadow-[0_0_0_4px_rgba(241,232,210,1)]"
                      style={{ borderColor: content.color }}
                    />
                  </div>

                  <article className="relative bg-[#F6EFDE] border border-[#C7A467]/70 rounded-xl shadow-[0_4px_14px_rgba(42,30,20,0.07)] p-3 sm:p-3.5 flex gap-3 sm:gap-4 items-start">
                    <div className="flex-1 min-w-0">
                      <span
                        className="inline-block max-w-full px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide text-[#FBF3E2] leading-snug"
                        style={{ backgroundColor: content.color }}
                      >
                        {ev.era}
                      </span>
                      <h4 className="font-fraunces text-base sm:text-[17px] font-bold text-[#1F3B2E] mt-1.5 mb-0.5">{ev.title}</h4>
                      <p className="text-[13px] text-[#2A241E] leading-relaxed">{ev.text}</p>
                    </div>
                    {/* whole picture as a thumbnail; a faint section motif when there's none */}
                    <div className="w-14 h-14 sm:w-24 sm:h-24 shrink-0 rounded-lg bg-[#EADFC4] border border-[#C7A467]/60 flex items-center justify-center overflow-hidden">
                      {ev.image
                        ? <img src={ev.image} alt="" className="max-w-full max-h-full object-contain" />
                        : <span aria-hidden="true" className="opacity-30">{SECTION_MOTIF[section]}</span>}
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>

          <FolkDivider className="my-5" />
          <div className="max-w-3xl mx-auto bg-[#F6EFDE] border border-[#C7A467]/70 rounded-xl px-4 py-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5142] mb-1.5">Sources</h4>
            <ul className="list-disc pl-5 space-y-0.5 text-[12px] text-[#5C5142] leading-relaxed">
              {content.sources.map((src, i) => <li key={i}>{src.title}</li>)}
            </ul>
          </div>
        </div>
      )}

      {tab === 'facts' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl">
          {content.funFacts.map((f, i) => (
            <div key={i} className="bg-[#F6EFDE] border border-[#C7A467]/70 rounded-xl p-4 flex gap-2">
              <Sparkles className="w-4 h-4 text-[#C4881F] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#2A241E] leading-relaxed">{f}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'library' && (
        <div className="space-y-7">
          {groups.map(group => {
            const items = practices.filter(p => p.category === group.key);
            if (items.length === 0) return null;
            return (
              <div key={group.key}>
                <h3 className="font-fraunces text-lg font-bold text-[#1F3B2E] mb-2.5">{group.label}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map(p => (
                    <PracticeCard
                      key={p.id}
                      practice={p}
                      locked={p.unlock_after_sessions > totalSessionsCompleted}
                      onClick={() => setSelected(p)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'heritage' && section === 'vyayam' && <HeritageCards />}

      {selected && (
        <PracticeDetailModal
          practice={selected}
          onClose={() => setSelected(null)}
          onStart={selected.unlock_after_sessions > totalSessionsCompleted ? undefined : () => onStartPractice(selected)}
        />
      )}
    </div>
  );
};
