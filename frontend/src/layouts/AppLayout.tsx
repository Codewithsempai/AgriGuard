import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';
import { LayoutDashboard, ScanSearch, CloudSun, Calendar, Menu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const { t, language } = useLanguage();

  const fetchUnread = () => {
    api.getNotifications()
      .then((items) => {
        const unread = items.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-[100dvh] w-full max-w-full overflow-hidden bg-zinc-100/60 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Monochromatic Aesthetic Ambient Glows */}
      <div className="pointer-events-none fixed -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-zinc-300/40 blur-[140px] dark:bg-white/[0.04]" />
      <div className="pointer-events-none fixed top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-zinc-200/50 blur-[140px] dark:bg-white/[0.03]" />
      <div className="pointer-events-none fixed -bottom-40 right-1/3 h-[500px] w-[500px] rounded-full bg-zinc-300/30 blur-[140px] dark:bg-white/[0.03]" />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col min-w-0 w-full max-w-full h-full relative z-10">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          unreadCount={unreadCount}
        />
        
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-8 pb-28 sm:pb-32 lg:pb-8 min-w-0 w-full max-w-full">
          <div className="mx-auto max-w-7xl w-full min-w-0">
            <Outlet />
          </div>
        </main>

        {/* Mobile & Tablet Bottom Navigation Bar (< lg screens) */}
        <nav className="fixed bottom-0 inset-x-0 z-30 flex lg:hidden items-center justify-around border-t border-zinc-200/90 bg-white/95 px-2 py-1.5 backdrop-blur-2xl dark:border-white/10 dark:bg-black/90 shadow-2xl safe-area-bottom pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition ${
                isActive
                  ? 'text-zinc-950 dark:text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>{language === 'ta' ? 'முகப்பு' : 'Home'}</span>
          </NavLink>

          <NavLink
            to="/disease-detection"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition ${
                isActive
                  ? 'text-zinc-950 dark:text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`
            }
          >
            <ScanSearch className="h-5 w-5" />
            <span>{language === 'ta' ? 'AI ஆய்வு' : 'AI Scan'}</span>
          </NavLink>

          <NavLink
            to="/weather"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition ${
                isActive
                  ? 'text-zinc-950 dark:text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`
            }
          >
            <CloudSun className="h-5 w-5" />
            <span>{language === 'ta' ? 'வானிலை' : 'Weather'}</span>
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition ${
                isActive
                  ? 'text-zinc-950 dark:text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`
            }
          >
            <Calendar className="h-5 w-5" />
            <span>{language === 'ta' ? 'பணிகள்' : 'Tasks'}</span>
          </NavLink>

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
          >
            <Menu className="h-5 w-5" />
            <span>{language === 'ta' ? 'கூடுதல்' : 'Menu'}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
