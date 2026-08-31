import React from 'react';
import { 
  Send, 
  Sparkles, 
  Smartphone, 
  UserCheck, 
  Layers, 
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface CustomerLinkFlowProps {
  onNavigate: (view: string, targetId?: string) => void;
}

export const CustomerLinkFlow: React.FC<CustomerLinkFlowProps> = ({ onNavigate }) => {
  const { t, isRtl } = useLanguage();

  const steps = [
    {
      num: '01',
      title: t('guideStep1'),
      desc: isRtl ? 'اختر الوجهات والمدة وخصائص المسافرين' : 'Select destinations, duration, and traveler preferences',
      icon: Sparkles,
      color: 'bg-amber-500 text-slate-950',
    },
    {
      num: '02',
      title: t('guideStep2'),
      desc: isRtl ? 'الذكاء الاصطناعي ينظم المحطات بالأوقات بدقة' : 'AI arranges stops with precise daily timetable',
      icon: Layers,
      color: 'bg-blue-600 text-white',
    },
    {
      num: '03',
      title: t('guideStep3'),
      desc: isRtl ? 'تحديد التكاليف والخدمات وهوية المرشد' : 'Review operating costs, inclusions, and branding',
      icon: CheckCircle2,
      color: 'bg-emerald-600 text-white',
    },
    {
      num: '04',
      title: t('guideStep4'),
      desc: isRtl ? 'إرسال رابط الويب التفاعلي مباشرة للعميل' : 'Share the live interactive link directly with travelers',
      icon: Send,
      color: 'bg-purple-600 text-white',
    },
  ];

  return (
    <section id="customer-flow" className="relative border-t border-slate-200 bg-slate-50/70 py-16 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
            <Send className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t('customerLinkHeader')}</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            {isRtl ? 'من فكرة المرشد إلى هاتف السائح في ثوانٍ' : 'From Guide’s Idea to Traveler’s Screen in Seconds'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('customerLinkDesc')}
          </p>
        </div>

        {/* 4 Steps Flow */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num}
                className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-2xl font-black text-slate-300 dark:text-slate-700">
                    {step.num}
                  </span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.color} shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Highlight Callout Card */}
        <div className="mt-10 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-6 dark:border-amber-900/40 dark:from-amber-950/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-black text-slate-950 shadow-md">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {t('travelerValueQuote')}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isRtl ? 'يعمل بسلاسة على كافة الهواتف والشاشات دون الحاجة لتثبيت أي تطبيق.' : 'Works smoothly on all smartphones and screens without installing any apps.'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('public_preview', 'tv_demo_egypt_explorer_2026')}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 transition-colors"
              >
                <span>{t('liveClientExperience')}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
