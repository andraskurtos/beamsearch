import type { LogitCandidate, StarTreeNode } from '../data/decodingData';

export interface EvaluatedBeamPath {
  nodeIds: string[];
  tokens: string[];
  stepProbs: number[];
  cumulativeProb: number;
  logProbSum: number;
  status: 'active' | 'winner' | 'pruned';
  inTopK: boolean;
  prunedAtStep?: number;
}

interface InternalPartialPath {
  nodes: StarTreeNode[];
  cumulativeProb: number;
  logProbSum: number;
  prunedAtStep?: number;
}

/**
 * Evaluates Beam Search up to `currentStep` (0..3) on the curated StarTreeNode.
 * Tracks all branches in the tree so the UI can render both surviving beams and pruned branches.
 */
export function evaluateBeamSearch(
  tree: StarTreeNode,
  beamWidth: number,
  currentStep: 0 | 1 | 2 | 3
): EvaluatedBeamPath[] {
  const k = Math.max(1, Math.min(5, Math.round(beamWidth)));

  if (currentStep === 0 || !tree.children) {
    return [];
  }

  let partials: InternalPartialPath[] = [
    {
      nodes: [],
      cumulativeProb: 1.0,
      logProbSum: 0,
    },
  ];

  for (let step = 1; step <= currentStep; step++) {
    const expanded: InternalPartialPath[] = [];

    for (const path of partials) {
      const lastNode = path.nodes.length === 0 ? tree : path.nodes[path.nodes.length - 1];
      const children = lastNode.children ?? [];

      if (children.length === 0) {
        expanded.push(path);
        continue;
      }

      for (const child of children) {
        const nextProb = path.cumulativeProb * child.prob;
        const nextLogProb = path.logProbSum + Math.log(child.prob);
        expanded.push({
          nodes: [...path.nodes, child],
          cumulativeProb: nextProb,
          logProbSum: nextLogProb,
          prunedAtStep: path.prunedAtStep,
        });
      }
    }

    // Only unpruned paths compete for the top-k slots at this step
    const candidates = expanded
      .filter((p) => p.prunedAtStep === undefined)
      .sort((a, b) => b.cumulativeProb - a.cumulativeProb);

    const allowedSet = new Set(candidates.slice(0, k));

    for (const p of expanded) {
      if (p.prunedAtStep === undefined && !allowedSet.has(p)) {
        p.prunedAtStep = step;
      }
    }

    partials = expanded;
  }

  // Sort all resulting paths by cumulativeProb descending
  const sorted = [...partials].sort((a, b) => b.cumulativeProb - a.cumulativeProb);
  const bestUnpruned = sorted.find((p) => p.prunedAtStep === undefined);

  return sorted.map((p) => {
    const inTopK = p.prunedAtStep === undefined;
    const isWinner = bestUnpruned === p;

    let status: 'active' | 'winner' | 'pruned';
    if (isWinner) {
      status = 'winner';
    } else if (!inTopK) {
      status = 'pruned';
    } else if (currentStep === 3) {
      // At final sequence step 3, non-winning hypotheses are pruned in favor of the best sequence
      status = 'pruned';
    } else {
      status = 'active';
    }

    return {
      nodeIds: p.nodes.map((n) => n.id),
      tokens: p.nodes.map((n) => n.token),
      stepProbs: p.nodes.map((n) => n.prob),
      cumulativeProb: Number(p.cumulativeProb.toFixed(6)),
      logProbSum: Number(p.logProbSum.toFixed(4)),
      status,
      inTopK,
      prunedAtStep: p.prunedAtStep ?? (currentStep === 3 && !isWinner ? 3 : undefined),
    };
  });
}

export interface ScaledTokenProb extends LogitCandidate {
  rawProb: number;
  inNucleus: boolean;
  finalProb: number;
  cumulativeBefore: number;
  cumulativeAfter: number;
}

/**
 * Computes Temperature-scaled Softmax followed by Top-P (Nucleus) truncation and re-normalization.
 */
export function computeSamplingDistribution(
  candidates: LogitCandidate[],
  temperature: number,
  topP: number
): ScaledTokenProb[] {
  const safeT = Math.max(0.05, temperature);
  const clampedP = Math.max(0.01, Math.min(1.0, topP));

  // Numerical stability: shift scaled logits by max(z_i / T)
  const scaledLogits = candidates.map((c) => c.logit / safeT);
  const maxLogit = Math.max(...scaledLogits);
  const exps = scaledLogits.map((s) => Math.exp(s - maxLogit));
  const sumExp = exps.reduce((a, b) => a + b, 0);

  const withRawProb = candidates
    .map((c, idx) => ({
      ...c,
      rawProb: exps[idx] / sumExp,
    }))
    .sort((a, b) => b.rawProb - a.rawProb);

  let runningCumul = 0;
  const annotated = withRawProb.map((item, idx) => {
    const cumulativeBefore = runningCumul;
    runningCumul += item.rawProb;
    const cumulativeAfter = runningCumul;
    // Always keep at least the #1 highest-probability token (idx === 0),
    // and include subsequent tokens while cumulative mass before adding them is strictly below topP
    const inNucleus = idx === 0 || cumulativeBefore < clampedP - 1e-9;

    return {
      ...item,
      inNucleus,
      cumulativeBefore,
      cumulativeAfter,
      finalProb: 0,
    };
  });

  const nucleusMass = annotated
    .filter((item) => item.inNucleus)
    .reduce((acc, item) => acc + item.rawProb, 0);

  return annotated.map((item) => ({
    ...item,
    finalProb: item.inNucleus && nucleusMass > 0 ? item.rawProb / nucleusMass : 0,
  }));
}

/**
 * Samples a token from the active Nucleus distribution using an optional deterministic RNG (0..1).
 */
export function sampleFromDistribution(
  dist: ScaledTokenProb[],
  rng: () => number = Math.random
): ScaledTokenProb {
  const active = dist.filter((d) => d.inNucleus && d.finalProb > 0);
  if (active.length === 0) {
    return dist[0];
  }

  const r = Math.max(0, Math.min(0.999999, rng()));
  let accum = 0;
  for (const item of active) {
    accum += item.finalProb;
    if (r <= accum) {
      return item;
    }
  }
  return active[active.length - 1];
}

