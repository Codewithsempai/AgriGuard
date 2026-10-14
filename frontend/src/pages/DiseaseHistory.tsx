import React, { useState, useEffect } from 'react';
import { History, ScanSearch, Calendar, Activity, Eye, ShieldAlert, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import type { DiseaseHistoryItem } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { translateTreatment } from '../utils/tamilTranslations';

export const DiseaseHistory: React.FC = () => {
  const { t, language } = useLanguage();
  const [history, setHistory] = useState<DiseaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DiseaseHistoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setLoading(true);
    api.getDiseaseHistory()
      .then(setHistory)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDeleteItem = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(language === 'ta' ? 'இந்த நோய் பகுப்பாய்வு பதிவை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this scan record?')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteDiseaseHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete scan record');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    try {
      await api.clearAllDiseaseHistory();
      setHistory([]);
      setSelectedItem(null);
      setShowClearConfirm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to clear history');
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_disease_history')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'முந்தைய இலை நோய் பகுப்பாய்வு பதிவுகள் மற்றும் சிகிச்சை வழிகாட்டுதல்கள்'
              : 'Chronological archive of all deep-learning leaf diagnoses, image scans, and treatment plans.'}
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-rose-300/80 bg-rose-50/80 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 transition shadow-xs cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>{language === 'ta' ? 'அனைத்து பதிவுகளையும் நீக்கு' : 'Clear All History'}</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-24" />
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 glass-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt="Scanned Leaf"
                    className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/15 px-2 py-0.5 rounded-md">
                        Scan #{item.id}
                      </span>
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        disabled={deletingId === item.id}
                        className="rounded-lg p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                        title={language === 'ta' ? 'இந்த பதிவை நீக்கு' : 'Delete this scan'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1 leading-snug truncate">
                      {item.predicted_label
                        ? (language === 'ta' && item.details?.tamil_name
                            ? item.details.tamil_name
                            : item.details?.common_name || item.predicted_label.replace('___', ' - ').replace(/_/g, ' '))
                        : 'Demo Record (No Diagnosis)'}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>{item.created_at?.slice(0, 10)}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-200/80 dark:border-white/10 pt-3 text-xs">
                  <span className="text-slate-500">Mode: <strong className="text-slate-700 dark:text-slate-300 capitalize">{item.mode}</strong></span>
                  {item.confidence !== null && item.confidence !== undefined && (
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {(item.confidence * 100).toFixed(1)}% confidence
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-200/80 dark:border-white/10 pt-3 flex items-center gap-2">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 py-1.5 text-xs font-semibold text-slate-700 hover:bg-zinc-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 transition"
                >
                  <Eye className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                  <span>{language === 'ta' ? 'முழு விவரம் பார்க்க' : 'View Treatment Details'}</span>
                </button>
                <button
                  onClick={(e) => handleDeleteItem(item.id, e)}
                  disabled={deletingId === item.id}
                  className="rounded-xl border border-zinc-200 p-2 text-zinc-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:border-white/10 dark:hover:border-rose-900 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                  title={language === 'ta' ? 'நீக்கு' : 'Delete scan'}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={History}
          title={language === 'ta' ? 'பதிவுகள் எதுவும் இல்லை' : 'No disease diagnosis records'}
          description={language === 'ta' ? 'இலை புகைப்படத்தை பதிவேற்றி முதல் பரிசோதனையை மேற்கொள்ளவும்.' : 'Run your first leaf scan on the AI Disease Detection page to see archived results here'}
          actionText={t('nav_disease_detect')}
          onAction={() => window.location.href = '/disease-detection'}
        />
      )}

      {/* Confirmation Modal for Clear All */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title={language === 'ta' ? 'அனைத்து பதிவுகளையும் அழிக்கவா?' : 'Clear Entire Scan History?'}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-rose-50/80 p-4 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">
                {language === 'ta' ? 'இந்த செயல் நிரந்தரமானது' : 'This action cannot be undone'}
              </p>
              <p className="mt-1">
                {language === 'ta'
                  ? 'உங்கள் அனைத்து இலை நோய் பரிசோதனை பதிவுகளும் படங்களும் நிரந்தரமாக நீக்கப்படும்.'
                  : 'All your archived leaf scans, diagnostic outputs, and uploaded images will be permanently deleted from the database and server storage.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              disabled={clearingAll}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 transition"
            >
              {language === 'ta' ? 'ரத்து செய்க' : 'Cancel'}
            </button>
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{clearingAll ? (language === 'ta' ? 'அழிக்கப்படுகிறது...' : 'Clearing...') : (language === 'ta' ? 'ஆம், அனைத்தையும் நீக்கு' : 'Yes, Clear All')}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.details?.common_name || selectedItem?.predicted_label || 'Analysis Details'}
        maxWidth="max-w-2xl"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={selectedItem.image_url}
                alt="Leaf scan"
                className="h-28 w-28 rounded-2xl object-cover border border-zinc-200 dark:border-white/15"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  {selectedItem.details?.pathogen || 'Crop Leaf Analysis'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {language === 'ta' && selectedItem.details?.tamil_name
                    ? selectedItem.details.tamil_name
                    : selectedItem.details?.common_name || selectedItem.predicted_label}
                </h3>
                <p className="text-xs text-slate-500">
                  Recorded: {selectedItem.created_at} • Confidence: {selectedItem.confidence ? `${(selectedItem.confidence * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>

            {selectedItem.details ? (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 glass-card">
                  <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1">
                    {t('ai_symptoms')}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'ta' && selectedItem.details.symptoms.ta
                      ? selectedItem.details.symptoms.ta
                      : selectedItem.details.symptoms.en}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-zinc-200/80 p-3 dark:border-white/10 glass-card">
                    <span className="font-bold text-zinc-900 dark:text-white block mb-1">{t('ai_cultural')}</span>
                    <ul className="list-disc pl-3 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      {selectedItem.details.treatments.cultural.map((c, i) => (
                        <li key={i}>{translateTreatment(c, language === 'ta')}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-zinc-200/80 p-3 dark:border-white/10 glass-card">
                    <span className="font-bold text-zinc-900 dark:text-white block mb-1">{t('ai_biological')}</span>
                    <ul className="list-disc pl-3 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      {selectedItem.details.treatments.biological.map((b, i) => (
                        <li key={i}>{translateTreatment(b, language === 'ta')}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-zinc-200/80 p-3 dark:border-white/10 glass-card">
                    <span className="font-bold text-zinc-900 dark:text-white block mb-1">{t('ai_chemical')}</span>
                    <ul className="list-disc pl-3 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      {selectedItem.details.treatments.chemical.map((ch, i) => (
                        <li key={i}>{translateTreatment(ch, language === 'ta')}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 text-zinc-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 glass-card">
                  <span className="font-bold block mb-0.5">🛡️ {t('ai_prevention')}</span>
                  <p className="text-[11px]">{translateTreatment(selectedItem.details.prevention, language === 'ta')}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                This analysis was performed in demo mode without trained weights loaded.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
