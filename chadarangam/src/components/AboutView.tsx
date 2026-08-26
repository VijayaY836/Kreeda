import React from 'react';
import { ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, ChariotWheelIcon } from './FolkArtMotifs';
import { KreeduMascot } from './KreeduMascot';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (tab: ViewTab) => void;
}

const VARIANT_ROWS: [string, string, string][] = [
  ['Queen-equivalent', 'Mantri — one square diagonally', 'Queen — any distance, any direction'],
  ['Bishop-equivalent', 'Gaja — leaps exactly two squares diagonally', 'Bishop — slides the full diagonal'],
  ['Pawn', 'No two-square first move → no en passant', 'Two-square first move → en passant possible'],
  ['Promotion', 'Padati → Mantri only', 'Pawn → player\'s choice of piece'],
  ['Castling', 'None', 'Both sides, kingside/queenside'],
  ['Stalemate', 'Win for the side that caused it', 'Draw'],
  ['Bare king (all other pieces captured)', 'Win (draw if the reply can bare you too)', 'Not a rule'],
];

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <KreeduMascot mood="IDLE" size={64} />
        </div>
        <h1 className="font-fraunces font-extrabold text-3xl sm:text-4xl text-[#5C140F] mb-1">Four Limbs of an Army</h1>
        <p className="font-telugu text-base font-bold text-[#D9587B]">చతురంగం · चतुरङ्ग</p>
      </div>

      <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 sm:p-7 mb-6">
        <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
          <em>Chatur-anga</em> means "four limbs" — the four divisions of a Gupta-era army: foot soldiers, horses, war
          elephants and chariots, all serving a king and his counsellor. The game turns that battle order into a board.
        </p>
        <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
          It appears in Indian texts from around the 6th century CE. From India it travelled west into Persia as{' '}
          <em>Shatranj</em> — where the cry <em>shah mat</em>, "the king is helpless", became our word checkmate — then
          through the Islamic world into Spain and Italy, where 15th-century players gave the queen and bishop their
          modern powers. A separate branch went east and became Xiangqi and Shogi.
        </p>
        <div className="p-3 bg-[#E4D19E] border-[2px] border-[#5C140F] text-xs text-[#2B1B12] mb-4">
          In Telugu it is <strong>చతురంగం (Chaturangam)</strong>; you will also hear <strong>Chadarangam</strong>. Switch to{' '}
          <strong>Chess</strong> from Play Game to try the far end of that journey on the same board.
        </div>
        <h4 className="font-fraunces font-bold text-sm text-[#5C140F] mb-1">An honest note</h4>
        <p className="text-xs text-[#6B4E3D] leading-relaxed">
          No complete rulebook survives from Gupta India. The moves here follow the standard reconstruction — the same
          one Shatranj used, which is the closest thing to direct evidence we have. The Gaja is the piece historians
          argue about most; some regional versions moved it differently. And no cross belongs on the Raja's turban — the
          Christian-iconography cross only enters the piece's history with the later European Staunton design.
        </p>
      </FolkArtFrame>

      <FolkDivider className="mb-6" />

      <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 sm:p-7 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ChariotWheelIcon size={20} color="#D8401F" />
          <h3 className="font-fraunces font-bold text-lg text-[#5C140F]">Chaturangam vs. Chess — at a glance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#5C140F] text-white">
                <th className="p-2 text-left font-bold">&nbsp;</th>
                <th className="p-2 text-left font-bold">Chaturangam</th>
                <th className="p-2 text-left font-bold">Chess</th>
              </tr>
            </thead>
            <tbody>
              {VARIANT_ROWS.map(([label, chat, chess], idx) => (
                <tr key={label} className={idx % 2 === 0 ? 'bg-[#E4D19E]' : 'bg-[#F6ECD2]'}>
                  <td className="p-2 font-bold text-[#5C140F] border-t-[1px] border-[#5C140F]/30">{label}</td>
                  <td className="p-2 text-[#2B1B12] border-t-[1px] border-[#5C140F]/30">{chat}</td>
                  <td className="p-2 text-[#2B1B12] border-t-[1px] border-[#5C140F]/30">{chess}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FolkArtFrame>

      <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 sm:p-7 mb-6">
        <h3 className="font-fraunces font-bold text-lg text-[#5C140F] mb-2">Credits</h3>
        <p className="text-xs text-[#6B4E3D] leading-relaxed">
          Chess piece artwork: <strong>Cburnett</strong> (Colin M. L. Burnett) via Wikimedia Commons,{' '}
          <em>Category:SVG chess pieces</em>, CC BY-SA 3.0 / GFDL. Everything else — the search engine, Chaturangam
          artwork, and this interface — is original work for the KREEDA project.
        </p>
      </FolkArtFrame>

      <div className="text-center flex flex-wrap justify-center gap-4">
        <button onClick={() => onNavigate('MODE_SELECT')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#D8401F] text-white border-[2px] border-[#5C140F] text-xs font-bold uppercase cursor-pointer">
          <span>Play Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onNavigate('HOME')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#F6ECD2] hover:bg-white border-[2px] border-[#5C140F] text-xs font-bold text-[#5C140F] uppercase cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
};
