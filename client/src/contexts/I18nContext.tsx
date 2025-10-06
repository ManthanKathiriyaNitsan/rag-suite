import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Easiest, clean i18n: global locale with localStorage persistence and a basic t() helper
// No CSS or component structure changes required. Components can read locale and optionally use t().

type I18nContextValue = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = "i18n"; // stores { locale }

// Minimal translations dictionary (optional). You can expand later.
const translations: Record<string, Record<string, string>> = {
  en: {
    "settings.i18n.title": "Internationalization",
    "settings.i18n.defaultLanguage": "Default Language",
    "settings.i18n.save": "Save Language",
  },
  "en-gb": {
    "settings.i18n.title": "Internationalisation",
    "settings.i18n.defaultLanguage": "Default Language",
    "settings.i18n.save": "Save Language",
  },
  es: {
    "settings.i18n.title": "Internacionalización",
    "settings.i18n.defaultLanguage": "Idioma predeterminado",
    "settings.i18n.save": "Guardar idioma",
  },
  fr: {
    "settings.i18n.title": "Internationalisation",
    "settings.i18n.defaultLanguage": "Langue par défaut",
    "settings.i18n.save": "Enregistrer la langue",
  },
  de: {
    "settings.i18n.title": "Internationalisierung",
    "settings.i18n.defaultLanguage": "Standardsprache",
    "settings.i18n.save": "Sprache speichern",
  },
  ja: {
    "settings.i18n.title": "国際化",
    "settings.i18n.defaultLanguage": "既定の言語",
    "settings.i18n.save": "言語を保存",
  },
  zh: {
    "settings.i18n.title": "国际化",
    "settings.i18n.defaultLanguage": "默认语言",
    "settings.i18n.save": "保存语言",
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<string>("en");

  // Load locale once
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { locale?: string };
        if (parsed.locale) setLocale(parsed.locale);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist locale
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ locale }));
    } catch (e) {
      // ignore
    }
  }, [locale]);

  const t = useMemo(() => {
    return (key: string) => {
      const table = translations[locale] || translations.en;
      return table[key] ?? key;
    };
  }, [locale]);

  const value: I18nContextValue = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}