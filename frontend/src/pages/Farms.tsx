import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Edit2, Trash2, Globe, Compass, Ruler } from 'lucide-react';
import { api } from '../services/api';
import type { Farm } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

export const Farms: React.FC = () => {
  const { t, language } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [areaAcres, setAreaAcres] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchFarms = () => {
    setLoading(true);
    api.getFarms(search || undefined)
      .then((res) => setFarms(res.items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFarms();
  }, [search]);

  const openAddModal = () => {
    setEditingFarm(null);
    setName('');
    setLocation('');
    setLatitude('11.0168');
    setLongitude('76.9558');
    setAreaAcres('5.5');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setName(farm.name);
    setLocation(farm.location || '');
    setLatitude(farm.latitude !== null && farm.latitude !== undefined ? String(farm.latitude) : '');
    setLongitude(farm.longitude !== null && farm.longitude !== undefined ? String(farm.longitude) : '');
    setAreaAcres(farm.area_acres !== null && farm.area_acres !== undefined ? String(farm.area_acres) : '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = {
      name,
      location: location || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      area_acres: areaAcres ? parseFloat(areaAcres) : null,
    };

    try {
      if (editingFarm) {
        await api.updateFarm(editingFarm.id, payload);
      } else {
        await api.createFarm(payload);
      }
      setIsModalOpen(false);
      fetchFarms();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save farm details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(language === 'ta' ? 'இந்த பண்ணையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this farm? All associated fields and crops will be affected.')) {
      try {
        await api.deleteFarm(id);
        fetchFarms();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_farms')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'உங்கள் நில அமைவிடங்கள், பரப்பளவு மற்றும் புவியியல் ஆயத்தொலைவுகளை நிர்வகியுங்கள்'
              : 'Register and manage your farm plots, geographical coordinates, and acreage.'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2.5 text-sm font-semibold shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'ta' ? 'புதிய பண்ணை சேர்க்க' : 'Add New Farm'}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('btn_search')}
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Farm Cards Grid */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-36" />
      ) : farms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 glass-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {farm.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {farm.location || 'Location not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Ruler className="h-3.5 w-3.5 text-slate-400" />
                    <span>{farm.area_acres ? `${farm.area_acres} Acres` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Compass className="h-3.5 w-3.5 text-slate-400" />
                    <span>{farm.latitude && farm.longitude ? `${farm.latitude.toFixed(2)}, ${farm.longitude.toFixed(2)}` : 'GPS N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  onClick={() => openEditModal(farm)}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  title={t('btn_edit')}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(farm.id)}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title={t('btn_delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title={language === 'ta' ? 'பண்ணைகள் எதுவும் இல்லை' : 'No farms registered yet'}
          description={language === 'ta' ? 'வயல்கள் மற்றும் பயிர்களை நிர்வகிக்க உங்கள் முதல் பண்ணையை சேர்க்கவும்.' : 'Add your first farm location to begin tracking fields, crop cycles and weather'}
          actionText={language === 'ta' ? 'பண்ணை சேர்க்க' : 'Add Farm'}
          onAction={openAddModal}
        />
      )}

      {/* Add / Edit Farm Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? (language === 'ta' ? 'பண்ணை விவரங்களை திருத்து' : 'Edit Farm Plot') : (language === 'ta' ? 'புதிய பண்ணை சேர்க்க' : 'Register New Farm Plot')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Farm Name / பண்ணை பெயர் *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. Green Valley Agro"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Location / அமைவிடம்
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. Pollachi, Coimbatore"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="11.0168"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="76.9558"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Total Area (Acres) / மொத்த பரப்பளவு
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={areaAcres}
              onChange={(e) => setAreaAcres(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="5.5"
            />
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
