import React from 'react';
import { HERITAGE_CARDS } from '../data/sectionContent';
import { ShieldAlert } from 'lucide-react';

export const HeritageCards: React.FC = () => {
  return (
    <div>
      <p className="text-[13px] text-[#5C5142] font-semibold mb-4 max-w-2xl">
        These heritage practices are part of Vyayam's living tradition, but they need equipment or a supervising coach
        to learn safely — so they're presented here as content only and are never added to a personal plan.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {HERITAGE_CARDS.map(card => (
          <div key={card.id} className="bg-[#F6EFDE] border border-[#C7A467]/70 rounded-xl flex overflow-hidden">
            <div className="w-32 shrink-0 bg-[#EADFC4] border-r-2 border-[#C7A467] p-2">
              {card.image && <img src={card.image} alt="" className="w-full h-full object-contain" />}
            </div>
            <div className="p-4 min-w-0">
              <h4 className="font-fraunces text-base font-bold text-[#1F3B2E]">{card.name}</h4>
              <p className="text-[11.5px] text-[#5C5142] font-semibold mb-2">{card.name_english}</p>
              <p className="text-[13px] text-[#2A241E] leading-relaxed mb-2.5">{card.blurb}</p>
              <div className="flex items-start gap-1.5 text-[11.5px] text-[#1F3B2E] font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{card.why_not_in_plan}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
