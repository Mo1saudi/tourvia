import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MessageSquare,
  Star,
  Download,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  User,
  Filter,
  DollarSign,
} from 'lucide-react';
import { api } from '../services/api';
import { CustomerInquiry, TripReview } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

export const AnalyticsView: React.FC = () => {
  const { t } = useLanguage();

  const [analytics, setAnalytics] = useState<any>(null);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [reviews, setReviews] = useState<TripReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterInquiryStatus, setFilterInquiryStatus] = useState<string>('ALL');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, inqRes, revRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getInquiries(),
        api.getReviews(),
      ]);
      setAnalytics(summaryRes);
      setInquiries(inqRes.inquiries);
      setReviews(revRes.reviews);
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      await api.updateInquiryStatus(id, status);
      setInquiries(prev => prev.map(i => (i.id === id ? { ...i, status: status as any } : i)));
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleExportCsv = () => {
    const token = api.getToken();
    const url = `/api/export-csv?token=${token || ''}`;
    window.open(url, '_blank');
  };

  const filteredInquiries = filterInquiryStatus === 'ALL'
    ? inquiries
    : inquiries.filter(i => i.status === filterInquiryStatus);

  return (
    <div id="analytics-view-root" className="space-y-8 pb-16">
      {/* Header & Export CTA */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            التحليلات واستفسارات العملاء
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            متابعة أداء البرامج السياحية، طلبات الحجز، ومشاهدات الروابط العامة.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Download className="h-4 w-4 text-amber-500" />
          <span>تصدير البيانات إلى Excel (CSV)</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي مشاهدات البرامج</span>
            <Eye className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {analytics?.metrics?.totalViews || 0}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">طلبات واستفسارات الحجز</span>
            <MessageSquare className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {inquiries.length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">قيمة المبيعات الإجمالية</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {(analytics?.metrics?.totalRevenue || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">EGP</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط تقييم المسافرين</span>
            <Star className="h-4 w-4 text-amber-400 fill-current" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {analytics?.metrics?.averageRating || 5.0} / 5.0
          </div>
        </div>
      </div>

      {/* Customer Inquiries Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">
              استفسارات وطلبات حجز العملاء ({filteredInquiries.length})
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {['ALL', 'NEW', 'CONTACTED', 'BOOKED', 'ARCHIVED'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterInquiryStatus(st)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  filterInquiryStatus === st
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {st === 'ALL' ? 'الكل' : st === 'NEW' ? 'جديد' : st === 'CONTACTED' ? 'تم التواصل' : st === 'BOOKED' ? 'تم الحجز' : 'مؤرشف'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {filteredInquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              لا توجد استفسارات مسجلة في هذا القسم.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="py-3 px-4">اسم العميل</th>
                  <th className="py-3 px-4">البريد والهاتف</th>
                  <th className="py-3 px-4">البرنامج المطلوب</th>
                  <th className="py-3 px-4">التاريخ والأفراد</th>
                  <th className="py-3 px-4">الرسالة</th>
                  <th className="py-3 px-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInquiries.map(inq => (
                  <tr key={inq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {inq.clientName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <div>{inq.clientPhone}</div>
                      <div className="text-[10px] text-slate-400">{inq.clientEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {inq.tripName || 'برنامج سياحي'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <div>{inq.travelDate || 'غير محدد'}</div>
                      <div className="text-[10px]">{inq.groupSize} أفراد</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {inq.message || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={inq.status}
                        onChange={e => handleUpdateInquiryStatus(inq.id, e.target.value)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="NEW">جديد (New)</option>
                        <option value="CONTACTED">تم التواصل (Contacted)</option>
                        <option value="BOOKED">تم الحجز (Booked)</option>
                        <option value="ARCHIVED">أرشفة (Archived)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
