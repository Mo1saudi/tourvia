import React from 'react';
import { Sparkles, ArrowRight, Eye, MapPin, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface HeroSectionProps {
  onNavigate: (view: string, tripId?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { isRtl } = useLanguage();

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-16 pb-20 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:pt-24">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-amber-400/10 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>منصة SaaS للمرشدين وشركات السياحة في مصر</span>
            </div>
            <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              أنشئ رحلتك السياحية.
              <br />
              <span className="bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                احسب تكلفتها. حدد سعرها.
              </span>
              <br />
              وقدمها للعميل.
            </h1>
            <p className="mt-5 max-w-xl text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base lg:mx-0 mx-auto">
              Tourvia يساعد المرشدين وشركات السياحة على إنشاء البرامج السياحية، حساب التكاليف والأرباح، تسعير الرحلات، وإنشاء عروض احترافية للعملاء من مكان واحد.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center">
              <button type="button" onClick={() => onNavigate('auth_register')} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/30 transition-all hover:scale-[1.02] hover:bg-amber-400 sm:w-auto">
                <Sparkles className="h-4 w-4" />
                <span>ابدأ مجانًا</span>
                <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
              <button type="button" onClick={() => onNavigate('auth_login')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-md transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 sm:w-auto">
                <Eye className="h-4 w-4 text-amber-500" />
                <span>استكشف Tourvia</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Cairo Premium Experience</h3>
                    <p className="text-[10px] text-slate-400">3 Days · 12 Activities</p>
                  </div>
                </div>
                <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">Trip Score 87/100</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold text-slate-400">التكلفة</p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">18,700 <span className="text-xs font-normal text-slate-400">EGP</span></p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold text-slate-400">سعر البيع</p>
                  <p className="mt-1 text-lg font-black text-amber-600 dark:text-amber-400">24,000 <span className="text-xs font-normal text-slate-400">EGP</span></p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">الربح</p>
                  <p className="mt-1 text-lg font-black text-emerald-600 dark:text-emerald-400">5,300 <span className="text-xs font-normal">EGP</span></p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/20">
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">الهامش</p>
                  <p className="mt-1 text-lg font-black text-blue-600 dark:text-blue-400">22.1%</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { items: 'المتحف المصري · خان الخليلي · القلعة', time: '8 ساعات' },
                  { items: 'الهرم · أبو الهول · سقارة', time: '7 ساعات' },
                  { items: 'المتحف الحضاري · نيل فلوكا', time: '6 ساعات' },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500 text-[10px] font-black text-slate-950">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-bold text-slate-600 dark:text-slate-300">{d.items}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-[9px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {d.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-3 -right-3 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 shadow-lg dark:border-emerald-800 dark:bg-slate-900">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">جاهز للنشر</span>
            </div>
            <div className="absolute -bottom-3 -left-3 flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-1.5 shadow-lg dark:border-amber-800 dark:bg-slate-900">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">ربح 22.1%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
