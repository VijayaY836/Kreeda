import React from 'react';
import { Practice } from '../types';
import { useEscapeToClose } from '../hooks/useEscapeToClose';
import { StepViewer } from './StepViewer';
import { X, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react';

const CONTRA_LABELS: Record<string, string> = {
  high_bp: 'High blood pressure', heart_condition: 'Heart condition', back_disc: 'Back / disc issue',
  knee: 'Knee issue', shoulder: 'Shoulder issue', neck: 'Neck issue', hernia: 'Hernia',
  vertigo: 'Vertigo', pregnancy: 'Pregnancy', recent_surgery: 'Recent surgery', eye_condition: 'Eye condition',
};

const LEVEL_LABELS: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

interface PracticeDetailModalProps {
  practice: Practice;
  onClose: () => void;
}

export const PracticeDetailModal: React.FC<PracticeDetailModalProps> = ({ practice, onClose }) => {
  useEscapeToClose(onClose);
  const hasGif = !!practice.demoGif;

  const content = (
    <div className="p-6">
      <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-[#1F3B2E] mb-1">
        {LEVEL_LABELS[practice.level]}{practice.tradition ? ` · ${practice.tradition}` : ''}
      </span>
      <h2 className="font-fraunces text-2xl font-semibold text-[#1F3B2E] leading-tight">{practice.name}</h2>
      {practice.name_iast && <p className="font-telugu text-sm text-[#C0524A] font-bold mt-0.5">{practice.name_iast}</p>}
      <p className="text-sm text-[#5C5142] font-semibold mt-0.5 mb-4">{practice.name_english}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {practice.component_tags.map(t => (
          <span key={t} className="text-[10px] font-bold uppercase tracking-wide bg-[#EADFC4] border border-[#C7A467]/40 px-2 py-1 text-[#1F3B2E]">{t}</span>
        ))}
      </div>

      {practice.steps.length > 0 && (
        <div className="mb-4">
          <h4 className="font-fraunces text-sm font-bold text-[#1F3B2E] mb-1.5 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> How to practice</h4>
          <ol className="list-decimal list-inside space-y-1 text-[13.5px] text-[#2A241E] leading-relaxed">
            {practice.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      {practice.benefits.length > 0 && (
        <div className="mb-4 p-3 bg-[#E4EFE0] border-2 border-[#3F6B4F]/50">
          <h4 className="font-fraunces text-sm font-bold text-[#3F6B4F] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Traditionally associated with</h4>
          <ul className="text-[13px] text-[#2A241E] leading-relaxed list-disc list-inside">
            {practice.benefits.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}

      {(practice.cautions.length > 0 || practice.contraindications.length > 0) && (
        <div className="mb-4 p-3 bg-[#F7E3D6] border-2 border-[#1F3B2E]/50">
          <h4 className="font-fraunces text-sm font-bold text-[#1F3B2E] mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Cautions</h4>
          {practice.cautions.map((c, i) => <p key={i} className="text-[13px] text-[#2A241E] mb-1">{c}</p>)}
          {practice.contraindications.length > 0 && (
            <p className="text-[12px] text-[#1F3B2E] font-semibold mt-1">
              Avoid with: {practice.contraindications.map(c => CONTRA_LABELS[c] ?? c).join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="text-[11px] text-[#5C5142] border-t-2 border-dashed border-[#C7A467] pt-2.5">
        Sources: {practice.sources.map(s => s.title).join('; ')}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#2A241E]/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-[#FBF3E2] border border-[#C7A467]/70 rounded-2xl shadow-[0_8px_24px_rgba(42,30,20,0.10)] w-full max-h-[88vh] relative wb-fade-in ${
          hasGif ? 'max-w-3xl overflow-hidden flex flex-col md:flex-row' : 'max-w-lg overflow-y-auto'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {hasGif ? (
          <>
            <div className="md:w-1/2 overflow-y-auto max-h-[88vh]">{content}</div>
            <div className="md:w-1/2 bg-[#EADFC4] border-t-[3px] md:border-t-0 md:border-l-[3px] border-[#C7A467] flex items-center justify-center p-3 shrink-0 overflow-y-auto max-h-[88vh]">
              <StepViewer practice={practice} imageClassName="w-full h-auto max-h-[64vh] object-contain" />
            </div>
          </>
        ) : (
          <>
            {(practice.image || practice.steps.length > 0) && (
              <div className="relative w-full border-b-[3px] border-[#C7A467] bg-[#EADFC4] p-3">
                <StepViewer practice={practice} imageClassName="w-full h-56 object-contain" />
              </div>
            )}
            {content}
          </>
        )}

        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 border border-[#C7A467]/70 rounded-xl text-[#1F3B2E] cursor-pointer ${practice.image || hasGif ? 'bg-[#FBF3E2]' : 'bg-[#F1E8D2]'}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
