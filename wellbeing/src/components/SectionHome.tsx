import React, { useMemo, useState } from 'react';
import { Section, Practice } from '../types';
import { SECTION_CONTENT } from '../data/sectionContent';
import { practicesBySection, LIBRARY_GROUPS } from '../data/practices';
import { PracticeCard } from './PracticeCard';
import { PracticeDetailModal } from './PracticeDetailModal';
import { SpreadMapView } from './SpreadMapView';
import { HeritageCards } from './HeritageCards';
import { FolkDivider } from './FolkArtMotifs';
import { ArrowLeft, Sparkles } from 'lucide-react';

type Tab = 'history' | 'facts' | 'library' | 'heritage' | 'map';

interface SectionHomeProps {
  section: Section;
  totalSessionsCompleted: number;
  onBack: () => void;
}

export const SectionHome: React.FC<SectionHomeProps> = ({ section, totalSessionsCompleted, onBack }) => {
  const [tab, setTab] = useState<Tab>('history');
  const [selected, setSelected] = useState<Practice | null>(null);
  const content = SECTION_CONTENT[section];
  const practices = useMemo(() => practicesBySection(section), [section]);
  const groups = LIBRARY_GROUPS[section];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'history', label: 'History' },
    { key: 'facts', label: 'Fun Facts' },
    { key: 'library', label: 'Library' },
    ...(section === 'vyayam' ? [{ key: 'heritage' as Tab, label: 'Heritage' }] : []),
    { key: 'map', label: 'Spread Map' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 wb-fade-in">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[#1F3B2E] font-bold text-sm mb-4 cursor-pointer hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Physical Wellbeing
      </button>

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
        <div className="space-y-4 max-w-2xl">
          {content.timeline.map((ev, i) => (
            <div key={ev.id ?? i} className="flex gap-3">
              <div className="w-24 shrink-0 text-right text-[11px] font-semibold text-[#1F3B2E] pt-0.5">{ev.era}</div>
              <div className="flex-1 border-l-2 border-[#C7A467]/40 pl-4 pb-4 flex gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-fraunces font-bold text-[#1F3B2E]">{ev.title}</h4>
                  <p className="text-[13.5px] text-[#2A241E] leading-relaxed">{ev.text}</p>
                </div>
                {ev.image && (
                  <img src={ev.image} alt="" className="w-16 h-16 shrink-0 object-cover border border-[#C7A467]/70 rounded-xl" />
                )}
              </div>
            </div>
          ))}
          <FolkDivider />
          <p className="text-[11px] text-[#5C5142]">Sources: {content.sources.map(s => s.title).join('; ')}</p>
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

      {tab === 'map' && <SpreadMapView content={content} />}

      {selected && <PracticeDetailModal practice={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};
