# Starlight Decoder (Scaffold & Interactive Core) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete interactive scaffold, Neo-Brutalist Zine layout, decoding math engine, visualizers, and externalized localization (`i18n`) system for Starlight Decoder using concise structural copy placeholders so narrative stories can be authored and translated independently.

**Architecture:** A client-side React + TypeScript single-page application styled with Tailwind CSS and animated with Framer Motion (`motion`). All copy lives in typed locale dictionaries (`src/locales/en.ts`, `src/locales/hu.ts`) accessed via `useLocale()`, while pure deterministic functions (`src/lib/decodingMath.ts`) drive the Stage 1–2 SVG Star-Tree and Stage 3–4 Softmax/Top-$p$ Probability Bar visualizers inside a layout that shifts from a full-screen Stage 0 Preamble into a 40% Left Story / 60% Right Star-Canvas split view.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS v4, Framer Motion (`motion`), Vitest + React Testing Library (`jsdom`).

**Spec:** `docs/superpowers/specs/2026-11-12-starlight-decoder-design.md`

## Global Constraints

- **No inline narrative prose in JSX:** Every user-facing heading, button label, mission prompt, narrative block, and "Under the Hood" math explanation must come from `src/locales/{en,hu}.ts` via `useLocale()`.
- **Scaffold-first copy:** Initial locale entries must use concise, structured scaffold text (1–2 sentences per slot + formula string) rather than long essays so layout, state transitions, and visualizers are verified cleanly first.
- **Neo-Brutalist Zine palette & borders:** Main surface `#FFFDF7`, Star-Canvas surface `#E0E7FF` with `#000` dot grid, highlights `#FFE600` (yellow), `#FF6B6B` (coral), `#A7F3D0` (mint), `#E5E7EB` (pruned gray), `3px solid #000000` borders, and hard offset shadows (`4px 4px 0px #000000`). No dark-mode slate or glassmorphism.
- **Zero progression locks:** Users can navigate freely between Stages `0..4` via scrolling or the top stage bar and can toggle the "Under the Hood" drawer open at any time even before completing a stage's win condition.
- **Curated deterministic math:** Use the exact tree probabilities and raw logits from Section 5.3 of the spec; no external API calls or model weights.

## Review Focus

1. **Locale switching & completeness:** Switching between `EN` and `HU` in the header updates all visible stage copy immediately, and both locales satisfy the exact same TypeScript `LocaleSchema` interface with zero missing keys. (Pinned in Task 1)
2. **Extreme Temperature numerical stability:** Passing boundary slider values ($T = 0.1$ or $T = 2.0$) into Softmax never produces `NaN`/`Infinity` (uses max-logit shift $z_i / T - \max_j(z_j / T)$) and probabilities always sum to `1.0 ± 1e-6`. (Pinned in Task 2)
3. **Top-$p$ single-token dominance:** When the highest-probability token alone has $P_1 \ge p$ (e.g., $T = 0.1, P(\text{"nebula"}) = 0.999, p = 0.10$), Top-$p$ truncation still keeps that #1 token in the active nucleus ($V^{(p)}$ is never empty) with re-normalized probability `1.0`. (Pinned in Task 2)
4. **Non-blocking navigation & manual math peek:** A user can jump directly from Stage 0 to Stage 4 (or back to Stage 0, restoring the full-width preamble) without completing any mission, and can click the manual math toggle on an unsolved stage to read the "Under the Hood" explanation. (Pinned in Task 3)
5. **Stage 1 vs. Stage 2 shared tree isolation:** Moving from Stage 2 (where the user set $k = 4$) back to Stage 1 always renders Stage 1 as strict Greedy Search ($k = 1$) without corrupting the user's saved $k$ slider value in Stage 2. (Pinned in Task 4)

---

### File Structure Map

