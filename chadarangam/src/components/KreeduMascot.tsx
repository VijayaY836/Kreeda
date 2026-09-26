import React from 'react';
import { KreeduMood } from '../types';
import mascotSrc from '../assets/kreedu-mascot.png';

interface KreeduMascotProps {
  mood?: KreeduMood;
  size?: number;
  className?: string;
  showDialogBubble?: boolean;
  dialogText?: string;
}

export const KreeduMascot: React.FC<KreeduMascotProps> = ({
  mood = 'IDLE',
  size = 72,
  className = '',
  showDialogBubble = false,
  dialogText,
}) => {
  const getMoodBadge = () => {
    switch (mood) {
      case 'THINKING':
        return (
          <span className="absolute -top-1 -right-1 bg-[#EFA90C] text-[#2B1B12] border-[1.5px] border-[#5C140F] text-[10px] font-extrabold px-1 rounded-full animate-bounce shadow-sm">
            🤔
          </span>
        );
      case 'HAPPY':
      case 'WIN':
        return (
          <span className="absolute -top-1 -right-1 bg-[#5F8F3B] text-white border-[1.5px] border-[#5C140F] text-[10px] font-extrabold px-1 rounded-full animate-pulse shadow-sm">
            ✨
          </span>
        );
      case 'WORRIED':
      case 'LOSE':
        return (
          <span className="absolute -top-1 -right-1 bg-[#D9587B] text-white border-[1.5px] border-[#5C140F] text-[10px] font-extrabold px-1 rounded-full shadow-sm">
            😮
          </span>
        );
      default:
        return null;
    }
  };

  const getMoodAnimationClass = () => {
    switch (mood) {
      case 'THINKING':
        return 'animate-pulse scale-95';
      case 'HAPPY':
      case 'WIN':
        return 'animate-bounce';
      case 'WORRIED':
        return 'rotate-[-3deg] transition-transform';
      case 'LOSE':
        return 'opacity-80 transition-opacity';
      default:
        return 'transition-transform hover:scale-105';
    }
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {showDialogBubble && dialogText && (
        <div className="mb-2 relative bg-[#F6ECD2] border-2 border-[#5C140F] px-3 py-1 text-xs font-semibold text-[#2B1B12] text-center max-w-55 shadow-sm">
          {dialogText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#F6ECD2] border-r-2 border-b-2 border-[#5C140F] rotate-45" />
        </div>
      )}

      <div className="relative inline-block" style={{ width: size, height: size }}>
        <img
          src={mascotSrc}
          alt="Kreedu Mascot"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-contain drop-shadow-sm ${getMoodAnimationClass()}`}
          style={{ width: size, height: size }}
        />
        {getMoodBadge()}
      </div>
    </div>
  );
};
