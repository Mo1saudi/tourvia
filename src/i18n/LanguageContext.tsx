import React, { createContext, useContext, useState, useEffect } from 'react';
import { WorkingLanguage } from '../types';
import { translations, Translations } from './translations';

interface LanguageContextType {
  language: WorkingLanguage;
  setLanguage: (lang: WorkingLanguage) => void;
  isRtl: boolean;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  availableLanguages: { code: WorkingLanguage; name: string; nativeName: string; dir: 'rtl' | 'ltr' }[];
}

const availableLanguages: { code: WorkingLanguage; name: string; nativeName: string; dir: 'rtl' | 'ltr' }[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', dir: 'ltr' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<WorkingLanguage>(() => {
    const saved = localStorage.getItem('tourvia_lang') as WorkingLanguage;
    return saved && translations[saved] ? saved : 'ar';
  });

  const isRtl = language === 'ar';

  useEffect(() => {
    localStorage.setItem('tourvia_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const setLanguage = (lang: WorkingLanguage) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.ar;
    let text = (langDict[key] as string) || (translations.en[key] as string) || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
