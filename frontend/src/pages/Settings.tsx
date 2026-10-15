import React from 'react';
import { Settings as SettingsIcon, Sun, Moon, Globe, Database, ShieldCheck, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('nav_settings')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {language === 'ta'
            ? 'பயன்பாட்டு இடைமுக விருப்பத்தேர்வுகள், மொழி மற்றும் அமைப்பு விவரங்கள்'
            : 'Configure application appearance, regional language dialect, and inspect local SQLite status.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 glass-card backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Display Appearance
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Toggle between clean pearl-white glass light theme and deep obsidian glass dark theme
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
                theme === 'light'
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                  : 'border-zinc-200/80 bg-white/80 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:hover:bg-zinc-800'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                theme === 'light' ? 'bg-white/15 text-white' : 'bg-amber-100 text-amber-600'
              }`}>
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <span className={`text-sm font-bold block ${theme === 'light' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{t('theme_light')}</span>
                <span className={`text-[11px] ${theme === 'light' ? 'text-zinc-300' : 'text-slate-500'}`}>Crisp pearl-white glass aesthetic</span>
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
                theme === 'dark'
                  ? 'border-white bg-white text-zinc-950 shadow-md'
                  : 'border-zinc-200/80 bg-white/80 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:hover:bg-zinc-800'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                theme === 'dark' ? 'bg-black/10 text-black' : 'bg-zinc-800 text-zinc-200'
              }`}>
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <span className={`text-sm font-bold block ${theme === 'dark' ? 'text-black' : 'text-slate-900 dark:text-white'}`}>{t('theme_dark')}</span>
                <span className={`text-[11px] ${theme === 'dark' ? 'text-zinc-600' : 'text-slate-500'}`}>Deep obsidian frosted glass</span>
              </div>
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 glass-card backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {t('language_switch')}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Choose your preferred regional interface language
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition cursor-pointer ${
                language === 'en'
                  ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black shadow-md'
                  : 'border-zinc-200/80 bg-white/80 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:hover:bg-zinc-800'
              }`}
            >
              <div>
                <span className="text-sm font-bold block">English (Global)</span>
                <span className={`text-[11px] ${language === 'en' ? 'text-zinc-300 dark:text-zinc-600' : 'text-slate-500'}`}>Default standard UI</span>
              </div>
              {language === 'en' && <Check className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setLanguage('ta')}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition cursor-pointer ${
                language === 'ta'
                  ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black shadow-md'
                  : 'border-zinc-200/80 bg-white/80 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:hover:bg-zinc-800'
              }`}
            >
              <div>
                <span className="text-sm font-bold block">தமிழ் (Tamil)</span>
                <span className={`text-[11px] ${language === 'ta' ? 'text-zinc-300 dark:text-zinc-600' : 'text-slate-500'}`}>முழுமையான தமிழ் இடைமுகம்</span>
              </div>
              {language === 'ta' && <Check className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Architecture & Verification Status */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 glass-card space-y-4 backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-zinc-900 dark:text-white" />
            <span>Architecture & Local Storage Specs</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Database Engine</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">SQLite (Embedded Windows Local)</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">AI Diagnostics Engine</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">TensorFlow / Keras MobileNet Net</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Weather Feed Provider</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Open-Meteo High-Resolution WMO API</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Authentication</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">HMAC SHA-256 JWT Token Bearer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
