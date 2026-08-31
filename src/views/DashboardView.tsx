import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  PlusCircle,
  MapPin,
  TrendingUp,
  Eye,
  MessageSquare,
  Star,
  Presentation,
  Share2,
  Calendar,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Clock,
  CreditCard,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Trip } from '../types';

interface DashboardViewProps {
  onNavigate: (view: string, tripId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, subscription, aiUsage } = useAuth();
  const { t, isRtl } = useLanguage();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, analyticsRes] = await Promise.all([
          api.getTrips({ status: 'all' }),
          api.getAnalyticsSummary().catch(() => null),
        ]);
        setTrips(tripsRes.trips);
        setAnalytics(analyticsRes);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const isUnlimitedAi = subscription?.planCode === 'PREMIUM' || aiUsage?.isUnlimited;
  const remainingAi = aiUsage
    ? Math.max(0, (aiUsage.currentPlanAiLimit || aiUsage.lifetimeLimit || 3) - aiUsage.lifetimeUsed)
    : 3;
  const totalLimit = aiUsage?.currentPlanAiLimit || aiUsage?.lifetimeLimit || 3;

  return (
    <div id="dashboard-view-root" className="space-y-8 pb-16">
      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              أهلاً بك، {user?.name.split(' ')[0]} 👋
            </h1>
            {user?.verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                مرشد موثق
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {user?.companyName ? `${user.companyName} • ` : ''}
            إليك نظرة شاملة على برامجك السياحية وتفاعل العملاء.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('builder')}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition-all hover:bg-amber-400 hover:scale-102"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t('ctaCreateTrip')}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('subscriptions')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <CreditCard className="h-4 w-4 text-amber-500" />
            <span>ترقية الباقة</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Trips */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي البرامج</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <FolderOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{trips.length}</span>
            <span className="text-[11px] text-slate-400 font-semibold">
              ({trips.filter(t => t.status === 'published').length} منشور)
            </span>
          </div>
        </div>

        {/* Metric 2: AI Quota */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">رصيد الذكاء الاصطناعي</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {isUnlimitedAi ? 'غير محدود' : `${remainingAi}/${totalLimit}`}
              </span>
              <span className="block text-[10px] text-slate-400">
                {subscription?.planCode === 'FREE' ? 'باقة مجانية مدى الحياة' : `${subscription?.planCode || 'FREE'} PLAN`}
              </span>
            </div>
            {remainingAi === 0 && !isUnlimitedAi && (
              <button
                type="button"
                onClick={() => onNavigate('subscriptions')}
                className="text-[11px] font-bold text-amber-600 underline"
              >
                ترقية
              </button>
            )}
          </div>
        </div>

        {/* Metric 3: Public Link Views */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">مشاهدات الروابط</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {analytics?.metrics?.totalViews || 0}
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
              تفاعل العملاء
            </span>
          </div>
        </div>

        {/* Metric 4: Estimated Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">قيمة البرامج المنشورة</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(analytics?.metrics?.totalRevenue || 0).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-slate-400">EGP</span>
          </div>
        </div>
      </div>

      {/* Recent Trips Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">أحدث الرحلات والبرامج</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('trips')}
            className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline dark:text-amber-400"
          >
            <span>عرض كل الرحلات ({trips.length})</span>
            <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">{t('loading')}</div>
          ) : trips.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950/40">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 dark:text-white">لا توجد رحلات حتى الآن</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                ابدأ بإنشاء أول برنامج سياحي ذكي متعدد الوجهات بدعم الذكاء الاصطناعي.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('builder')}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{t('ctaCreateTrip')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trips.slice(0, 6).map(trip => (
                <div
                  key={trip.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div>
                    {/* Header: Status & Duration */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                          trip.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {trip.status === 'published' ? 'منشور للعملاء' : 'مسودة (Draft)'}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{trip.durationDays} أيام / {trip.nightsCount} ليالٍ</span>
                      </span>
                    </div>

                    <h3 className="mt-3 font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      {trip.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {trip.summary || 'برنامج سياحي مخصص...'}
                    </p>

                    {/* Destinations Tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {trip.destinations.map(d => (
                        <span
                          key={d.id}
                          className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs dark:bg-slate-800 dark:text-slate-300"
                        >
                          📍 {d.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-5 border-t border-slate-200/80 pt-3 dark:border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400">سعر البيع المقترح:</span>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {trip.costs.sellingPrice.toLocaleString()} EGP
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {trip.publicToken && (
                          <button
                            type="button"
                            onClick={() => onNavigate('public_preview', trip.publicToken)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            title="فتح رابط العميل"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onNavigate('presentation', trip.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          title="عرض Slide Presentation"
                        >
                          <Presentation className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('builder', trip.id)}
                          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
                        >
                          تعديل
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
