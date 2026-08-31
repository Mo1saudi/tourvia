import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Users,
  Compass,
  MapPin,
  TrendingUp,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Layers,
  HelpCircle
} from 'lucide-react';
import { HomepageCustomStats } from '../../types';
import { api } from '../../services/api';

interface HomepageSettingsManagerProps {
  onRefreshAll?: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const HomepageSettingsManager: React.FC<HomepageSettingsManagerProps> = ({ onRefreshAll, showToast }) => {
  const [stats, setStats] = useState<HomepageCustomStats>({
    mode: 'custom',
    usersCountOverride: 250,
    usersCountDisplay: '250+',
    usersCountLabelAr: 'مرشد سياحي وشركة معتمدة',
    usersCountLabelEn: 'Licensed Guides & Agencies',
    tripsCountOverride: 1200,
    tripsCountDisplay: '1,200+',
    tripsCountLabelAr: 'برنامج سياحي مصمم بالذكاء الاصطناعي',
    tripsCountLabelEn: 'AI Travel Itineraries Created',
    monumentsCountDisplay: '50+',
    monumentsLabelAr: 'معلم أثري وموقع سياحي مصري',
    monumentsLabelEn: 'Egyptian Monuments & Sites',
    satisfactionRateDisplay: '99.8%',
    satisfactionLabelAr: 'دقة التوقيتات ورضا المسافرين',
    satisfactionLabelEn: 'Timetable Precision & Rating',
    heroTaglineAr: 'المنصة الذكية الرائدة لتصميم البرامج السياحية بالذكاء الاصطناعي للمرشدين والشركات السياحية في مصر',
    heroTaglineEn: 'The Smart Operating System for Egyptian Tour Guides & Agencies',
    updatedAt: new Date().toISOString(),
  });

  const [realCounts, setRealCounts] = useState<{
    totalUsers: number;
    totalTrips: number;
    publishedTrips: number;
    verifiedGuides: number;
  }>({
    totalUsers: 0,
    totalTrips: 0,
    publishedTrips: 0,
    verifiedGuides: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminHomepageStats();
      if (res.stats) {
        setStats(res.stats);
      }
      if (res.realCounts) {
        setRealCounts(res.realCounts);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل جلب إعدادات الصفحة الرئيسية', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateAdminHomepageStats(stats);
      setStats(res.stats);
      if (res.realCounts) setRealCounts(res.realCounts);
      showToast(res.message || 'تم حفظ إعدادات الصفحة الرئيسية بنجاح!');
      if (onRefreshAll) onRefreshAll();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الإعدادات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearMockData = async () => {
    setIsPurging(true);
    try {
      const res = await api.clearAllMockData();
      showToast(res.message || 'تم حذف وتطهير كافة البيانات الافتراضية بنجاح.');
      setShowPurgeConfirm(false);
      fetchStats();
      if (onRefreshAll) onRefreshAll();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف البيانات الافتراضية', 'error');
    } finally {
      setIsPurging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
        <p className="mt-3 text-xs font-bold text-slate-500">جاري تحميل إعدادات الصفحة الرئيسية...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              إعدادات إحصائيات الصفحة الرئيسية (Homepage Dynamic Metrics)
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            تحكم كامل في الأرقام والإحصائيات المعروضة لزوار الصفحة الرئيسية مع خيار الربط التلقائي بقاعدة البيانات أو التخصيص اليدوي.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStats}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPurgeConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-200 text-red-700 hover:bg-red-500/20 px-3.5 py-2 text-xs font-bold transition-colors dark:border-red-900/40 dark:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-600" />
            <span>تطهير البيانات الافتراضية</span>
          </button>
        </div>
      </div>

      {/* Real Counts vs Display Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">المستخدمون المسجلون الحقيقيون:</span>
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{realCounts.totalUsers}</span>
            <span className="text-[10px] text-slate-400">حساب حقيقي</span>
          </div>
          <p className="mt-1 text-[10px] text-purple-600 font-bold">
            المعروض حاليًا: {stats.mode === 'custom' ? stats.usersCountDisplay : `${realCounts.totalUsers}`}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">البرامج والرحلات الحقيقية:</span>
            <Compass className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{realCounts.totalTrips}</span>
            <span className="text-[10px] text-slate-400">برنامج</span>
          </div>
          <p className="mt-1 text-[10px] text-blue-600 font-bold">
            المعروض حاليًا: {stats.mode === 'custom' ? stats.tripsCountDisplay : `${realCounts.totalTrips}`}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">المرشدون الموثقون رسمياً:</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{realCounts.verifiedGuides}</span>
            <span className="text-[10px] text-slate-400">مرشد معتمد</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400 font-medium">
            المنشور للعامة: {realCounts.publishedTrips} برنامج
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">نمط عرض الإحصائيات:</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
              stats.mode === 'custom'
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}>
              {stats.mode === 'custom' ? 'تخصيص يدوي (Custom Override)' : 'تلقائي من السجلات (Auto Live)'}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            يمكنك التبديل بين النمطين أدناه
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          
          {/* Mode Selection */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <label className="block text-sm font-black text-slate-900 dark:text-white mb-2">
              اختر أسلوب احتساب وعرض الإحصائيات بالصفحة الرئيسية:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`relative flex cursor-pointer rounded-2xl border p-4 transition-all ${
                stats.mode === 'custom'
                  ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 ring-2 ring-purple-600/30'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/50'
              }`}>
                <input
                  type="radio"
                  name="statsMode"
                  value="custom"
                  checked={stats.mode === 'custom'}
                  onChange={() => setStats(prev => ({ ...prev, mode: 'custom' }))}
                  className="sr-only"
                />
                <div className="flex flex-col gap-1 text-right">
                  <span className="font-black text-xs text-slate-900 dark:text-white">
                    1. الوضع المخصص الإداري (Custom Display Override) - مستحسن
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    يتيح لك كتابة أرقام ونصوص احترافية مثل (+250 مرشد) و (+1,200 برنامج) لإعطاء ثقة لزوار المنصة الجدد.
                  </span>
                </div>
              </label>

              <label className={`relative flex cursor-pointer rounded-2xl border p-4 transition-all ${
                stats.mode === 'auto'
                  ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 ring-2 ring-purple-600/30'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/50'
              }`}>
                <input
                  type="radio"
                  name="statsMode"
                  value="auto"
                  checked={stats.mode === 'auto'}
                  onChange={() => setStats(prev => ({ ...prev, mode: 'auto' }))}
                  className="sr-only"
                />
                <div className="flex flex-col gap-1 text-right">
                  <span className="font-black text-xs text-slate-900 dark:text-white">
                    2. الوضع التلقائي الحي (Live Database Count)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    يقرأ عدد المستخدمين والبرامج السياحية المنشأة الفعلي والمخزن في قاعدة البيانات بصورة تلقائية.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Metric 1 & 2: Users & Trips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Users Stat Field */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  إحصائية عدد المرشدين والمستخدمين (Guides & Users)
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  النص أو الرقم المعروض (Display Text)
                </label>
                <input
                  type="text"
                  required
                  value={stats.usersCountDisplay}
                  onChange={e => setStats(prev => ({ ...prev, usersCountDisplay: e.target.value }))}
                  placeholder="مثال: 250+ أو 500+"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  العدد الرقمي الصرف (Numeric Override)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stats.usersCountOverride}
                  onChange={e => setStats(prev => ({ ...prev, usersCountOverride: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  الوصف بالعربية
                </label>
                <input
                  type="text"
                  value={stats.usersCountLabelAr}
                  onChange={e => setStats(prev => ({ ...prev, usersCountLabelAr: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  الوصف بالإنجليزية (English Label)
                </label>
                <input
                  type="text"
                  value={stats.usersCountLabelEn}
                  onChange={e => setStats(prev => ({ ...prev, usersCountLabelEn: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-left"
                />
              </div>
            </div>

            {/* Trips Stat Field */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  إحصائية عدد البرامج والرحلات السياحية (Itineraries & Trips)
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  النص أو الرقم المعروض (Display Text)
                </label>
                <input
                  type="text"
                  required
                  value={stats.tripsCountDisplay}
                  onChange={e => setStats(prev => ({ ...prev, tripsCountDisplay: e.target.value }))}
                  placeholder="مثال: 1,200+ أو 3,000+"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  العدد الرقمي الصرف (Numeric Override)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stats.tripsCountOverride}
                  onChange={e => setStats(prev => ({ ...prev, tripsCountOverride: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  الوصف بالعربية
                </label>
                <input
                  type="text"
                  value={stats.tripsCountLabelAr}
                  onChange={e => setStats(prev => ({ ...prev, tripsCountLabelAr: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  الوصف بالإنجليزية (English Label)
                </label>
                <input
                  type="text"
                  value={stats.tripsCountLabelEn}
                  onChange={e => setStats(prev => ({ ...prev, tripsCountLabelEn: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-left"
                />
              </div>
            </div>
          </div>

          {/* Metric 3 & 4: Monuments & Satisfaction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monuments */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  إحصائية المعالم الأثرية والمزارات (Monuments & Sites)
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  النص المعروض
                </label>
                <input
                  type="text"
                  value={stats.monumentsCountDisplay}
                  onChange={e => setStats(prev => ({ ...prev, monumentsCountDisplay: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  الوصف بالعربية
                </label>
                <input
                  type="text"
                  value={stats.monumentsLabelAr}
                  onChange={e => setStats(prev => ({ ...prev, monumentsLabelAr: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Satisfaction */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  إحصائية رضا العملاء ودقة المواعيد (Satisfaction & Precision)
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  النسبة أو النص المعروض
                </label>
                <input
                  type="text"
                  value={stats.satisfactionRateDisplay}
                  onChange={e => setStats(prev => ({ ...prev, satisfactionRateDisplay: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  الوصف بالعربية
                </label>
                <input
                  type="text"
                  value={stats.satisfactionLabelAr}
                  onChange={e => setStats(prev => ({ ...prev, satisfactionLabelAr: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Hero Taglines */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              الوصف الترويجي في واجهة الصفحة الرئيسية (Hero Subtitle / Tagline)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  النص بالعربية
                </label>
                <textarea
                  rows={2}
                  value={stats.heroTaglineAr || ''}
                  onChange={e => setStats(prev => ({ ...prev, heroTaglineAr: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  النص بالإنجليزية (English Tagline)
                </label>
                <textarea
                  rows={2}
                  value={stats.heroTaglineEn || ''}
                  onChange={e => setStats(prev => ({ ...prev, heroTaglineEn: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-left"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              آخر تحديث: {stats.updatedAt ? new Date(stats.updatedAt).toLocaleString('ar-EG') : 'الآن'}
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-3 text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ ونشر التعديلات فوراً'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Live Preview Box of How It Looks on Landing Page */}
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/40 to-white p-6 shadow-sm dark:border-amber-900/40 dark:from-slate-900 dark:to-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              معاينة حية: كيف تظهر هذه الإحصائيات لزوار الصفحة الرئيسية الآن
            </h3>
          </div>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 rounded-full px-3 py-0.5">
            Live Preview
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-2xl font-black text-purple-600">
              {stats.mode === 'custom' ? stats.usersCountDisplay : `${realCounts.totalUsers}`}
            </span>
            <p className="mt-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {stats.usersCountLabelAr}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-2xl font-black text-blue-600">
              {stats.mode === 'custom' ? stats.tripsCountDisplay : `${realCounts.totalTrips}`}
            </span>
            <p className="mt-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {stats.tripsCountLabelAr}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-2xl font-black text-amber-500">
              {stats.monumentsCountDisplay}
            </span>
            <p className="mt-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {stats.monumentsLabelAr}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-2xl font-black text-emerald-500">
              {stats.satisfactionRateDisplay}
            </span>
            <p className="mt-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {stats.satisfactionLabelAr}
            </p>
          </div>
        </div>
      </div>

      {/* Clear Mock Data Confirmation Dialog Modal */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  تطهير وحذف كافة البيانات الافتراضية التجريبية
                </h3>
                <span className="text-xs text-red-600 font-bold">إجراء إداري رسمي</span>
              </div>
            </div>

            <div className="rounded-2xl bg-red-50/80 p-4 border border-red-200 text-xs text-red-900 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300 space-y-2 leading-relaxed">
              <p className="font-bold">سيؤدي هذا الإجراء إلى:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>حذف كافة المستخدمين التجريبيين (مثل المرشدين الوهميين).</li>
                <li>حذف كافة البرامج والرحلات السياحية التجريبية المسجلة مسبقاً.</li>
                <li>تصفير الاستفسارات والتقييمات وطلبات الدفع التجريبية.</li>
                <li>الحفاظ التام على حسابات المديرين الإداريين (<span className="font-mono">mohamedseo2002@gmail.com</span>) واللوائح التنظيمية.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handleClearMockData}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-md transition-colors disabled:opacity-50"
              >
                <Trash2 className={`h-4 w-4 ${isPurging ? 'animate-spin' : ''}`} />
                <span>{isPurging ? 'جاري التطهير...' : 'تأكيد الحذف والتطهير الآن'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
