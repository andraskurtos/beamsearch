import { motion } from 'motion/react';
import { useLocale } from '../../context/LocaleContext';
import type { ScaledTokenProb } from '../../lib/decodingMath';

interface ProbabilityBarCanvasProps {
  mode: 'temperature' | 'top-p';
  temperature: number;
  topP: number;
  distribution: ScaledTokenProb[];
  lastSampledToken: string | null;
  onSelectToken?: (item: ScaledTokenProb) => void;
}

export function ProbabilityBarCanvas({
  mode,
  temperature,
  topP,
  distribution,
  lastSampledToken,
  onSelectToken,
}: ProbabilityBarCanvasProps) {
  const { t } = useLocale();
  const nucleusCount = distribution.filter((d) => d.inNucleus).length;

  return (
    <div className="flex flex-col h-full justify-between gap-4">
      {/* Live Transmission Banner */}
      <div
        data-testid="live-transmission-banner"
        className="brutal-border-sm brutal-shadow-sm bg-[#FFFDF7] p-3.5 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <span className="font-mono text-[10px] uppercase text-black/60 block">
            {t.ui.liveTransmission}
          </span>
          <div className="font-mono text-xs md:text-sm font-bold flex flex-wrap items-center gap-1.5 mt-0.5">
            <span>"{t.promptStage3Prefix}</span>
            <span className="inline-flex items-center gap-1 bg-[#FFE600] brutal-border-sm px-2 py-0.5">
              {lastSampledToken ? `${lastSampledToken}.` : '[ ??? ]'}
            </span>
            <span>"</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <span className="bg-[#FF6B6B] text-black px-2.5 py-1 brutal-border-sm">
            T = {temperature.toFixed(1)}
          </span>
          {mode === 'top-p' && (
            <span className="bg-[#FFE600] text-black px-2.5 py-1 brutal-border-sm">
              Top-P = {topP.toFixed(2)} ({nucleusCount}/8)
            </span>
          )}
        </div>
      </div>

      {/* Token Probability Radar & Horizontal/Vertical Bars */}
      <div className="brutal-border-sm bg-[#FFFDF7]/95 p-4 flex-1 flex flex-col justify-between gap-2.5">
        {mode === 'top-p' && (
          <div className="flex items-center justify-between bg-[#FFE600] brutal-border-sm px-3 py-1.5 font-mono text-xs font-bold">
            <span>
              🛡️ {t.ui.nucleusZone}: {t.ui.cumulativeThresholdLabel} {(topP * 100).toFixed(0)}%
            </span>
            <span>
              {t.ui.activePoolLabel} {nucleusCount} {t.ui.tokensUnit}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {distribution.map((item) => {
            const isSampled = lastSampledToken === item.token;
            const displayProb = mode === 'top-p' ? item.finalProb : item.rawProb;
            const widthPct = Math.max(displayProb * 100, item.inNucleus ? 3 : 0);

            let categoryBadge = t.ui.safeCategory;
            let categoryColor = 'bg-[#E0E7FF] text-black';
            let barFill = 'bg-[#A7F3D0]';

            if (item.category === 'creative') {
              categoryBadge = t.ui.creativeCategory;
              categoryColor = 'bg-[#FFE600] text-black';
              barFill = 'bg-[#FFE600]';
            } else if (item.category === 'tail') {
              categoryBadge = t.ui.tailCategory;
              categoryColor = 'bg-[#FF6B6B] text-black';
              barFill = 'bg-[#FF6B6B]';
            }

            if (!item.inNucleus) {
              barFill = 'bg-[#E5E7EB]';
            }

            return (
              <div
                key={item.token}
                data-testid={`token-bar-${item.token}`}
                data-in-nucleus={String(item.inNucleus)}
                onClick={() => {
                  if (item.inNucleus && onSelectToken) {
                    onSelectToken(item);
                  }
                }}
                className={`brutal-border-sm p-2 transition-all ${
                  !item.inNucleus
                    ? 'bg-[#E5E7EB] opacity-65 cursor-not-allowed'
                    : isSampled
                    ? 'bg-[#FFFDF7] ring-2 ring-black brutal-shadow-sm cursor-pointer'
                    : 'bg-white hover:bg-[#FFFDF7] cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-sm ${
                        !item.inNucleus ? 'line-through text-black/50' : 'text-black'
                      }`}
                    >
                      "{item.token}"
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 brutal-border-sm ${categoryColor}`}>
                      {categoryBadge}
                    </span>
                    <span className="text-[10px] text-black/60">
                      z={item.logit.toFixed(2)}
                    </span>
                    {isSampled && (
                      <span className="bg-black text-[#FFE600] px-1.5 py-0.2 text-[10px] font-bold">
                        {t.ui.probeLandedBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-bold">
                    {!item.inNucleus ? (
                      <span className="bg-black text-white px-1.5 py-0.2 text-[10px]">
                        {t.ui.cutOffStamp}
                      </span>
                    ) : (
                      <>
                        {mode === 'top-p' && (
                          <span className="text-[10px] text-black/55 font-normal">
                            raw {(item.rawProb * 100).toFixed(1)}% →
                          </span>
                        )}
                        <span className="text-xs">
                          {(displayProb * 100).toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Probability Bar Track */}
                <div className="w-full h-4 bg-[#F3F4F6] brutal-border-sm overflow-hidden relative">
                  <motion.div
                    initial={false}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    className={`h-full ${barFill} border-r-2 border-black`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-black/70 pt-1 flex items-center justify-between">
          <span>{t.ui.clickBarHint}</span>
          <span>∑ P = 100.0%</span>
        </div>
      </div>
    </div>
  );
}
