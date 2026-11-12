import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../context/LocaleContext';
import type { StageId } from '../locales/types';

interface StageCardProps {
  stageId: StageId;
  isActive: boolean;
  isCompleted: boolean;
  onActivate: () => void;
  onNavigateStage: (stage: StageId) => void;
  children?: React.ReactNode;
}

export function StageCard({
  stageId,
  isActive,
  isCompleted,
  onActivate,
  onNavigateStage,
  children,
}: StageCardProps) {
  const { t } = useLocale();
  const [manualMathOpen, setManualMathOpen] = useState(false);

  const stageCopy = t.stages[stageId];
  const isMathVisible = isCompleted || manualMathOpen;

  return (
    <motion.section
      layout
      id={`stage-section-${stageId}`}
      data-testid={`stage-card-${stageId}`}
      onClick={onActivate}
      className={`brutal-border bg-[#FFFDF7] p-5 md:p-6 transition-all ${
        isActive
          ? 'brutal-shadow-lg ring-2 ring-black'
          : 'brutal-shadow opacity-85 hover:opacity-100'
      }`}
    >
      {/* Top Badge Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="inline-block bg-[#FF6B6B] brutal-border-sm px-2.5 py-0.5 text-xs font-mono font-bold uppercase">
          {stageCopy.badge}
        </span>

        {stageId > 0 && (
          <span
            data-testid={`stage-status-${stageId}`}
            className={`inline-flex items-center gap-1.5 brutal-border-sm px-2.5 py-0.5 text-xs font-mono font-bold ${
              isCompleted ? 'bg-[#A7F3D0] text-black' : 'bg-[#FFE600] text-black'
            }`}
          >
            {isCompleted ? `★ ${t.ui.missionComplete}` : `◎ ${t.ui.missionGoal}`}
          </span>
        )}
      </div>

      {/* Stage Heading & Narrative */}
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-2.5">
        {stageCopy.title}
      </h2>

      <div className="space-y-2.5 text-sm md:text-base leading-relaxed text-black/90 mb-4">
        <p>{stageCopy.metaphorScaffold}</p>
        {stageCopy.metaphorDetail && (
          <p className="text-black/80 text-xs md:text-sm bg-white/80 brutal-border-sm p-3">
            {stageCopy.metaphorDetail}
          </p>
        )}
      </div>

      {/* Mission Goal Box */}
      <div className="bg-[#FFE600]/60 brutal-border-sm p-3 mb-4 text-xs md:text-sm font-medium">
        <strong className="font-mono uppercase mr-1.5">{t.ui.missionGoal}:</strong>
        <span>{stageCopy.goalText}</span>
      </div>

      {/* Interactive Controls Slot */}
      {children && (
        <div
          className="mb-4"
          onClick={(e) => {
            e.stopPropagation();
            if (!isActive) onActivate();
          }}
        >
          {children}
        </div>
      )}

      {/* Stage 0 Launch CTA */}
      {stageId === 0 && (
        <div className="my-5">
          <div className="brutal-border-sm bg-[#E0E7FF] p-3.5 mb-4 font-mono text-xs md:text-sm">
            <span className="text-black/60 block text-[11px] uppercase mb-1">
              {t.ui.liveTransmission}
            </span>
            <span className="font-bold">"{t.promptPrefix}</span>{' '}
            <span className="bg-[#FFE600] brutal-border-sm px-2 py-0.5 font-bold">
              [ ??? ]
            </span>
            "
          </div>

          <button
            type="button"
            data-testid="launch-mission-btn"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateStage(1);
            }}
            className="brutal-btn bg-[#FF6B6B] text-black px-6 py-3 text-sm md:text-base font-mono uppercase tracking-wide w-full sm:w-auto"
          >
            🚀 {t.ui.launchMission}
          </button>
        </div>
      )}

      {/* Manual Toggle + Expandable "Under the Hood" LLM Math Drawer */}
      <div className="mt-4 pt-3 border-t-2 border-black/20">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            data-testid={`math-toggle-${stageId}`}
            onClick={(e) => {
              e.stopPropagation();
              setManualMathOpen((prev) => !prev);
            }}
            className="text-xs font-mono font-bold underline cursor-pointer hover:bg-[#FFE600] px-1.5 py-0.5"
          >
            {isMathVisible ? `▲ ${t.ui.hideMath}` : `▼ ${t.ui.showMath}`}
          </button>

          {stageId > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid={`prev-stage-btn-${stageId}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateStage((stageId - 1) as StageId);
                }}
                className="brutal-btn bg-white px-2.5 py-1 text-xs font-mono"
              >
                {t.ui.prevStage}
              </button>
              {stageId < 4 && (
                <button
                  type="button"
                  data-testid={`next-stage-btn-${stageId}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateStage((stageId + 1) as StageId);
                  }}
                  className="brutal-btn bg-[#FFE600] px-2.5 py-1 text-xs font-mono"
                >
                  {t.ui.nextStage}
                </button>
              )}
            </div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {isMathVisible && (
            <motion.div
              key={`math-drawer-${stageId}`}
              initial={{ y: -6 }}
              animate={{ y: 0 }}
              exit={{ y: -6 }}
              transition={{ duration: 0.18 }}
              data-testid={`math-drawer-${stageId}`}
              className="mt-3 bg-[#A7F3D0] brutal-border-sm brutal-shadow-sm p-3.5 overflow-hidden"
            >
              <div className="font-mono text-xs font-bold uppercase tracking-wide mb-1.5">
                🔓 {stageCopy.mathTitle}
              </div>
              <div className="bg-[#FFFDF7] brutal-border-sm px-3 py-1.5 font-mono text-xs font-bold mb-2.5">
                {stageCopy.mathFormula}
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-black/90 mb-2.5">
                {stageCopy.mathScaffold}
              </p>
              {stageCopy.mathTakeaways.length > 0 && (
                <ul className="space-y-1.5 list-disc list-inside text-xs text-black/85 border-t border-black/20 pt-2">
                  {stageCopy.mathTakeaways.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