```
src/
├── locales/
│   ├── types.ts                        # Strict TypeScript schema for all translatable text
│   ├── en.ts                           # English scaffold strings (UI, stages 0-4, math drawers)
│   └── hu.ts                           # Hungarian scaffold strings (matching schema)
├── context/
│   └── LocaleContext.tsx               # LocaleProvider + useLocale() hook
├── data/
│   └── decodingData.ts                 # Curated Beam Search tree + 8-token Logit pool
├── lib/
│   └── decodingMath.ts                 # Pure functions: Greedy, Beam Search, Softmax(T), Top-P, Sampler
├── components/
│   ├── TopNavBar.tsx                   # Neo-Brutalist header: stage tabs (00..04) + EN/HU switcher
│   ├── StageCard.tsx                   # Left-column card: badge, scaffold copy, goal banner, MathDrawer
│   ├── controls/
│   │   ├── TreeStageControls.tsx       # Stage 1 step/reset buttons & Stage 2 k-slider + step scrubber
│   │   └── SamplingStageControls.tsx   # Stage 3-4 T-slider, Top-P slider, Fire Probe button + history
│   └── visualizers/
│       ├── StarTreeCanvas.tsx          # Right-canvas SVG/HTML horizontal star-tree (Stages 1 & 2)
│       └── ProbabilityBarCanvas.tsx    # Right-canvas Softmax bars + Top-P shield + Probe drop (Stages 3 & 4)
├── App.tsx                             # Stage 0 Full-Screen <-> Stages 1-4 40/60 Split workspace orchestrator
└── main.tsx                            # Entry point
```

---

### Task 1: Project Scaffold, Neo-Brutalist Styling & Typed Localization (`i18n`)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/index.css`
- Create: `src/locales/types.ts`
- Create: `src/locales/en.ts`
- Create: `src/locales/hu.ts`
- Create: `src/context/LocaleContext.tsx`
- Test: `src/context/__tests__/LocaleContext.test.tsx`

**Interfaces:**
- Produces:
  - `StageId = 0 | 1 | 2 | 3 | 4`
  - `Language = 'en' | 'hu'`
  - `LocaleSchema` in `src/locales/types.ts` with keys:
    - `appTitle: string`, `promptPrefix: string` (`"The astronaut looked out the window and saw"`)
    - `nav: { stages: Record<StageId, string>; langToggle: string }`
    - `ui: { launchMission: string; missionGoal: string; missionComplete: string; showMath: string; hideMath: string; nextStage: string; prevStage: string; stepAutopilot: string; reset: string; beamWidthLabel: string; stepLabel: string; temperatureLabel: string; topPLabel: string; fireProbe: string; sampledHistory: string; prunedStamp: string; cutOffStamp: string; nucleusZone: string }`
    - `stages: Record<StageId, { badge: string; title: string; metaphorScaffold: string; goalText: string; mathTitle: string; mathFormula: string; mathScaffold: string }>`
  - `LocaleProvider` and `useLocale(): { lang: Language; setLang: (l: Language) => void; t: LocaleSchema }` in `src/context/LocaleContext.tsx`

- [ ] **Step 1: Initialize Vite + React + TypeScript + Tailwind + Framer Motion + Vitest project**

Create `package.json`, `vite.config.ts` (configured with `@vitejs/plugin-react`, `@tailwindcss/vite`, and `test: { environment: 'jsdom', globals: true, setupFiles: './src/testSetup.ts' }`), `tsconfig.json`, `index.html` (importing Google Fonts `Space Grotesk` and `JetBrains Mono`), `src/testSetup.ts` (`import '@testing-library/jest-dom'`), and `src/index.css` defining the Neo-Brutalist utility classes (`.brutal-card`, `.brutal-btn`, `.brutal-shadow`, `.star-grid-bg`). Run `npm install`.

