# Starlight Decoder — Interactive LLM Decoding Explainer Specification

**Course:** BME AI Engineering MSc — *AI in Practice* (Topic 14: Distill-style Interactive Explorable Explanation)  
**Author:** Andras Kurtos  
**Date:** 2026-11-12  

---

## 1. Intent & Why

Most people treat Large Language Model (LLM) text generation as a black box, when in reality the decoding loop is an intuitive search and sampling problem over a probability tree of tokens. 

**Starlight Decoder** is an interactive, game-like web experience that teaches the four foundational LLM decoding concepts—**Greedy Search**, **Beam Search**, **Temperature Scaling**, and **Top-$p$ (Nucleus) Sampling**—through direct manipulation.

Instead of presenting a passive, scroll-heavy blogpost or a generic dark-mode tech demo, the application frames token generation as **plotting a spacecraft's transmission route across star systems**, styled as a high-contrast **Neo-Brutalist Zine**. Every star system on the map *is* a candidate word token with a real probability score, so playing the game directly manipulates the underlying LLM algorithm. Each stage follows a strict pedagogical rhythm:
1. **Metaphor & Sandbox Play:** A friendly mission setup with interactive controls and an optional, non-blocking "Win Condition."
2. **Visual Star-Token Feedback:** Watching word-stars branch, prune, reshape, or sample on the right-hand canvas.
3. **"Under the Hood" LLM Reveal:** Completing the stage's win condition (or clicking an always-available *"Show LLM Math"* toggle) expands a rigorous technical breakdown connecting the visual metaphor to actual Transformer decoding math.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Teach Four Core Concepts Progressively:**
  1. *The Greedy Trap ($k=1$):* Stepwise $\arg\max$ token selection getting stuck in a suboptimal local choice.
  2. *Beam Search ($k=1\dots5$):* Tracking $k$ parallel candidate sequences, computing cumulative sequence probabilities, and pruning weaker branches.
  3. *Temperature ($T$):* Reshaping raw logits via temperature-scaled Softmax $\text{softmax}(z_i / T)$ and stochastically sampling from the resulting distribution.
  4. *Top-$p$ Nucleus Sampling ($p$):* Sorting probabilities descending, sweeping a cumulative threshold $p$, and truncating the "long tail" of nonsensical tokens before re-normalizing.
- **Dynamic Stage-Shifting Layout:** Start with a **full-screen Preamble (Stage 0)** that animates open into a **Split-Screen Workspace (40% Left Story & Controls / 60% Right Persistent Star-Canvas)** once the user begins playing (Stages 1–4), while preserving the ability to scroll back up or click the top stage bar to revisit earlier sections.
- **Sandbox with Non-Blocking Win Conditions:** Every stage gives the user a clear, playful goal to trigger a "Mission Complete" celebration and unlock the technical LLM explanation, without ever locking progression or punishing experimentation.
- **High-Contrast Neo-Brutalist Zine Aesthetic:** Warm paper surfaces, punchy print-zine accent blocks, thick `3px` black ink borders, and hard offset shadows (`4px 4px 0px #000`).

### Non-Goals
- **Live LLM Inference:** No WebGPU/WASM model weights or external API calls. All trees and logits use curated, deterministic datasets so the pedagogical examples (like the Greedy Trap) trigger with 100% reliability and 60fps responsiveness.
- **Transformer Internals:** Does not cover self-attention, positional encodings, tokenization (BPE), or backpropagation—it focuses strictly on the **decoding step** (from output logits to selected tokens).

### Anti-Goals (Failure Conditions Even If Technically Functional)
- **"Dark-Mode Linux Bro" UI:** No dark slate backgrounds, neon cyberpunk gradients, or translucent glassmorphism cards.
- **Static Wall-of-Text Blogpost:** Never force the user to scroll through long static paragraphs between disconnected charts.
- **Hard Progression Locks:** Never block a user from moving to the next stage or peeking at the LLM math if they just want to browse or revise.
- **Metaphor Disconnect:** Never show stars without words; the candidate words and probabilities must always be overlaid directly on the star nodes and bars.

