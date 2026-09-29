import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SectionCardProps {
  label: string;
  // 'full' fills the screen (sections, plan); 'compact' sizes to its content (mood)
  size?: 'full' | 'compact';
  onClose: () => void;
  children: React.ReactNode;
}

/* A card over the Exercises page (a Yoga / Vyayam / Dhyana section, Today's
   Plan or the Mood log) instead of a separate page. The section's own pop-ups (practice details, the
   spread map) are fixed to the screen, so they still cover everything. */
export const SectionCard: React.FC<SectionCardProps> = ({ label, size = 'full', onClose, children }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const returnFocus = document.activeElement as HTMLElement | null;
    cardRef.current?.focus();
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // the page behind stays put
    const onKey = (e: KeyboardEvent) => {
      // Escape closes a pop-up inside the section first; only then the card
      if (e.key === 'Escape' && !cardRef.current?.querySelector('.fixed')) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = bodyOverflow;
      returnFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 bg-[#2A241E]/45 flex items-center justify-center p-2 sm:p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative w-full ${size === 'full' ? 'max-w-6xl h-full' : 'max-w-4xl max-h-full'} bg-[#F1E8D2] rounded-2xl border border-[#C7A467] shadow-[0_20px_50px_rgba(42,30,20,0.3)] overflow-y-auto outline-none`}
      >
        {/* stays in the corner while the section scrolls; takes no space */}
        <div className="sticky top-0 z-10 h-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mt-3 mr-3 w-9 h-9 rounded-full bg-[#FBF3E2] border border-[#C7A467] text-[#1F3B2E] flex items-center justify-center shadow-sm hover:bg-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