- [ ] **Step 2: Write the failing localization test in `src/context/__tests__/LocaleContext.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LocaleProvider, useLocale } from '../LocaleContext';
import { en } from '../../locales/en';
import { hu } from '../../locales/hu';

function TestConsumer() {
  const { lang, setLang, t } = useLocale();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="title">{t.stages[2].title}</span>
      <button onClick={() => setLang(lang === 'en' ? 'hu' : 'en')}>Toggle</button>
    </div>
  );
}

describe('LocaleContext & Locale Dictionaries', () => {
  it('provides English by default and switches cleanly to Hungarian (Review Focus #1)', () => {
    render(
      <LocaleProvider>
        <TestConsumer />
      </LocaleProvider>
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('title')).toHaveTextContent(en.stages[2].title);

    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('lang')).toHaveTextContent('hu');
    expect(screen.getByTestId('title')).toHaveTextContent(hu.stages[2].title);
    expect(hu.stages[2].title).not.toEqual(en.stages[2].title);
  });

  it('has non-empty scaffold strings for every stage 0..4 in both locales', () => {
    ([0, 1, 2, 3, 4] as const).forEach((id) => {
      expect(en.stages[id].metaphorScaffold.length).toBeGreaterThan(10);
      expect(hu.stages[id].metaphorScaffold.length).toBeGreaterThan(10);
      expect(en.stages[id].mathScaffold.length).toBeGreaterThan(10);
      expect(hu.stages[id].mathScaffold.length).toBeGreaterThan(10);
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/context/__tests__/LocaleContext.test.tsx`
Expected: FAIL with module resolution error for `../LocaleContext`.

- [ ] **Step 4: Implement `src/locales/types.ts`, `src/locales/en.ts`, `src/locales/hu.ts`, and `src/context/LocaleContext.tsx`**

Populate `en.ts` and `hu.ts` with concise, clear scaffold strings (1–2 sentences per stage) matching the spec's 5 stages (`0: Preamble`, `1: Greedy Trap`, `2: Beam Search`, `3: Temperature`, `4: Top-P Nucleus`).

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/context/__tests__/LocaleContext.test.tsx`
Expected: PASS (2 passed).

---

### Task 2: Curated Datasets & Pure Decoding Math Engine

**Files:**
- Create: `src/data/decodingData.ts`
- Create: `src/lib/decodingMath.ts`
- Test: `src/lib/__tests__/decodingMath.test.ts`

**Interfaces:**
- Produces in `src/data/decodingData.ts`:
  - `export interface StarTreeNode { id: string; token: string; prob: number; children?: StarTreeNode[] }`
  - `export interface LogitCandidate { token: string; logit: number; category: 'safe' | 'creative' | 'tail' }`
  - `export const BEAM_TREE_DATA: StarTreeNode` (exact probabilities from Spec §5.3: `"nothing"` `0.45` $\to$ `"at"` `0.25` $\to$ `"all."` `0.40` [final `0.045`] and `"but"` `0.20` $\to$ `"dust."` `0.50` [final `0.045`]; `"a"` `0.40` $\to$ `"glowing"` `0.85` $\to$ `"nebula."` `0.90` [final `0.306`] and `"distant"` `0.10` $\to$ `"comet."` `0.60` [final `0.024`]; `"two"` `0.10` $\to$ `"binary"` `0.80` $\to$ `"suns."` `0.85` [final `0.068`]; `"earth"` `0.05` $\to$ `"below"` `0.70` $\to$ `"shining."` `0.80` [final `0.028`])
  - `export const LOGIT_CANDIDATES: LogitCandidate[]` (exact 8 tokens from Spec §5.3: `"nebula"` `4.2`, `"star"` `3.4`, `"planet"` `2.6`, `"leviathan"` `1.8`, `"monolith"` `1.5`, `"cathedral"` `1.1`, `"banana"` `-0.2`, `"404_error"` `-0.8`)
- Produces in `src/lib/decodingMath.ts`:
  - `export interface EvaluatedBeamPath { nodeIds: string[]; tokens: string[]; cumulativeProb: number; logProbSum: number; status: 'active' | 'winner' | 'pruned'; prunedAtStep?: number }`
  - `export function evaluateBeamSearch(tree: StarTreeNode, beamWidth: number, currentStep: 0 | 1 | 2 | 3): EvaluatedBeamPath[]`
  - `export interface ScaledTokenProb extends LogitCandidate { rawProb: number; inNucleus: boolean; finalProb: number; cumulativeBefore: number; cumulativeAfter: number }`
  - `export function computeSamplingDistribution(candidates: LogitCandidate[], temperature: number, topP: number): ScaledTokenProb[]`
  - `export function sampleFromDistribution(dist: ScaledTokenProb[], rng?: () => number): ScaledTokenProb`

- [ ] **Step 1: Write the failing math engine tests in `src/lib/__tests__/decodingMath.test.ts`**

```ts
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
    expect( sampleFromDistribution(dist, () => 0.999).inNucleus ).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/decodingMath.test.ts`
Expected: FAIL with missing module `../../data/decodingData`.

- [ ] **Step 3: Implement `src/data/decodingData.ts` and `src/lib/decodingMath.ts`**

In `evaluateBeamSearch`, step-by-step from `step = 1..currentStep`, expand active beams, rank by `cumulativeProb` descending, keep top `beamWidth` as `'active'` (marking the #1 path at `currentStep` as `'winner'` when `currentStep > 0`), and mark dropped paths as `'pruned'` with `prunedAtStep`. In `computeSamplingDistribution`, shift logits by `max(z_i / T)` before `Math.exp`, sort descending, include token $i$ in nucleus if `cumulativeBefore < topP` (ensuring index `0` is always included since `cumulativeBefore === 0 < topP`), and re-normalize `finalProb` across `inNucleus` tokens.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/decodingMath.test.ts`
Expected: PASS (5 passed).

