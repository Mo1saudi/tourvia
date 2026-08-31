import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingUp,
  Share2,
  FileText,
  Presentation,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  DollarSign,
  Users,
  Eye,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface LandingViewProps {
  onNavigate: (view: string, tripId?: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const { t, isRtl } = useLanguage();

  // Interactive Profit Simulator state
  const [simDays, setSimDays] = useState(5);
  const [simTravelers, setSimTravelers] = useState(4);
  const [simCostPerDay, setSimCostPerDay] = useState(2500); // EGP
  const [simMarkup, setSimMarkup] = useState(30); // 30% margin

  const totalCost = simDays * simTravelers * simCostPerDay;
  const sellingPrice = Math.round(totalCost * (1 + simMarkup / 100));
  const expectedProfit = sellingPrice - totalCost;

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform">
          <div className="h-[450px] w-[750px] rounded-full bg-gradient-to-tr from-amber-400/20 to-amber-600/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/90 px-3.5 py-1.5 text-xs font-bold text-amber-900 shadow-xs dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>{t('aiFreeCounterTitle')}: 3 برامج ذكية مجانًا مدى الحياة</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 font-sans text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
            صمّم ونظّم رحلاتك السياحية <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 bg-clip-text text-transparent">
              بالذكاء الاصطناعي في دقائق
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto sm:text-lg leading-relaxed">
            {t('subheadline')}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate('auth_register')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-102 hover:bg-amber-400 sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t('ctaCreateTrip')}</span>
              <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('public_preview', 'tv_demo_egypt_explorer_2026')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:w-auto"
            >
              <Eye className="h-4 w-4 text-amber-500" />
              <span>معاينة صفحة العميل المباشرة</span>
            </button>
          </div>

          {/* Demo Hero Banner */}
          <div className="mt-14 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-16/9 sm:aspect-21/9 flex flex-col justify-end p-6 sm:p-10 text-right">
              <img
                src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1400&q=80"
                alt="Egypt Pyramids and Nile"
                className="absolute inset-0 h-full w-full object-cover opacity-45"
              />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/90 px-3 py-1 text-xs font-black text-slate-950">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>مرشد موثق: تامر المصري (Nile Wonders)</span>
                </div>
                <h3 className="mt-2 text-xl sm:text-3xl font-black text-white">
                  Egypt Pharaohs & Nile Odyssey (5 Days / 4 Nights)
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-200 max-w-2xl">
                  القاهرة • الأهرامات والمتحف الكبير • الأقصر والكرنك ووادي الملوك • الإسكندرية
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('public_preview', 'tv_demo_egypt_explorer_2026')}
                    className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100"
                  >
                    فتح رابط العميل العام
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('presentation', 'trip_egypt_classic_5d')}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                  >
                    عرض Slide Presentation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              كل ما يحتاجه المرشد السياحي والشركات في منصة واحدة
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              تحكم كامل في مسارات الرحلات، محطات اليوم، حساب تكاليف النقل والفنادق، وصافي أرباحك.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                توليد البرامج بالذكاء الاصطناعي
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                حدد الوجهات والميزانية واهتمامات عملائك، وسيقوم الذكاء الاصطناعي بصياغة جدول يومي دقيق بالمحطات والأوقات وأفضل المسارات.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                رحلات متعددة الوجهات ومحطات تفاعلية
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                من 2 إلى 5 وجهات مع تنظيم محطات كل يوم (معالم، متاحف، أنشطة، وجبات) وتحديد وسيلة التنقل والمسافة المقدرة بالكيلومتر.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                حساب التكاليف وهوامش الربح تلقائيًا
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                اجمع تكاليف الإقامة والنقل والمرشد والأنشطة، وحدد سعر البيع للعميل لمعرفة صافي ربحك ونسبة الهامش قبل إرسال العرض.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                صفحات ويب عامة آمنة للعملاء
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                شارك رابطًا أنيقًا لبرنامجك السياحي يحمل هويتك وشعارك ويخفي التكاليف الخاصة، مع نموذج مباشر لاستقبال الحجوزات والتقييمات.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <Presentation className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                عرض شرائح تفاعلي وتصدير PDF
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                اعرض برنامجك على الشاشات أو الأجهزة اللوحية كعرض تقديمي احترافي خطوة بخطوة للعملاء، أو صدّره كملف PDF بضغطة زر.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                توثيق المرشدين والشركات
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                نظام تحقق معتمد يمنحك شارة المرشد الموثق الرسمية لتعزيز ثقة السياح ووكالات السفر العالمية في برامجك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Profitability Simulator */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-6 sm:p-10 shadow-xl dark:border-amber-900/40 dark:from-slate-900 dark:to-slate-900">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                حاسبة الأرباح التقديرية
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                احسب تكلفة وأرباح رحلتك القادمة
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>عدد أيام البرنامج:</span>
                    <span>{simDays} أيام</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={simDays}
                    onChange={e => setSimDays(Number(e.target.value))}
                    className="mt-2 w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>عدد المسافرين:</span>
                    <span>{simTravelers} أشخاص</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={simTravelers}
                    onChange={e => setSimTravelers(Number(e.target.value))}
                    className="mt-2 w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>التكلفة التشغيلية للفرد/اليوم:</span>
                    <span>{simCostPerDay.toLocaleString()} EGP</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={simCostPerDay}
                    onChange={e => setSimCostPerDay(Number(e.target.value))}
                    className="mt-2 w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>هامش الربح المستهدف:</span>
                    <span className="text-amber-600 font-black">{simMarkup}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={simMarkup}
                    onChange={e => setSimMarkup(Number(e.target.value))}
                    className="mt-2 w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Result Card */}
              <div className="flex flex-col justify-center rounded-2xl bg-slate-950 p-6 text-white shadow-lg">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>إجمالي التكلفة التشغيلية:</span>
                    <span className="font-bold text-white">{totalCost.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>سعر بيع البرنامج المقترح:</span>
                    <span className="font-bold text-amber-400">{sellingPrice.toLocaleString()} EGP</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-300">صافي ربح المرشد:</span>
                      <span className="text-2xl font-black text-emerald-400">
                        +{expectedProfit.toLocaleString()} EGP
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('auth_register')}
                  className="mt-6 w-full rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 transition-colors"
                >
                  ابدأ بإنشاء هذا البرنامج مجانًا
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        <p>© 2026 TOURVIA AI Tour Guide SaaS. جميع الحقوق محفوظة للمرشدين وشركات السياحة.</p>
      </footer>
    </div>
  );
};
