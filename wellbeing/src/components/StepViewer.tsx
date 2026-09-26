import React, { useMemo, useState } from 'react';
import { Practice } from '../types';
import { getStepImages } from '../data/images';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Mode = 'steps' | 'gif';

interface StepViewerProps {
  practice: Practice;
  imageClassName: string;
}

// Static step-by-step view with a step slider, plus a toggle to the animated
// demo GIF when the practice has one. GIF mode stays the default for those
// practices so the existing demo behaviour is unchanged.
export const StepViewer: React.FC<StepViewerProps> = ({ practice, imageClassName }) => {
  const hasGif = !!practice.demoGif;
  const stepCount = practice.steps.length;
  const [mode, setMode] = useState<Mode>(hasGif ? 'gif' : 'steps');
  const [step, setStep] = useState(0);
  const stepImages = useMemo(() => getStepImages(practice.id, stepCount), [practice.id, stepCount]);

  const stepImage = stepImages[step];
  const staticImage = stepImage ?? practice.image;

  const modeButton = (key: Mode, label: string) => (
    <button
      type="button"
      aria-pressed={mode === key}
      onClick={() => setMode(key)}
      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer ${
        mode === key ? 'bg-[#1F3B2E] text-white' : 'text-[#1F3B2E] hover:bg-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full flex flex-col items-center gap-2.5">
      {hasGif && stepCount > 0 && (
        <div className="inline-flex gap-1 p-1 bg-[#FBF3E2] border border-[#C7A467]/70 rounded-xl" role="group" aria-label="Demo display mode">
          {modeButton('steps', 'Steps')}
          {modeButton('gif', 'GIF')}
        </div>
      )}

      {mode === 'gif' && hasGif ? (
        <img src={practice.demoGif} alt={`${practice.name} step-by-step demo`} className={imageClassName} />
      ) : (
        <>
          {staticImage && (
            <img
              src={staticImage}
              alt={stepImage ? `${practice.name}, step ${step + 1}` : ''}
              className={imageClassName}
            />
          )}

          {stepCount > 0 && (
            <div className="w-full max-w-sm bg-[#FBF3E2] border border-[#C7A467]/70 rounded-xl p-3">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8402E]">
                  Step {step + 1} of {stepCount}
                </span>
                {!stepImage && staticImage && (
                  <span className="text-[10px] text-[#5C5142]">No image for this step yet</span>
                )}
              </div>
              <p className="text-[13px] text-[#2A241E] leading-relaxed min-h-[2.5rem]" aria-live="polite">
                {practice.steps[step]}
              </p>

              {stepCount > 1 && (
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    aria-label="Previous step"
                    className="p-1 rounded-lg text-[#1F3B2E] cursor-pointer hover:bg-white disabled:opacity-30 disabled:cursor-default"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={stepCount - 1}
                    step={1}
                    value={step}
                    onChange={e => setStep(Number(e.target.value))}
                    aria-label="Exercise step"
                    aria-valuetext={`Step ${step + 1} of ${stepCount}`}
                    className="flex-1 accent-[#1F3B2E] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setStep(s => Math.min(stepCount - 1, s + 1))}
                    disabled={step === stepCount - 1}
                    aria-label="Next step"
                    className="p-1 rounded-lg text-[#1F3B2E] cursor-pointer hover:bg-white disabled:opacity-30 disabled:cursor-default"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
