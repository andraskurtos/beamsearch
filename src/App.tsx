import { LocaleProvider, useLocale } from './context/LocaleContext';
import type { StageId } from './locales/types';

function ScaffoldPreview() {
  const { lang, setLang, t } = useLocale();
  const stageIds: StageId[] = [0, 1, 2, 3, 4];

  return (
    <div className="min-h-screen paper-grid-bg p-6">
      <header className="brutal-border brutal-shadow bg-[#FFE600] px-4 py-3 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">{t.appTitle}</h1>
          <p className="text-xs font-mono">{t.appSubtitle}</p>
        </div>
        <button
          onClick={() => setLang(lang === 'en' ? 'hu' : 'en')}
          className="brutal-btn bg-white px-3 py-1 text-xs font-mono"
        >
          {t.nav.langToggle} ({lang.toUpperCase()})
        </button>
      </header>

      <div className="grid gap-4 max-w-4xl mx-auto">
        {stageIds.map((id) => (
          <div key={id} className="brutal-border brutal-shadow bg-[#FFFDF7] p-4">
            <span className="inline-block bg-[#FF6B6B] brutal-border-sm px-2 py-0.5 text-xs font-bold mb-2">
              {t.stages[id].badge}
            </span>
            <h2 className="text-lg font-bold">{t.stages[id].title}</h2>
            <p className="text-sm mt-1">{t.stages[id].metaphorScaffold}</p>
            <div className="mt-3 bg-[#A7F3D0] brutal-border-sm p-2 text-xs font-mono">
              <strong>{t.stages[id].mathTitle}:</strong> {t.stages[id].mathFormula}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <ScaffoldPreview />
    </LocaleProvider>
  );
}

