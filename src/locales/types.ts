export type StageId = 0 | 1 | 2 | 3 | 4;
export type Language = 'en' | 'hu';

export interface StageLocaleEntry {
  badge: string;
  title: string;
  metaphorScaffold: string;
  goalText: string;
  mathTitle: string;
  mathFormula: string;
  mathScaffold: string;
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

