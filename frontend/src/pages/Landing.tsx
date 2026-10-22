import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout, ScanSearch, CloudSun, TrendingUp, ShieldCheck,
  ArrowRight, CheckCircle2, ChevronRight, BarChart3, Database, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Landing: React.FC = () => {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: ScanSearch,
      title: language === 'ta' ? 'AI பயிர் இலை நோய் பகுப்பாய்வு' : 'AI Crop Disease Detection',
      desc: language === 'ta'
        ? 'நவீன ஆழமான கற்றல் மாதிரி மூலம் இலை நோய்களை துல்லியமாக கண்டறிந்து உடனடி சிகிச்சை முறைகளை பெறலாம்.'
        : 'Deep learning neural models identify foliar blights, rusts, and fungal infections with evidence-based treatment guidance.',
      color: 'text-zinc-900 bg-zinc-100 border border-zinc-200 dark:text-white dark:bg-white/10 dark:border-white/20',
    },
    {
      icon: CloudSun,
      title: language === 'ta' ? 'வானிலை நுண்ணறிவு' : 'Precision Weather Intelligence',
      desc: language === 'ta'
        ? 'திறந்தநிலை Open-Meteo வானிலை மூலம் 7 நாள் வெப்பநிலை, மழைப்பொழிவு மற்றும் ஈரப்பதம் தகவல்.'
        : 'Real-time 7-day meteorological forecasts with temperature, precipitation, and humidity for precise spray scheduling.',
      color: 'text-zinc-900 bg-zinc-100 border border-zinc-200 dark:text-white dark:bg-white/10 dark:border-white/20',
    },
    {
      icon: TrendingUp,
      title: language === 'ta' ? 'சந்தை விலை நுண்ணறிவு' : 'Market Price Benchmarks',
      desc: language === 'ta'
        ? 'முக்கிய மண்டிகளில் பயிர் விலைகளை ஒப்பிட்டு விற்பனை முடிவுகளை எளிதாக்குங்கள்.'
        : 'Explore verified mandi benchmark pricing across major Indian agricultural trading hubs.',
      color: 'text-zinc-900 bg-zinc-100 border border-zinc-200 dark:text-white dark:bg-white/10 dark:border-white/20',
    },
    {
      icon: BarChart3,
      title: language === 'ta' ? 'செலவு மற்றும் லாப பகுப்பாய்வு' : 'Financials & Profit Analytics',
      desc: language === 'ta'
        ? 'விதை, உரம், ஆட்கள் கூலி செலவுகளை பதிவு செய்து அறுவடை நிகர லாபத்தை தானாக கணக்கிடுங்கள்.'
        : 'Track expenditures across 6 farming categories and automatically compute net harvest margin and ROI.',
      color: 'text-zinc-900 bg-zinc-100 border border-zinc-200 dark:text-white dark:bg-white/10 dark:border-white/20',
    },
    {
      icon: Database,
      title: language === 'ta' ? 'பாதுகாப்பான உள்ளூர் தரவுத்தளம்' : 'Zero-Hardware Local SQLite',
      desc: language === 'ta'
        ? 'வெளிப்புற சர்வர்கள் அல்லது சென்சார்கள் இன்றி உங்கள் கணினியிலேயே பாதுகாப்பாக இயங்குகிறது.'
        : 'Runs locally on SQLite with JWT encryption, zero vendor lock-in, and zero expensive hardware dependencies.',
      color: 'text-zinc-900 bg-zinc-100 border border-zinc-200 dark:text-white dark:bg-white/10 dark:border-white/20',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-zinc-300/30 to-transparent dark:from-white/5 pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300/80 bg-white/70 px-4 py-1.5 text-xs font-semibold text-zinc-900 dark:border-white/20 dark:bg-zinc-900/80 dark:text-zinc-100 mb-8 backdrop-blur-md shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{language === 'ta' ? 'செயற்கை நுண்ணறிவுடன் கூடிய ஸ்மார்ட் விவசாயம்' : 'Enterprise Autonomous Agriculture SaaS'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          {language === 'ta' ? (
            <>விவசாயத்தை மேம்படுத்தும் <span className="text-black dark:text-white underline decoration-zinc-400 dark:decoration-zinc-600 underline-offset-8">அறிவார்ந்த AI தளம்</span></>
          ) : (
            <>Smarter Farms, Healthier Yields with <span className="text-black dark:text-white underline decoration-zinc-400 dark:decoration-zinc-600 underline-offset-8">AgriGuard AI</span></>
          )}
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {language === 'ta'
            ? 'பயிர் இலை நோய்களை நொடிகளில் கண்டறியுங்கள், மண் சத்துக்களை பகுப்பாய்வு செய்யுங்கள், பண்ணை செலவுகளை நிர்வகித்து லாபத்தை அதிகப்படுத்துங்கள்.'
            : 'Unify farm operations, instant deep-learning crop leaf diagnosis, and financial profit analytics in one secure platform.'}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-black/20 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition transform hover:-translate-y-0.5"
          >
            <span>{language === 'ta' ? 'இலவசமாக தொடங்குக' : 'Get Started Free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300/80 bg-white/80 px-6 py-3.5 text-base font-semibold text-zinc-900 shadow-xs hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800 transition backdrop-blur-md"
          >
            <span>{language === 'ta' ? 'உள்நுழைக' : 'Sign In to Dashboard'}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-200" />
            <span>{language === 'ta' ? '10+ இலை நோய்கள் வகைப்பாடு' : '10+ Calibrated Leaf Disease Classes'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-200" />
            <span>{language === 'ta' ? 'தமிழ் & ஆங்கில ஆதரவு' : 'English & Tamil Bilingual UI'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-200" />
            <span>{language === 'ta' ? '100% உள்ளூர் SQLite சேமிப்பு' : 'SQLite Local Zero-Cost Architecture'}</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20 border-t border-slate-200/80 dark:border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {language === 'ta' ? 'முழுமையான விவசாய மேலாண்மை அம்சங்கள்' : 'Comprehensive Modules Built for Modern Agriculture'}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            {language === 'ta'
              ? 'விதைப்பு முதல் அறுவடை வரை உங்கள் பண்ணையின் அனைத்து நடவடிக்கைகளையும் ஒரே இடத்தில் நிர்வகிக்கலாம்.'
              : 'From seed germination and disease mitigation to financial yield audits and APMC market prices.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-xs hover:shadow-xl transition-all duration-300 dark:border-white/10 dark:bg-zinc-900/60 backdrop-blur-md hover:border-zinc-400 dark:hover:border-white/30 hover:-translate-y-1"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.color} mb-5 shadow-xs`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Transparency Banner */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {language === 'ta' ? 'அறிவியல் பூர்வமான மற்றும் நம்பகமான விவசாய முடிவுகள்' : 'Transparent, Science-Backed Agricultural Advice'}
            </h3>
            <p className="mt-3 text-zinc-300 text-sm sm:text-base leading-relaxed">
              {language === 'ta'
                ? 'AgriGuard AI தவறான கணிப்புகளை உருவாக்குவதில்லை. தெளிவான புகைப்படங்களுக்கான உண்மையான AI முடிவுகள், வெளிப்படையான மண் பரிசோதனை விதிகள், மற்றும் அதிகாரப்பூர்வ வானிலை சேவைகளை மட்டுமே பயன்படுத்துகிறது.'
                : 'AgriGuard AI never fabricates diagnoses or artificial confidence numbers. Image analyses include detailed cultural, biological, and chemical mitigation pathways.'}
            </p>
            <div className="mt-6">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black shadow-md hover:bg-zinc-200 transition"
              >
                <span>{language === 'ta' ? 'இப்போதே கணக்கு தொடங்குக' : 'Create Farmer Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
