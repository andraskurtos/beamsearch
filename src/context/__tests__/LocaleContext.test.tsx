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

  it('has complete, non-placeholder narrative and math copy for every stage 0..4 in both locales', () => {
    ([0, 1, 2, 3, 4] as const).forEach((id) => {
      expect(en.stages[id].metaphorScaffold).not.toContain('[Scaffold');
      expect(hu.stages[id].metaphorScaffold).not.toContain('[Vázlat');
      expect(en.stages[id].mathScaffold).not.toContain('[Scaffold');
      expect(hu.stages[id].mathScaffold).not.toContain('[Vázlat');
      expect(en.stages[id].metaphorScaffold.length).toBeGreaterThan(80);
      expect(hu.stages[id].metaphorScaffold.length).toBeGreaterThan(80);
      expect(en.stages[id].mathTakeaways.length).toBeGreaterThanOrEqual(2);
      expect(hu.stages[id].mathTakeaways.length).toBeGreaterThanOrEqual(2);
    });
  });
});
