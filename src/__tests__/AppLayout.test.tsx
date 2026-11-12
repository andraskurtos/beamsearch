import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

describe('App Dynamic Layout & Non-Blocking Navigation (Review Focus #4)', () => {
  it('starts on Stage 0 full-screen Preamble with right canvas collapsed, and opens 40/60 split scrolled to Sector 1 top on Launch', () => {
    const scrollIntoViewSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewSpy;

    render(<App />);
    expect(screen.getByTestId('workspace-shell')).toHaveAttribute('data-layout-mode', 'preamble-fullscreen');

    scrollIntoViewSpy.mockClear();
    fireEvent.click(screen.getByTestId('launch-mission-btn'));
    expect(screen.getByTestId('workspace-shell')).toHaveAttribute('data-layout-mode', 'split-workspace');
    expect(screen.getByTestId('right-star-canvas')).toBeVisible();
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(scrollIntoViewSpy.mock.instances[0]).toBe(document.getElementById('stage-section-1'));
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

  it('scrolls to the top (block: "start") of the next sector card when clicking Next Sector', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('launch-mission-btn'));

    const stage2El = document.getElementById('stage-section-2')!;
    const scrollSpy = vi.fn();
    stage2El.scrollIntoView = scrollSpy;

    fireEvent.click(screen.getByTestId('next-stage-btn-1'));
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(stage2El.className).toContain('scroll-mt-');
  });

  it('positions Beam Search (k=2,3,4) and Top-P (0.85) slider tick labels accurately without triangle characters', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('nav-tab-2'));

    expect(screen.getByTestId('beam-tick-2').style.left).toContain('25%');
    expect(screen.getByTestId('beam-tick-3').style.left).toContain('50%');
    expect(screen.getByTestId('beam-tick-4').style.left).toContain('75%');
    expect(screen.getByTestId('beam-tick-2').textContent).not.toContain('▲');

    fireEvent.click(screen.getByTestId('nav-tab-4'));
    expect(screen.getByTestId('top-p-tick-sweet').style.left).toContain('83.33%');
    expect(screen.getByTestId('top-p-tick-sweet').textContent).not.toContain('▲');
  });
});
