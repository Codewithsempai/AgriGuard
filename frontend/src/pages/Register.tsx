import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, User, AlertCircle, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await register(email, name, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/20">
            <Sprout className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {language === 'ta' ? 'புதிய விவசாய கணக்கு தொடங்குக' : 'Create Farmer Account'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta' ? 'அனைத்து AI வேளாண் கருவிகளையும் இலவசமாக பயன்படுத்தலாம்' : 'Start managing your farm, soil health and crop diagnoses'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Full Name / பெயர்
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Kavitha Raman"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="farmer@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Password (min 8 characters)
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Check className={`h-3 w-3 ${password.length >= 8 ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least 8 characters</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? t('btn_loading') : (language === 'ta' ? 'பதிவு செய்க' : 'Create Account')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {language === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா? ' : 'Already have an account? '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
            {language === 'ta' ? 'உள்நுழைக' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
};
