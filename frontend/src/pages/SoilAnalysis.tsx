import React, { useState, useEffect } from 'react';
import {
  FlaskConical, CheckCircle2, AlertTriangle, History, ArrowRight,
  Info, Sparkles, Layers, Sprout, ShieldCheck, Save
} from 'lucide-react';
import { api } from '../services/api';
import type { Field, SoilAnalysisResult, SoilHistoryItem } from '../types';
import { LoadingSkeleton, EmptyState } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

export const SoilAnalysis: React.FC = () => {
  const { t, language } = useLanguage();
  const [fields, setFields] = useState<Field[]>([]);
  const [history, setHistory] = useState<SoilHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Form
  const [fieldId, setFieldId] = useState<number | ''>('');
  const [cropName, setCropName] = useState('tomato');
  const [ph, setPh] = useState<number>(6.5);
  const [nitrogen, setNitrogen] = useState<number>(240); // Low default for demo
  const [phosphorus, setPhosphorus] = useState<number>(18); // Medium
  const [potassium, setPotassium] = useState<number>(160); // Medium
  const [soilType, setSoilType] = useState('Red Sandy Loam');
  const [saveToHistory, setSaveToHistory] = useState(true);

  const [result, setResult] = useState<SoilAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cropsList = [
    { value: 'rice', label: 'Rice / Paddy (நெல்)' },
    { value: 'maize', label: 'Maize (மக்காச்சோளம்)' },
    { value: 'tomato', label: 'Tomato (தக்காளி)' },
    { value: 'groundnut', label: 'Groundnut (வேர்க்கடலை)' },
    { value: 'wheat', label: 'Wheat (கோதுமை)' },
    { value: 'cotton', label: 'Cotton (பருத்தி)' },
    { value: 'chilli', label: 'Chilli / Bell Pepper (மிளகாய்)' },
  ];

  const fetchHistory = () => {
    setHistoryLoading(true);
    api.getSoilHistory()
      .then(setHistory)
      .catch((err) => console.error(err))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    api.getFields().then((res) => setFields(res.items)).catch((err) => console.error(err));
    fetchHistory();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.analyzeSoil({
        field_id: fieldId ? Number(fieldId) : null,
        crop_name: cropName,
        ph: Number(ph),
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
        soil_type: soilType,
        save: saveToHistory,
      });
      setResult(res);
      if (saveToHistory) {
        fetchHistory();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Soil analysis failed. Please verify input ranges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 mb-2">
          <FlaskConical className="h-3.5 w-3.5" />
          <span>Scientific Agronomic Rule Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('soil_title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('soil_subtitle')}
        </p>
      </div>

      {/* Main Input Form */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {t('soil_crop_target')}
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {cropsList.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Field Allocation (Optional) / வயல்
              </label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value ? Number(e.target.value) : '')}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- General Farm Soil Sample --</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.soil_type || 'soil unassigned'})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nutrients Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {t('soil_ph')} (0 - 14)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                required
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Ideal: 6.0 - 7.5</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Nitrogen (N - kg/ha)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={nitrogen}
                onChange={(e) => setNitrogen(parseFloat(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Low &lt; 280, High ≥ 560</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Phosphorus (P - kg/ha)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={phosphorus}
                onChange={(e) => setPhosphorus(parseFloat(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Low &lt; 11, High ≥ 25</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Potassium (K - kg/ha)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={potassium}
                onChange={(e) => setPotassium(parseFloat(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Low &lt; 110, High ≥ 280</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToHistory}
                onChange={(e) => setSaveToHistory(e.target.checked)}
                className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span>{language === 'ta' ? 'இந்த மண் பரிசோதனையை வரலாற்று பதிவுகளில் சேமிக்கவும்' : 'Save this test record to farm soil history'}</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-6 py-2.5 text-sm font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <FlaskConical className="h-4 w-4" />
              <span>{loading ? t('btn_loading') : t('soil_analyze_btn')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Output Section */}
      {result && (
        <div className="rounded-3xl border border-blue-200 bg-white p-6 sm:p-8 shadow-lg dark:border-blue-900/50 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                Agronomic Evaluation Result
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t('soil_ratings')} & Action Plan
              </h3>
            </div>
          </div>

          {/* Ratings Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(result.ratings).map(([nutrient, rating]) => (
              <div
                key={nutrient}
                className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center"
              >
                <span className="text-xs uppercase font-bold text-slate-500 block capitalize">
                  {nutrient}
                </span>
                <span className={`text-lg font-black uppercase mt-1 inline-block ${
                  rating === 'low'
                    ? 'text-rose-600 dark:text-rose-400'
                    : rating === 'high'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {rating}
                </span>
              </div>
            ))}
          </div>

          {/* Recommendations List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('soil_recommendations')}
            </h4>
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {rec.nutrient} Rule: <code className="text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">{rec.rule}</code>
                    </span>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rec.advice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crop-Specific Guidance */}
          {result.crop_note && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              <span className="font-bold block mb-1">🌱 Crop Specific Note ({cropName.toUpperCase()}):</span>
              <p>{result.crop_note}</p>
            </div>
          )}

          <p className="text-[11px] text-slate-400 italic">
            {result.disclaimer}
          </p>
        </div>
      )}

      {/* Historical Soil Tests Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 glass-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-600" />
          <span>{language === 'ta' ? 'மண் பரிசோதனை வரலாறு' : 'Archived Soil Test Records'}</span>
        </h3>

        {historyLoading ? (
          <LoadingSkeleton count={3} height="h-16" />
        ) : history.length > 0 ? (
          <div className="table-responsive-container w-full min-w-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300 min-w-[500px]">
              <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-500 dark:bg-white/5 border-b border-zinc-200/80 dark:border-white/10">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Crop / Field</th>
                  <th className="p-3">pH</th>
                  <th className="p-3">N (kg/ha)</th>
                  <th className="p-3">P (kg/ha)</th>
                  <th className="p-3">K (kg/ha)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{item.tested_on}</td>
                    <td className="p-3 capitalize">{item.crop_name || 'General'}</td>
                    <td className="p-3 font-semibold">{item.ph}</td>
                    <td className="p-3">{item.nitrogen}</td>
                    <td className="p-3">{item.phosphorus}</td>
                    <td className="p-3">{item.potassium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            {language === 'ta' ? 'முந்தைய பரிசோதனைகள் எதுவும் பதிவு செய்யப்படவில்லை.' : 'No previous soil tests recorded. Check your first sample above.'}
          </p>
        )}
      </div>
    </div>
  );
};
