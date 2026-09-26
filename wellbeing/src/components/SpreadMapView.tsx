import React, { useState } from 'react';
import { MapPin, SectionContent } from '../types';
import { useEscapeToClose } from '../hooks/useEscapeToClose';
import { X } from 'lucide-react';

interface SpreadMapViewProps {
  content: SectionContent;
}

export const SpreadMapView: React.FC<SpreadMapViewProps> = ({ content }) => {
  const [active, setActive] = useState<MapPin | null>(null);
  useEscapeToClose(() => setActive(null));

  const pathD = content.mapPath && content.pins.length > 1
    ? `M ${content.pins.map(p => `${p.x} ${p.y}`).join(' L ')}`
    : null;

  return (
    <div>
      <p className="text-[13px] font-semibold text-[#5C5142] mb-3">Tap a pin to read its story.</p>
      <div
        className="relative h-[320px] sm:h-[360px] border border-[#C7A467]/70 rounded-2xl shadow-[0_8px_24px_rgba(42,30,20,0.10)] overflow-hidden bg-kolam-dots"
        style={{ backgroundColor: content.color }}
      >
        {pathD && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={pathD} fill="none" stroke="#FBF3E2" strokeWidth="0.6" strokeDasharray="1.2 2" strokeLinecap="round" opacity={0.85} />
          </svg>
        )}
        {content.pins.map(pin => (
          <button
            key={pin.id}
            onClick={() => setActive(pin)}
            className="absolute w-6 h-6 -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-115"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            aria-label={pin.place}
          >
            <svg viewBox="0 0 24 32">
              <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 8 10.5 18 10.5 18s10.5-10 10.5-18c0-5.8-4.7-10.5-10.5-10.5z" fill="#C4881F" stroke="#1F3B2E" strokeWidth="2.4" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="4" fill="#F1E8D2" stroke="#1F3B2E" strokeWidth="1.6" />
            </svg>
          </button>
        ))}
        <div className="absolute bottom-2.5 left-3.5 text-[#F1E8D2] text-[11px] font-bold">{content.mapCaption}</div>
      </div>

      {active && (
        <div className="fixed inset-0 z-50 bg-[#2A241E]/55 flex items-center justify-center p-5" onClick={() => setActive(null)}>
          <div className="bg-[#F1E8D2] border border-[#C7A467]/70 rounded-2xl shadow-[0_8px_24px_rgba(42,30,20,0.10)] max-w-sm w-full relative overflow-hidden" onClick={e => e.stopPropagation()}>
            {active.image && (
              <div className="relative h-36 w-full border-b-[3px] border-[#C7A467]">
                <img src={active.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <button
              onClick={() => setActive(null)}
              className={`absolute top-4 right-4 p-1 text-[#1F3B2E] cursor-pointer ${active.image ? 'bg-[#F1E8D2]/90 border border-[#C7A467]' : ''}`}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1F3B2E] mb-1">{active.place}</div>
              <h3 className="font-fraunces text-xl font-semibold text-[#1F3B2E] mb-2">{active.name}</h3>
              <p className="text-sm text-[#2A241E] leading-relaxed mb-2.5">{active.fact}</p>
              <div className="text-xs text-[#5C5142] font-semibold border-t-2 border-dashed border-[#C7A467] pt-2.5">{active.how}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
