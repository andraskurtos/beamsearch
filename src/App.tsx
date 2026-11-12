import { useState } from 'react';
import { motion } from 'motion/react';
import { LocaleProvider, useLocale } from './context/LocaleContext';
import type { StageId } from './locales/types';
import { TopNavBar } from './components/TopNavBar';
import { StageCard } from './components/StageCard';
import { TreeStageControls } from './components/controls/TreeStageControls';
import { StarTreeCanvas } from './components/visualizers/StarTreeCanvas';

const PLAYABLE_STAGE_IDS: StageId[] = [1, 2, 3, 4];

function StarlightDecoderWorkspace() {
  const { t } = useLocale();
  const [activeStage, setActiveStage] = useState<StageId>(0);

  // Stage 1 (Greedy Trap) isolated state
  const [greedyStep, setGreedyStep] = useState<0 | 1 | 2 | 3>(0);

  // Stage 2 (Beam Search) isolated state
  const [beamStep, setBeamStep] = useState<0 | 1 | 2 | 3>(3);
  const [beamWidth, setBeamWidth] = useState<number>(1);

  const [completedStages, setCompletedStages] = useState<Record<StageId, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const markStageCompleted = (id: StageId) => {
    setCompletedStages((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  const handleGreedyStepChange = (nextStep: 0 | 1 | 2 | 3) => {
    setGreedyStep(nextStep);
    if (nextStep === 3) {
      markStageCompleted(1);
    }
  };

  const handleBeamWidthChange = (nextK: number) => {
    setBeamWidth(nextK);
    if (nextK >= 2 && beamStep === 3) {
      markStageCompleted(2);
    }
  };

  const handleBeamStepChange = (nextStep: 0 | 1 | 2 | 3) => {
    setBeamStep(nextStep);
    if (beamWidth >= 2 && nextStep === 3) {
      markStageCompleted(2);
    }
  };

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
            {/* Left 40% Narrative & Controls Deck */}
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
                >
                  {stageId === 1 && (
                    <TreeStageControls
                      mode="greedy"
                      step={greedyStep}
                      beamWidth={1}
                      onStepChange={handleGreedyStepChange}
                      onBeamWidthChange={() => {}}
                    />
                  )}
                  {stageId === 2 && (
                    <TreeStageControls
                      mode="beam"
                      step={beamStep}
                      beamWidth={beamWidth}
                      onStepChange={handleBeamStepChange}
                      onBeamWidthChange={handleBeamWidthChange}
                    />
                  )}
                </StageCard>
              ))}
            </div>

            {/* Right 60% Persistent Star-Atlas Canvas */}
            <aside
              data-testid="right-star-canvas"
              className="lg:col-span-7 lg:sticky lg:top-16 brutal-border brutal-shadow-lg star-grid-bg p-5 min-h-[540px] flex flex-col justify-between"
            >
              {activeStage === 1 && (
                <StarTreeCanvas mode="greedy" step={greedyStep} beamWidth={1} />
              )}
              {activeStage === 2 && (
                <StarTreeCanvas mode="beam" step={beamStep} beamWidth={beamWidth} />
              )}
              {(activeStage === 3 || activeStage === 4) && (
                <div className="flex flex-col h-full justify-between">
                  <div
                    data-testid="live-transmission-banner"
                    className="brutal-border-sm brutal-shadow-sm bg-[#FFFDF7] p-3 font-mono text-xs md:text-sm"
                  >
                    <span className="text-[10px] uppercase text-black/60 block">
                      {t.ui.liveTransmission}
                    </span>
                    <span className="font-bold">"{t.promptStage3Prefix}..."</span>
                  </div>
                  <div className="my-auto text-center p-8 brutal-border-sm bg-[#FFFDF7]/90">
                    <div className="font-mono text-xs uppercase font-bold text-black/60 mb-1">
                      {t.stages[activeStage].badge}
                    </div>
                    <div className="text-lg font-extrabold">
                      {t.stages[activeStage].title}
                    </div>
                  </div>
                </div>
              )}
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
