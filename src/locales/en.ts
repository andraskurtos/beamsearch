import type { LocaleSchema } from './types';

export const en: LocaleSchema = {
  appTitle: 'STARLIGHT DECODER',
  appSubtitle: 'INTERACTIVE GUIDE TO LLM DECODING STRATEGIES',
  promptPrefix: 'The astronaut looked out the window and saw',
  promptStage3Prefix: 'The astronaut looked out the window and saw a glowing',
  nav: {
    stages: {
      0: '00 INTRO',
      1: '01 GREEDY',
      2: '02 BEAM SEARCH',
      3: '03 TEMPERATURE',
      4: '04 TOP-P',
    },
    langToggle: 'HU / EN',
  },
  ui: {
    launchMission: 'ENGAGE AUTOPILOT → SECTOR 01',
    missionGoal: 'MISSION OBJECTIVE',
    missionComplete: 'MISSION COMPLETE — LLM MATH UNLOCKED',
    showMath: 'PEEK AT LLM MATH',
    hideMath: 'HIDE LLM MATH',
    nextStage: 'NEXT SECTOR →',
    prevStage: '← PREV SECTOR',
    stepAutopilot: 'STEP AUTOPILOT (GREEDY)',
    reset: 'RESET ROUTE',
    beamWidthLabel: 'BEAM WIDTH (k)',
    stepLabel: 'JUMP STEP',
    temperatureLabel: 'REACTOR TEMPERATURE (T)',
    topPLabel: 'NUCLEUS SHIELD (TOP-P)',
    fireProbe: '🎲 FIRE SAMPLE PROBE',
    sampledHistory: 'RECENT PROBE LANDINGS:',
    noSamplesYet: 'No probes fired yet — click Fire Sample Probe or click a bar!',
    prunedStamp: 'PRUNED',
    cutOffStamp: 'CUT OFF (0%)',
    nucleusZone: 'ACTIVE NUCLEUS (TOP-P)',
    liveTransmission: 'LIVE TRANSMISSION SIGNAL:',
    sequenceProbability: 'TOTAL ROUTE PROBABILITY:',
    clickBarHint: 'Tip: Fire a random probe or click any active token bar to test landing on it.',
    summaryTitle: 'CHEAT SHEET: WHEN TO USE WHICH STRATEGY',
    summaryItems: {
      greedy: 'Greedy (k=1): Fast deterministic baseline; prone to repetitive loops and local traps.',
      beam: 'Beam Search (k=2..5): Best for translation & summarization where high whole-sentence likelihood matters.',
      temp: 'Temperature (T): Reshapes logits before Softmax; lower T for facts/code, higher T for creative flair.',
      topP: 'Top-P (Nucleus): Cuts off the long tail of absurd tokens while dynamically adapting to confidence.',
    },
  },
  stages: {
    0: {
      badge: 'SECTOR 00 // MISSION BRIEFING',
      title: 'How Do AI Models Choose Their Next Word?',
      metaphorScaffold:
        '[Scaffold Copy] LLMs generate text one token at a time by scoring every candidate word. In Starlight Decoder, each word is a star system and its brightness is its probability—your job is to guide the ship through the probability map to finish the astronaut’s transmission.',
      goalText: 'Click Engage Autopilot below to open the Star-Atlas and start Sector 01.',
      mathTitle: 'Autoregressive Next-Token Prediction',
      mathFormula: 'P(y_1, ..., y_T) = ∏ P(y_t | y_<t)',
      mathScaffold:
        '[Scaffold Math] At each step t, a Transformer outputs raw logits over its vocabulary and converts them into a conditional probability distribution for the next token.',
    },
    1: {
      badge: 'SECTOR 01 // SHORT-RANGE AUTOPILOT',
      title: 'The Greedy Trap (k = 1)',
      metaphorScaffold:
        '[Scaffold Copy] Short-range autopilot blindly jumps to the single highest-probability star right in front of the ship at every fork, completely ignoring what lies two steps ahead.',
      goalText: 'Step the greedy autopilot 3 times to watch it fly straight into a low-probability dead-end.',
      mathTitle: 'Under the Hood: Greedy Decoding',
      mathFormula: 'y_t = argmax_w P(w | y_<t)',
      mathScaffold:
        '[Scaffold Math] Greedy search picks the highest local probability at each step (0.45), but locks the sequence into "nothing at all." with a poor joint probability of 0.045.',
    },
    2: {
      badge: 'SECTOR 02 // PARALLEL SCANNER BEAMS',
      title: 'Beam Search & Pruning (k = 1..5)',
      metaphorScaffold:
        '[Scaffold Copy] Instead of committing to one star immediately, Beam Search projects k parallel scanner beams across the map, keeping the top k highest cumulative routes alive and pruning weaker branches.',
      goalText: 'Slide Beam Width (k) to 2 or higher at Step 3 to discover the 0.306 "a glowing nebula." route.',
      mathTitle: 'Under the Hood: Beam Search Scoring',
      mathFormula: 'score(y_1..t) = ∑ log P(y_i | y_<i)',
      mathScaffold:
        '[Scaffold Math] By keeping k=2 hypotheses in parallel, the model retains "a" (0.40) at Step 1 and discovers "a glowing nebula." (P = 0.306, nearly 7× better than Greedy). Real LLMs sum log-probabilities to avoid floating-point underflow.',
    },
    3: {
      badge: 'SECTOR 03 // THERMAL STOCHASTICITY',
      title: 'Reactor Temperature (T)',
      metaphorScaffold:
        '[Scaffold Copy] Always picking the #1 path makes creative writing predictable. Heating up the Reactor Temperature (T) flattens the probability bars so our sampling probe can land on rare, creative words.',
      goalText: 'Set Temperature T ≥ 1.2 and land a sample probe on a Creative Sighting ("leviathan", "monolith", or "cathedral").',
      mathTitle: 'Under the Hood: Temperature-Scaled Softmax',
      mathFormula: 'P(w_i) = exp(z_i / T) / ∑_j exp(z_j / T)',
      mathScaffold:
        '[Scaffold Math] Dividing raw logits z_i by T < 1 sharpens the peak toward argmax; T > 1 increases entropy and boosts creative tokens—at the risk of waking up the garbage tail.',
    },
    4: {
      badge: 'SECTOR 04 // CONTAINMENT FIELD',
      title: 'Top-P Nucleus Sampling',
      metaphorScaffold:
        '[Scaffold Copy] High temperature unlocked awesome words like "leviathan", but also let "banana" and "404_error" sneak in! The Top-P shield sweeps from the most likely word downward until reaching cumulative probability p, cutting off the garbage tail.',
      goalText: 'With T ≥ 1.3, tune Top-P so all 3 creative words stay inside the Nucleus while "banana" and "404_error" are 100% cut off.',
      mathTitle: 'Under the Hood: Top-P (Nucleus) Truncation',
      mathFormula: '∑_{w ∈ V^(p)} P(w) ≥ p',
      mathScaffold:
        '[Scaffold Math] Top-P keeps the smallest set of top-ranked tokens whose cumulative probability reaches p, zeroes out the rest, and re-normalizes—preserving high-temperature creativity without incoherent tail tokens.',
    },
  },
};

