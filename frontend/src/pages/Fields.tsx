import React, { useState, useEffect } from 'react';
import { Grid, Plus, Edit2, Trash2, MapPin, Layers, Ruler } from 'lucide-react';
import { api } from '../services/api';
import type { Farm, Field } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

export const Fields: React.FC = () => {
  const { t, language } = useLanguage();
  const [fields, setFields] = useState<Field[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmFilter, setSelectedFarmFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  // Form State
  const [farmId, setFarmId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [areaAcres, setAreaAcres] = useState<string>('');
  const [soilType, setSoilType] = useState('Red Sandy Loam');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const soilTypesList = [
    'Red Sandy Loam',
    'Black Cotton Soil',
    'Clay Loam',
    'Alluvial Soil',
    'Laterite Soil',
    'Sandy Clay',
    'Peaty / Marshy',
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fieldRes, farmRes] = await Promise.all([
        api.getFields(),
        api.getFarms(),
      ]);
      setFields(fieldRes.items);
      setFarms(farmRes.items);
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
    setEditingField(null);
    setFarmId(farms.length > 0 ? farms[0].id : '');
    setName('');
    setAreaAcres('2.0');
    setSoilType('Red Sandy Loam');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (field: Field) => {
    setEditingField(field);
    setFarmId(field.farm_id);
    setName(field.name);
    setAreaAcres(field.area_acres !== null && field.area_acres !== undefined ? String(field.area_acres) : '');
    setSoilType(field.soil_type || 'Red Sandy Loam');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) {
      setFormError('Please select a parent farm');
      return;
    }
    setFormError(null);
    setSubmitting(true);

    const payload = {
      farm_id: Number(farmId),
      name,
      area_acres: areaAcres ? parseFloat(areaAcres) : null,
      soil_type: soilType || null,
    };

    try {
      if (editingField) {
        await api.updateField(editingField.id, payload);
      } else {
        await api.createField(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save field details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(language === 'ta' ? 'இந்த வயலை நிச்சயமாக நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this field? Associated crops will also be deleted.')) {
      try {
        await api.deleteField(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredFields = selectedFarmFilter === 'all'
    ? fields
    : fields.filter((f) => String(f.farm_id) === selectedFarmFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_fields')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'பண்ணைகளுக்கு உட்பட்ட தனித்தனி வயல் பிரிவுகள் மற்றும் மண் வகைகளை நிர்வகியுங்கள்'
              : 'Segment your farms into manageable field plots with specific soil profiles.'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={farms.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'ta' ? 'புதிய வயல் சேர்க்க' : 'Add New Field'}</span>
        </button>
      </div>

      {farms.length === 0 && !loading && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          ⚠️ {language === 'ta' ? 'வயல் சேர்க்கும் முன் குறைந்தபட்சம் ஒரு பண்ணையை உருவாக்க வேண்டும்.' : 'You must create at least one Farm before you can add Fields.'}
        </div>
      )}

      {/* Filter by Farm */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {language === 'ta' ? 'பண்ணை வாரியாக:' : 'Filter by Farm:'}
        </label>
        <select
          value={selectedFarmFilter}
          onChange={(e) => setSelectedFarmFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="all">{language === 'ta' ? 'அனைத்து பண்ணைகளும்' : 'All Farms'}</option>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>

      {/* Fields Grid */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-32" />
      ) : filteredFields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => {
            const parentFarm = farms.find((f) => f.id === field.farm_id);
            return (
              <div
                key={field.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 glass-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {parentFarm ? parentFarm.name : `Farm #${field.farm_id}`}
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {field.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Ruler className="h-3.5 w-3.5 text-slate-400" />
                      <span>{field.area_acres ? `${field.area_acres} Acres` : 'Acreage unrecorded'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      <span>Soil: <strong className="font-semibold text-slate-800 dark:text-slate-200">{field.soil_type || 'Unspecified'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    onClick={() => openEditModal(field)}
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                    title={t('btn_edit')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(field.id)}
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
          icon={Grid}
          title={language === 'ta' ? 'வயல்கள் எதுவும் இல்லை' : 'No fields found'}
          description={language === 'ta' ? 'பயிர்களை நடுவதற்கும் மண் பரிசோதனை செய்வதற்கும் முதல் வயலை சேர்க்கவும்.' : 'Fields represent individual cultivation blocks where crops are planted and fertilized'}
          actionText={farms.length > 0 ? (language === 'ta' ? 'வயல் சேர்க்க' : 'Add Field') : undefined}
          onAction={openAddModal}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingField ? (language === 'ta' ? 'வயல் விவரங்களை திருத்து' : 'Edit Field Block') : (language === 'ta' ? 'புதிய வயல் சேர்க்க' : 'Add Field Block')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Parent Farm / பண்ணை *
            </label>
            <select
              required
              value={farmId}
              onChange={(e) => setFarmId(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="" disabled>Select parent farm...</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Field Name / வயல் பெயர் *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. North Block A"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Area (Acres) / பரப்பளவு
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={areaAcres}
              onChange={(e) => setAreaAcres(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="2.0"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Soil Type / மண் வகை
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {soilTypesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
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