---

## 3. Constraints

- **Deployment:** Pure client-side single-page web app (SPA) with zero backend requirements; buildable to static assets via Vite (`npm run build`).
- **Performance:** All slider interactions (`k`, `T`, `p`) must update probabilities and animations synchronously at 60fps.
- **Responsiveness *(Builder Call)*:** Optimized for desktop/laptop viewports (`>= 1024px`) with the 40%/60% split layout; below `1024px`, the layout stacks vertically with the Star-Canvas pinned at the top (`45vh`) and the narrative card below (`55vh`).

---

## 4. Approaches Considered

### Approach 1: Vite + React + TypeScript + Tailwind CSS + Framer Motion + Custom SVG *(Selected)*
- **Description:** React manages stage progression, slider parameters (`k`, `T`, `p`), and mission win states. Framer Motion (`motion/react`) drives the full-screen-to-split-screen layout transition, expandable "Under the Hood" drawers, spring-animated probability bars, and SVG Beam Search tree paths.
- **Pros:** Total control over the Neo-Brutalist thick ink borders, hard shadows, and custom layout morphing between Stage 0 (full screen), Stages 1–2 (horizontal tree), and Stages 3–4 (distribution radar/bars). Minimal bundle overhead.
- **Cons:** Requires writing custom SVG tree coordinate layout logic (trivial for a fixed 3-step depth tree).

### Approach 2: Vite + React + TypeScript + Tailwind + React Flow & D3.js *(Rejected)*
- **Description:** Uses `React Flow` for the Beam Search tree and `D3.js` for the Softmax/Top-$p$ charts.
- **Reason for Rejection:** Overkill for a curated depth-3 tree and 8-bar distribution; library DOM wrappers fight against Neo-Brutalist CSS styling and make morphing the right-hand canvas across stages clunky.

### Approach 3: Vanilla TypeScript + GSAP Flip/ScrollTrigger *(Rejected)*
- **Description:** Imperative DOM manipulation and GSAP timelines without a component framework.
- **Reason for Rejection:** Synchronizing coupled slider states ($T$ + Top-$p$), cumulative sequence math, win-state badges, and scroll-back history is brittle without declarative state.

---

## 5. Detailed Design

### 5.1 Visual Identity: Neo-Brutalist Zine
*(User Decision: Option B from visual exploration)*

| Token Role | Value | Usage |
| :--- | :--- | :--- |
| **Canvas Paper** | `#FFFDF7` | Main background and narrative panel surface |
| **Star-Atlas Grid Surface** | `#E0E7FF` (Soft Periwinkle) with `#000` radial dot grid | Right-hand interactive canvas background |
| **Ink / Borders** | `#000000` (`2.5px` to `3px solid #000`) | All structural dividers, cards, buttons, and nodes |
| **Hard Shadow** | `4px 4px 0px #000000` (`6px 6px 0px #000` on elevated cards) | Tactile print-cutout depth; shifts to `1px 1px 0px` on `:active` press |
| **Primary Highlight** | `#FFE600` (Acid Zine Yellow) | Top header bar, active token highlights, Top-$p$ nucleus sweep |
| **Win / Optimal Path** | `#FF6B6B` (Punchy Coral) & `#A7F3D0` (Mint Green) | Winning beam trajectory (`#FF6B6B`) and unlocked LLM Theory box (`#A7F3D0`) |
| **Pruned / Dead State** | `#E5E7EB` fill, `#6B7280` text, dashed border, `line-through` | Pruned beams and Top-$p$ excluded tail tokens |
| **Typography** | **Headings:** `Space Grotesk` (700/800)<br>**Body:** `Inter` or `Space Grotesk` (400/600)<br>**Math & Telemetry:** `JetBrains Mono` (500/700) | High-legibility editorial contrast |

---

### 5.2 Layout Architecture & Dynamic Stage Shifting
*(User Decision: Split-screen Option B with full-screen Preamble and scroll-back capability)*

