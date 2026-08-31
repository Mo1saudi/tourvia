import React, { useState, useEffect } from 'react';
import {
  Compass,
  ShieldCheck,
  Sparkles,
  MapPin,
  Users,
  Award,
  ArrowRight,
  Cpu,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { TourviaLogo } from '../TourviaLogo';
import { api } from '../../services/api';
import { PublicStatsResponse } from '../../types';

interface AboutTourviaSectionProps {
  onNavigate: (view: string, targetId?: string) => void;
  stats?: PublicStatsResponse | null;
}

export const AboutTourviaSection: React.FC<AboutTourviaSectionProps> = ({ onNavigate, stats: externalStats }) => {
  const { t, isRtl } = useLanguage();
  const [stats, setStats] = useState<PublicStatsResponse | null>(externalStats || null);

  useEffect(() => {
    if (externalStats) {
      setStats(externalStats);
    } else {
      api.getPublicStats().then(res => setStats(res)).catch(() => {});
    }
  }, [externalStats]);

  const displayUsers = stats?.users ? (isRtl ? (stats.users.labelAr || 'مرشد سياحي وشركة معتمدة') : (stats.users.labelEn || 'Guides & Agencies')) : (isRtl ? 'مرشد سياحي وشركة معتمدة' : 'Guides & Agencies');
  const displayUsersCount = stats?.users?.display || '250+';

  const displayTrips = stats?.trips ? (isRtl ? (stats.trips.labelAr || 'برنامج مصمم بالذكاء') : (stats.trips.labelEn || 'AI Trips Created')) : (isRtl ? 'برنامج مصمم بالذكاء' : 'AI Trips Created');
  const displayTripsCount = stats?.trips?.display || '1,200+';

  const displayMonuments = stats?.monuments ? (isRtl ? (stats.monuments.labelAr || 'معلم أثري وسياحي مصري') : (stats.monuments.labelEn || 'Monuments & Sites')) : (isRtl ? 'معلم أثري وسياحي مصري' : 'Monuments & Sites');
  const displayMonumentsCount = stats?.monuments?.display || '50+';

  const displayPrecision = stats?.satisfaction ? (isRtl ? (stats.satisfaction.labelAr || 'دقة وتناسق التوقيتات') : (stats.satisfaction.labelEn || 'Timetable Precision')) : (isRtl ? 'دقة وتناسق التوقيتات' : 'Timetable Precision');
  const displayPrecisionCount = stats?.satisfaction?.display || '99.8%';

  const pillars = [
    {
      icon: Cpu,
      title: t('aboutPoint1Title'),
      desc: t('aboutPoint1Desc'),
      color: 'bg-amber-500 text-slate-950',
    },
    {
      icon: ShieldCheck,
      title: t('aboutPoint2Title'),
      desc: t('aboutPoint2Desc'),
      color: 'bg-blue-600 text-white',
    },
    {
      icon: Layers,
      title: t('aboutPoint3Title'),
      desc: t('aboutPoint3Desc'),
      color: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <section id="about" className="scroll-mt-20 border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
            <Compass className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isRtl ? 'ريادة التكنولوجيا السياحية في مصر' : 'Pioneering Travel-Tech in Egypt'}</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            {t('aboutTourviaTitle')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('aboutTourviaSubtitle')}
          </p>
        </div>

        {/* Story & Mission Box */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/60 p-8 dark:border-slate-800 dark:bg-slate-950/40 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 dark:bg-[#0B1736] dark:ring-amber-500/20">
                  <TourviaLogo size={36} variant="mark" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-black text-slate-950 dark:text-white">
                    TOUR<span className="text-amber-500">VIA</span> Platform
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    The Smart Operating System for Egyptian Tour Guides
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-2">
                {t('aboutMissionText')}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 border border-slate-200 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isRtl ? 'مصمم وفق معايير نقابة المرشدين السياحيين' : 'Aligned with Tour Guide Standards'}
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 border border-slate-200 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
                  <HeartHandshake className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isRtl ? 'دعم السياحة المصرية الأصيلة' : 'Supporting Egyptian Tourism Heritage'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-2xl font-black text-purple-600">{displayUsersCount}</span>
                <p className="mt-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {displayUsers}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-2xl font-black text-blue-600">{displayTripsCount}</span>
                <p className="mt-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {displayTrips}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-2xl font-black text-amber-500">{displayMonumentsCount}</span>
                <p className="mt-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {displayMonuments}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-2xl font-black text-emerald-500">{displayPrecisionCount}</span>
                <p className="mt-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {displayPrecision}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.color} shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-base font-bold text-slate-950 dark:text-white">
                  {p.title}
                </h4>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
