import React from 'react';
import { KreeduMascot } from './KreeduMascot';
import { FolkDivider } from './FolkArtMotifs';

interface DisclaimerProps {
  onAcknowledge: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAcknowledge }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#FAF4E5] border-4 border-[#5C140F] p-6 max-h-[85vh] overflow-y-auto relative">
        <div className="flex items-center gap-3 mb-2">
          <KreeduMascot size={48} />
          <h3 className="font-fraunces text-2xl font-bold text-[#5C140F]">Before You Begin</h3>
        </div>
        <FolkDivider className="mb-3" />
        <div className="space-y-3 text-sm text-[#2B1B12] leading-relaxed">
          <p>
            Yoga, Vyayam and Dhyana are presented here as <strong>traditional practices</strong>, not medical treatment.
            Benefits described in this module are phrased as "traditionally associated with" a concern — never as a cure
            or guaranteed outcome.
          </p>
          <p>
            This app does not replace professional medical advice. If you have any health condition, are pregnant, or
            are recovering from surgery, please consult a doctor before starting a new physical or breathing practice.
          </p>
          <p>
            Everything you enter — your body data, health checklist and session history — stays on this device. Nothing
            is uploaded anywhere.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t-2 border-[#5C140F] flex justify-end">
          <button
            onClick={onAcknowledge}
            className="px-5 py-2.5 bg-[#D8401F] text-white border-2 border-[#5C140F] text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#B83215]"
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
};
