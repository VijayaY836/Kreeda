import React from 'react';
import { ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, LotusIcon } from './FolkArtMotifs';
import { ArrowRight, BookOpen, Scroll, Landmark, Globe, MapPin } from 'lucide-react';

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
          THE HUNT ACROSS TIME
        </h2>
        <p className="font-fraunces italic text-base sm:text-lg text-[#6B4E3D]">
          Following Puli Meka's journey across South Asia
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
              An Ancient Game of Predator & Prey
            </h3>
          </div>
          <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
            Puli Meka (పులి మేక — Tiger and Goat) represents one of humanity's oldest strategic games, combining the thrill of a hunt with the defensive genius of coordinated prey. Unlike alignment games, Puli Meka models an eternal ecological story: the tension between a small, powerful predator and a large herd fighting for survival.
          </p>
          <div className="p-4 bg-[#E4D19E] border-[2px] border-[#5C140F] mb-3">
            <p className="font-fraunces italic text-sm text-[#5C140F] leading-relaxed">
              "Puli Meka belongs to a family of hunt-games found across Asia, particularly in South Asia where it was carved onto temple floors and played on village courtyards for centuries."
            </p>
          </div>
          <p className="text-sm text-[#2B1B12] leading-relaxed">
            The game's presence on permanent temple boards suggests both its antiquity and its cultural significance — games worth preserving in stone were treasured by communities.
          </p>
        </FolkArtFrame>

        {/* Regional Variants Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FolkArtFrame bg="bg-[#F6ECD2]">
            <div className="flex items-center gap-2 text-[#D8401F] mb-2">
              <MapPin className="w-4 h-4" />
              <h4 className="font-fraunces text-lg font-bold text-[#5C140F]">
                Andhra Pradesh & Telangana
              </h4>
            </div>
            <p className="text-xs text-[#5C140F] font-bold mb-1">
              Puli Meka / Meka Puli
            </p>
            <p className="text-xs text-[#2B1B12] leading-relaxed">
              Known in Telugu-speaking regions. Stone boards found at Chamundi Hill, Mysore, and temple courtyards across the Deccan region.</p>
          </FolkArtFrame>

          <FolkArtFrame bg="bg-[#F6ECD2]">
            <div className="flex items-center gap-2 text-[#EFA90C] mb-2">
              <Landmark className="w-4 h-4" />
              <h4 className="font-fraunces text-lg font-bold text-[#5C140F]">
                Tamil Nadu & Karnataka
              </h4>
            </div>
            <p className="text-xs text-[#5C140F] font-bold mb-1">
              Aadu Puli Aatam / Puli Aatta
            </p>
            <p className="text-xs text-[#2B1B12] leading-relaxed">
              Tamil variant meaning "Goat-Tiger Game." Played during Pongal celebrations and monsoon afternoons in village courtyards.</p>
          </FolkArtFrame>

          <FolkArtFrame bg="bg-[#F6ECD2]">
            <div className="flex items-center gap-2 text-[#0E5C58] mb-2">
              <BookOpen className="w-4 h-4" />
              <h4 className="font-fraunces text-lg font-bold text-[#5C140F]">
                Nepal & Himalayas
              </h4>
            </div>
            <p className="text-xs text-[#5C140F] font-bold mb-1">
              Bagh-Chal / Baag-Chal
            </p>
            <p className="text-xs text-[#2B1B12] leading-relaxed">
              Nepali version meaning "Tiger Game." Extremely popular in Nepali culture and still played competitively today.</p>
          </FolkArtFrame>
        </div>

        {/* Temple Boards & Permanence */}
        <FolkArtFrame bg="bg-[#F6ECD2]">
          <h3 className="font-fraunces text-2xl font-bold text-[#5C140F] mb-3">
            Sacred Stones & Permanent Boards
          </h3>
          <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
            Puli Meka boards are carved directly into the stone floors of temples, particularly in South India. These permanent boards reveal the game's sacred place in Indian culture — games important enough to carve into sacred spaces deserved to endure forever.
          </p>
          <p className="text-sm text-[#2B1B12] leading-relaxed mb-4">
            The most famous example is the board carved into the temple stairs at Chamundi Hill in Mysore, Karnataka, where the board has survived centuries of pilgrims ascending to worship Chamundeshwari Devi. Similar boards appear at Hampi and other temple complexes across the Deccan.
          </p>

          <div className="p-3 bg-[#E4D19E] border-[2px] border-[#5C140F] mb-3">
            <p className="text-xs text-[#5C140F] font-bold mb-1">WHY STONE BOARDS MATTER</p>
            <p className="text-xs text-[#2B1B12]">A game carved into a temple floor is a testament to cultural permanence. It means the community valued this game so deeply that they invested in making it last beyond any single lifetime.</p>
          </div>
        </FolkArtFrame>

        {/* Living Tradition */}
        <FolkArtFrame bg="bg-[#F6ECD2]">
          <h3 className="font-fraunces text-2xl font-bold text-[#5C140F] mb-3">
            A Living Tradition Today
          </h3>
          <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
            Today, Puli Meka remains most popular in Nepal, where Bagh-Chal tournaments are held and played by schoolchildren and adults alike. In South India, the game survives primarily in memory and through scattered stone boards, though communities are working to revive these games during festivals.
          </p>
          <p className="text-sm text-[#2B1B12] leading-relaxed mb-4">
            The game endures because it teaches something timeless: strategy, patience, perspective, and the eternal dance between predator and prey. Every culture recognizes this story.
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