```
STAGE 0 (PREAMBLE — FULL VIEWPORT)
+-------------------------------------------------------------------+
| ★ STARLIGHT DECODER // INTERACTIVE GUIDE TO LLM TEXT GENERATION   |
+-------------------------------------------------------------------+
|                                                                   |
|        [ HERO ZINE CARD: How Do AI Models Choose Words? ]         |
|        Friendly intro + The Astronaut Transmission Setup          |
|        Interactive mini-preview: "The astronaut looked out..."    |
|                                                                   |
|                  [ 🚀 LAUNCH MISSION (STAGE 1) ]                  |
+-------------------------------------------------------------------+

STAGES 1–4 (SPLIT WORKSPACE — 40% LEFT STORY / 60% RIGHT STAR-CANVAS)
+-------------------------------------------------------------------+
| [00 INTRO] [01 GREEDY] [02 BEAM SEARCH] [03 TEMP] [04 TOP-P]      |
+---------------------------+---------------------------------------+
| LEFT PANEL (40% WIDTH)    | RIGHT PERSISTENT STAR-CANVAS (60%)    |
|                           |                                       |
| [SECTOR BADGE & TITLE]    | [LIVE TRANSMISSION BANNER]            |
| Narrative Metaphor Intro  | "The astronaut looked out and saw..." |
|                           |                                       |
| [MISSION GOAL BANNER]     | [INTERACTIVE VISUALIZER]              |
|                           |  • Stages 1-2: Horizontal Star-Tree   |
| [INTERACTIVE CONTROLS]    |  • Stages 3-4: Token Probability      |
|  Sliders / Step Buttons   |    Distribution + Probe Dropper       |
|                           |                                       |
| [🔓 UNDER THE HOOD CARD]  | [LEGEND / LIVE FORMULA READOUT]       |
|  Appears on Win (or via   |                                       |
|  "Peek at LLM Math" btn)  |                                       |
|                           |                                       |
| [↑ Prev]    [Next Stage ↓]|                                       |
+---------------------------+---------------------------------------+
```

#### Navigation & Scroll-Back Mechanics *(Builder Call)*
- **Advancing & Revising:** All 5 stages exist as a vertical stack of chapters on the page. In Stage 0, the right-hand Star-Canvas is collapsed (`width: 0%`), giving the Preamble 100% width.
- **The Split Transition:** Scrolling past Stage 0 (or clicking **"Launch Mission"**) smoothly animates (`Framer Motion` layout transition, ~450ms spring) the sticky right-hand Star-Canvas to `60%` width while the left column narrows to `40%` width and scrolls through Stages 1, 2, 3, and 4.
- **Free Scroll-Back:** Because the left narrative column uses native vertical scroll (with CSS scroll-snap or intersection observers triggering the active stage on the sticky right canvas) AND has a clickable top stage-bar (`00 Intro` … `04 Top-P`), the user can scroll up with their mousewheel/trackpad or click any stage tab at any time to revise previous stages. Scrolling all the way back to the top smoothly expands Stage 0 back to full width.

---

### 5.3 Stage-by-Stage Interactive Specification & Curated Data

All four stages share the narrative prompt:
> **`"The astronaut looked out the window and saw..."`**

#### Stage 0: Full-Screen Preamble (*"How Do LLMs Speak?"*)
- **Friendly Narrative:** Explains that an LLM doesn't think up whole paragraphs in advance—it predicts **one token (word/subword) at a time** by assigning a probability score to every word in its vocabulary.
- **Setting the Metaphor:** Casts the user as the navigator of the *Starlight Decoder*. Each word is a star system; its brightness/badge is the probability the LLM assigns to it. Your job is to guide the ship from word to word to complete the astronaut's transmission.
- **CTA:** A chunky Neo-Brutalist button: **`[ ENGAGE AUTOPILOT → SECTOR 01 ]`**.

---

