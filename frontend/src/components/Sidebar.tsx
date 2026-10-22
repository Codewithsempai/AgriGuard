import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Grid, Leaf, ScanSearch, History, CloudSun,
  FlaskConical, TrendingUp, Receipt, Wheat, Calendar, Bug, BookOpen,
  BarChart3, Bell, User, Settings, ShieldCheck, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const navSections = [
    {
      title: 'Core Operations',
      items: [
        { to: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
        { to: '/farms', label: t('nav_farms'), icon: MapPin },
        { to: '/fields', label: t('nav_fields'), icon: Grid },
        { to: '/crops', label: t('nav_crops'), icon: Leaf },
      ],
    },
    {
      title: 'AI Intelligence & Health',
      items: [
        { to: '/disease-detection', label: t('nav_disease_detect'), icon: ScanSearch, badge: 'AI' },
        { to: '/disease-history', label: t('nav_disease_history'), icon: History },
        { to: '/soil-analysis', label: t('nav_soil'), icon: FlaskConical },
        { to: '/weather', label: t('nav_weather'), icon: CloudSun },
      ],
    },
    {
      title: 'Field Management',
      items: [
        { to: '/calendar', label: t('nav_calendar'), icon: Calendar },
        { to: '/pest-management', label: t('nav_pest'), icon: Bug },
        { to: '/knowledge', label: t('nav_knowledge'), icon: BookOpen },
      ],
    },
    {
      title: 'Financials & Market',
      items: [
        { to: '/expenses', label: t('nav_expenses'), icon: Receipt },
        { to: '/harvests', label: t('nav_harvests'), icon: Wheat },
        { to: '/market-prices', label: t('nav_market'), icon: TrendingUp },
        { to: '/reports', label: t('nav_reports'), icon: BarChart3 },
      ],
    },
    {
      title: 'Personal & System',
      items: [
        { to: '/notifications', label: t('nav_notifications'), icon: Bell },
        { to: '/profile', label: t('nav_profile'), icon: User },
        { to: '/settings', label: t('nav_settings'), icon: Settings },
        ...(isAdmin ? [{ to: '/admin', label: t('nav_admin'), icon: ShieldCheck, badge: 'Admin' }] : []),
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop (< lg screens) */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container - Collapsible on PC/Laptop & Slide-in Drawer on Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200/80 bg-white/95 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/95 transition-all duration-300 ease-in-out lg:static lg:z-auto ${
          open
            ? 'w-72 sm:w-64 translate-x-0 opacity-100 shadow-2xl lg:shadow-none lg:w-64'
            : '-translate-x-full w-0 opacity-0 pointer-events-none lg:w-0 lg:opacity-0 lg:-translate-x-full lg:overflow-hidden lg:border-r-0'
        }`}
      >
        <div className="w-64 flex flex-col h-full shrink-0">
          {/* Header in mobile drawer */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-200/80 dark:border-white/10 lg:hidden shrink-0">
            <span className="font-bold text-zinc-900 dark:text-white">AgriGuard Navigation</span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10"
              title="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {section.title}
                </h3>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs backdrop-blur-md'
                            : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-black dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 transition-colors group-hover:text-black dark:group-hover:text-white" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-md bg-zinc-200 text-zinc-900 dark:bg-white/20 dark:text-white px-1.5 py-0.5 text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-zinc-200/80 dark:border-white/10 text-center shrink-0">
            <div className="rounded-xl bg-zinc-100/80 p-3 text-xs text-zinc-800 dark:bg-white/5 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/10 backdrop-blur-md">
              <span className="font-semibold block mb-0.5">AgriGuard Enterprise</span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">v1.0.0 • SQLite Offline Ready</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
