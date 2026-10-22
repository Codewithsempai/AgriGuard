import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Grid, Leaf, DollarSign, TrendingUp, AlertTriangle, CheckCircle2,
  Calendar, ScanSearch, Receipt, Wheat, ArrowUpRight, Clock
} from 'lucide-react';
import { api } from '../services/api';
import type { DashboardStats, Task } from '../types';
import { StatCard } from '../components/StatCard';
import { LoadingSkeleton, EmptyState } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { LeafImage } from '../components/LeafImage';
import { translateTask, translateLabel, TASK_TYPE_TA } from '../utils/tamilTranslations';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = () => {
    setLoading(true);
    api.getDashboard()
      .then(setStats)
      .catch((err) => setError(err.message || 'Failed to load dashboard metrics'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (id: number) => {
    try {
      await api.toggleTask(id);
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={4} height="h-28" />
        <LoadingSkeleton count={2} height="h-64" />
      </div>
    );
  }

  const chartData = [
    {
      name: language === 'ta' ? 'நிதி நிலவரம்' : 'Financials (₹)',
      [language === 'ta' ? 'செலவுகள்' : 'Expenses']: stats?.total_cost || 0,
      [language === 'ta' ? 'வருவாய்' : 'Revenue']: stats?.revenue || 0,
      [language === 'ta' ? 'நிகர லாபம்' : 'NetProfit']: stats?.profit || 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Overdue Alerts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_dashboard')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'உங்கள் பண்ணையின் அனைத்து புள்ளிவிவரங்கள் மற்றும் பணிகள்'
              : 'Real-time overview of crops, fields, financial health, and field tasks.'}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/disease-detection"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
          >
            <ScanSearch className="h-4 w-4" />
            <span>{t('dash_diagnose_leaf')}</span>
          </Link>
          <Link
            to="/expenses"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800 transition backdrop-blur-md"
          >
            <Receipt className="h-4 w-4 text-zinc-900 dark:text-white" />
            <span>{t('dash_add_expense')}</span>
          </Link>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {stats && stats.tasks_overdue > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 dark:bg-zinc-900/80 dark:border-white/15 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">
                {stats.tasks_overdue} {language === 'ta' ? 'பண்ணை பணிகள் காலக்கெடு முடிந்துள்ளன!' : 'Scheduled farm activities are overdue!'}
              </p>
              <p className="text-xs text-zinc-300 mt-0.5">
                {language === 'ta'
                  ? 'பயிர் இழப்புகளைத் தவிர்க்க உடனடியாக காலண்டர் பக்கத்தில் பணிகளை கவனிக்கவும்.'
                  : 'Review your calendar to address overdue irrigation, fertilization, or pesticide tasks.'}
              </p>
            </div>
          </div>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-black shadow-sm hover:bg-zinc-200 transition shrink-0 self-start sm:self-auto"
          >
            <span>{language === 'ta' ? 'பார்க்க' : 'View Tasks'}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title={t('dash_total_farms')}
          value={stats?.farms ?? 0}
          subtitle={`${stats?.fields ?? 0} ${t('dash_total_fields')}`}
          icon={MapPin}
          color="emerald"
        />
        <StatCard
          title={t('dash_active_crops')}
          value={stats?.crops ?? 0}
          subtitle={language === 'ta' ? `${stats?.expected_yield_kg ?? 0} கிலோ எதிர்பார்ப்பு` : `${stats?.expected_yield_kg ?? 0} kg expected`}
          icon={Leaf}
          color="blue"
        />
        <StatCard
          title={t('dash_total_cost')}
          value={`₹${(stats?.total_cost ?? 0).toLocaleString()}`}
          subtitle={`${t('dash_total_revenue')}: ₹${(stats?.revenue ?? 0).toLocaleString()}`}
          icon={Receipt}
          color="rose"
        />
        <StatCard
          title={t('dash_net_profit')}
          value={`₹${(stats?.profit ?? 0).toLocaleString()}`}
          subtitle={(stats?.profit ?? 0) >= 0 ? (language === 'ta' ? 'ஆரோக்கியமான லாப விகிதம்' : 'Healthy financial margin') : (language === 'ta' ? 'எதிர்மறை இருப்பு' : 'Negative balance')}
          icon={TrendingUp}
          color={(stats?.profit ?? 0) >= 0 ? 'emerald' : 'amber'}
        />
      </div>

      {/* Middle Row: Financial Chart & Fast Action Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Chart Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ta' ? 'நிதி சுருக்கம் (செலவு vs வருவாய்)' : 'Financial Summary (Cost vs Revenue)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ta' ? 'உண்மையான பதிவு செய்யப்பட்ட செலவு மற்றும் அறுவடை விற்பனை' : 'Computed from verified stored expense & harvest logs'}
              </p>
            </div>
            <Link to="/reports" className="text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
              {language === 'ta' ? 'முழு அறிக்கை' : 'Full Report'} →
            </Link>
          </div>

          <div className="chart-wrapper h-64 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme === 'dark' ? '#a1a1aa' : '#71717a' }} />
                <YAxis tick={{ fontSize: 12, fill: theme === 'dark' ? '#a1a1aa' : '#71717a' }} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
                    background: theme === 'dark' ? 'rgba(20,20,23,0.95)' : 'rgba(255,255,255,0.95)',
                    color: theme === 'dark' ? '#ffffff' : '#09090b',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: theme === 'dark' ? '#e4e4e7' : '#27272a' }} />
                <Bar
                  dataKey={language === 'ta' ? 'செலவுகள்' : 'Expenses'}
                  fill={theme === 'dark' ? '#52525b' : '#94a3b8'}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey={language === 'ta' ? 'வருவாய்' : 'Revenue'}
                  fill={theme === 'dark' ? '#e4e4e7' : '#18181b'}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey={language === 'ta' ? 'நிகர லாபம்' : 'NetProfit'}
                  fill={theme === 'dark' ? '#a1a1aa' : '#52525b'}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Farm Action Hub */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-xs dark:border-white/10 dark:bg-zinc-900/60 glass-card flex flex-col justify-between backdrop-blur-md">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t('dash_quick_actions')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {language === 'ta' ? 'அடிக்கடி பயன்படுத்தப்படும் செயல்பாடுகள்' : 'Frequent operations and diagnostic shortcuts'}
            </p>

            <div className="space-y-2.5">
              <Link
                to="/disease-detection"
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white/60 p-3 hover:bg-zinc-100 hover:border-zinc-400 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/10 transition group backdrop-blur-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-zinc-100 p-2 text-zinc-900 border border-zinc-200 dark:bg-white/10 dark:text-white dark:border-white/15">
                    <ScanSearch className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 block group-hover:text-black dark:group-hover:text-white transition">
                      {t('dash_diagnose_leaf')}
                    </span>
                    <span className="text-[10px] text-slate-400">{language === 'ta' ? 'கூகுள் ஜெமினி & நியூரல் வகைப்படுத்தி' : 'Google Gemini & Neural Classifier'}</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-black dark:group-hover:text-white transition" />
              </Link>

              <Link
                to="/harvests"
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white/60 p-3 hover:bg-zinc-100 hover:border-zinc-400 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/10 transition group backdrop-blur-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-zinc-100 p-2 text-zinc-900 border border-zinc-200 dark:bg-white/10 dark:text-white dark:border-white/15">
                    <Wheat className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 block group-hover:text-black dark:group-hover:text-white transition">
                      {t('dash_record_harvest')}
                    </span>
                    <span className="text-[10px] text-slate-400">{language === 'ta' ? 'விளைச்சல் & விற்பனை விலையை பதிவு செய்' : 'Record Yield & Sale Price'}</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-black dark:group-hover:text-white transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Tasks & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-xs dark:border-white/10 dark:bg-zinc-900/60 glass-card backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('dash_recent_tasks')}
            </h3>
            <Link to="/calendar" className="text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
              {language === 'ta' ? 'அனைத்து பணிகள்' : 'View Calendar'} →
            </Link>
          </div>

          {stats?.recent_tasks && stats.recent_tasks.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recent_tasks.map((task: Task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 py-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`h-5 w-5 rounded-md flex items-center justify-center border transition shrink-0 ${
                        task.completed
                          ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black'
                          : 'border-zinc-300 hover:border-black dark:border-white/20 dark:hover:border-white text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {translateTask(task.title, language === 'ta')}
                      </p>
                      <span className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{language === 'ta' ? 'கெடு' : 'Due'} {task.due_date}</span>
                        <span className="capitalize px-1.5 py-0.2 rounded-sm bg-zinc-100 dark:bg-white/10 text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10">
                          {language === 'ta' ? (TASK_TYPE_TA[task.task_type] || task.task_type) : task.task_type.replace('_', ' ')}
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    task.completed
                      ? 'bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-white/10 dark:text-white dark:border-white/20'
                      : 'bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-black dark:border-white'
                  }`}>
                    {task.completed ? t('status_completed') : t('status_pending')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title={language === 'ta' ? 'பணிகள் இல்லை' : 'No upcoming tasks'}
              description={language === 'ta' ? 'உங்கள் பயிர்களுக்கான முதல் பணியை சேர்க்கவும்' : 'Keep your farm on schedule by adding irrigation and sowing tasks'}
            />
          )}
        </div>

        {/* Recent Disease Diagnoses */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-xs dark:border-white/10 dark:bg-zinc-900/60 glass-card backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ta' ? 'சமீபத்திய இலை நோய் சோதனைகள்' : 'Recent Leaf Diagnoses'}
            </h3>
            <Link to="/disease-history" className="text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
              {t('nav_disease_history')} →
            </Link>
          </div>

          {stats?.recent_disease && stats.recent_disease.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-white/5">
              {stats.recent_disease.map((diag) => (
                <div key={diag.id} className="flex items-center justify-between gap-3 py-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <LeafImage src={diag.image_url} className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {diag.predicted_label ? translateLabel(diag.predicted_label, language === 'ta') : (language === 'ta' ? 'டெமோ பகுப்பாய்வு' : 'Demo analysis')}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {diag.created_at?.slice(0, 10)} • {diag.mode === 'model' ? (language === 'ta' ? `${((diag.confidence || 0) * 100).toFixed(1)}% நம்பகத்தன்மை` : `${((diag.confidence || 0) * 100).toFixed(1)}% confidence`) : (language === 'ta' ? 'டெமோ முறை' : 'Demo mode')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    diag.mode === 'model'
                      ? 'bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-black dark:border-white'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:border-white/10'
                  }`}>
                    {diag.mode === 'model' ? (language === 'ta' ? 'மாடல்' : 'model') : diag.mode}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ScanSearch}
              title={language === 'ta' ? 'சோதனை பதிவுகள் இல்லை' : 'No disease scans yet'}
              description={language === 'ta' ? 'இலை புகைப்படத்தை பதிவேற்றி நோய்களை உடனே கண்டறியலாம்' : 'Upload your first crop leaf photo to test deep learning disease classification'}
              actionText={t('dash_diagnose_leaf')}
              onAction={() => window.location.href = '/disease-detection'}
            />
          )}
        </div>
      </div>
    </div>
  );
};
