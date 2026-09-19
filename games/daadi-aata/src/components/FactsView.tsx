import React, { useState } from 'react';
import { ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, CowrieShellIcon } from './FolkArtMotifs';
import { Sparkles, ArrowRight, Hash, Layers, Dices, Globe2, Shapes } from 'lucide-react';

interface FactsViewProps {
  onNavigate: (tab: ViewTab) => void;
}

interface FactItem {
  id: number;
  factNumber: string;
  title: string;
  snippet: string;
  detail: string;
  icon: React.ReactNode;
  teluguTerm: string;
}

export const FactsView: React.FC<FactsViewProps> = ({ onNavigate }) => {
  const [selectedFact, setSelectedFact] = useState<number | null>(null);

  const facts: FactItem[] = [
    {
      id: 1,
      factNumber: 'FACT 1',
      title: 'Known by Several Regional Names',
      snippet: 'From Daadi in Telugu to Saalu Mane Aata in Kannada and Navakankari in Sanskrit.',
      detail:
        'In Andhra & Telangana, it is famous as Daadi Aata (దాడి ఆట). In Karnataka, it is called Saalu Mane Aata (సాలు ಮನೆ ಆಟ — meaning "Line House Game"). In Marathi and Hindi regions, related forms are known as Char Bhar or Nau Kankari.',
      icon: <Layers className="w-5 h-5 text-[#D8401F]" />,
      teluguTerm: 'ప్రాంతీయ పేర్లు',
    },
    {
      id: 2,
      factNumber: 'FACT 2',
      title: 'The Meaning of "Navakankari"',
      snippet: 'The classical name translates literally to "Nine Pebbles".',
      detail:
        'The Sanskrit root "Nava" means Nine, and "Kankari" refers to small rounded pebbles or stones. This reflects the 9 pieces each player controls on the 24-point board.',
      icon: <Hash className="w-5 h-5 text-[#0E5C58]" />,
      teluguTerm: 'నవకంకరి (తొమ్మిది రాళ్లు)',
    },
    {
      id: 3,
      factNumber: 'FACT 3',
      title: 'Played with Simple Natural Objects',
      snippet: 'Ancient players needed nothing more than ground dust and seeds.',
      detail:
        'No costly boards were needed. Villagers drew lines on temple steps with chalk or charcoal and used dried tamarind seeds (chintapikkalu), polished river pebbles, or broken earthen pot shards as playing tokens.',
      icon: <CowrieShellIcon size={24} className="text-[#5C140F]" />,
      teluguTerm: 'సహజ వస్తువులు',
    },
    {
      id: 4,
      factNumber: 'FACT 4',
      title: 'A Line of Three is Called a "Daadi"',
      snippet: 'Aligning 3 pieces triggers the power to strike an opponent counter.',
      detail:
        'In Telugu board game tradition, completing the three-in-a-row alignment is called forming a "Daadi" (దాడి) or "Gudu". This grants you the privilege of capturing and banishing an enemy piece from the battlefield.',
      icon: <Shapes className="w-5 h-5 text-[#D8401F]" />,
      teluguTerm: 'మూడు వరుస దాడి',
    },
    {
      id: 5,
      factNumber: 'FACT 5',
      title: 'Pure Strategy with Zero Luck',
      snippet: 'There are no dice, spinners, or hidden cards in Daadi Aata.',
      detail:
        'Like Chess, Go, and Chaturanga, Daadi Aata is a game of deterministic, perfect information. Every piece is visible, and the outcome is determined solely by foresight, positioning, and tactical trap creation.',
      icon: <Dices className="w-5 h-5 text-[#EFA90C]" />,
      teluguTerm: 'పూర్తి వ్యూహం',
    },
    {
      id: 6,
      factNumber: 'FACT 6',
      title: 'Worldwide Ancient Parallels',
      snippet: 'Mill games share geometric echoes across ancient continents.',
      detail:
        'Historical variants of the three concentric squares appear in ancient Egypt, the Roman Empire, medieval Europe (Nine Men’s Morris), and across the Silk Route, demonstrating humanity’s universal fascination with geometric alignment.',
      icon: <Globe2 className="w-5 h-5 text-[#0E5C58]" />,
      teluguTerm: 'ప్రపంచ సంస్కృతి',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Title Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1 mb-2 text-xs uppercase font-bold tracking-widest text-[#5C140F]">
          <Sparkles className="w-4 h-4 text-[#EFA90C]" />
          Did You Know?
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-fraunces text-[#5C140F] mb-1">
          FASCINATING FACTS
        </h2>
        <p className="font-fraunces italic text-base sm:text-lg text-[#6B4E3D]">
          Discover the folklore, language, and cultural wisdom behind Daadi Aata
        </p>
        <FolkDivider className="my-3" />
      </div>

      {/* 6 Interactive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {facts.map((fact) => {
          const isExpanded = selectedFact === fact.id;
          return (
            <div
              key={`fact-${fact.id}`}
              onClick={() => setSelectedFact(isExpanded ? null : fact.id)}
              className="cursor-pointer transition-transform hover:-translate-y-1"
            >
              <FolkArtFrame
                bg="bg-[#F6ECD2]"
                className="h-full flex flex-col justify-between border-[3px] border-[#5C140F]"
              >
                <div>
                  {/* Top tag & icon */}
                  <div className="flex items-center justify-between border-b-[2px] border-[#5C140F] pb-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D8401F]">
                      {fact.factNumber}
                    </span>
                    <div className="p-1.5 bg-[#E4D19E] border-[1.5px] border-[#5C140F]">
                      {fact.icon}
                    </div>
                  </div>

                  <h3 className="font-fraunces text-lg font-bold text-[#5C140F] mb-1">
                    {fact.title}
                  </h3>
                  <div className="font-telugu text-xs font-bold text-[#D8401F] mb-2">
                    {fact.teluguTerm}
                  </div>

                  <p className="text-xs text-[#2B1B12] leading-relaxed mb-3">
                    {fact.snippet}
                  </p>

                  {/* Expandable detail */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t-[1.5px] border-[#5C140F] text-xs text-[#2B1B12] leading-relaxed bg-[#E4D19E] p-2.5 border-[1px]">
                      {fact.detail}
                    </div>
                  )}
                </div>

                <div className="pt-2 mt-2 flex items-center justify-between text-[11px] font-bold text-[#D8401F]">
                  <span>{isExpanded ? 'Show Less' : 'Tap to Read More'}</span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </FolkArtFrame>
            </div>
          );
        })}
      </div>

      {/* Navigation footer */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => onNavigate('HOW_TO_PLAY')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D8401F] hover:bg-[#B83215] border-[3px] border-[#5C140F] text-sm font-bold text-white uppercase tracking-wider cursor-pointer"
        >
          Master the Rules (How to Play)
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
