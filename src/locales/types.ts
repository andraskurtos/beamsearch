export type StageId = 0 | 1 | 2 | 3 | 4;
export type Language = 'en' | 'hu';

export interface StageLocaleEntry {
  badge: string;
  title: string;
  metaphorScaffold: string;
  metaphorDetail: string;
  goalText: string;
  mathTitle: string;
  mathFormula: string;
  mathScaffold: string;
  mathTakeaways: string[];
}

export interface LocaleSchema {
  appTitle: string;
  appSubtitle: string;
  promptPrefix: string;
  promptStage3Prefix: string;
  nav: {
    stages: Record<StageId, string>;
    langToggle: string;
  };
  ui: {
    launchMission: string;
    missionGoal: string;
    missionComplete: string;
    showMath: string;
    hideMath: string;
    nextStage: string;
    prevStage: string;
    stepAutopilot: string;
    reset: string;
    beamWidthLabel: string;
    stepLabel: string;
    temperatureLabel: string;
    topPLabel: string;
    fireProbe: string;
    sampledHistory: string;
    noSamplesYet: string;
    prunedStamp: string;
    cutOffStamp: string;
    nucleusZone: string;
    liveTransmission: string;
    sequenceProbability: string;
    clickBarHint: string;
    bestRoute: string;
    activeBeam: string;
    rootLabel: string;
    promptBadge: string;
    safeCategory: string;
    creativeCategory: string;
    tailCategory: string;
    probeLandedBadge: string;
    activePoolLabel: string;
    tokensUnit: string;
    cumulativeThresholdLabel: string;
    tempFrozenHint: string;
    tempStandardHint: string;
    tempChaoticHint: string;
    topPStrictHint: string;
    topPSweetSpotHint: string;
    topPNoFilterHint: string;
    beamGreedyHint: string;
    beamWideHint: string;
    summaryTitle: string;
    summaryItems: {
      greedy: string;
      beam: string;
      temp: string;
      topP: string;
    };
  };
  stages: Record<StageId, StageLocaleEntry>;
}
