import React, { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('user_theme') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Xóa trạng thái cũ
    root.classList.remove('dark');

    // Kiểm tra xem có nên bật chế độ tối không
    if (themeMode === 'dark' || (themeMode === 'system' && isDarkSystem)) {
      root.classList.add('dark');
    }

    localStorage.setItem('user_theme', themeMode);
  }, [themeMode]);

  return (
    <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors">
      <button
        type="button"
        onClick={() => setThemeMode('light')}
        className={`px-3 py-1.5 rounded-lg transition-all ${themeMode === 'light' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
      >
        ☀️ Sáng
      </button>
      <button
        type="button"
        onClick={() => setThemeMode('dark')}
        className={`px-3 py-1.5 rounded-lg transition-all ${themeMode === 'dark' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
      >
        🌙 Tối
      </button>
      <button
        type="button"
        onClick={() => setThemeMode('system')}
        className={`px-3 py-1.5 rounded-lg transition-all ${themeMode === 'system' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
      >
        💻 Hệ thống
      </button>
    </div>
  );
}