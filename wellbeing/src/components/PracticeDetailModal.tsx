import React from 'react';
import { Practice } from '../types';
import { useEscapeToClose } from '../hooks/useEscapeToClose';
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
  return (
    <div className="fixed inset-0 z-50 bg-[#2B1B12]/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#FAF4E5] border-[3px] border-[#5C140F] max-w-lg w-full max-h-[88vh] overflow-y-auto p-6 relative wb-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-[#EFDFB8] border-2 border-[#5C140F] text-[#5C140F] cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#D8401F] mb-1">
          {LEVEL_LABELS[practice.level]}{practice.tradition ? ` · ${practice.tradition}` : ''}
        </span>
        <h2 className="font-fraunces text-2xl font-extrabold text-[#5C140F] leading-tight">{practice.name}</h2>
        {practice.name_iast && <p className="font-telugu text-sm text-[#D9587B] font-bold mt-0.5">{practice.name_iast}</p>}
        <p className="text-sm text-[#6B4E3D] font-semibold mt-0.5 mb-4">{practice.name_english}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {practice.component_tags.map(t => (
            <span key={t} className="text-[10px] font-bold uppercase tracking-wide bg-[#E4D19E] border border-[#5C140F]/40 px-2 py-1 text-[#5C140F]">{t}</span>
          ))}
        </div>

        {practice.steps.length > 0 && (
          <div className="mb-4">
            <h4 className="font-fraunces text-sm font-bold text-[#5C140F] mb-1.5 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> How to practice</h4>
            <ol className="list-decimal list-inside space-y-1 text-[13.5px] text-[#2B1B12] leading-relaxed">
              {practice.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        )}

        {practice.benefits.length > 0 && (
          <div className="mb-4 p-3 bg-[#E4EFE0] border-2 border-[#5F8F3B]/50">
            <h4 className="font-fraunces text-sm font-bold text-[#5F8F3B] mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Traditionally associated with</h4>
            <ul className="text-[13px] text-[#2B1B12] leading-relaxed list-disc list-inside">
              {practice.benefits.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        )}

        {(practice.cautions.length > 0 || practice.contraindications.length > 0) && (
          <div className="mb-4 p-3 bg-[#F7E3D6] border-2 border-[#D8401F]/50">
            <h4 className="font-fraunces text-sm font-bold text-[#D8401F] mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Cautions</h4>
            {practice.cautions.map((c, i) => <p key={i} className="text-[13px] text-[#2B1B12] mb-1">{c}</p>)}
            {practice.contraindications.length > 0 && (
              <p className="text-[12px] text-[#5C140F] font-semibold mt-1">
                Avoid with: {practice.contraindications.map(c => CONTRA_LABELS[c] ?? c).join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="text-[11px] text-[#6B4E3D] border-t-2 border-dashed border-[#5C140F] pt-2.5">
          Sources: {practice.sources.map(s => s.title).join('; ')}
        </div>
      </div>
    </div>
  );
};
