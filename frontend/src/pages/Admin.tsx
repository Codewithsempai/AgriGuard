import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, BookOpen, TrendingUp, CheckCircle, Database,
  ArrowUpRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../types';
import { LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

export const Admin: React.FC = () => {
  const { t, language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    api.getAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load user management list'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administrator Security Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_admin')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'பயனர்கள், அறிவு களஞ்சிய வழிகாட்டிகள் மற்றும் சந்தை விலை தரவு மேலாண்மை'
              : 'Enterprise administration: manage user accounts, RBAC permissions, and benchmark market data.'}
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Records</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Modules Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Users</span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</h4>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-xs dark:border-white/10 dark:bg-zinc-900/60 glass-card flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-white/10 dark:text-white dark:border-white/15">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Knowledge Guides</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Publish & Edit</h4>
            </div>
          </div>
          <Link
            to="/knowledge"
            className="rounded-lg p-2 text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10"
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Market Mandis</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Add Prices</h4>
            </div>
          </div>
          <Link
            to="/market-prices"
            className="rounded-lg p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            User Accounts & Roles Registry
          </h3>
          <p className="text-xs text-slate-500">
            Registered farmers and administrative accounts stored in SQLite
          </p>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={3} height="h-14" />
          </div>
        ) : users.length > 0 ? (
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Farmer / User Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Language</th>
                <th className="p-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-slate-400">
                    #{u.id}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                    {u.name}
                  </td>
                  <td className="p-4 font-mono">
                    {u.email}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                      u.role === 'admin'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {u.role === 'admin' && <ShieldCheck className="h-3 w-3" />}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="p-4 uppercase font-semibold">
                    {u.language || 'en'}
                  </td>
                  <td className="p-4 text-slate-400">
                    {u.created_at?.slice(0, 10) || 'Active'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No user accounts found.
          </div>
        )}
      </div>
    </div>
  );
};
