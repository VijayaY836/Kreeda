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
      title: 'Known as Puli Meka, Aadu Puli Aatam, and Bagh-Chal',
      snippet: 'The same game across three South Asian cultures with their own names.',
      detail:
        'In Tamil Nadu and Andhra Pradesh, it is called Puli Meka Aata (పులి మేక ఆట). In Karnataka, it is Aadu Puli Aatam (ಆಡು ಪುಲಿ ಆಟಂ). In Nepal, the identical game is known as Bagh-Chal. Each region treasured this predator-prey drama for centuries.',
      icon: <Layers className="w-5 h-5 text-[#D8401F]" />,
      teluguTerm: 'జాతీయ ఆట',
    },
    {
      id: 2,
      factNumber: 'FACT 2',
      title: 'Three Tigers, Fifteen Goats',
      snippet: 'Asymmetry is the soul of the game — numbers versus intelligence.',
      detail:
        'The board has three tigers (Puli) starting at the apex and two points just below. Fifteen goats (Meka) start off-board and enter one by one. This 3-vs-15 ratio creates perfect strategic tension where outnumbered tigers must use superior mobility to overcome sheer numbers.',
      icon: <Hash className="w-5 h-5 text-[#0E5C58]" />,
      teluguTerm: '3 పులి, 15 మేక',
    },
    {
      id: 3,
      factNumber: 'FACT 3',
      title: 'Permanent Boards Carved in Stone',
      snippet: 'Visit Chamundi Hill, Mysore — boards are carved into temple stairs.',
      detail:
        'Puli Meka boards were carved permanently into stone temple floors and staircases. This indicates how deeply valued the game was in South Asian temple culture. The boards serve as permanent records of civilizational memory and strategic wisdom.',
      icon: <CowrieShellIcon size={24} className="text-[#5C140F]" />,
      teluguTerm: 'శిల ఆట పలక',
    },
    {
      id: 4,
      factNumber: 'FACT 4',
      title: 'Jump to Capture — No Alignment Needed',
      snippet: 'Tigers hunt by jumping over goats, not by alignment.',
      detail:
        'Puli (Tigers) capture by jumping over adjacent goats in a straight line, just like checkers. This creates a fundamentally different game of movement and tactical positioning. The captured goat is removed from the board immediately.',
      icon: <Shapes className="w-5 h-5 text-[#D8401F]" />,
      teluguTerm: 'దూకుట ఆట',
    },
    {
      id: 5,
      factNumber: 'FACT 5',
      title: 'Pure Strategy with Perfect Information',
      snippet: 'No randomness. No hidden cards. Only planning and positioning.',
      detail:
        'Like Chess and Go, Puli Meka is a game of complete information where both players see every piece. Victory depends entirely on foresight, tactical intelligence, and the ability to predict several moves ahead.',
      icon: <Dices className="w-5 h-5 text-[#EFA90C]" />,
      teluguTerm: 'పూర్తి వ్యూహం',
    },
    {
      id: 6,
      factNumber: 'FACT 6',
      title: 'An Ecological Metaphor in Gameplay',
      snippet: 'The game mirrors real predator-prey dynamics in nature.',
      detail:
        'Puli Meka captures the eternal ecological tension between a solitary predator and a cooperative prey herd. Tigers must be mobile and efficient; goats must be coordinated and defensive. The game asks: can numbers overcome skill? Can intelligence overcome collective strength?',
      icon: <Globe2 className="w-5 h-5 text-[#0E5C58]" />,
      teluguTerm: 'జీవ శాస్త్ర ఆట',
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
          Discover the folklore, language, and cultural wisdom behind Puli Meka
        </p>
        <FolkDivider className="my-3" />
      </div>

      {/* Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {facts.map((fact) => (
          <div
            key={fact.id}
            onClick={() => setSelectedFact(selectedFact === fact.id ? null : fact.id)}
            className="cursor-pointer transition-all hover:shadow-[4px_4px_0px_0px_rgba(92,20,15,0.3)]"
          >
            <FolkArtFrame bg="bg-[#E4D19E]">
            <div className="flex items-start gap-3 mb-2">
              {fact.icon}
              <div className="flex-1">
                <h4 className="font-fraunces text-xs font-bold uppercase text-[#D8401F] tracking-wide mb-0.5">
                  {fact.factNumber}
                </h4>
                <h3 className="font-fraunces text-lg font-bold text-[#5C140F]">
                  {fact.title}
                </h3>
              </div>
            </div>
            <p className="text-xs text-[#2B1B12] leading-relaxed mb-2">
              {fact.snippet}
            </p>
            {selectedFact === fact.id && (
              <div className="pt-2 border-t-[2px] border-[#5C140F] mt-2">
                <p className="text-xs text-[#2B1B12] leading-relaxed">
                  {fact.detail}
                </p>
                <p className="text-[10px] text-[#6B4E3D] italic mt-2">
                  {fact.teluguTerm}
                </p>
              </div>
            )}
            </FolkArtFrame>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <button
          onClick={() => onNavigate('MODE_SELECT')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D8401F] text-white border-[3px] border-[#5C140F] font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
        >
          Ready to play Puli Meka?
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
