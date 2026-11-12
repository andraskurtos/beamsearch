import { useLocale } from '../../context/LocaleContext';

interface TreeStageControlsProps {
  mode: 'greedy' | 'beam';
  step: 0 | 1 | 2 | 3;
  beamWidth: number;
  onStepChange: (s: 0 | 1 | 2 | 3) => void;
  onBeamWidthChange: (k: number) => void;
}

const STEPS: Array<0 | 1 | 2 | 3> = [0, 1, 2, 3];

export function TreeStageControls({
  mode,
  step,
  beamWidth,
  onStepChange,
  onBeamWidthChange,
}: TreeStageControlsProps) {
  const { t } = useLocale();

  if (mode === 'greedy') {
    const nextStep = Math.min(3, step + 1) as 0 | 1 | 2 | 3;
    return (
      <div className="brutal-border-sm bg-white p-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between font-mono text-xs font-bold">
          <span>{t.ui.stepLabel}: {step} / 3</span>
          <span className="bg-black text-[#FFE600] px-2 py-0.5">k = 1 (GREEDY)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-testid="greedy-step-btn"
            disabled={step >= 3}
            onClick={() => onStepChange(nextStep)}
            className="brutal-btn bg-[#FFE600] text-black px-4 py-2 text-xs font-mono uppercase flex-1"
          >
            ▶ {t.ui.stepAutopilot} ({step}/3)
          </button>

          <button
            type="button"
            data-testid="greedy-reset-btn"
            onClick={() => onStepChange(0)}
            className="brutal-btn bg-[#FFFDF7] text-black px-3 py-2 text-xs font-mono uppercase"
          >
            ↺ {t.ui.reset}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="brutal-border-sm bg-white p-3.5 flex flex-col gap-3.5">
      <div>
        <div className="flex items-center justify-between font-mono text-xs font-bold mb-1.5">
          <label htmlFor="beam-width-slider">{t.ui.beamWidthLabel}</label>
          <span className="bg-[#FF6B6B] brutal-border-sm px-2 py-0.5 text-black">
            k = {beamWidth}
          </span>
        </div>
        <input
          id="beam-width-slider"
          data-testid="beam-width-slider"
          type="range"
          min={1}
          max={5}
          step={1}
          value={beamWidth}
          onChange={(e) => onBeamWidthChange(Number(e.target.value))}
          className="brutal-slider"
        />
        <div className="flex justify-between font-mono text-[10px] text-black/70 mt-1">
          <span>k=1 (Greedy)</span>
          <span>k=2</span>
          <span>k=3</span>
          <span>k=4</span>
          <span>k=5 (Wide)</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/15">
        <span className="font-mono text-xs font-bold">{t.ui.stepLabel}:</span>
        <div className="flex items-center gap-1.5">
          {STEPS.filter((s) => s > 0).map((s) => (
            <button
              key={s}
              type="button"
              data-testid={`beam-step-btn-${s}`}
              onClick={() => onStepChange(s)}
              className={`px-2.5 py-1 text-xs font-mono font-bold brutal-border-sm cursor-pointer ${
                step === s
                  ? 'bg-black text-[#FFE600]'
                  : 'bg-[#FFFDF7] text-black hover:bg-[#FFE600]/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

