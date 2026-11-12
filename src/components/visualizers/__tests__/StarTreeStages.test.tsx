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

