import { describe, it, expect } from 'vitest';
import { BEAM_TREE_DATA, LOGIT_CANDIDATES } from '../../data/decodingData';
import {
  evaluateBeamSearch,
  computeSamplingDistribution,
  sampleFromDistribution,
} from '../decodingMath';

describe('decodingMath engine', () => {
  it('springs the Greedy Trap when k=1 at step 3 (final prob 0.045 on "nothing at all.")', () => {
    const paths = evaluateBeamSearch(BEAM_TREE_DATA, 1, 3);
    const winner = paths.find((p) => p.status === 'winner');
    expect(winner?.tokens).toEqual(['nothing', 'at', 'all.']);
    expect(winner?.cumulativeProb).toBeCloseTo(0.045, 4);
  });

  it('discovers "a glowing nebula." (0.306) when k >= 2 at step 3 and prunes "nothing" at step 2', () => {
    const paths = evaluateBeamSearch(BEAM_TREE_DATA, 2, 3);
    const winner = paths.find((p) => p.status === 'winner');
    expect(winner?.tokens).toEqual(['a', 'glowing', 'nebula.']);
    expect(winner?.cumulativeProb).toBeCloseTo(0.306, 4);

    const greedyTrapBranch = paths.find((p) => p.tokens.join(' ') === 'nothing at all.');
    expect(greedyTrapBranch?.status).toBe('pruned');
  });

  it('maintains numerical stability across extreme temperatures T=0.1 and T=2.0 (Review Focus #2)', () => {
    for (const T of [0.1, 1.0, 2.0]) {
      const dist = computeSamplingDistribution(LOGIT_CANDIDATES, T, 1.0);
      const sum = dist.reduce((acc, item) => acc + item.finalProb, 0);
      expect(sum).toBeCloseTo(1.0, 5);
      expect(dist.every((d) => !Number.isNaN(d.finalProb))).toBe(true);
    }
    const lowT = computeSamplingDistribution(LOGIT_CANDIDATES, 0.1, 1.0);
    expect(lowT[0].token).toBe('nebula');
    expect(lowT[0].finalProb).toBeGreaterThan(0.99);
  });

  it('keeps at least the top token in the nucleus even when p=0.10 < P(top) (Review Focus #3)', () => {
    const dist = computeSamplingDistribution(LOGIT_CANDIDATES, 0.1, 0.1);
    const active = dist.filter((d) => d.inNucleus);
    expect(active).toHaveLength(1);
    expect(active[0].token).toBe('nebula');
    expect(active[0].finalProb).toBeCloseTo(1.0, 5);
  });

  it('cuts off garbage tail ("banana", "404_error") while keeping creative tokens at T=1.5, p=0.88', () => {
    const dist = computeSamplingDistribution(LOGIT_CANDIDATES, 1.5, 0.88);
    const byToken = Object.fromEntries(dist.map((d) => [d.token, d]));
    expect(byToken['leviathan'].inNucleus).toBe(true);
    expect(byToken['monolith'].inNucleus).toBe(true);
    expect(byToken['cathedral'].inNucleus).toBe(true);
    expect(byToken['banana'].inNucleus).toBe(false);
    expect(byToken['banana'].finalProb).toBe(0);
    expect(byToken['404_error'].inNucleus).toBe(false);
    expect(byToken['404_error'].finalProb).toBe(0);
    expect(sampleFromDistribution(dist, () => 0.999).inNucleus).toBe(true);
  });
});

