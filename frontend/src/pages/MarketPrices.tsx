import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Plus, Trash2, Calendar, ShieldCheck, Tag } from 'lucide-react';
import { api } from '../services/api';
import type { MarketPrice } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const MarketPrices: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCrop, setSearchCrop] = useState('');
  const [searchMarket, setSearchMarket] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [crop, setCrop] = useState('');
  const [market, setMarket] = useState('');
  const [price, setPrice] = useState<string>('');
  const [unit, setUnit] = useState('INR/quintal');
  const [source, setSource] = useState('Agmarknet Benchmark');
  const [isSample, setIsSample] = useState(true);
  const [recordedOn, setRecordedOn] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPrices = () => {
    setLoading(true);
    api.getMarketPrices({
      crop: searchCrop || undefined,
      market: searchMarket || undefined,
    })
      .then((res) => setPrices(res.items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrices();
  }, [searchCrop, searchMarket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await api.createMarketPrice({
        crop,
        market,
        price: parseFloat(price),
        unit,
        source,
        is_sample: isSample,
        recorded_on: recordedOn,
      });
      setIsModalOpen(false);
      fetchPrices();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to add market price');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this market price entry?')) {
      try {
        await api.deleteMarketPrice(id);
        fetchPrices();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_market')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'விவசாய மண்டிகள் மற்றும் சந்தை நிலவரங்களின் உண்மை விலை ஒப்பீடு'
              : 'Benchmark wholesale market prices across APMC mandis. Clearly identified sample reference data.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setCrop('');
              setMarket('');
              setPrice('');
              setUnit('INR/quintal');
              setSource('Agmarknet / State APMC');
              setIsSample(false);
              setRecordedOn(new Date().toISOString().slice(0, 10));
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2.5 text-sm font-semibold shadow-sm transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Benchmark Price (Admin)</span>
          </button>
        )}
      </div>

      {/* Transparency Note */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        ℹ️ <strong className="font-semibold text-slate-800 dark:text-slate-200">Data Integrity Notice:</strong> AgriGuard AI displays real stored benchmark records. Records marked with the <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold text-[10px]">Sample Data</span> badge are development reference records.
      </div>

      {/* Search Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            placeholder="Search crop (e.g. Tomato, Rice)..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchMarket}
            onChange={(e) => setSearchMarket(e.target.value)}
            placeholder="Search mandi (e.g. Coimbatore, Madurai)..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Market Prices Table */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-16" />
      ) : prices.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Crop</th>
                <th className="p-4">Market / Mandi</th>
                <th className="p-4">Benchmark Price</th>
                <th className="p-4">Recorded Date</th>
                <th className="p-4">Source & Authenticity</th>
                {isAdmin && <th className="p-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {prices.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                    {item.crop}
                  </td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-200">
                    {item.market}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{item.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">/ {item.unit}</span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {item.recorded_on}
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {item.source}
                      </span>
                      {item.is_sample ? (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Sample Benchmark
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Verified
                        </span>
                      )}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete price entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title={language === 'ta' ? 'விலை விவரங்கள் கிடைக்கவில்லை' : 'No market price records found'}
          description="Try broadening your crop or mandi search terms"
        />
      )}

      {/* Admin Add Price Modal */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Verified / Benchmark Market Price"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Crop Name *
                </label>
                <input
                  type="text"
                  required
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Tomato"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Mandi / Market *
                </label>
                <input
                  type="text"
                  required
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Coimbatore APMC"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Price (INR) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="2400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="INR/quintal">INR / quintal</option>
                  <option value="INR/kg">INR / kg</option>
                  <option value="INR/tonne">INR / tonne</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Source Name
                </label>
                <input
                  type="text"
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Agmarknet Benchmark"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Recorded Date
                </label>
                <input
                  type="date"
                  required
                  value={recordedOn}
                  onChange={(e) => setRecordedOn(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSample}
                  onChange={(e) => setIsSample(e.target.checked)}
                  className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Mark as Sample / Demo benchmark record</span>
              </label>
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
                {submitting ? 'Saving...' : 'Add Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
