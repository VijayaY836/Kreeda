import React from 'react';
import { ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, LotusIcon } from './FolkArtMotifs';
import { ArrowRight, BookOpen, Scroll, Landmark, Globe } from 'lucide-react';

interface HistoryViewProps {
  onNavigate: (tab: ViewTab) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1 mb-2 text-xs uppercase font-bold tracking-widest text-[#5C140F]">
          <LotusIcon size={18} color="#D8401F" />
          Archaeology & Antiquity
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-fraunces text-[#5C140F] mb-1">
          THE STORY OF THE GAME
        </h2>
        <p className="font-fraunces italic text-base sm:text-lg text-[#6B4E3D]">
          Tracing the ancient lineage of alignment games across civilizations
        </p>
        <FolkDivider className="my-3" />
      </div>

      {/* Honest Cultural Narrative */}
      <div className="space-y-6">
        
        {/* Core Evidence-Based Perspective */}
        <FolkArtFrame bg="bg-[#F6ECD2]">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-[#0E5C58]" />
            <h3 className="font-fraunces text-2xl font-bold text-[#5C140F]">
              A Shared Human Heritage of Alignment
            </h3>
          </div>
          <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
            Games based on the simple, elegant principle of forming aligned groups of three or more counters belong to humanity’s oldest recreational inventions. Archaeologists and game historians recognize that the wider <em>mill-game</em> family transcends any single border.
          </p>
          <div className="p-4 bg-[#E4D19E] border-[2px] border-[#5C140F] mb-3">
            <p className="font-fraunces italic text-sm text-[#5C140F] leading-relaxed">
              “The exact origin of the wider mill-game family is difficult to assign to a single civilization. Similar geometric forms appear independently or through trade in multiple historical traditions across Africa, Asia, and Europe.”
            </p>
          </div>
          <p className="text-sm text-[#2B1B12] leading-relaxed">
            Rather than claiming a mythical single point of origin, the true wonder of Daadi Aata lies in how it was adopted, cherished, and transmitted through generations of Indian domestic and temple life.
          </p>
        </FolkArtFrame>

        {/* Global Parallels Timeline Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FolkArtFrame bg="bg-[#F6ECD2]">
            <div className="flex items-center gap-2 text-[#D8401F] mb-2">
              <Landmark className="w-4 h-4" />
              <h4 className="font-fraunces text-lg font-bold text-[#5C140F]">
                Indian Heritage
              </h4>
            </div>
            <p className="text-xs text-[#5C140F] font-bold mb-1">
              Navakankari / Saalu Mane Aata / Daadi
            </p>
            <p className="text-xs text-[#2B1B12] leading-relaxed">
              Carved directly onto stone floors of medieval South Indian temples (such as Hampi, Belur, and Halebidu) and etched on village stone platforms.
            </p>
          </FolkArtFrame>

          <FolkArtFrame bg="bg-[#F6ECD2]">
            <div className="flex items-center gap-2 text-[#EFA90C] mb-2">
              <Scroll className="w-4 h-4 text-[#D8401F]" />
              <h4 className="font-fraunces text-lg font-bold text-[#5C140F]">
                Mediterranean & Near East
              </h4>
            </div>
            <p className="text-xs text-[#5C140F] font-bold mb-1">
              Merels & Ancient Roman Lines
            </p>
            <p className="text-xs text-[#2B1B12] leading-relaxed">
              Similar concentric square patterns were etched onto the roofing slabs of the Kurna temple in Egypt and into stone steps of the Roman Forum.
            </p>
          </FolkArtFrame>

          <FolkArtFrame bg="bg-[#F6ECD2]">
            <div className="flex items-center gap-2 text-[#0E5C58] mb-2">
              <BookOpen className="w-4 h-4" />
              <h4 className="font-fraunces text-lg font-bold text-[#5C140F]">
                Medieval Traditions
              </h4>
            </div>
            <p className="text-xs text-[#5C140F] font-bold mb-1">
              Nine Men’s Morris
            </p>
            <p className="text-xs text-[#2B1B12] leading-relaxed">
              Popularized across medieval Europe and documented in King Alfonso X of Castile’s 1283 CE manuscript <em>Libro de los juegos</em> (Book of Games).
            </p>
          </FolkArtFrame>
        </div>

        {/* The Indian Context: Living Memory */}
        <FolkArtFrame bg="bg-[#F6ECD2]">
          <h3 className="font-fraunces text-2xl font-bold text-[#5C140F] mb-3">
            Preserving Daadi Aata in Indian Culture
          </h3>
          <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
            In Andhra Pradesh, Telangana, Karnataka, and Tamil Nadu, traditional games like Daadi Aata flourished as an essential social fabric during festivals like Sankranti / Pongal and quiet monsoon afternoons.
          </p>
          <p className="text-sm text-[#2B1B12] leading-relaxed mb-4">
            Mothers and grandmothers passed down the rules orally to children, using tamarind seeds (chintapikkalu) and small colored glass bangles or stones. The game instilled calculation, respect for turns, and the joy of mental duel without needing expensive equipment.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-[2px] border-[#5C140F]">
            <button
              onClick={() => onNavigate('FACTS')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D19E] hover:bg-[#FAF4E5] border-[2px] border-[#5C140F] text-xs font-bold text-[#2B1B12] uppercase cursor-pointer"
            >
              Explore Fun Facts
              <ArrowRight className="w-3.5 h-3.5 text-[#5C140F]" />
            </button>

            <button
              onClick={() => onNavigate('HOW_TO_PLAY')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D8401F] hover:bg-[#B83215] border-[2px] border-[#5C140F] text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
            >
              Learn the Rules
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </FolkArtFrame>

      </div>
    </div>
  );
};
