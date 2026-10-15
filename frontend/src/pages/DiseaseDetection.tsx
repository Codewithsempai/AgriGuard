import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud, ScanSearch, AlertTriangle, CheckCircle, Info, ShieldAlert,
  Sparkles, FileText, Activity, AlertCircle, ArrowRight, RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import type { Crop, DiseasePredictionResponse } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { translateTreatment } from '../utils/tamilTranslations';

export const DiseaseDetection: React.FC = () => {
  const { t, language } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiseasePredictionResponse | null>(null);
  const [engineStatus, setEngineStatus] = useState<{ gemini_active: boolean; engine: string } | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keySuccess, setKeySuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEngineStatus = () => {
    api.getDiseaseEngineStatus()
      .then((res) => setEngineStatus(res))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    api.getCrops()
      .then((res) => setCrops(res.items.filter((c) => c.status === 'active')))
      .catch((err) => console.error(err));
    loadEngineStatus();
  }, []);

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setSavingKey(true);
    try {
      await api.configureGeminiKey(apiKeyInput.trim());
      setKeySuccess('Gemini AI key connected successfully! Multimodal Vision is now active.');
      setApiKeyInput('');
      loadEngineStatus();
      setTimeout(() => setShowKeyModal(false), 2000);
    } catch (err: any) {
      setError('Failed to save Gemini key. Please verify key format.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setResult(null);

    // Client-side validation
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setError('Only JPEG or PNG image files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRunDiagnosis = async () => {
    if (!imageFile) {
      setError('Please select or upload an image file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', imageFile);
    if (selectedCropId) {
      formData.append('crop_id', String(selectedCropId));
    }
    formData.append('language', language);

    try {
      const res = await api.predictDisease(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please check the image format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title & Engine Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-xs ${
              engineStatus?.gemini_active
                ? 'border-zinc-300 bg-white/90 text-zinc-900 dark:border-white/20 dark:bg-zinc-900/90 dark:text-white'
                : 'border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200'
            }`}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>{engineStatus?.gemini_active ? '✨ Google Gemini Vision AI (Active)' : '🧠 TensorFlow Deep-Learning (Active)'}</span>
            </div>
            
            <button
              type="button"
              onClick={() => setShowKeyModal(!showKeyModal)}
              className="text-xs text-zinc-900 hover:text-black underline dark:text-zinc-200 dark:hover:text-white font-semibold"
            >
              {engineStatus?.gemini_active ? 'Configure Gemini Key' : '⚡ Connect Free Gemini Key (99% Accuracy)'}
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('ai_detect_title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('ai_detect_subtitle')}
          </p>
        </div>
      </div>

      {/* Gemini Key Configuration Card */}
      {showKeyModal && (
        <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-6 dark:border-white/15 dark:bg-zinc-900/80 glass-card backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white font-bold">
              <Sparkles className="h-5 w-5" />
              <span>Connect Google Gemini Multimodal Vision AI</span>
            </div>
            <button
              onClick={() => setShowKeyModal(false)}
              className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
            >
              ✕ Close
            </button>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Connecting your free Google Gemini API key enables high-resolution visual leaf pathology inspection, 99% accuracy across all crop varieties, and agronomist treatment protocols.
          </p>

          <form onSubmit={handleSaveGeminiKey} className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              placeholder="Paste your Gemini API Key (e.g. AIzaSy...)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs shadow-xs focus:border-black focus:outline-hidden dark:border-white/20 dark:bg-black/60 dark:text-white"
            />
            <button
              type="submit"
              disabled={savingKey || !apiKeyInput.trim()}
              className="rounded-xl bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
            >
              {savingKey ? 'Saving...' : 'Save & Activate'}
            </button>
          </form>

          {keySuccess && (
            <p className="text-xs text-zinc-900 dark:text-zinc-100 font-semibold">{keySuccess}</p>
          )}

          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>🔑 Free API Key available from Google AI Studio</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-black dark:hover:text-white"
            >
              Get Free Gemini Key ↗
            </a>
          </div>
        </div>
      )}

      {/* Advisory Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 text-xs text-zinc-700 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-300 flex items-start gap-3 glass-card backdrop-blur-md">
        <Info className="h-5 w-5 text-zinc-900 dark:text-white shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('ai_advisory_notice')}
        </p>
      </div>

      {/* Upload & Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Upload Zone */}
        <div className="md:col-span-2 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-all duration-300 glass-card ${
              previewUrl
                ? 'border-zinc-800 bg-zinc-100/50 dark:border-white/40 dark:bg-white/5'
                : 'border-zinc-300/80 hover:border-black/50 bg-white/70 hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-900/60 dark:hover:border-white/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {previewUrl ? (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt="Crop Leaf Preview"
                  className="max-h-64 rounded-2xl object-contain shadow-md mx-auto"
                />
                <p className="text-xs text-zinc-900 dark:text-zinc-200 font-medium">
                  {imageFile?.name} ({(imageFile!.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'ta' ? 'மாற்ற கிளிக் செய்யவும்' : 'Click to change photo'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-white/10 dark:text-white dark:border-white/15 shadow-xs">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {t('ai_drag_drop')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('ai_formats_allowed')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right: Parameters & Trigger */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/70 p-6 shadow-xs dark:border-white/10 dark:bg-zinc-900/60 glass-card flex flex-col justify-between space-y-6 backdrop-blur-md">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {language === 'ta' ? 'பயிர் விவரம் (விருப்பத்தேர்வு)' : 'Target Crop Link (Optional)'}
            </h3>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                {language === 'ta' ? 'வயலில் உள்ள பயிரை தேர்ந்தெடுக்கவும்' : 'Assign to an active crop cycle:'}
              </label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-black focus:outline-hidden dark:border-white/20 dark:bg-zinc-900 dark:text-white"
              >
                <option value="">{language === 'ta' ? '-- பொதுவான பகுப்பாய்வு --' : '-- General Inspection --'}</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.variety ? `(${c.variety})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-3.5 text-xs text-slate-600 dark:bg-white/[0.04] dark:text-slate-300 border border-zinc-200/80 dark:border-white/10">
              <span className="font-semibold block text-slate-800 dark:text-slate-200 mb-1">
                {language === 'ta' ? 'சிறந்த முடிவுகளுக்கான குறிப்புகள்:' : 'Tips for Best Accuracy:'}
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>{language === 'ta' ? 'இலையின் புள்ளி தெளிவாக தெரியுமாறு படம் எடுக்கவும்' : 'Frame a single symptomatic leaf in sharp focus.'}</li>
                <li>{language === 'ta' ? 'நல்ல பகல் வெளிச்சத்தில் படம் பிடிக்கவும்' : 'Avoid excessive shadows or dark flash glare.'}</li>
                <li>{language === 'ta' ? 'இலையின் முன்புறம் மற்றும் பின்புறத்தை கவனிக்கவும்' : 'Focus closely on the lesion border.'}</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleRunDiagnosis}
              disabled={!imageFile || loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition disabled:opacity-50"
            >
              <ScanSearch className="h-4 w-4" />
              <span>{loading ? t('btn_loading') : (language === 'ta' ? 'AI பரிசோதனை செய்க' : 'Run AI Leaf Diagnosis')}</span>
            </button>

            {previewUrl && (
              <button
                onClick={handleReset}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 py-2 text-xs font-semibold text-slate-600 hover:bg-zinc-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{language === 'ta' ? 'மீட்டமைக்க' : 'Clear & Reset'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Diagnosis Results Section */}
      {result && (
        <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-6 sm:p-8 shadow-xl dark:border-white/15 dark:bg-zinc-900/80 glass-card backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-white/10 pb-4 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/15 px-2.5 py-0.5 rounded-md inline-block">
                {result.top_prediction?.engine || (result.mode === 'model' ? 'TensorFlow Inference Complete' : 'AI Diagnosis Complete')}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 break-words">
                {result.top_prediction
                  ? (language === 'ta' && result.top_prediction.details?.tamil_name
                      ? result.top_prediction.details.tamil_name
                      : result.top_prediction.details?.common_name || result.top_prediction.label.replace('___', ' - ').replace(/_/g, ' '))
                  : (language === 'ta' ? 'மாதிரி நிலை: மாதிரி முடிவுகள் இல்லை' : 'Demo Mode: No Diagnosis Generated')}
              </h2>
            </div>

            {result.top_prediction && (
              <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/15 px-4 py-2 rounded-2xl shadow-xs shrink-0 self-start sm:self-auto">
                <Activity className="h-5 w-5 text-zinc-900 dark:text-white" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    {t('ai_confidence')}
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {((result.top_prediction.confidence || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Uncertain prediction warning */}
          {result.is_uncertain && (
            <div className="flex items-start gap-3 rounded-2xl bg-zinc-100/90 dark:bg-white/5 p-4 text-xs text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-white/20 shadow-sm backdrop-blur-md">
              <AlertTriangle className="h-5 w-5 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{t('ai_uncertain_warning')}</p>
                <p className="mt-0.5">Top class confidence is low ({((result.top_prediction?.confidence || 0) * 100).toFixed(1)}%). The local basic TensorFlow weights have limited sample coverage.</p>
                {!engineStatus?.gemini_active && (
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(true)}
                    className="mt-2 inline-flex items-center gap-1.5 font-bold text-black underline hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Connect free Google Gemini Vision key for 99% accurate leaf diagnosis ↗</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Top 3 Confidence Distribution */}
          {result.predictions && result.predictions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'ta' ? 'அதிக சாத்தியக்கூறு கொண்ட வகைப்பாடுகள்' : 'Top Model Probability Distributions'}
              </h4>
              <div className="space-y-2">
                {result.predictions.map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{p.details?.common_name || p.label.replace('___', ' - ').replace(/_/g, ' ')}</span>
                      <span>{(p.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-black dark:bg-white' : 'bg-zinc-400 dark:bg-zinc-600'
                        }`}
                        style={{ width: `${Math.max(p.confidence * 100, 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence-Based Diagnostic Protocol */}
          {result.top_prediction?.details && (
            <div className="space-y-6 border-t border-zinc-200/80 dark:border-white/10 pt-6">
              {/* Pathogen & Symptoms */}
              <div className="rounded-2xl bg-zinc-50/80 p-5 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 glass-card">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
                  {result.top_prediction.details.pathogen}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {t('ai_symptoms')}
                </h4>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'ta' && result.top_prediction.details.symptoms.ta
                    ? result.top_prediction.details.symptoms.ta
                    : result.top_prediction.details.symptoms.en}
                </p>
              </div>

              {/* Treatment Sections */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  {t('ai_treatments')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cultural */}
                  <div className="rounded-2xl border border-zinc-200/80 p-5 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03] shadow-xs glass-card">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{t('ai_cultural')}</span>
                    </span>
                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {result.top_prediction.details.treatments.cultural.map((item, i) => (
                        <li key={i}>{translateTreatment(item, language === 'ta')}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Biological */}
                  <div className="rounded-2xl border border-zinc-200/80 p-5 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03] shadow-xs glass-card">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{t('ai_biological')}</span>
                    </span>
                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {result.top_prediction.details.treatments.biological.map((item, i) => (
                        <li key={i}>{translateTreatment(item, language === 'ta')}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical */}
                  <div className="rounded-2xl border border-zinc-200/80 p-5 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03] shadow-xs glass-card">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span>{t('ai_chemical')}</span>
                    </span>
                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {result.top_prediction.details.treatments.chemical.map((item, i) => (
                        <li key={i}>{translateTreatment(item, language === 'ta')}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prevention */}
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 backdrop-blur-md p-5 text-xs text-zinc-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 shadow-xs glass-card">
                <span className="font-bold block mb-1">
                  🛡️ {t('ai_prevention')}
                </span>
                <p>{translateTreatment(result.top_prediction.details.prevention, language === 'ta')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
