import React, { useState, useEffect } from 'react';
import {
  Compass,
  PlusCircle,
  Search,
  Filter,
  Share2,
  Presentation,
  Copy,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  History,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Trip, TripVersion } from '../types';

interface TripsListViewProps {
  onNavigate: (view: string, tripId?: string) => void;
}

export const TripsListView: React.FC<TripsListViewProps> = ({ onNavigate }) => {
  const { t, isRtl } = useLanguage();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [includeArchived, setIncludeArchived] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string>('');
  const [selectedVersionsTrip, setSelectedVersionsTrip] = useState<Trip | null>(null);
  const [versionsList, setVersionsList] = useState<TripVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(false);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTrips({
        status: filterStatus,
        includeArchived,
        search: searchQuery,
      });
      setTrips(res.trips);
    } catch (err) {
      console.warn('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [filterStatus, includeArchived]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrips();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyPublicLink = (trip: Trip) => {
    if (!trip.publicToken) return;
    const url = `${window.location.origin}/#/public/${trip.publicToken}`;
    navigator.clipboard.writeText(url);
    showToast('تم نسخ رابط العميل العام بنجاح!');
  };

  const handleDuplicate = async (tripId: string) => {
    try {
      await api.duplicateTrip(tripId);
      showToast('تم تكرار الرحلة كمسودة جديدة.');
      loadTrips();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate trip.');
    }
  };

  const handleToggleArchive = async (tripId: string) => {
    try {
      await api.archiveTrip(tripId);
      showToast('تم تحديث حالة الأرشفة.');
      loadTrips();
    } catch (err: any) {
      alert(err.message || 'Failed to archive trip.');
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرحلة نهائيًا؟')) return;
    try {
      await api.deleteTrip(tripId);
      showToast('تم حذف الرحلة.');
      loadTrips();
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip.');
    }
  };

  const handleOpenVersions = async (trip: Trip) => {
    setSelectedVersionsTrip(trip);
    setIsLoadingVersions(true);
    try {
      const res = await api.getTripVersions(trip.id);
      setVersionsList(res.versions);
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!selectedVersionsTrip) return;
    if (!window.confirm('هل تريد استعادة هذه النسخة السابقة؟ ستصبح هي النسخة الحالية.')) return;
    try {
      await api.restoreTripVersion(selectedVersionsTrip.id, versionId);
      showToast('تم استعادة النسخة بنجاح.');
      setSelectedVersionsTrip(null);
      loadTrips();
    } catch (err: any) {
      alert(err.message || 'Failed to restore version.');
    }
  };

  return (
    <div id="trips-list-view-root" className="space-y-6 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            {t('navTrips')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            إدارة جميع برامجك السياحية، التعديل، المشاركة مع العملاء، وحفظ الإصدارات.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('builder')}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md hover:bg-amber-400 transition-all hover:scale-102"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{t('ctaCreateTrip')}</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الرحلة أو الوجهة أو الأنشطة..."
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-10 pl-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </form>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            {['all', 'draft', 'published'].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  filterStatus === status
                    ? 'bg-white text-slate-950 shadow-2xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                {status === 'all' && 'الكل'}
                {status === 'draft' && 'مسودة'}
                {status === 'published' && 'منشور'}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pl-2">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={e => setIncludeArchived(e.target.checked)}
              className="rounded-sm accent-amber-500"
            />
            <span>المؤرشفة</span>
          </label>
        </div>
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">{t('loading')}</div>
      ) : trips.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <Compass className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 font-bold text-slate-900 dark:text-white">لم يتم العثور على برامج سياحية</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            جرّب تغيير فلاتر البحث أو أنشئ برنامجًا سياحيًا جديدًا.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trips.map(trip => (
            <div
              key={trip.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Status Badge & Version */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        trip.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {trip.status === 'published' ? 'منشور' : 'مسودة'}
                    </span>
                    {trip.isArchived && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        مؤرشف
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    v{trip.version || 1}
                  </span>
                </div>

                {/* Title & Summary */}
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {trip.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {trip.summary || 'برنامج سياحي متكامل ومجدول...'}
                </p>

                {/* Meta details */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{trip.durationDays} أيام / {trip.nightsCount} ليالٍ</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{trip.destinations.length} وجهات</span>
                  </span>
                </div>

                {/* Destinations Chips */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {trip.destinations.map(d => (
                    <span
                      key={d.id}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {d.name}
                    </span>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">سعر البيع:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {trip.costs.sellingPrice.toLocaleString()} EGP
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-slate-500">صافي الربح:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{trip.costs.calculatedProfit.toLocaleString()} EGP ({trip.costs.profitMarginPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-1">
                    {trip.publicToken && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyPublicLink(trip)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="نسخ رابط العميل"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('public_preview', trip.publicToken)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="فتح صفحة العميل"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigate('presentation', trip.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                      title="عرض تقديمي Slide Presentation"
                    >
                      <Presentation className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenVersions(trip)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                      title="سجل الإصدارات (Versions)"
                    >
                      <History className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(trip.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                      title="تكرار الرحلة"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(trip.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                      title={trip.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(trip.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="حذف الرحلة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => onNavigate('builder', trip.id)}
                    className="flex items-center gap-1 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-xs"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>تعديل</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Version History Modal */}
      {selectedVersionsTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  سجل إصدارات: {selectedVersionsTrip.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVersionsTrip(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                إغلاق
              </button>
            </div>

            <div className="mt-4 max-h-80 space-y-2.5 overflow-y-auto">
              {isLoadingVersions ? (
                <div className="py-8 text-center text-xs text-slate-400">{t('loading')}</div>
              ) : versionsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  لا توجد إصدارات سابقة مسجلة لهذه الرحلة حتى الآن.
                </div>
              ) : (
                versionsList.map(ver => (
                  <div
                    key={ver.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                          v{ver.versionNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(ver.savedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {ver.notes || 'تعديل وحفظ تلقائي'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(ver.id)}
                      className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-2xs ring-1 ring-slate-900/10 hover:bg-slate-100 dark:bg-slate-700 dark:text-white"
                    >
                      استعادة هذه النسخة
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