#### Stage 1: The Greedy Trap ($k = 1$)
- **Metaphor Narrative:** Short-range autopilot (`k = 1`) is lazy: at every fork, it blindly jumps to the single brightest star right in front of the nose cone, ignoring what lies two jumps ahead.
- **Right Canvas Visual:** A 3-step horizontal star-tree (`Step 1 → Step 2 → Step 3`). Initially only Step 1 candidates are revealed (`"nothing"` at `0.45`, `"a"` at `0.40`, `"stars"` at `0.15`).
- **Controls:** **`[ STEP AUTOPILOT (GREEDY) ]`** button and **`[ RESET ]`**.
- **Interaction & Curated Trap Data *(Builder Call)*:**
  - **Step 1:** Autopilot picks `"nothing"` (`P = 0.45`) over `"a"` (`P = 0.40`).
  - **Step 2:** From `"nothing"`, the only continuations are weak: autopilot picks `"at"` (`P = 0.25`, cumulative `0.45 × 0.25 = 0.1125`).
  - **Step 3:** From `"at"`, autopilot picks `"all."` (`P = 0.40`, final cumulative sequence score **`P = 0.045`**). A hidden dashed hint briefly flashes showing that the `"a"` route had a much stronger path waiting down below!
- **Win Condition:** Step the autopilot all the way to the 3rd token (`"nothing at all."`) to witness the Greedy Trap spring.
- **"Under the Hood" LLM Reveal:**
  - **Concept:** **Greedy Decoding** selects $y_t = \arg\max_{w} P(w \mid y_{<t})$ at each step $t$.
  - **Takeaway:** Fast and deterministic ($O(1)$ branches per step), but locally optimal choices can lock the sequence into a globally low-probability dead-end ($P(\text{sequence}) = 0.045$).

---

#### Stage 2: Beam Search & Parallel Scouting ($k = 1 \dots 5$)
- **Metaphor Narrative:** Instead of committing to a single jump immediately, what if our ship fires **$k$ parallel scanner beams** across the sector, checks where each path leads, and only keeps the $k$ strongest total routes alive at each jump?
- **Right Canvas Visual:** The complete 3-step horizontal star-tree with animated SVG connector beams, live cumulative score badges on every path, and smooth pruning transitions (pruned nodes get a Neo-Brutalist `"PRUNED"` stamp, gray fill, and dashed border).
- **Controls:**
  - Chunky slider: **`Beam Width (k)`** ranging from `1` to `5` (default `1`).
  - Playback toggle: **`[ AUTO-PLAY STEPS ]`** or step-by-step scrubber (`Step 1`, `Step 2`, `Step 3`).
- **Curated Multi-Beam Tree Dataset *(Builder Call)*:**

