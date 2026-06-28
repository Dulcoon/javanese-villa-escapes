import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import idDict from './id.json';
import enDict from './en.json';

type Language = 'id' | 'en';
type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  id: idDict,
  en: enDict,
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tDynamic: (data: any, field: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>('id');

  useEffect(() => {
    const savedLang = localStorage.getItem('marmevilla_lang') as Language;
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('marmevilla_lang', newLang);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    let str = dictionaries[lang][key] || dictionaries['id'][key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        str = str.replace(`{${param}}`, String(params[param]));
      });
    }
    return str;
  };

  const tDynamic = (data: any, field: string) => {
    if (!data) return '';
    if (lang === 'en') {
      const enField = `${field}_en`;
      if (data[enField] !== undefined && data[enField] !== null && data[enField] !== '') {
        return data[enField];
      }
    }
    return data[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tDynamic }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
