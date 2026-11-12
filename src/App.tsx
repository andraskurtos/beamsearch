import { useState } from 'react';
import { motion } from 'motion/react';
import { LocaleProvider, useLocale } from './context/LocaleContext';
import type { StageId } from './locales/types';
import { TopNavBar } from './components/TopNavBar';
import { StageCard } from './components/StageCard';

const PLAYABLE_STAGE_IDS: StageId[] = [1, 2, 3, 4];

function StarlightDecoderWorkspace() {
  const { t } = useLocale();
  const [activeStage, setActiveStage] = useState<StageId>(0);
  const [completedStages] = useState<Record<StageId, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const handleSelectStage = (stage: StageId) => {
    setActiveStage(stage);
    const el = document.getElementById(`stage-section-${stage}`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isPreamble = activeStage === 0;

  return (
    <div className="min-h-screen flex flex-col paper-grid-bg">
      <TopNavBar
        activeStage={activeStage}
        completedStages={completedStages}
        onSelectStage={handleSelectStage}
      />

      <motion.main
        layout
        data-testid="workspace-shell"
        data-layout-mode={isPreamble ? 'preamble-fullscreen' : 'split-workspace'}
        data-active-stage={String(activeStage)}
        className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-6 md:px-6"
      >
        {isPreamble ? (
          <div className="max-w-3xl mx-auto my-6">
            <StageCard
              stageId={0}
              isActive={true}
              isCompleted={completedStages[0]}
              onActivate={() => setActiveStage(0)}
              onNavigateStage={handleSelectStage}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 40% Narrative & Controls Deck (scrollable through all stages, including back up to Stage 0) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <StageCard
                stageId={0}
                isActive={false}
                isCompleted={completedStages[0]}
                onActivate={() => setActiveStage(0)}
                onNavigateStage={handleSelectStage}
              />

              {PLAYABLE_STAGE_IDS.map((stageId) => (
                <StageCard
                  key={stageId}
                  stageId={stageId}
                  isActive={activeStage === stageId}
                  isCompleted={completedStages[stageId]}
                  onActivate={() => setActiveStage(stageId)}
                  onNavigateStage={handleSelectStage}
                />
              ))}
            </div>

            {/* Right 60% Persistent Star-Atlas Canvas */}
            <aside
              data-testid="right-star-canvas"
              className="lg:col-span-7 lg:sticky lg:top-16 brutal-border brutal-shadow-lg star-grid-bg p-5 min-h-[520px] flex flex-col justify-between"
            >
              <div
                data-testid="live-transmission-banner"
                className="brutal-border-sm brutal-shadow-sm bg-[#FFFDF7] p-3 font-mono text-xs md:text-sm"
              >
                <span className="text-[10px] uppercase text-black/60 block">
                  {t.ui.liveTransmission}
                </span>
                <span className="font-bold">"{t.promptPrefix}..."</span>
              </div>

              <div className="my-auto text-center p-8 brutal-border-sm bg-[#FFFDF7]/90">
                <div className="font-mono text-xs uppercase font-bold text-black/60 mb-1">
                  {t.stages[activeStage].badge}
                </div>
                <div className="text-lg font-extrabold">
                  {t.stages[activeStage].title}
                </div>
              </div>
            </aside>
          </div>
        )}
      </motion.main>
    </div>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <StarlightDecoderWorkspace />
    </LocaleProvider>
  );
}
