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

