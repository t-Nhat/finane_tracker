import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle({ themeMode: externalTheme, setThemeMode: externalSetTheme }) {
  const [internalTheme, setInternalTheme] = useState(() => {
    return localStorage.getItem('user_theme') || 'light';
  });

  const themeMode = externalTheme !== undefined ? externalTheme : internalTheme;
  const changeTheme = (newMode) => {
    if (externalSetTheme) {
      externalSetTheme(newMode);
    } else {
      setInternalTheme(newMode);
      localStorage.setItem('user_theme', newMode);
    }
  };

  useEffect(() => {
    if (externalTheme === undefined) {
      const root = window.document.documentElement;
      const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.remove('dark');
      if (themeMode === 'dark' || (themeMode === 'system' && isDarkSystem)) {
        root.classList.add('dark');
      }
    }
  }, [themeMode, externalTheme]);

  return (
    <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold shadow-inner transition-colors">
      <button
        type="button"
        onClick={() => changeTheme('light')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
          themeMode === 'light'
            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Sun className="w-4 h-4" />
        <span>Sáng</span>
      </button>
      <button
        type="button"
        onClick={() => changeTheme('dark')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
          themeMode === 'dark'
            ? 'bg-slate-900 text-emerald-400 shadow-md font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Moon className="w-4 h-4" />
        <span>Tối</span>
      </button>
      <button
        type="button"
        onClick={() => changeTheme('system')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
          themeMode === 'system'
            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Monitor className="w-4 h-4" />
        <span>Tự động</span>
      </button>
    </div>
  );
}