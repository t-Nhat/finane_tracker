import React, { createContext, useState, useContext, useEffect } from 'react';
import vi from '../locales/vi.json';
import en from '../locales/en.json';

const dictionaries = { vi, en };

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && dictionaries[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (dictionaries[lang]) {
      setLanguage(lang);
      localStorage.setItem('app_language', lang);
    }
  };

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let result = dictionaries[language];
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return keyPath; // fallback to key path if missing
      }
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
