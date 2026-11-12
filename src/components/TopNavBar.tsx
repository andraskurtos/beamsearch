import { useLocale } from '../context/LocaleContext';
import type { StageId } from '../locales/types';

interface TopNavBarProps {
  activeStage: StageId;
  completedStages: Record<StageId, boolean>;
  onSelectStage: (stage: StageId) => void;
}

const STAGE_IDS: StageId[] = [0, 1, 2, 3, 4];

export function TopNavBar({
  activeStage,
  completedStages,
  onSelectStage,
}: TopNavBarProps) {
  const { lang, setLang, t } = useLocale();

  return (
    <header className="sticky top-0 z-30 bg-[#FFE600] border-b-[3px] border-black px-4 py-2.5">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelectStage(0)}
          className="text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 bg-black text-[#FFE600] font-mono font-bold text-base brutal-border-sm">
            ★
          </span>
          <div>
            <div className="font-extrabold text-base tracking-tight leading-none">
              {t.appTitle}
            </div>
            <div className="font-mono text-[10px] tracking-wider uppercase text-black/80 mt-0.5">
              {t.appSubtitle}
            </div>
          </div>
        </button>

        <nav
          aria-label="Mission Stages"
          className="flex flex-wrap items-center gap-1.5"
        >
          {STAGE_IDS.map((id) => {
            const isActive = activeStage === id;
            const isDone = completedStages[id];
            return (
              <button
                key={id}
                type="button"
                data-testid={`nav-tab-${id}`}
                onClick={() => onSelectStage(id)}
                className={`px-2.5 py-1 text-xs font-mono font-bold brutal-border-sm transition-transform cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-black text-[#FFE600] -translate-y-0.5 shadow-[2px_2px_0px_#FF6B6B]'
                    : isDone
                    ? 'bg-[#A7F3D0] text-black brutal-shadow-sm'
                    : 'bg-[#FFFDF7] text-black brutal-shadow-sm hover:bg-white'
                }`}
              >
                <span>{t.nav.stages[id]}</span>
                {isDone && (
                  <span
                    aria-label="Completed"
                    className="inline-block w-4 h-4 bg-black text-[#A7F3D0] text-[10px] leading-4 text-center"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          data-testid="lang-toggle-btn"
          onClick={() => setLang(lang === 'en' ? 'hu' : 'en')}
          className="brutal-btn bg-[#FFFDF7] px-3 py-1 text-xs font-mono"
        >
          {t.nav.langToggle}: <span className="underline">{lang.toUpperCase()}</span>
        </button>
      </div>
    </header>
  );
}

