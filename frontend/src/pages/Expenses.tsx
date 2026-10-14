import React, { useState, useEffect } from 'react';
import {
  Receipt, Plus, Edit2, Trash2, Calendar, Filter, PieChart as PieChartIcon, DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import type { Expense, Crop } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Expenses: React.FC = () => {
  const { t, language } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form State
  const [cropId, setCropId] = useState<number | ''>('');
  const [category, setCategory] = useState<'seeds' | 'fertilizer' | 'labor' | 'irrigation' | 'transport' | 'other'>('seeds');
  const [amount, setAmount] = useState<string>('');
  const [spentOn, setSpentOn] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'seeds', label: 'Seeds & Seedlings (விதைகள்)' },
    { value: 'fertilizer', label: 'Fertilizer & Manure (உரம்)' },
    { value: 'labor', label: 'Farm Labor (ஆட்கள் கூலி)' },
    { value: 'irrigation', label: 'Irrigation & Power (பாசனம்)' },
    { value: 'transport', label: 'Transport & Logistics (போக்குவரத்து)' },
    { value: 'other', label: 'Equipment & Other (இதர)' },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, cropRes] = await Promise.all([
        api.getExpenses(),
        api.getCrops(),
      ]);
      setExpenses(expRes.items);
      setCrops(cropRes.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingExpense(null);
    setCropId(crops.length > 0 ? crops[0].id : '');
    setCategory('seeds');
    setAmount('1200');
    setSpentOn(new Date().toISOString().slice(0, 10));
    setNote('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setCropId(exp.crop_id || '');
    setCategory(exp.category);
    setAmount(String(exp.amount));
    setSpentOn(exp.spent_on);
    setNote(exp.note || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = {
      crop_id: cropId ? Number(cropId) : null,
      category,
      amount: parseFloat(amount),
      spent_on: spentOn,
      note: note || null,
    };

    try {
      if (editingExpense) {
        await api.updateExpense(editingExpense.id, payload);
      } else {
        await api.createExpense(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense entry?')) {
      try {
        await api.deleteExpense(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredExpenses = selectedCategoryFilter === 'all'
    ? expenses
    : expenses.filter((e) => e.category === selectedCategoryFilter);

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group for Donut Chart
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_expenses')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'விதை, உரம், பாசனம் மற்றும் கூலி செலவுகளை பயிர் வாரியாக பதிவு செய்து கண்காணியுங்கள்'
              : 'Log and categorize all farm operational expenses to compute net harvest profitability.'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2.5 text-sm font-semibold shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'ta' ? 'புதிய செலவு பதிவு' : 'Log New Expense'}</span>
        </button>
      </div>

      {/* Top Cards: Total & Category Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 dark:border-rose-950/40 dark:bg-rose-950/20 glass-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Total Expenses Tracked
            </span>
            <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              ₹{totalSpent.toLocaleString()}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {filteredExpenses.length} expenditure transactions logged
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-rose-100 dark:border-rose-900/40 text-xs text-slate-600 dark:text-slate-400">
            Categorizing expenses gives accurate net profit calculations when logging harvests.
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Category Breakdown Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Expense distribution across farming inputs
          </p>
          {pieData.length > 0 ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-xs text-slate-400">
              No expenses recorded yet to render breakdown
            </div>
          )}
        </div>
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            selectedCategoryFilter === 'all'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'border border-zinc-200 bg-white/80 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setSelectedCategoryFilter(c.value)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              selectedCategoryFilter === c.value
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'border border-zinc-200 bg-white/80 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {c.value}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-16" />
      ) : filteredExpenses.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Linked Crop</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((exp) => {
                const crop = crops.find((c) => c.id === exp.crop_id);
                return (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {exp.spent_on}
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-semibold rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {crop ? (
                        <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{crop.name}</span>
                      ) : (
                        <span className="text-slate-400">General Farm</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-rose-600 dark:text-rose-400 text-sm">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">
                      {exp.note || '--'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="No expenses recorded"
          description="Log seed purchases, fertilizer bags, or labor hours to track your farm budget"
          actionText="Log Expense"
          onAction={openAddModal}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Log Farm Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Linked Crop Cycle (Optional)
            </label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value ? Number(e.target.value) : '')}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">-- General Farm Overhead --</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Amount (INR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="1200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Expenditure Date *
            </label>
            <input
              type="date"
              required
              value={spentOn}
              onChange={(e) => setSpentOn(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Notes / Vendor details
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. 50 kg urea from Agro Service Centre"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2 text-sm font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
