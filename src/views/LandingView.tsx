import React from 'react';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { TourviaLogo } from '../components/TourviaLogo';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureShowcase } from '../components/landing/FeatureShowcase';
import { AICopilotSection } from '../components/landing/AICopilotSection';
import { AudienceSections } from '../components/landing/AudienceSections';
import { FAQSection } from '../components/landing/FAQSection';
import { HomepagePlansSection } from '../components/landing/HomepagePlansSection';

interface LandingViewProps {
  onNavigate: (view: string, tripId?: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const { t, isRtl } = useLanguage();

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* 1. Hero */}
      <HeroSection onNavigate={onNavigate} />

      {/* 2. Product Preview — Feature Showcase */}
      <FeatureShowcase />

      {/* 3. AI Copilot */}
      <AICopilotSection />

      {/* 4. For Guides & Agencies */}
      <AudienceSections />

      {/* 5. Pricing */}
      <HomepagePlansSection onNavigate={onNavigate} />

      {/* 6. FAQ */}
      <FAQSection />

      {/* 7. Final CTA */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-amber-500/10 to-amber-500/5 py-16 dark:border-slate-800 dark:from-amber-950/20 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
            جاهز لتنظيم شغلك السياحي بشكل أذكى؟
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            ابدأ ببناء أول برنامج لك مع Tourvia.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('auth_register')}
              className="flex items-center gap-2 rounded-2xl bg-amber-500 px-8 py-3.5 text-xs font-black text-slate-950 shadow-xl shadow-amber-500/30 hover:bg-amber-400 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>ابدأ مجانًا</span>
              <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('auth_login')}
              className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <Eye className="h-4 w-4 text-amber-500" />
              <span>تسجيل الدخول</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-500 dark:border-slate-800 dark:bg-[#070E22] dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <TourviaLogo size={32} variant="mark" />
              <div>
                <span className="font-black text-base text-[#0B1736] dark:text-white">
                  TOUR<span className="text-amber-500">VIA</span>
                </span>
                <span className="block text-[10px] text-slate-400">{t('footerTagline')}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
              <a href="#hero" className="hover:text-amber-500 transition-colors">{t('navHome')}</a>
              <a href="#plans" className="hover:text-amber-500 transition-colors">{t('navPlans')}</a>
              <button type="button" onClick={() => onNavigate('auth_login')} className="hover:text-amber-500 transition-colors">
                {t('ctaGuideLogin')}
              </button>
            </div>
            <p className="text-xs">© {new Date().getFullYear()} TOURVIA. {t('footerRights')}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
