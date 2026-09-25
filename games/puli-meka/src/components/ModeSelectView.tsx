import React, { useState } from 'react';
import { AIDifficulty, GameMode, GameVariant, ViewTab } from '../types';
import { BOARD_DEFS, Side, VARIANTS } from '../game/puliMekaEngine';
import { KolamCorner } from './FolkArtMotifs';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

type SetupStep = 'BOARD_SELECTION' | 'SIDE_SELECTION';

interface ModeSelectViewProps {
  onStartGame: (variant: GameVariant, mode: GameMode, side: Side, difficulty?: AIDifficulty) => void;
  onNavigate: (tab: ViewTab) => void;
}

const variantIds: GameVariant[] = ['puli_meka', 'bagh_chal'];

export const ModeSelectView: React.FC<ModeSelectViewProps> = ({ onStartGame, onNavigate }) => {
  const [step, setStep] = useState<SetupStep>('BOARD_SELECTION');
  const [variant, setVariant] = useState<GameVariant>('puli_meka');
  const [side, setSide] = useState<Side>('PULI');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('MEDIUM');
  const selectedVariant = VARIANTS[variant];

  const back = () => {
    if (step === 'BOARD_SELECTION') onNavigate('HOME');
    else setStep('BOARD_SELECTION');
  };

  const chooseDifficulty = (nextDifficulty: AIDifficulty) => {
    setDifficulty(nextDifficulty);
    onStartGame(variant, 'PVC', side, nextDifficulty);
  };

  const title = step === 'BOARD_SELECTION' ? 'Select Board' : 'Choose Your Side';
  const telugu = step === 'BOARD_SELECTION' ? 'ఆట బోర్డును ఎంచుకోండి' : 'మీ వైపు ఎంచుకోండి';

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {step === 'BOARD_SELECTION' ? (
        <div className="text-center mb-6">
          <h1 className="font-fraunces font-extrabold text-3xl sm:text-4xl text-[#5C140F]">Select Game</h1>
        </div>
      ) : (
        <div className="text-center mb-8">
          <button type="button" onClick={back} className="block mx-auto text-sm font-bold text-[#5C140F] hover:underline mb-5"><ArrowLeft className="inline w-4 h-4 mr-1" />Back to game select</button>
          <div className="bg-[#0E5C58] border-[4px] border-[#5C140F] rounded-[16px] text-[#EFDFB8] py-8 px-4">
            <h1 className="font-fraunces font-extrabold text-3xl sm:text-4xl mb-2">{selectedVariant.name}</h1>
            <p className="text-base sm:text-lg">{selectedVariant.tagline} — {selectedVariant.blurb}</p>
          </div>
        </div>
      )}

      {step === 'BOARD_SELECTION' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">{variantIds.map((id) => { const item = VARIANTS[id]; return <button type="button" key={id} onClick={() => { setVariant(id); setStep('SIDE_SELECTION'); }} className="text-center bg-[#E4D19E] border-[4px] border-[#5C140F] rounded-[16px] p-5 sm:p-6 cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#5C140F]"><BoardPreview variant={id} /><h2 className="font-fraunces font-extrabold text-2xl sm:text-3xl text-[#5C140F] mt-4 mb-2">{item.name}</h2><p className="text-base font-bold text-[#D8401F] mb-2">{item.blurb}</p><p className="text-base text-[#6B4E3D]">{item.tagline}</p></button>; })}</div>}

      {step === 'SIDE_SELECTION' && <><h2 className="font-fraunces font-extrabold text-2xl text-center text-[#5C140F] mb-4">Choose Your Side</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8"><SideCard image="./tiger_face.png" title={variant === 'puli_meka' ? 'PULI' : 'TIGERS'} subtitle={`Play as the ${variant === 'puli_meka' ? 'PULI' : 'TIGERS'}`} selected={side === 'PULI'} onClick={() => setSide('PULI')} /><SideCard image="./goat_face.png" title={variant === 'puli_meka' ? 'MEKA' : 'GOATS'} subtitle={`Play as the ${variant === 'puli_meka' ? 'MEKA' : 'GOATS'}`} selected={side === 'MEKA'} onClick={() => setSide('MEKA')} /></div><h2 className="font-fraunces font-bold text-xl text-center text-[#5C140F] mb-4">Kreedu's Difficulty</h2><div className="flex justify-center gap-3 mb-7"><DifficultyButton title="Easy" selected={difficulty === 'EASY'} onClick={() => setDifficulty('EASY')} /><DifficultyButton title="Medium" selected={difficulty === 'MEDIUM'} onClick={() => setDifficulty('MEDIUM')} /><DifficultyButton title="Hard" selected={difficulty === 'HARD'} onClick={() => setDifficulty('HARD')} /></div><button type="button" onClick={() => onStartGame(variant, 'PVC', side, difficulty)} className="block mx-auto w-full max-w-sm py-4 bg-[#D8401F] text-[#EFDFB8] border-[3px] border-[#5C140F] rounded-[12px] font-fraunces font-bold text-xl hover:opacity-90">Begin Game</button></>}

      {step === 'BOARD_SELECTION' && <div className="flex justify-end text-xs font-bold text-[#5C140F]"><button type="button" onClick={() => onNavigate('HOW_TO_PLAY')} className="inline-flex items-center gap-1.5 hover:text-[#D8401F]"><BookOpen className="w-4 h-4" /> Read Game Rules</button></div>}
    </div>
  );
};

const BoardPreview: React.FC<{ variant: GameVariant }> = ({ variant }) => {
  const definition = BOARD_DEFS[variant];
  const nodes = Object.entries(definition.nodes) as [string, { x: number; y: number }][];
  const segments = definition.lines.flatMap((line) => line.slice(0, -1).map((node, index) => ({
    from: definition.nodes[node],
    to: definition.nodes[line[index + 1]],
  })));

  return (
    <div className="w-full aspect-[1.55] max-h-[320px] flex items-center justify-center bg-[#E4D19E] overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-full h-full" aria-label={`${VARIANTS[variant].name} board preview`}>
        <g stroke="#9E765C" strokeWidth="1.05" strokeLinecap="round" opacity="0.95">
          {segments.map((segment, index) => <line key={`preview-line-${index}`} x1={segment.from.x} y1={segment.from.y} x2={segment.to.x} y2={segment.to.y} />)}
        </g>
        <g fill="#7D4938">
          {nodes.map(([node, position]) => <circle key={node} cx={position.x} cy={position.y} r="1.65" />)}
        </g>
      </svg>
    </div>
  );
};

const SideCard: React.FC<{ image: string; title: string; subtitle: string; selected: boolean; onClick: () => void }> = ({ image, title, subtitle, selected, onClick }) => <button type="button" onClick={onClick} className={`bg-[#E4D19E] border-[4px] ${selected ? 'border-[#D8401F] ring-2 ring-[#D8401F]/40' : 'border-[#5C140F]'} rounded-[16px] p-5 cursor-pointer hover:-translate-y-1 transition-all`}><div className="h-36 sm:h-44 flex items-center justify-center overflow-hidden"><img src={image} alt={`${title} face`} className="h-full w-full object-contain" /></div><h2 className="font-fraunces font-extrabold text-2xl text-[#5C140F]">{title}</h2><p className="text-base text-[#6B4E3D]">{subtitle}</p></button>;

const DifficultyButton: React.FC<{ title: string; selected: boolean; onClick: () => void }> = ({ title, selected, onClick }) => <button type="button" onClick={onClick} className={`px-6 py-3 border-[3px] border-[#5C140F] rounded-[12px] font-bold text-base ${selected ? 'bg-[#D8401F] text-white' : 'bg-[#EFDFB8] text-[#5C140F]'} hover:opacity-90`}>{title}</button>;
