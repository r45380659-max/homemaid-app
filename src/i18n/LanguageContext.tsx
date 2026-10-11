import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, LanguageInfo } from './languages';
import { getTranslation, TranslationKey } from './translations';

interface LanguageContextType {
  language: string;
  languageInfo: LanguageInfo;
  setLanguage: (code: string) => void;
  t: (key: TranslationKey) => string;
  hasChosenInitialLanguage: boolean;
  setHasChosenInitialLanguage: (val: boolean) => void;
  showLanguageModal: boolean;
  setShowLanguageModal: (val: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('homemate_preferred_language') || 'en';
  });

  const [hasChosenInitialLanguage, setHasChosenInitialLanguageState] = useState<boolean>(() => {
    return localStorage.getItem('homemate_language_chosen') === 'true';
  });

  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);

  useEffect(() => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    if (langObj?.isRTL) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  const setLanguage = (code: string) => {
    setLanguageState(code);
    localStorage.setItem('homemate_preferred_language', code);
  };

  const setHasChosenInitialLanguage = (val: boolean) => {
    setHasChosenInitialLanguageState(val);
    localStorage.setItem('homemate_language_chosen', val ? 'true' : 'false');
  };

  const currentLangInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: TranslationKey) => getTranslation(language, key);

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageInfo: currentLangInfo,
        setLanguage,
        t,
        hasChosenInitialLanguage,
        setHasChosenInitialLanguage,
        showLanguageModal,
        setShowLanguageModal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
