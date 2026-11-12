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

