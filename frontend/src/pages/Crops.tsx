import React, { useState, useEffect } from 'react';
import { Leaf, Plus, Edit2, Trash2, Calendar, Sprout, CheckCircle2, AlertOctagon, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import type { Crop, Field } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

export const Crops: React.FC = () => {
  const { t, language } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'harvested' | 'failed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  // Form State
  const [fieldId, setFieldId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().slice(0, 10));
  const [growthStage, setGrowthStage] = useState('vegetative');
  const [expectedHarvest, setExpectedHarvest] = useState('');
  const [expectedYieldKg, setExpectedYieldKg] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'harvested' | 'failed'>('active');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const stages = [
    { value: 'sowing', label: 'Sowing / Seedling' },
    { value: 'vegetative', label: 'Vegetative Canopy' },
    { value: 'flowering', label: 'Flowering & Pollination' },
    { value: 'fruiting', label: 'Fruit / Grain Filling' },
    { value: 'maturity', label: 'Maturity & Ripening' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cropRes, fieldRes] = await Promise.all([
        api.getCrops(),
        api.getFields(),
      ]);
      setCrops(cropRes.items);
      setFields(fieldRes.items);
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
    setEditingCrop(null);
    setFieldId(fields.length > 0 ? fields[0].id : '');
    setName('');
    setVariety('');
    setPlantingDate(new Date().toISOString().slice(0, 10));
    setGrowthStage('vegetative');
    setExpectedHarvest('');
    setExpectedYieldKg('1500');
    setStatus('active');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (crop: Crop) => {
    setEditingCrop(crop);
    setFieldId(crop.field_id);
    setName(crop.name);
    setVariety(crop.variety || '');
    setPlantingDate(crop.planting_date || '');
    setGrowthStage(crop.growth_stage);
    setExpectedHarvest(crop.expected_harvest || '');
    setExpectedYieldKg(crop.expected_yield_kg !== null && crop.expected_yield_kg !== undefined ? String(crop.expected_yield_kg) : '');
    setStatus(crop.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId) {
      setFormError('Please select a parent field');
      return;
    }
    setFormError(null);
    setSubmitting(true);

    const payload = {
      field_id: Number(fieldId),
      name,
      variety: variety || null,
      planting_date: plantingDate || null,
      growth_stage: growthStage,
      expected_harvest: expectedHarvest || null,
      expected_yield_kg: expectedYieldKg ? parseFloat(expectedYieldKg) : null,
      status,
    };

    try {
      if (editingCrop) {
        await api.updateCrop(editingCrop.id, payload);
      } else {
        await api.createCrop(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save crop cycle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(language === 'ta' ? 'இந்த பயிர் சுழற்சியை நிச்சயமாக நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this crop record?')) {
      try {
        await api.deleteCrop(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredCrops = statusFilter === 'all'
    ? crops
    : crops.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_crops')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'பயிரிடப்பட்ட ரகங்கள், வளர்ச்சி நிலைகள், மற்றும் எதிர்பார்க்கப்படும் அறுவடை நாட்களை கண்காணிக்கவும்'
              : 'Track active crop cultivars, phenological growth stages, and projected harvest dates.'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={fields.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'ta' ? 'புதிய பயிர் சேர்க்க' : 'Add New Crop'}</span>
        </button>
      </div>

      {fields.length === 0 && !loading && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          ⚠️ {language === 'ta' ? 'பயிர் பதிவு செய்யும் முன் குறைந்தபட்சம் ஒரு வயலை ஒதுக்க வேண்டும்.' : 'You must create at least one Field plot before you can register Crops.'}
        </div>
      )}

      {/* Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['all', 'active', 'harvested', 'failed'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              statusFilter === st
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'border border-zinc-200 bg-white/80 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {st === 'all' ? (language === 'ta' ? 'அனைத்து நிலைகளும்' : 'All Statuses') : st}
          </button>
        ))}
      </div>

      {/* Crops Grid */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-40" />
      ) : filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => {
            const parentField = fields.find((f) => f.id === crop.field_id);
            return (
              <div
                key={crop.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 glass-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
                      {parentField ? parentField.name : `Field #${crop.field_id}`}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      crop.status === 'active'
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                        : crop.status === 'harvested'
                        ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {crop.status}
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-zinc-800 dark:text-zinc-200" />
                    <span>{crop.name}</span>
                  </h3>
                  {crop.variety && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Variety: <span className="font-semibold">{crop.variety}</span>
                    </p>
                  )}

                  <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Growth Stage:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                        {crop.growth_stage}
                      </span>
                    </div>
                    {crop.planting_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Planted On:</span>
                        <span>{crop.planting_date}</span>
                      </div>
                    )}
                    {crop.expected_harvest && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Target Harvest:</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{crop.expected_harvest}</span>
                      </div>
                    )}
                    {crop.expected_yield_kg && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Projected Yield:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{crop.expected_yield_kg} kg</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    onClick={() => openEditModal(crop)}
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                    title={t('btn_edit')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(crop.id)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title={t('btn_delete')}
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
          icon={Leaf}
          title={language === 'ta' ? 'பயிர்கள் எதுவும் இல்லை' : 'No crops found'}
          description={language === 'ta' ? 'வயலுக்கு ஒரு பயிரை ஒதுக்கி உங்கள் சாகுபடியை தொடங்குங்கள்.' : 'Register crop varieties to monitor growth stages, harvest forecasts, and soil health'}
          actionText={fields.length > 0 ? (language === 'ta' ? 'பயிர் சேர்க்க' : 'Add Crop') : undefined}
          onAction={openAddModal}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCrop ? (language === 'ta' ? 'பயிர் விவரங்களை திருத்து' : 'Edit Crop Cycle') : (language === 'ta' ? 'புதிய பயிர் பதிவு' : 'Register Crop Cycle')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Field Plot / வயல் *
            </label>
            <select
              required
              value={fieldId}
              onChange={(e) => setFieldId(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="" disabled>Select field...</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.area_acres || '?'} acres)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Crop Name / பயிர் *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. Tomato"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Variety / ரகம்
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. Shivam Hybrid"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Planting Date / நட்ட நாள்
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Expected Harvest / அறுவடை நாள்
              </label>
              <input
                type="date"
                value={expectedHarvest}
                onChange={(e) => setExpectedHarvest(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Growth Stage / வளர்ச்சி நிலை
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {stages.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Expected Yield (kg) / மகசூல்
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={expectedYieldKg}
                onChange={(e) => setExpectedYieldKg(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="1500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Crop Status / நிலை
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="active">Active (Currently growing)</option>
              <option value="harvested">Harvested</option>
              <option value="failed">Failed (Weather/Pest damage)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2 text-sm font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? t('btn_loading') : t('btn_save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
