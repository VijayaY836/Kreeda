import React from 'react';
import { KreeduMascot } from './KreeduMascot';
import { FolkDivider } from './FolkArtMotifs';

interface DisclaimerProps {
  onAcknowledge: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAcknowledge }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#2A241E]/45 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#FBF3E2] border border-[#C7A467] rounded-2xl shadow-[0_20px_50px_rgba(42,30,20,0.3)] p-6 max-h-[85vh] overflow-y-auto relative">
        <div className="flex items-center gap-3 mb-2">
          <KreeduMascot size={48} />
          <h3 className="font-fraunces text-2xl font-bold text-[#1F3B2E]">Before You Begin</h3>
        </div>
        <FolkDivider className="mb-3" />
        <div className="space-y-3 text-sm text-[#2A241E] leading-relaxed">
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
        <div className="mt-4 pt-3 border-t border-dashed border-[#C7A467] flex justify-end">
          <button
            onClick={onAcknowledge}
            className="px-5 py-2.5 bg-[#1F3B2E] text-white border border-[#C7A467]/70 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#2C5040]"
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
};
