import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-200/80 bg-white/60 py-6 sm:py-8 dark:border-white/10 dark:bg-black/60 backdrop-blur-md text-xs text-zinc-500 dark:text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} AgriGuard AI Platform. Enterprise Agriculture Intelligence.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <span className="hover:text-black dark:hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-black dark:hover:text-white transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-black dark:hover:text-white transition cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