---

### Task 3: Dynamic Layout Shell (Full-Screen Stage 0 $\leftrightarrow$ 40/60 Split Workspace)

**Files:**
- Create: `src/components/TopNavBar.tsx`
- Create: `src/components/StageCard.tsx`
- Modify: `src/App.tsx`
- Test: `src/__tests__/AppLayout.test.tsx`

**Interfaces:**
- Consumes: `StageId`, `useLocale()` from Task 1.
- Produces:
  - `TopNavBar` props: `{ activeStage: StageId; completedStages: Record<StageId, boolean>; onSelectStage: (stage: StageId) => void }`
  - `StageCard` props: `{ stageId: StageId; isActive: boolean; isCompleted: boolean; onActivate: () => void; onNavigateStage: (stage: StageId) => void; children?: React.ReactNode }` (includes collapsible `MathDrawer` that opens automatically when `isCompleted` turns `true` OR when user clicks the manual `showMath` toggle button)
  - `App` shell managing `activeStage: StageId`, `completedStages: Record<StageId, boolean>`, and rendering full-width Preamble when `activeStage === 0` vs. the 40% Left Story / 60% Right Star-Canvas split container when `activeStage > 0`.

- [ ] **Step 1: Write the failing layout & navigation test in `src/__tests__/AppLayout.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Dynamic Layout & Non-Blocking Navigation (Review Focus #4)', () => {
  it('starts on Stage 0 full-screen Preamble with right canvas collapsed, and opens 40/60 split on Launch', () => {
    render(<App />);
    expect(screen.getByTestId('workspace-shell')).toHaveAttribute('data-layout-mode', 'preamble-fullscreen');

    fireEvent.click(screen.getByTestId('launch-mission-btn'));
    expect(screen.getByTestId('workspace-shell')).toHaveAttribute('data-layout-mode', 'split-workspace');
    expect(screen.getByTestId('right-star-canvas')).toBeVisible();
  });

  it('allows jumping directly to any stage (0..4) and back to 0 without completing missions, and toggling LLM math manually', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-tab-4'));
    expect(screen.getByTestId('workspace-shell')).toHaveAttribute('data-active-stage', '4');

    const mathToggle = screen.getByTestId('math-toggle-4');
    fireEvent.click(mathToggle);
    expect(screen.getByTestId('math-drawer-4')).toBeVisible();

    fireEvent.click(screen.getByTestId('nav-tab-0'));
    expect(screen.getByTestId('workspace-shell')).toHaveAttribute('data-layout-mode', 'preamble-fullscreen');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/AppLayout.test.tsx`
Expected: FAIL on missing testids `workspace-shell` / `launch-mission-btn`.

- [ ] **Step 3: Implement `TopNavBar.tsx`, `StageCard.tsx`, and the layout state machine in `App.tsx`**