| Root | Step 1 Token $P(w_1)$ | Step 2 Token $P(w_2 \mid w_1)$ & Cumul. $P$ | Step 3 Token $P(w_3 \mid w_{1:2})$ & Final $P$ | Route Outcome |
| :--- | :--- | :--- | :--- | :--- |
| `"saw"` | **`"nothing"`** (`0.45`) | `"at"` (`0.25` → cumul `0.113`)<br>`"but"` (`0.20` → cumul `0.090`) | `"all."` (`0.40` → **final `0.045`**)<br>`"dust."` (`0.50` → **final `0.045`**) | **Greedy Trap!** Starts #1 at Step 1, gets pruned at Step 2 when $k=2$. |
| `"saw"` | **`"a"`** (`0.40`) | **`"glowing"`** (`0.85` → cumul **`0.340`**)<br>`"distant"` (`0.10` → cumul `0.040`) | **`"nebula."`** (`0.90` → **final `0.306` ★**)<br>`"comet."` (`0.60` → **final `0.024`**) | **Optimal Beam Winner!** Starts #2 at Step 1, overtakes at Step 2. |
| `"saw"` | **`"two"`** (`0.10`) | `"binary"` (`0.80` → cumul `0.080`) | `"suns."` (`0.85` → **final `0.068`**) | Explored when $k \ge 3$ (#2 overall final route). |
| `"saw"` | **`"earth"`** (`0.05`) | `"below"` (`0.70` → cumul `0.035`) | `"shining."` (`0.80` → **final `0.028`**) | Explored when $k = 5$. |

- **Win Condition:** Set `Beam Width (k) >= 2` so the scanner beams discover and lock onto **`"a glowing nebula."`** (`P = 0.306`, more than $6\times$ higher sequence probability than the greedy path!).
- **"Under the Hood" LLM Reveal:**
  - **Concept:** **Beam Search** maintains the top $k$ partial sequences at each step $t$, expanding each by the vocabulary and pruning back to the top $k$ based on cumulative sequence probability:
    $$\text{score}(y_{1:t}) = \sum_{i=1}^{t} \log P(y_i \mid y_{<i})$$
  - **Takeaway:** Explains why real LLMs sum **log-probabilities** ($\log P \in (-\infty, 0]$) instead of multiplying raw decimals (preventing floating-point underflow on long sentences), and mentions the compute trade-off ($k\times$ forward passes) and why very large $k$ can actually make open-ended text repetitive or generic.

---

#### Stage 3: Reactor Temperature ($T = 0.1 \dots 2.0$)
- **Metaphor Narrative:** Beam search always finds the "most likely" textbook transmission (`"a glowing nebula"`). What if we're writing sci-fi poetry and *want* the astronaut to see something unexpected and creative? We adjust the **Reactor Temperature ($T$)** before firing a sampling probe!
- **Right Canvas Visual Morph:** The horizontal tree smoothly transitions into a **Next-Token Probability Radar & Bar Chart** for the token following `"The astronaut looked out the window and saw a glowing..."`.
  - Shows 8 candidate word-stars arranged as Neo-Brutalist vertical probability bars with raw logit values ($z_i$) and post-Softmax percentages ($P_i$).
  - Above the bars sits a **Probe Dropper** that physically bounces/animates onto a bar weighted by the current probability distribution when the user clicks **`[ 🎲 FIRE SAMPLE PROBE ]`**.
- **Controls:**
  - **`Temperature (T)`** slider (`0.1` to `2.0`, step `0.1`, default `1.0`).
  - **`[ 🎲 FIRE SAMPLE PROBE ]`** button (plus a history strip of the last 5 sampled words).
- **Curated Logit Dataset ($z_i$) for `"saw a glowing..."` *(Builder Call)*:**
  - `"nebula"` ($z = 4.2$, safe/predictable)
  - `"star"` ($z = 3.4$, predictable)
  - `"planet"` ($z = 2.6$, common)
  - `"leviathan"` ($z = 1.8$, creative/awesome!)
  - `"monolith"` ($z = 1.5$, creative/sci-fi!)
  - `"cathedral"` ($z = 1.1$, poetic!)
  - `"banana"` ($z = -0.2$, absurd tail)
  - `"404_error"` ($z = -0.8$, garbage tail)
- **Live Math Behavior:**
  - At $T = 0.1$: `"nebula"` spikes to `>99.9%` (acts just like Greedy Search).
  - At $T = 1.0$: Standard Softmax distribution.
  - At $T \ge 1.4$: The distribution flattens; creative words (`"leviathan"`, `"monolith"`, `"cathedral"`) climb to ~10–14% each, while the garbage tail (`"banana"`, `"404_error"`) also creeps up to ~4–7%.
- **Win Condition:** Crank $T \ge 1.2$ and fire the sample probe until you land on one of the **Creative Anomaly** words (`"leviathan"`, `"monolith"`, or `"cathedral"`)—or watch it accidentally land on `"banana"`!
- **"Under the Hood" LLM Reveal:**
  - **Concept:** **Temperature Scaling** divides the model's raw unnormalized scores (**logits** $z_i$) by $T$ *before* applying the Softmax function:
    $$P(w_i) = \frac{\exp(z_i / T)}{\sum_{j} \exp(z_j / T)}$$
  - **Takeaway:** $T \to 0$ sharpens the peak toward $\arg\max$ (deterministic); $T > 1$ increases entropy (flattens the distribution), boosting creativity at the risk of sampling low-probability nonsense from the tail.

---

#### Stage 4: Top-$p$ Nucleus Containment ($p = 0.10 \dots 1.00$)
- **Metaphor Narrative:** Running the reactor hot ($T = 1.5$) gave us awesome creative sightings like `"leviathan"`—but it also let `"banana"` and `"404_error"` sneak into our navigation pool! How do we keep the creativity while locking out the garbage tail? Enter the **Top-$p$ Containment Shield (Nucleus Sampling)**.
- **Right Canvas Visual:** Uses the **same 8-token bar chart** (sorted descending by probability) with both the `Temperature (T)` slider and the new **`Top-P (Nucleus Threshold)`** slider active.
  - A bright Neo-Brutalist yellow **Containment Zone** sweeps from left to right across the bars, accumulating probability ($P_1 + P_2 + \dots$) until the sum crosses $p$.
  - Any bar outside the containment zone gets stamped **`CUT OFF (0%)`**, crossed out, and its probability is redistributed proportionally (re-normalized) among the surviving **Nucleus** tokens!
- **Controls:**
  - **`Top-P (p)`** slider (`0.10` to `1.00`, step `0.05`, default `1.00`).
  - **`Temperature (T)`** slider (`0.1` to `2.0`, default `1.5` in Stage 4 so the long tail is visible immediately).
  - **`[ 🎲 FIRE SAFE PROBE ]`** button.
- **Win Condition:** Set $T \ge 1.3$ and adjust `Top-P` (around `p = 0.80` to `0.90`) so that **all three creative words (`"leviathan"`, `"monolith"`, `"cathedral"`) remain inside the active Nucleus**, while **both garbage tokens (`"banana"`, `"404_error"`) are 100% cut off**!
- **"Under the Hood" LLM Reveal:**
  - **Concept:** **Top-$p$ (Nucleus) Sampling** (Holtzman et al., 2020) sorts the vocabulary by probability descending and finds the smallest subset $V^{(p)}$ such that:
    $$\sum_{w \in V^{(p)}} P(w) \ge p$$
    All tokens outside $V^{(p)}$ are set to $0$, and the remaining probabilities are re-normalized to sum to $1$.
  - **Takeaway:** Unlike Top-$k$ (which keeps a fixed number of words regardless of confidence), Top-$p$ dynamically adapts the pool size: when the model is certain (one word has 95%), the nucleus shrinks to 1 word; when the model is uncertain (many plausible words), the nucleus expands—giving modern LLMs the sweet spot of coherent creativity when combined with Temperature.

---

### 5.4 Localization & Scaffold-First Content Architecture
*(User Decision)*

- **Separate Locale Files (`src/locales/`):** Zero narrative prose or explanation "word salads" may be hardcoded inside JSX components. All UI strings, stage headers, mission objectives, narrative paragraphs, and "Under the Hood" mathematical explanations must reside in structured locale dictionaries (e.g., `src/locales/en.ts` and `src/locales/hu.ts`) consumed via a typed `useLocale()` hook and language toggle (`EN` / `HU`) in the Neo-Brutalist top bar.
- **Scaffold-First Progression:** Implementation begins with a clean, functional scaffold using concise structural copy in the locale files to verify layout transitions, interactive algorithms, and visualizers first, allowing narrative copy and translations to be iterated on independently in the locale files.

---

## 6. What Is Left to the Builder

1. **Component Structure:** Organizing the Vite + React + TypeScript codebase cleanly (e.g., `src/data/decodingData.ts`, `src/components/StarCanvas/`, `src/components/StageCard/`, `src/components/MathDrawer/`).
2. **KaTeX / Formula Formatting:** Rendering mathematical formulas cleanly using either lightweight KaTeX or styled semantic math blocks in `JetBrains Mono`.
3. **Micro-Animations & Tactile Polish:** Tuning Framer Motion spring parameters, SVG path drawing (`pathLength`), button press shadow transitions, and celebratory confetti/stamp animations when a stage win condition triggers.
4. **Final Sandbox Summary Banner:** Adding a compact footer card at the bottom of Stage 4 summarizing when to use each strategy in practice (e.g., *Coding/Math:* low $T$ or Greedy; *Translation/Summarization:* Beam Search; *Creative Writing/Chat:* $T \approx 0.8\text{--}1.2$ + Top-$p \approx 0.9$).

