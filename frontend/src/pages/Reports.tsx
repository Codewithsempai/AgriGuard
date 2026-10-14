import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, Printer, TrendingUp, DollarSign, Receipt,
  Wheat, Sprout, ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import type { ReportSummary } from '../types';
import { LoadingSkeleton, EmptyState } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

export const Reports: React.FC = () => {
  const { t, language } = useLanguage();
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getReportSummary()
      .then(setReport)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      await api.downloadReportCsv();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSkeleton count={4} height="h-32" />;
  }

  const chartData = report?.crops.map((c) => ({
    name: c.crop,
    Cost: c.cost,
    Revenue: c.revenue,
    Profit: c.profit,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header and Print/Export controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_reports')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'உண்மையான பண்ணை பதிவுகளிலிருந்து கணக்கிடப்பட்ட நிதி மற்றும் உற்பத்தி அறிக்கைகள்'
              : 'Audit farm economics, crop profitability, and download verified CSV ledgers.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition shadow-xs disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-zinc-900 dark:text-white" />
            <span>{downloading ? 'Downloading...' : t('btn_export_csv')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-3.5 py-2 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>{t('btn_print')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 dark:border-rose-950/40 dark:bg-rose-950/20 glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Total Farm Expenditures
          </span>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            ₹{(report?.total_cost ?? 0).toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Direct cultivation input expenses</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-950/40 dark:bg-blue-950/20 glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Gross Harvest Receipts
          </span>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            ₹{(report?.revenue ?? 0).toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Income from commodity marketing</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 dark:border-emerald-950/40 dark:bg-emerald-950/20 glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Net Estimated Margin
          </span>
          <h3 className={`mt-2 text-3xl font-extrabold ${
            (report?.profit ?? 0) >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600'
          }`}>
            ₹{(report?.profit ?? 0).toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Calculated: Gross Receipts − Input Costs</p>
        </div>
      </div>

      {/* Profitability Bar Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Crop-by-Crop Economics (₹)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Comparison of production cost vs sales revenue for each planted crop variety
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Cost" fill="#f43f5e" name="Input Cost" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Revenue" fill="#10b981" name="Gross Revenue" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Profit" fill="#3b82f6" name="Net Profit" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Crop Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Crop Financial Ledger Breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Computed from recorded individual transactions in SQLite
          </p>
        </div>

        {report?.crops && report.crops.length > 0 ? (
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Crop Name</th>
                <th className="p-4">Lifecycle Status</th>
                <th className="p-4">Cultivation Cost</th>
                <th className="p-4">Harvest Revenue</th>
                <th className="p-4">Net Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report.crops.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                    {c.crop}
                  </td>
                  <td className="p-4">
                    <span className="capitalize font-semibold rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 text-[10px]">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-rose-600 dark:text-rose-400">
                    ₹{c.cost.toLocaleString()}
                  </td>
                  <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{c.revenue.toLocaleString()}
                  </td>
                  <td className={`p-4 font-bold text-sm ${c.profit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600'}`}>
                    ₹{c.profit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No crops logged yet to generate economic reports.
          </div>
        )}
      </div>
    </div>
  );
};
