import React, { useState, useEffect } from 'react';
import { Bug, Plus, Trash2, AlertTriangle, ShieldCheck, CheckCircle, Info } from 'lucide-react';
import { api } from '../services/api';
import type { PestObservation, Crop } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

export const PestManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const [observations, setObservations] = useState<PestObservation[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [cropId, setCropId] = useState<number | ''>('');
  const [kind, setKind] = useState<'pest' | 'weed'>('pest');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [observedOn, setObservedOn] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pestRes, cropRes] = await Promise.all([
        api.getPestObservations(),
        api.getCrops(),
      ]);
      setObservations(pestRes.items);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await api.createPestObservation({
        crop_id: cropId ? Number(cropId) : null,
        kind,
        description,
        severity,
        observed_on: observedOn,
      });
      setIsModalOpen(false);
      setDescription('');
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to record observation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this observation log?')) {
      try {
        await api.deletePestObservation(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_pest')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'பூச்சி மற்றும் களை தாக்குதல்களை பதிவு செய்து ஒருங்கிணைந்த மேலாண்மை (IPM) வழிமுறைகளை பின்பற்றுங்கள்'
              : 'Log field scouting observations and execute Integrated Pest Management (IPM) protocols.'}
          </p>
        </div>
        <button
          onClick={() => {
            setCropId(crops.length > 0 ? crops[0].id : '');
            setKind('pest');
            setDescription('');
            setSeverity('low');
            setObservedOn(new Date().toISOString().slice(0, 10));
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2.5 text-sm font-semibold shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'ta' ? 'புதிய அவதானிப்பு பதிவு' : 'Log Observation'}</span>
        </button>
      </div>

      {/* Documented IPM Protocol Cards */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Documented Integrated Pest Management (IPM) Principles</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
              1. Cultural & Mechanical Prevention
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Use certified disease-resistant seeds, implement sticky pheromone traps, maintain weed-free bunds, and rotate with non-host legume crops.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40">
            <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">
              2. Biological Conservation
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Conserve predatory spiders and ladybird beetles. Spray botanicals (neem seed kernel extract 5%) or beneficial microbes like Bacillus thuringiensis.
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40">
            <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
              3. Economic Threshold Level (ETL)
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Apply chemical pesticides only when insect density breaches economic threshold levels. Always observe recommended pre-harvest intervals (PHI).
            </p>
          </div>
        </div>
      </div>

      {/* Observations Grid */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-28" />
      ) : observations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {observations.map((item) => {
            const crop = crops.find((c) => c.id === item.crop_id);
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 glass-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      item.kind === 'pest'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {item.kind}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      item.severity === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                        : item.severity === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950'
                    }`}>
                      {item.severity} Severity
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                    <span>Crop: <strong className="text-slate-800 dark:text-slate-200">{crop ? crop.name : 'General Farm'}</strong></span>
                    <span>{item.observed_on}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete log"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bug}
          title="No scouting observations"
          description="Log pests or weed outbreaks observed during routine field inspections"
          actionText="Log Observation"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Pest / Weed Scouting Observation"
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
                Observation Type *
              </label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="pest">Insect Pest (பூச்சி)</option>
                <option value="weed">Weed Infestation (களை)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Severity Level *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="low">Low (Trace occurrences)</option>
                <option value="medium">Medium (Isolated clusters)</option>
                <option value="high">High (Breaching ETL)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Crop Affected
              </label>
              <select
                value={cropId}
                onChange={(e) => setCropId(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- General Field Observation --</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Observed Date *
              </label>
              <input
                type="date"
                required
                value={observedOn}
                onChange={(e) => setObservedOn(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Observation Notes & Symptoms *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. Whiteflies observed on leaf undersides in block 2; curling starting on terminal shoots."
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
              {submitting ? 'Saving...' : 'Save Observation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
