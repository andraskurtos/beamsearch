import { useState, useMemo, useEffect } from 'react';
import { LocaleProvider, useLocale } from './context/LocaleContext';
import type { StageId } from './locales/types';
import { TopNavBar } from './components/TopNavBar';
import { StageCard } from './components/StageCard';
import { TreeStageControls } from './components/controls/TreeStageControls';
import { SamplingStageControls } from './components/controls/SamplingStageControls';
import { StarTreeCanvas } from './components/visualizers/StarTreeCanvas';
import { ProbabilityBarCanvas } from './components/visualizers/ProbabilityBarCanvas';
import { LOGIT_CANDIDATES } from './data/decodingData';
import {
  computeSamplingDistribution,
  sampleFromDistribution,
  type ScaledTokenProb,
} from './lib/decodingMath';

const PLAYABLE_STAGE_IDS: StageId[] = [1, 2, 3, 4];

function checkStage4Win(temp: number, dist: ScaledTokenProb[]): boolean {
  if (temp < 1.3) return false;
  const creativesIn = dist
    .filter((d) => d.category === 'creative')
    .every((d) => d.inNucleus);
  const tailsCutOff = dist
    .filter((d) => d.category === 'tail')
    .every((d) => !d.inNucleus);
  return creativesIn && tailsCutOff;
}

function StarlightDecoderWorkspace() {
  const { t } = useLocale();
  const [activeStage, setActiveStage] = useState<StageId>(0);
  const [scrollRequest, setScrollRequest] = useState<{ stage: StageId; seq: number } | null>(
    null
  );

  // Stage 1 (Greedy Trap) isolated state
  const [greedyStep, setGreedyStep] = useState<0 | 1 | 2 | 3>(0);

  // Stage 2 (Beam Search) isolated state
  const [beamStep, setBeamStep] = useState<0 | 1 | 2 | 3>(3);
  const [beamWidth, setBeamWidth] = useState<number>(1);

  // Stage 3 (Temperature) isolated state
  const [stage3Temp, setStage3Temp] = useState<number>(1.0);
  const [stage3History, setStage3History] = useState<string[]>([]);

  // Stage 4 (Top-P Nucleus) isolated state
  const [stage4Temp, setStage4Temp] = useState<number>(1.5);
  const [stage4TopP, setStage4TopP] = useState<number>(1.0);
  const [stage4History, setStage4History] = useState<string[]>([]);

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

  // Computed distributions for Stages 3 and 4
  const stage3Dist = useMemo(
    () => computeSamplingDistribution(LOGIT_CANDIDATES, stage3Temp, 1.0),
    [stage3Temp]
  );

  const stage4Dist = useMemo(
    () => computeSamplingDistribution(LOGIT_CANDIDATES, stage4Temp, stage4TopP),
    [stage4Temp, stage4TopP]
  );

  // Stage 1 & 2 handlers
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

  // Stage 3 handlers
  const recordStage3Sample = (picked: ScaledTokenProb) => {
    setStage3History((prev) => [picked.token, ...prev].slice(0, 5));
    if (stage3Temp >= 1.2 && picked.category === 'creative') {
      markStageCompleted(3);
    }
  };

  const handleFireStage3Probe = () => {
    const picked = sampleFromDistribution(stage3Dist);
    recordStage3Sample(picked);
  };

  // Stage 4 handlers
  const handleStage4TempChange = (nextTemp: number) => {
    setStage4Temp(nextTemp);
    const nextDist = computeSamplingDistribution(LOGIT_CANDIDATES, nextTemp, stage4TopP);
    if (checkStage4Win(nextTemp, nextDist)) {
      markStageCompleted(4);
    }
  };

  const handleStage4TopPChange = (nextTopP: number) => {
    setStage4TopP(nextTopP);
    const nextDist = computeSamplingDistribution(LOGIT_CANDIDATES, stage4Temp, nextTopP);
    if (checkStage4Win(stage4Temp, nextDist)) {
      markStageCompleted(4);
    }
  };

  const recordStage4Sample = (picked: ScaledTokenProb) => {
    setStage4History((prev) => [picked.token, ...prev].slice(0, 5));
  };

  const handleFireStage4Probe = () => {
    const picked = sampleFromDistribution(stage4Dist);
    recordStage4Sample(picked);
  };

  const handleSelectStage = (stage: StageId) => {
    setActiveStage(stage);
    setScrollRequest((prev) => ({ stage, seq: (prev?.seq ?? 0) + 1 }));
  };

  useEffect(() => {
    if (!scrollRequest) return;
    if (scrollRequest.stage === 0) {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const el = document.getElementById(`stage-section-${scrollRequest.stage}`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollRequest]);

  const isPreamble = activeStage === 0;

  return (
    <div className="min-h-screen flex flex-col paper-grid-bg">
      <TopNavBar
        activeStage={activeStage}
        completedStages={completedStages}
        onSelectStage={handleSelectStage}
      />

      <main
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
                  {stageId === 3 && (
                    <SamplingStageControls
                      stageId={3}
                      mode="temperature"
                      temperature={stage3Temp}
                      topP={1.0}
                      onTemperatureChange={setStage3Temp}
                      onTopPChange={() => {}}
                      onFireProbe={handleFireStage3Probe}
                      sampleHistory={stage3History}
                    />
                  )}
                  {stageId === 4 && (
                    <div className="flex flex-col gap-4">
                      <SamplingStageControls
                        stageId={4}
                        mode="top-p"
                        temperature={stage4Temp}
                        topP={stage4TopP}
                        onTemperatureChange={handleStage4TempChange}
                        onTopPChange={handleStage4TopPChange}
                        onFireProbe={handleFireStage4Probe}
                        sampleHistory={stage4History}
                      />

                      {/* Practical Summary Cheat Sheet */}
                      <div className="brutal-border-sm bg-[#E0E7FF] p-3.5 text-xs">
                        <div className="font-mono font-bold uppercase mb-2">
                          📋 {t.ui.summaryTitle}
                        </div>
                        <ul className="space-y-1.5 list-disc list-inside text-black/90">
                          <li>{t.ui.summaryItems.greedy}</li>
                          <li>{t.ui.summaryItems.beam}</li>
                          <li>{t.ui.summaryItems.temp}</li>
                          <li>{t.ui.summaryItems.topP}</li>
                        </ul>
                      </div>
                    </div>
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
              {activeStage === 3 && (
                <ProbabilityBarCanvas
                  mode="temperature"
                  temperature={stage3Temp}
                  topP={1.0}
                  distribution={stage3Dist}
                  lastSampledToken={stage3History[0] ?? null}
                  onSelectToken={recordStage3Sample}
                />
              )}
              {activeStage === 4 && (
                <ProbabilityBarCanvas
                  mode="top-p"
                  temperature={stage4Temp}
                  topP={stage4TopP}
                  distribution={stage4Dist}
                  lastSampledToken={stage4History[0] ?? null}
                  onSelectToken={recordStage4Sample}
                />
              )}
            </aside>
          </div>
        )}
      </main>
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
