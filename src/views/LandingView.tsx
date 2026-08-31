import React, { useState, useEffect } from 'react';
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
  Award,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { TourviaLogo } from '../components/TourviaLogo';
import { CustomerLinkFlow } from '../components/landing/CustomerLinkFlow';
import { ProgramsPreviewSection } from '../components/landing/ProgramsPreviewSection';
import { AvailableToursSection } from '../components/landing/AvailableToursSection';
import { ProductSlideshow } from '../components/landing/ProductSlideshow';
import { HomepagePlansSection } from '../components/landing/HomepagePlansSection';
import { AboutTourviaSection } from '../components/landing/AboutTourviaSection';
import { api } from '../services/api';
import { PublicStatsResponse } from '../types';

interface LandingViewProps {
  onNavigate: (view: string, tripId?: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const { t, isRtl } = useLanguage();
  const [publicStats, setPublicStats] = useState<PublicStatsResponse | null>(null);

  useEffect(() => {
    api.getPublicStats()
      .then(data => setPublicStats(data))
      .catch(err => console.warn('Could not fetch public stats:', err));
  }, []);

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
      {/* 1. Hero Section with 40% Opacity Archaeological Landmarks Background */}
      <section id="hero" className="scroll-mt-20 relative overflow-hidden pt-10 pb-20 sm:pt-16 sm:pb-28">
        {/* Egyptian Archaeological Landmarks Multi-Panorama (Opacity: 40%) */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
          {/* Panoramic Composite of Iconic Egyptian Monuments */}
          <div className="grid h-full w-full grid-cols-1 md:grid-cols-3 gap-0">
            {/* 1. Giza Pyramids & Great Sphinx */}
            <div className="relative h-full w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=85"
                alt="أهرامات الجيزة وأبو الهول"
                style={{ opacity: 0.4 }}
                className="h-full w-full object-cover object-center filter saturate-125 contrast-110"
              />
            </div>
            {/* 2. Karnak & Luxor Ancient Temples Columns */}
            <div className="relative hidden md:block h-full w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=85"
                alt="معابد الكرنك والأقصر الأثرية"
                style={{ opacity: 0.4 }}
                className="h-full w-full object-cover object-center filter saturate-125 contrast-110"
              />
            </div>
            {/* 3. Abu Simbel & Philae Temples */}
            <div className="relative hidden md:block h-full w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=85"
                alt="معبد أبو سمبل وآثار النيل"
                style={{ opacity: 0.4 }}
                className="h-full w-full object-cover object-center filter saturate-125 contrast-110"
              />
            </div>
          </div>

          {/* Selective subtle gradient wash that preserves 40% photo visibility while guaranteeing text sharpness */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-slate-50/20 to-slate-50 dark:from-slate-950/40 dark:via-slate-950/30 dark:to-slate-950" />
          
          {/* Subtle Ambient Golden Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 transform pointer-events-none">
            <div className="h-[350px] w-[650px] rounded-full bg-amber-400/20 blur-3xl" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Content Card with soft backdrop protection for maximum text clarity */}
          <div className="max-w-4xl mx-auto py-4 px-2 sm:px-6 rounded-3xl backdrop-blur-[2px]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/80 bg-white/95 px-4 py-1.5 text-xs font-black text-amber-950 shadow-md backdrop-blur-md dark:border-amber-600/80 dark:bg-slate-900/95 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>{t('heroBadgeText')}</span>
            </div>

            {/* Headline with high contrast & crisp readability */}
            <h1 className="mt-6 font-sans text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {t('heroHeadlineMain')} <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-500 bg-clip-text text-transparent drop-shadow-none">
                {t('heroHeadlineGradient')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-5 text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_8px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
              {t('subheadline')}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate('auth_register')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/30 transition-all hover:scale-102 hover:bg-amber-400 sm:w-auto"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t('ctaCreateTrip')}</span>
                <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('public_preview', 'tv_demo_egypt_explorer_2026')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/95 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-md backdrop-blur-md hover:bg-white dark:border-slate-700 dark:bg-slate-900/95 dark:text-white sm:w-auto"
              >
                <Eye className="h-4 w-4 text-amber-500" />
                <span>{t('liveClientPreview')}</span>
              </button>
            </div>
          </div>

          {/* Egyptian Landmarks Highlights Strip (Opacity 45%) */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl mx-auto">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 shadow-md dark:border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=500&q=80"
                alt="أهرامات الجيزة وأبو الهول"
                className="h-24 w-full object-cover opacity-45 group-hover:opacity-60 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2.5 flex flex-col justify-end text-right">
                <span className="text-[11px] font-black text-amber-300">أهرامات الجيزة</span>
                <span className="text-[9px] text-slate-300">Giza Pyramids</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 shadow-md dark:border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=500&q=80"
                alt="معبد الكرنك والأقصر"
                className="h-24 w-full object-cover opacity-45 group-hover:opacity-60 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2.5 flex flex-col justify-end text-right">
                <span className="text-[11px] font-black text-amber-300">معابد الأقصر والكرنك</span>
                <span className="text-[9px] text-slate-300">Luxor & Karnak</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 shadow-md dark:border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=500&q=80"
                alt="معبد أبو سمبل وأسوان"
                className="h-24 w-full object-cover opacity-45 group-hover:opacity-60 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2.5 flex flex-col justify-end text-right">
                <span className="text-[11px] font-black text-amber-300">معبد أبو سمبل والنيل</span>
                <span className="text-[9px] text-slate-300">Abu Simbel & Nile</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 shadow-md dark:border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=500&q=80"
                alt="قلعة قايتباي والإسكندرية"
                className="h-24 w-full object-cover opacity-45 group-hover:opacity-60 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2.5 flex flex-col justify-end text-right">
                <span className="text-[11px] font-black text-amber-300">الإسكندرية والساحل</span>
                <span className="text-[9px] text-slate-300">Alexandria & Coast</span>
              </div>
            </div>
          </div>

          {/* Dynamic Platform Statistics Strip (Connected directly to Admin Control) */}
          <div className="mt-8 mx-auto max-w-4xl rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 dark:divide-slate-800">
              <div className="text-center pt-2 sm:pt-0">
                <span className="font-heading text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                  {publicStats?.users?.display || '250+'}
                </span>
                <p className="mt-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {publicStats?.users ? (isRtl ? (publicStats.users.labelAr || 'مرشد وشركة معتمدة') : (publicStats.users.labelEn || 'Licensed Guides')) : (isRtl ? 'مرشد وشركة معتمدة' : 'Licensed Guides')}
                </p>
              </div>

              <div className="text-center pt-2 sm:pt-0">
                <span className="font-heading text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  {publicStats?.trips?.display || '1,200+'}
                </span>
                <p className="mt-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {publicStats?.trips ? (isRtl ? (publicStats.trips.labelAr || 'برنامج بالذكاء الاصطناعي') : (publicStats.trips.labelEn || 'AI Trips Created')) : (isRtl ? 'برنامج بالذكاء الاصطناعي' : 'AI Trips Created')}
                </p>
              </div>

              <div className="text-center pt-2 sm:pt-0">
                <span className="font-heading text-2xl sm:text-3xl font-black text-amber-500">
                  {publicStats?.monuments?.display || '50+'}
                </span>
                <p className="mt-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {publicStats?.monuments ? (isRtl ? (publicStats.monuments.labelAr || 'معلم أثري وموقع سياحي') : (publicStats.monuments.labelEn || 'Monuments & Sites')) : (isRtl ? 'معلم أثري وموقع سياحي' : 'Monuments & Sites')}
                </p>
              </div>

              <div className="text-center pt-2 sm:pt-0">
                <span className="font-heading text-2xl sm:text-3xl font-black text-emerald-500">
                  {publicStats?.satisfaction?.display || '99.8%'}
                </span>
                <p className="mt-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {publicStats?.satisfaction ? (isRtl ? (publicStats.satisfaction.labelAr || 'دقة المواعيد ورضا العملاء') : (publicStats.satisfaction.labelEn || 'Precision & Rating')) : (isRtl ? 'دقة المواعيد ورضا العملاء' : 'Precision & Rating')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Explore Available Tours (Search by Location or Interest) */}
      <AvailableToursSection onNavigate={onNavigate} />

      {/* 3. Customer Link Workflow: Guide -> TOURVIA -> Live Client Link -> Traveler */}
      <CustomerLinkFlow onNavigate={onNavigate} />

      {/* 3. Programs Preview Section ("شوف تجربة البرنامج بنفسك") */}
      <ProgramsPreviewSection onNavigate={onNavigate} />

      {/* 4. Product Showcase Slideshow */}
      <ProductSlideshow onNavigate={onNavigate} />

      {/* 6. Core Feature Highlights Grid */}
      <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              {t('featuresHeadline')}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t('featuresSubheadline')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                {t('featureAiTitle')}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('featureAiDesc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                {t('featureMultiDestTitle')}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('featureMultiDestDesc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                {t('featureCostProfitTitle')}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('featureCostProfitDesc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                {t('featurePublicPagesTitle')}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('featurePublicPagesDesc')}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <Presentation className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                {t('featurePresentationTitle')}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('featurePresentationDesc')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                {t('featureVerificationTitle')}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('featureVerificationDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Profitability Simulator */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-6 sm:p-10 shadow-xl dark:border-amber-900/40 dark:from-slate-900 dark:to-slate-900">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {t('profitSimulatorSubtitle')}
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                {t('profitSimulatorTitle')}
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{t('simDaysLabel')}</span>
                    <span>{simDays} {t('daysUnit')}</span>
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
                    <span>{t('simTravelersLabel')}</span>
                    <span>{simTravelers} {t('personsUnit')}</span>
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
                    <span>{t('simCostPerDayLabel')}</span>
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
                    <span>{t('simMarkupLabel')}</span>
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
                    <span>{t('simTotalCostLabel')}</span>
                    <span className="font-bold text-white">{totalCost.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t('simSellingPriceLabel')}</span>
                    <span className="font-bold text-amber-400">{sellingPrice.toLocaleString()} EGP</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-300">{t('simNetProfitLabel')}</span>
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
                  {t('simStartFreeCta')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Homepage Plans Section ("الخطط والأسعار") */}
      <HomepagePlansSection onNavigate={onNavigate} />

      {/* 8. About TOURVIA Section ("عن TOURVIA") */}
      <AboutTourviaSection onNavigate={onNavigate} stats={publicStats} />

      {/* 10. Final Call to Action */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-amber-500/10 to-amber-500/5 py-16 dark:border-slate-800 dark:from-amber-950/20 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            {isRtl ? 'جاهز لتقديم تجربة سياحية رقمية تليق بضيوف مصر؟' : 'Ready to Deliver a Premium Travel Experience in Egypt?'}
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {isRtl ? 'انضم لمئات المرشدين والشركات السياحية المعتمدة وابدأ مجاناً اليوم بـ 3 برامج مدى الحياة.' : 'Join licensed guides and agencies. Start free today with 3 lifetime AI itineraries.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('auth_register')}
              className="flex items-center gap-2 rounded-2xl bg-amber-500 px-8 py-3.5 text-xs font-black text-slate-950 shadow-xl shadow-amber-500/30 hover:bg-amber-400 transition-all hover:scale-102"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t('ctaStartNow')}</span>
              <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('public_preview', 'tv_demo_egypt_explorer_2026')}
              className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <Eye className="h-4 w-4 text-amber-500" />
              <span>{t('liveClientExperience')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. Footer with Quick Nav Links */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-500 dark:border-slate-800 dark:bg-[#070E22] dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <TourviaLogo size={32} variant="mark" />
              <div>
                <span className="font-heading font-black text-base text-[#0B1736] dark:text-white">
                  TOUR<span className="text-amber-500">VIA</span>
                </span>
                <span className="block text-[10px] text-slate-400">{t('footerTagline')}</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
              <a href="#hero" className="hover:text-amber-500 transition-colors">
                {t('navHome')}
              </a>
              <a href="#programs" className="hover:text-amber-500 transition-colors">
                {t('navPrograms')}
              </a>
              <a href="#plans" className="hover:text-amber-500 transition-colors">
                {t('navPlans')}
              </a>
              <a href="#about" className="hover:text-amber-500 transition-colors">
                {t('navAbout')}
              </a>
              <button
                type="button"
                onClick={() => onNavigate('auth_login')}
                className="hover:text-amber-500 transition-colors"
              >
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
