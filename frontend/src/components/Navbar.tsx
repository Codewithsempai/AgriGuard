import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, Sun, Moon, Globe, Bell, User as UserIcon, LogOut, ShieldCheck, Sprout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, unreadCount = 0 }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="relative shrink-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/70 px-2.5 sm:px-6 backdrop-blur-2xl dark:border-white/10 dark:bg-black/60 shadow-xs">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {isAuthenticated && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-1.5 sm:p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10 shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-black border border-white/20 text-white shadow-md dark:bg-white dark:text-black dark:border-white/40 transition-transform group-hover:scale-105 shrink-0">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 22s5.5-1.5 8.5-5.5C13.5 12.5 14 8 22 2c-6 8-10.5 8.5-14.5 11.5C3.5 16.5 2 22 2 22z" fill="currentColor" fillOpacity="0.15" />
              <path d="M9 15l4-4" />
              <path d="M12 12l3-1" />
              <path d="M10 17l1-3" />
              <circle cx="17" cy="7" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-base sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white truncate">
                AgriGuard
              </span>
              <span className="rounded-md border border-zinc-200/80 bg-zinc-100 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-800 dark:border-white/20 dark:bg-white/10 dark:text-white shrink-0">
                AI
              </span>
            </div>
            <span className="hidden md:block text-[10px] font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t('app_tagline')}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Language switch */}
        <div className="flex items-center rounded-xl border border-zinc-200/80 bg-zinc-100/80 p-0.5 text-xs font-medium dark:border-white/10 dark:bg-white/5 backdrop-blur-md">
          <button
            onClick={() => setLanguage('en')}
            className={`rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs transition-all ${
              language === 'en'
                ? 'bg-white text-black shadow-xs font-semibold dark:bg-white dark:text-black'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ta')}
            className={`rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs transition-all ${
              language === 'ta'
                ? 'bg-white text-black shadow-xs font-semibold dark:bg-white dark:text-black'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            தமிழ்
          </button>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-zinc-100/80 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-200/60 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white transition backdrop-blur-md shadow-xs cursor-pointer"
          title={theme === 'dark' ? 'Switch to Full Light Mode' : 'Switch to Full Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-300" />
              <span className="hidden sm:inline font-medium">Light</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-zinc-800" />
              <span className="hidden sm:inline font-medium">Dark</span>
            </>
          )}
        </button>

        {isAuthenticated ? (
          <>
            {/* Notification bell */}
            <Link
              to="/notifications"
              className="relative rounded-xl p-1.5 sm:p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10 transition"
              title={t('nav_notifications')}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-black text-[9px] font-bold ring-2 ring-black">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User profile badge */}
            <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-zinc-200 dark:border-white/10">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl py-1 px-1 sm:px-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10 transition"
              >
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-zinc-900 text-white font-bold text-xs sm:text-sm dark:bg-white dark:text-black border border-white/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold leading-tight text-zinc-900 dark:text-white">
                    {user?.name}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                    {user?.role === 'admin' && <ShieldCheck className="h-3 w-3 text-zinc-400" />}
                    <span className="capitalize">{user?.role}</span>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="rounded-xl p-1.5 sm:p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black dark:hover:bg-white/10 dark:hover:text-white transition"
                title={t('nav_logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition"
            >
              {t('nav_login')}
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-black px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
            >
              {t('nav_register')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
