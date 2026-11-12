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
    bestRoute: 'Best Route',
    activeBeam: 'Active Beam',
    rootLabel: 'ROOT',
    promptBadge: 'PROMPT',
    safeCategory: 'SAFE',
    creativeCategory: '★ CREATIVE',
    tailCategory: '⚠ TAIL',
    probeLandedBadge: '🎯 PROBE LANDED',
    activePoolLabel: 'Active Pool:',
    tokensUnit: 'tokens',
    cumulativeThresholdLabel: 'Cumulative P ≤',
    tempFrozenHint: '0.1 (Frozen / Greedy)',
    tempStandardHint: '1.0 (Standard)',
    tempChaoticHint: '2.0 (Chaotic)',
    topPStrictHint: '0.10 (Strict)',
    topPSweetSpotHint: '0.85 (Sweet Spot)',
    topPNoFilterHint: '1.00 (No Filter)',
    beamGreedyHint: 'k=1 (Greedy)',
    beamWideHint: 'k=5 (Wide)',
    summaryTitle: 'CHEAT SHEET: WHEN TO USE WHICH STRATEGY',
    summaryItems: {
      greedy: 'Greedy (k=1): Fast deterministic baseline; great for single-answer classification, but prone to repetitive loops and local traps.',
      beam: 'Beam Search (k=2..5): Best for machine translation, summarization, and structured code where highest whole-sentence probability matters.',
      temp: 'Temperature (T): Reshapes logits before Softmax; use low T (0.1–0.4) for factual Q&A and higher T (0.8–1.4) for creative writing.',
      topP: 'Top-P (Nucleus): Cuts off the long tail of absurd tokens while dynamically adapting to model confidence—the standard pairing with Temperature.',
    },
  },
  stages: {
    0: {
      badge: 'SECTOR 00 // MISSION BRIEFING',
      title: 'How Do AI Models Choose Their Next Word?',
      metaphorScaffold:
        'When ChatGPT or a local LLM writes a sentence, it does not plan whole paragraphs in advance. Instead, it plays a high-speed navigation game—predicting strictly one word (token) at a time by assigning a probability score to every word in its vocabulary.',
      metaphorDetail:
        'Welcome aboard the Starlight Decoder! An astronaut in deep space just transmitted an incomplete signal: "The astronaut looked out the window and saw..." On our Star-Atlas, every candidate word is a star system and its brightness is the probability the AI assigns to it. Across 4 sectors, you will pilot the ship through deterministic tree search (Greedy & Beam Search) and stochastic probe sampling (Temperature & Top-P) to see how decoding shapes AI intelligence.',
      goalText: 'Click Engage Autopilot below to open the Star-Atlas and start Sector 01.',
      mathTitle: 'Autoregressive Next-Token Prediction',
      mathFormula: 'P(y_1, ..., y_T) = ∏_{t=1..T} P(y_t | y_<t)',
      mathScaffold:
        'By the chain rule of probability, the likelihood of a complete sentence is the product of conditional probabilities of each token given all preceding tokens. Because searching every possible sentence across a 100,000-token vocabulary is exponentially impossible (V^T paths), LLMs rely on decoding heuristics to navigate the tree.',
      mathTakeaways: [
        'A Transformer forward pass only outputs a vector of raw scores (logits) for the single next token.',
        'The decoding strategy—not the neural network weights—decides how to turn those probabilities into actual words.',
      ],
    },
    1: {
      badge: 'SECTOR 01 // SHORT-RANGE AUTOPILOT',
      title: 'The Greedy Trap (k = 1)',
      metaphorScaffold:
        'Our ship’s default short-range autopilot is impatient: at every jump gate, it only scans the immediate stars one hop ahead and blindly jumps to whichever star shines brightest right now.',
      metaphorDetail:
        'At Step 1, the word "nothing" (P = 0.45) edges out "a" (P = 0.40). Greedy autopilot immediately commits to "nothing"—only to discover at Steps 2 and 3 that every continuation after "nothing" is a dim asteroid field ("nothing at all.", total route probability P = 0.045), while a glowing 0.306 super-highway was hiding right behind "a"!',
      goalText: 'Click Step Autopilot 3 times to watch the k = 1 greedy ship fly straight into the "nothing at all." dead-end.',
      mathTitle: 'Under the Hood: Greedy Decoding & Local Optima',
      mathFormula: 'y_t = argmax_{w ∈ V} P(w | y_<t)',
      mathScaffold:
        'Greedy decoding picks the single highest-probability token at step t and discards every other branch forever. While computationally cheap—requiring only 1 forward pass per token—it maximizes local step probability rather than global sequence probability.',
      mathTakeaways: [
        'A high-probability function word or generic phrase at Step 1 ("nothing" at 0.45) can trap the model in a low-probability continuation (0.45 × 0.25 × 0.40 = 0.045).',
        'In longer generations, greedy decoding frequently gets stuck in repetitive phrasing loops because it has no mechanism to backtrack or compare parallel futures.',
      ],
    },
    2: {
      badge: 'SECTOR 02 // PARALLEL SCANNER BEAMS',
      title: 'Beam Search & Pruning (k = 1..5)',
      metaphorScaffold:
        'How do we escape the Greedy Trap without exploring every star in the galaxy? Instead of committing to one star immediately, we widen our scanner to project k parallel sensor beams at once!',
      metaphorDetail:
        'When you set Beam Width k ≥ 2, the ship keeps both "nothing" (0.45) and "a" (0.40) alive at Step 1. At Step 2, the scanner multiplies the cumulative path scores: "a glowing" surges ahead to 0.340 (0.40 × 0.85), overtaking "nothing at" (0.113)! By Step 3, Beam Search locks onto "a glowing nebula." (P = 0.306)—nearly 7× stronger than the greedy route—and prunes the weaker branches.',
      goalText: 'Drag the Beam Width (k) slider to 2 or higher at Step 3 to rescue the signal and lock onto "a glowing nebula." (P = 0.306).',
      mathTitle: 'Under the Hood: Beam Search & Log-Probabilities',
      mathFormula: 'score(y_{1:t}) = ∑_{i=1..t} log P(y_i | y_<i)',
      mathScaffold:
        'At each step t, Beam Search expands the k active partial hypotheses across the vocabulary, scores all k × |V| candidates by their cumulative probability, keeps the top k, and prunes the rest. In production LLMs, scores are computed by summing log-probabilities rather than multiplying raw probabilities.',
      mathTakeaways: [
        'Why logs? Multiplying dozens of decimals smaller than 1.0 quickly underflows 32-bit/16-bit floating-point numbers to 0.0. Because log(a × b) = log(a) + log(b) and log is monotonically increasing, summing log-probabilities preserves the exact ranking safely.',
        'Trade-off: Beam Search costs k× more compute and memory (KV-cache) per step, and works best for bounded tasks like translation or summarization rather than open-ended creative chat.',
      ],
    },
    3: {
      badge: 'SECTOR 03 // THERMAL STOCHASTICITY',
      title: 'Reactor Temperature (T)',
      metaphorScaffold:
        'Beam Search found the most textbook sentence ("a glowing nebula."). But what if we are writing sci-fi fiction and want the astronaut to witness something surprising? Instead of always taking the #1 winner, we roll the dice—and control the odds with Reactor Temperature (T)!',
      metaphorDetail:
        'Watch the 8 candidate word-bars on the right as you drag Temperature. When the core is frozen (T = 0.1), "nebula" hogs 99.3% of the probability—every probe lands on the exact same word. As you heat the reactor up (T ≥ 1.2), the tall bars melt down and share probability with rare, poetic sightings like "leviathan", "monolith", and "cathedral"!',
      goalText: 'Heat Reactor Temperature to T ≥ 1.2 and fire sample probes (or click an active bar) until you land on a ★ CREATIVE sighting ("leviathan", "monolith", or "cathedral").',
      mathTitle: 'Under the Hood: Temperature-Scaled Softmax',
      mathFormula: 'P(w_i) = exp(z_i / T) / ∑_j exp(z_j / T)',
      mathScaffold:
        'Before turning the neural network’s raw unnormalized scores (logits z_i) into probabilities via the Softmax exponential, the decoder divides every logit by Temperature T. Because exponentiation amplifies differences, dividing by T directly controls the Shannon entropy of the distribution.',
      mathTakeaways: [
        'Low Temperature (T → 0): Stretches logit gaps toward infinity, driving the top token’s probability toward 100% (converging to deterministic argmax / Greedy Search).',
        'High Temperature (T > 1): Compresses differences between logits, flattening the distribution so creative lower-logit tokens get sampled—at the cost of also waking up nonsensical tail tokens like "banana" and "404_error".',
      ],
    },
    4: {
      badge: 'SECTOR 04 // CONTAINMENT FIELD',
      title: 'Top-P Nucleus Sampling',
      metaphorScaffold:
        'Running the reactor hot (T = 1.5) unlocked awesome creative words like "leviathan"—but look at the bottom bars: "banana" (6.0%) and "404_error" (4.6%) snuck into our jump pool! Roughly 1 in 10 probes will corrupt the transmission with total gibberish.',
      metaphorDetail:
        'To get creativity without hallucinations, we activate the Top-P Containment Shield (Nucleus Sampling). Starting from the #1 most likely word, the shield sweeps downward, adding up probabilities until the cumulative sum crosses p. Every word inside that "Nucleus" survives and has its probability re-normalized to 100%, while the long tail outside the shield is stamped CUT OFF (0%)!',
      goalText: 'Keep T ≥ 1.3 and tune the Top-P slider (around p = 0.80–0.89) so all 3 ★ CREATIVE words stay inside the active Nucleus while both ⚠ TAIL tokens ("banana" and "404_error") are 100% cut off.',
      mathTitle: 'Under the Hood: Top-P (Nucleus) Truncation & Re-Normalization',
      mathFormula: '∑_{w ∈ V^(p)} P(w) ≥ p   →   P′(w) = P(w) / ∑_{v ∈ V^(p)} P(v)',
      mathScaffold:
        'Introduced by Holtzman et al. (2020), Nucleus Sampling sorts the vocabulary descending by probability and selects the smallest prefix set V^(p) whose cumulative probability mass reaches p. All tokens outside V^(p) are zeroed out, and the surviving tokens are divided by their sum so the distribution sums to 1.0 again.',
      mathTakeaways: [
        'Why Top-P beats fixed Top-K: When the model is confident (e.g., "nebula" has 90%), a fixed Top-K=10 would still let 9 unlikely words in, whereas Top-P=0.85 dynamically shrinks the pool to just 1 word.',
        'When the model is uncertain across many good options (high Temperature), Top-P automatically expands the pool to include creative choices while still slicing off the unreliable "long tail".',
      ],
    },
  },
};
