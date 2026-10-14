import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Edit2, Trash2, Tag, Globe, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { Article } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Knowledge: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Form State
  const [category, setCategory] = useState('crop-care');
  const [titleEn, setTitleEn] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyTa, setBodyTa] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Articles' },
    { value: 'crop-care', label: 'Crop Care (பயிர் பராமரிப்பு)' },
    { value: 'pest', label: 'Pest Management (பூச்சி கட்டுப்பாடு)' },
    { value: 'disease', label: 'Disease Prevention (நோய் தடுப்பு)' },
    { value: 'soil', label: 'Soil Fertility (மண் வளம்)' },
    { value: 'weed', label: 'Weed Control (களை மேலாண்மை)' },
    { value: 'harvest', label: 'Post-Harvest (அறுவடை பின்)' },
  ];

  const fetchArticles = () => {
    setLoading(true);
    api.getKnowledge({
      q: search || undefined,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      lang: language,
    })
      .then(setArticles)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, [search, selectedCategory, language]);

  const openAddModal = () => {
    setEditingArticle(null);
    setCategory('crop-care');
    setTitleEn('');
    setTitleTa('');
    setBodyEn('');
    setBodyTa('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (a: Article) => {
    setEditingArticle(a);
    setCategory(a.category);
    setTitleEn(a.title_en);
    setTitleTa(a.title_ta || '');
    setBodyEn(a.body_en);
    setBodyTa(a.body_ta || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = {
      category,
      title_en: titleEn,
      title_ta: titleTa || null,
      body_en: bodyEn,
      body_ta: bodyTa || null,
    };

    try {
      if (editingArticle) {
        await api.updateArticle(editingArticle.id, payload);
      } else {
        await api.createArticle(payload);
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save knowledge article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this published article?')) {
      try {
        await api.deleteArticle(id);
        fetchArticles();
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
            {t('nav_knowledge')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'விவசாய வழிகாட்டிகள், நோய் தடுப்பு முறைகள் மற்றும் பயிர் பராமரிப்பு கட்டுரைகள் (தமிழ் & ஆங்கிலம்)'
              : 'Searchable crop-care guides, disease prevention, and agronomy manuals with English & Tamil translations.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2.5 text-sm font-semibold shadow-sm transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Article (Admin)</span>
          </button>
        )}
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides (e.g. irrigation, blast, weed)..."
            className="w-full rounded-xl border border-zinc-200/80 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-black focus:outline-hidden dark:border-white/10 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === c.value
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'border border-zinc-200 bg-white/80 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-32" />
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 glass-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {art.language === 'ta' ? 'தமிழ்' : 'English'}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {art.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {art.body}
                </p>
              </div>

              {isAdmin && (
                <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    onClick={() => openEditModal(art)}
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    title="Edit article"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(art.id)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No articles match your query"
          description="Try clearing search filters or selecting a different category"
        />
      )}

      {/* Admin Modal */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingArticle ? 'Edit Agriculture Knowledge Guide' : 'Publish Agriculture Knowledge Guide'}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Guide Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {categories.filter((c) => c.value !== 'all').map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Drip Fertigation Schedules"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Title (Tamil / தமிழ்)
                </label>
                <input
                  type="text"
                  value={titleTa}
                  onChange={(e) => setTitleTa(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. சொட்டுநீர் உரப்பாசன அட்டவணை"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Body Content (English) *
              </label>
              <textarea
                required
                rows={4}
                value={bodyEn}
                onChange={(e) => setBodyEn(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Detailed agronomy recommendations and steps..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Body Content (Tamil / தமிழ்)
              </label>
              <textarea
                rows={4}
                value={bodyTa}
                onChange={(e) => setBodyTa(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="தமிழில் விரிவான விவசாய குறிப்புகள்..."
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
                {submitting ? 'Saving...' : 'Publish Guide'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