Use Framer Motion (`motion.div` with `layout`) on `data-testid="workspace-shell"`, transitioning between `data-layout-mode="preamble-fullscreen"` (`activeStage === 0`) and `data-layout-mode="split-workspace"` (`activeStage > 0`). Wire up `TopNavBar` tabs (`data-testid="nav-tab-0"` .. `"nav-tab-4"`) and `StageCard` manual math toggle (`data-testid="math-toggle-${stageId}"` controlling `data-testid="math-drawer-${stageId}"`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/AppLayout.test.tsx`
Expected: PASS (2 passed).

---

### Task 4: Star-Tree Visualizer & Controls for Stages 1 (Greedy Trap) & 2 (Beam Search)

**Files:**
- Create: `src/components/controls/TreeStageControls.tsx`
- Create: `src/components/visualizers/StarTreeCanvas.tsx`
- Modify: `src/App.tsx` (mount `TreeStageControls` in Stages 1–2 and `StarTreeCanvas` in the Right Star-Canvas when `activeStage === 1 || activeStage === 2`)
- Test: `src/components/visualizers/__tests__/StarTreeStages.test.tsx`

**Interfaces:**
- Consumes: `BEAM_TREE_DATA`, `evaluateBeamSearch` from Task 2; `useLocale()` from Task 1.
- Produces:
  - `TreeStageControls` props: `{ mode: 'greedy' | 'beam'; step: 0 | 1 | 2 | 3; beamWidth: number; onStepChange: (s: 0 | 1 | 2 | 3) => void; onBeamWidthChange: (k: number) => void }`
  - `StarTreeCanvas` props: `{ mode: 'greedy' | 'beam'; step: 0 | 1 | 2 | 3; beamWidth: number }`

- [ ] **Step 1: Write the failing Stage 1 & 2 interactive test in `src/components/visualizers/__tests__/StarTreeStages.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../../App';

describe('Stages 1 & 2: Star-Tree Visualizer & Win Conditions', () => {
  it('completes Stage 1 (Greedy Trap) after 3 autopilot steps and unlocks Stage 1 LLM Math', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('launch-mission-btn'));

    const stepBtn = screen.getByTestId('greedy-step-btn');
    fireEvent.click(stepBtn); // Step 1: "nothing"
    fireEvent.click(stepBtn); // Step 2: "at"
    fireEvent.click(stepBtn); // Step 3: "all."

    expect(screen.getByTestId('live-transmission-banner')).toHaveTextContent('nothing at all.');
    expect(screen.getByTestId('math-drawer-1')).toBeVisible();
  });

  it('completes Stage 2 when Beam Width k >= 2 reaches step 3 ("a glowing nebula.") and keeps Stage 1 isolated at k=1 (Review Focus #5)', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-tab-2'));

    const kSlider = screen.getByTestId('beam-width-slider');
    fireEvent.change(kSlider, { target: { value: '3' } });

    expect(screen.getByTestId('live-transmission-banner')).toHaveTextContent('a glowing nebula.');
    expect(screen.getByTestId('math-drawer-2')).toBeVisible();

    // Switch back to Stage 1: must still render k=1 greedy path, not k=3
    fireEvent.click(screen.getByTestId('nav-tab-1'));
    expect(screen.getByTestId('active-k-readout')).toHaveTextContent('k = 1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/visualizers/__tests__/StarTreeStages.test.tsx`
Expected: FAIL on missing `greedy-step-btn` and `beam-width-slider`.

- [ ] **Step 3: Implement `TreeStageControls.tsx`, `StarTreeCanvas.tsx`, and wire into `App.tsx`**

In `App.tsx`, maintain `greedyStep: 0 | 1 | 2 | 3` (default `0`) for Stage 1 and `beamStep: 0 | 1 | 2 | 3` (default `3`) + `beamWidth: number` (default `1`) for Stage 2. When `greedyStep === 3`, mark Stage 1 completed. When `beamWidth >= 2 && beamStep === 3`, mark Stage 2 completed. In `StarTreeCanvas.tsx`, render the Neo-Brutalist transmission banner (`data-testid="live-transmission-banner"`), `data-testid="active-k-readout"`, and the 3-column horizontal star-tree with SVG connector beams and token/probability badges on every star node.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/visualizers/__tests__/StarTreeStages.test.tsx`
Expected: PASS (2 passed).

---

### Task 5: Probability Radar/Bar Visualizer & Probe Sampler for Stages 3 (Temperature) & 4 (Top-$p$)

**Files:**
- Create: `src/components/controls/SamplingStageControls.tsx`
- Create: `src/components/visualizers/ProbabilityBarCanvas.tsx`
- Modify: `src/App.tsx` (mount `SamplingStageControls` in Stages 3–4 and `ProbabilityBarCanvas` in the Right Star-Canvas when `activeStage === 3 || activeStage === 4`)
- Test: `src/components/visualizers/__tests__/SamplingStages.test.tsx`

**Interfaces:**
- Consumes: `LOGIT_CANDIDATES`, `computeSamplingDistribution`, `sampleFromDistribution` from Task 2; `useLocale()` from Task 1.
- Produces:
  - `SamplingStageControls` props: `{ mode: 'temperature' | 'top-p'; temperature: number; topP: number; onTemperatureChange: (t: number) => void; onTopPChange: (p: number) => void; onFireProbe: () => void; sampleHistory: string[] }`
  - `ProbabilityBarCanvas` props: `{ mode: 'temperature' | 'top-p'; distribution: ScaledTokenProb[]; lastSampledToken: string | null }`

- [ ] **Step 1: Write the failing Stage 3 & 4 interactive test in `src/components/visualizers/__tests__/SamplingStages.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../../App';

describe('Stages 3 & 4: Temperature & Top-P Nucleus Sampling', () => {
  it('reshapes probability bars when Temperature changes and unlocks Stage 3 on creative sample', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-tab-3'));

    const tempSlider = screen.getByTestId('temperature-slider-3');
    fireEvent.change(tempSlider, { target: { value: '1.5' } });

    const fireBtn = screen.getByTestId('fire-probe-btn-3');
    // Fire probe up to 30 times at T=1.5 until a creative token lands, or click a token bar directly to test probe targeting
    for (let i = 0; i < 40; i++) {
      fireEvent.click(fireBtn);
    }
    expect(screen.getByTestId('sample-history-3').textContent?.length).toBeGreaterThan(0);
  });

  it('unlocks Stage 4 when T >= 1.3 and Top-P cuts off garbage tail ("banana", "404_error") while keeping creative tokens', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-tab-4'));

    const tempSlider = screen.getByTestId('temperature-slider-4');
    const topPSlider = screen.getByTestId('top-p-slider-4');

    fireEvent.change(tempSlider, { target: { value: '1.5' } });
    fireEvent.change(topPSlider, { target: { value: '0.85' } });

    expect(screen.getByTestId('token-bar-banana')).toHaveAttribute('data-in-nucleus', 'false');
    expect(screen.getByTestId('token-bar-404_error')).toHaveAttribute('data-in-nucleus', 'false');
    expect(screen.getByTestId('token-bar-cathedral')).toHaveAttribute('data-in-nucleus', 'true');
    expect(screen.getByTestId('math-drawer-4')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/visualizers/__tests__/SamplingStages.test.tsx`
Expected: FAIL on missing `temperature-slider-3` and `top-p-slider-4`.

- [ ] **Step 3: Implement `SamplingStageControls.tsx`, `ProbabilityBarCanvas.tsx`, and wire into `App.tsx`**

In `App.tsx`:
- Stage 3 state: `stage3Temp` (default `1.0`), `stage3History: string[]`. Unlock Stage 3 when `stage3Temp >= 1.2` and a sampled token (or clicked bar) has `category === 'creative'`.
- Stage 4 state: `stage4Temp` (default `1.5`), `stage4TopP` (default `1.0`), `stage4History: string[]`. Unlock Stage 4 automatically as soon as `stage4Temp >= 1.3` and the computed distribution has all `'creative'` tokens with `inNucleus === true` and all `'tail'` tokens with `inNucleus === false`.
- In `ProbabilityBarCanvas.tsx`, render each token bar with `data-testid="token-bar-${item.token}"` and `data-in-nucleus={String(item.inNucleus)}`, showing the yellow `#FFE600` nucleus shield badge on active tokens and the `"CUT OFF (0%)"` stamp on excluded tail tokens.

- [ ] **Step 4: Run the full test suite and production build to verify everything passes**

Run: `npx vitest run && npm run build`
Expected: All 4 test suites pass (11 tests total) and `vite build` succeeds with zero TypeScript errors.

