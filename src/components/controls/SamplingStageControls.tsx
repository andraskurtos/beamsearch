import { useLocale } from '../../context/LocaleContext';

interface SamplingStageControlsProps {
  stageId: 3 | 4;
  mode: 'temperature' | 'top-p';
  temperature: number;
  topP: number;
  onTemperatureChange: (t: number) => void;
  onTopPChange: (p: number) => void;
  onFireProbe: () => void;
  sampleHistory: string[];
}

export function SamplingStageControls({
  stageId,
  mode,
  temperature,
  topP,
  onTemperatureChange,
  onTopPChange,
  onFireProbe,
  sampleHistory,
}: SamplingStageControlsProps) {
  const { t } = useLocale();

  return (
    <div className="brutal-border-sm bg-white p-3.5 flex flex-col gap-3.5">
      {/* Temperature Slider */}
      <div>
        <div className="flex items-center justify-between font-mono text-xs font-bold mb-1.5">
          <label htmlFor={`temperature-slider-${stageId}`}>
            {t.ui.temperatureLabel}
          </label>
          <span className="bg-[#FF6B6B] brutal-border-sm px-2 py-0.5 text-black">
            T = {temperature.toFixed(1)}
          </span>
        </div>
        <input
          id={`temperature-slider-${stageId}`}
          data-testid={`temperature-slider-${stageId}`}
          type="range"
          min={0.1}
          max={2.0}
          step={0.1}
          value={temperature}
          onChange={(e) => onTemperatureChange(Number(e.target.value))}
          className="brutal-slider"
        />
        <div className="flex justify-between font-mono text-[10px] text-black/70 mt-1">
          <span>{t.ui.tempFrozenHint}</span>
          <span>{t.ui.tempStandardHint}</span>
          <span>{t.ui.tempChaoticHint}</span>
        </div>
      </div>

      {/* Top-P Slider (Stage 4 only: min=0.10, max=1.00 -> 0.85 is at 83.33%) */}
      {mode === 'top-p' && (
        <div className="pt-2 border-t border-black/15">
          <div className="flex items-center justify-between font-mono text-xs font-bold mb-1.5">
            <label htmlFor={`top-p-slider-${stageId}`}>{t.ui.topPLabel}</label>
            <span className="bg-[#FFE600] brutal-border-sm px-2 py-0.5 text-black">
              p = {topP.toFixed(2)} ({Math.round(topP * 100)}%)
            </span>
          </div>
          <input
            id={`top-p-slider-${stageId}`}
            data-testid={`top-p-slider-${stageId}`}
            type="range"
            min={0.1}
            max={1.0}
            step={0.01}
            value={topP}
            onChange={(e) => onTopPChange(Number(e.target.value))}
            className="brutal-slider"
          />
          <div className="relative h-5 font-mono text-[10px] text-black/75 mt-1 select-none">
            <span className="absolute left-0 top-0 text-left">
              {t.ui.topPStrictHint}
            </span>
            <span
              data-testid="top-p-tick-sweet"
              style={{ left: 'calc(83.33% - 7.3px)' }}
              className="absolute top-0 -translate-x-1/2 font-bold text-black whitespace-nowrap"
            >
              0.85
            </span>
            <span className="absolute right-0 top-0 text-right">
              1.00
            </span>
          </div>
        </div>
      )}

      {/* Fire Sample Probe Button */}
      <div className="pt-2 border-t border-black/15 flex flex-col gap-2">
        <button
          type="button"
          data-testid={`fire-probe-btn-${stageId}`}
          onClick={onFireProbe}
          className="brutal-btn bg-[#FFE600] text-black px-4 py-2.5 text-xs font-mono uppercase w-full"
        >
          {t.ui.fireProbe}
        </button>

        <div
          data-testid={`sample-history-${stageId}`}
          className="bg-[#FFFDF7] brutal-border-sm p-2 font-mono text-[11px]"
        >
          <span className="text-black/60 block text-[10px] uppercase mb-1">
            {t.ui.sampledHistory}
          </span>
          {sampleHistory.length === 0 ? (
            <span className="text-black/50 italic">{t.ui.noSamplesYet}</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {sampleHistory.map((tok, idx) => (
                <span
                  key={`${tok}-${idx}`}
                  className={`px-2 py-0.5 brutal-border-sm font-bold ${
                    idx === 0 ? 'bg-[#FF6B6B] text-black' : 'bg-white text-black'
                  }`}
                >
                  "{tok}"
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
