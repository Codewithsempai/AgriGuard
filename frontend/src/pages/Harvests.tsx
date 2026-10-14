import React, { useState, useEffect } from 'react';
import { Wheat, Plus, Edit2, Trash2, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '../services/api';
import type { Harvest, Crop } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

export const Harvests: React.FC = () => {
  const { t, language } = useLanguage();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);

  // Form State
  const [cropId, setCropId] = useState<number | ''>('');
  const [quantityKg, setQuantityKg] = useState<string>('');
  const [pricePerKg, setPricePerKg] = useState<string>('');
  const [harvestedOn, setHarvestedOn] = useState(new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [harvRes, cropRes] = await Promise.all([
        api.getHarvests(),
        api.getCrops(),
      ]);
      setHarvests(harvRes.items);
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
    setEditingHarvest(null);
    setCropId(crops.length > 0 ? crops[0].id : '');
    setQuantityKg('500');
    setPricePerKg('25');
    setHarvestedOn(new Date().toISOString().slice(0, 10));
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (h: Harvest) => {
    setEditingHarvest(h);
    setCropId(h.crop_id);
    setQuantityKg(String(h.quantity_kg));
    setPricePerKg(String(h.price_per_kg));
    setHarvestedOn(h.harvested_on);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropId) {
      setFormError('Please select a harvested crop');
      return;
    }
    setFormError(null);
    setSubmitting(true);

    const payload = {
      crop_id: Number(cropId),
      quantity_kg: parseFloat(quantityKg),
      price_per_kg: parseFloat(pricePerKg),
      harvested_on: harvestedOn,
    };

    try {
      if (editingHarvest) {
        await api.updateHarvest(editingHarvest.id, payload);
      } else {
        await api.createHarvest(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to record harvest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this harvest record?')) {
      try {
        await api.deleteHarvest(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalYieldKg = harvests.reduce((acc, h) => acc + h.quantity_kg, 0);
  const totalRevenue = harvests.reduce((acc, h) => acc + h.quantity_kg * h.price_per_kg, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_harvests')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'அறுவடை எடை, விற்பனை விலை மற்றும் மொத்த வருவாய் பதிவுகள்'
              : 'Log harvested crop yields, commodity market selling rates, and generated revenue.'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={crops.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'ta' ? 'அறுவடை பதிவு செய்க' : 'Record Harvest'}</span>
        </button>
      </div>

      {crops.length === 0 && !loading && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          ⚠️ Register at least one crop before logging harvest yields.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Yield Harvested
          </span>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalYieldKg.toLocaleString()} <span className="text-sm font-medium text-slate-500">kg</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">{harvests.length} recorded harvest batches</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-xs dark:border-emerald-950/40 dark:bg-emerald-950/20 glass-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Gross Harvest Revenue
          </span>
          <h3 className="mt-2 text-3xl font-extrabold text-emerald-800 dark:text-emerald-300">
            ₹{totalRevenue.toLocaleString()}
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Direct crop sales generated</p>
        </div>
      </div>

      {/* Harvests Table */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-16" />
      ) : harvests.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Harvest Date</th>
                <th className="p-4">Crop</th>
                <th className="p-4">Quantity (kg)</th>
                <th className="p-4">Selling Rate</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {harvests.map((h) => {
                const crop = crops.find((c) => c.id === h.crop_id);
                const revenue = h.quantity_kg * h.price_per_kg;
                return (
                  <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {h.harvested_on}
                    </td>
                    <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
                      {crop ? crop.name : `Crop #${h.crop_id}`}
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                      {h.quantity_kg.toLocaleString()} kg
                    </td>
                    <td className="p-4">
                      ₹{h.price_per_kg} / kg
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{revenue.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(h)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
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
          icon={Wheat}
          title="No harvests recorded yet"
          description="Log harvested quantity and market selling prices to track crop productivity"
          actionText={crops.length > 0 ? 'Record Harvest' : undefined}
          onAction={openAddModal}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHarvest ? 'Edit Harvest Record' : 'Record Crop Harvest'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Crop Harvested *
            </label>
            <select
              required
              value={cropId}
              onChange={(e) => setCropId(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="" disabled>Select crop...</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.variety || 'variety not set'})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Quantity (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Price per kg (INR) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="25"
              />
            </div>
          </div>

          {quantityKg && pricePerKg && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex justify-between font-semibold">
              <span>Calculated Revenue:</span>
              <span>₹{(parseFloat(quantityKg) * parseFloat(pricePerKg)).toLocaleString()}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Harvest Date *
            </label>
            <input
              type="date"
              required
              value={harvestedOn}
              onChange={(e) => setHarvestedOn(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
              {submitting ? 'Saving...' : 'Save Harvest'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
