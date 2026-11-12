import React, { createContext, useContext, useState } from 'react';
import type { Language, LocaleSchema } from '../locales/types';
import { en } from '../locales/en';
import { hu } from '../locales/hu';

interface LocaleContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: LocaleSchema;
}

const dictionaries: Record<Language, LocaleSchema> = { en, hu };

const LocaleContext = createContext<LocaleContextValue>({
  lang: 'en',
  setLang: () => {},
  t: en,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  return (
    <LocaleContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

