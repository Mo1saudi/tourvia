import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  Car,
  ShieldCheck,
  Star,
  Share2,
  Calendar,
  Send,
  CheckCircle,
  Phone,
  Mail,
  User,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';
import { PublicTripPayload, TripReview } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface PublicTripViewProps {
  token: string;
  onBackToApp?: () => void;
}

export const PublicTripView: React.FC<PublicTripViewProps> = ({ token, onBackToApp }) => {
  const { t, isRtl } = useLanguage();

  const [payload, setPayload] = useState<PublicTripPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Inquiry Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [groupSize, setGroupSize] = useState(2);
  const [clientMessage, setClientMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewCountry, setReviewCountry] = useState('Egypt');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Day collapse toggles
  const [openDay, setOpenDay] = useState<number | null>(1);

  useEffect(() => {
    setIsLoading(true);
    setError('');
    api.getPublicTrip(token)
      .then(res => setPayload(res))
      .catch(err => setError(err.message || 'Trip not found or link expired.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) return;
    setIsSendingInquiry(true);
    try {
      await api.sendPublicInquiry(token, {
        clientName,
        clientEmail,
        clientPhone,
        travelDate,
        groupSize,
        message: clientMessage,
      });
      setInquirySuccess(true);
      setClientMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit inquiry.');
    } finally {
      setIsSendingInquiry(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    try {
      const res = await api.submitPublicReview(token, {
        clientName: reviewName,
        clientCountry: reviewCountry,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (payload) {
        setPayload({
          ...payload,
          reviews: [res.review, ...payload.reviews],
        });
      }
      setReviewSuccess(true);
      setReviewComment('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Compass className="mx-auto h-10 w-10 text-amber-500 animate-spin" />
          <p className="mt-3 text-xs text-slate-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl dark:bg-slate-900">
          <Compass className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">البرنامج غير متوفر</h2>
          <p className="mt-2 text-xs text-slate-500">{error || 'عذرًا، لم يتم العثور على هذا البرنامج السياحي.'}</p>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="mt-5 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950"
            >
              العودة إلى TOURVIA
            </button>
          )}
        </div>
      </div>
    );
  }

  const { trip, guide, reviews } = payload;

  return (
    <div id="public-trip-view-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Guide Brand Banner */}
      <header className="border-b border-slate-200 bg-white/95 px-4 py-3 sticky top-0 z-30 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950 text-sm">
              {guide.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {guide.companyName || guide.name}
                </span>
                {guide.isVerified && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    مرشد معتمد
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {guide.companyTagline || 'مرشد ووكيل سياحي مرخص'}
              </span>
            </div>
          </div>

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              TOURVIA SaaS
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-amber-500/90 px-2.5 py-0.5 font-bold text-slate-950">
              {trip.durationDays} أيام / {trip.nightsCount} ليالٍ
            </span>
            <span className="rounded-md bg-white/20 px-2.5 py-0.5 font-bold backdrop-blur-xs">
              {trip.destinations.map(d => d.name).join(' • ')}
            </span>
          </div>

          <h1 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {trip.name}
          </h1>

          <p className="mt-3 text-sm text-slate-300 max-w-3xl leading-relaxed">
            {trip.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>نقطة الانطلاق: {trip.startCity || 'القاهرة'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>الموسم المناسب: {trip.season || 'طوال العام'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <span>السعر الإجمالي للبرنامج: {trip.sellingPrice?.toLocaleString()} {trip.currency || 'EGP'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Itinerary Timeline & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day by Day Itinerary */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              برنامج الرحلة اليومي بالتفصيل
            </h2>

            <div className="mt-5 space-y-4">
              {trip.days.map((day, idx) => {
                const isOpen = openDay === day.dayNumber;
                return (
                  <div
                    key={day.id || idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenDay(isOpen ? null : day.dayNumber)}
                      className="flex w-full items-center justify-between p-4 text-left font-bold text-xs text-slate-900 dark:text-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 font-black text-xs text-slate-950">
                          {day.dayNumber}
                        </span>
                        <div>
                          <span className="text-sm font-black">{day.title}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            📍 {day.destinationName}
                          </span>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-200/80 p-4 space-y-3 dark:border-slate-700/80">
                        {/* Day Activities */}
                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                          {day.morningActivity && (
                            <p><strong>الفترة الصباحية:</strong> {day.morningActivity}</p>
                          )}
                          {day.afternoonActivity && (
                            <p><strong>الفترة المسائية:</strong> {day.afternoonActivity}</p>
                          )}
                          {day.eveningActivity && (
                            <p><strong>السهرة والليل:</strong> {day.eveningActivity}</p>
                          )}
                        </div>

                        {/* Stations Timeline */}
                        {day.stations && day.stations.length > 0 && (
                          <div className="mt-3 border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
                            <span className="text-[11px] font-bold text-slate-400">محطات وجدول اليوم:</span>
                            <div className="mt-2 space-y-2">
                              {day.stations.map(st => (
                                <div
                                  key={st.id}
                                  className="flex items-center gap-2 rounded-xl bg-white p-2 text-xs shadow-2xs dark:bg-slate-900"
                                >
                                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                    {st.time || '09:00'}
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {st.name}
                                  </span>
                                  {st.durationMinutes && (
                                    <span className="text-[10px] text-slate-400">
                                      ({st.durationMinutes} دقيقة)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-950 dark:bg-emerald-950/20">
              <h3 className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                البرنامج يشمل:
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-emerald-800 dark:text-emerald-300/90">
                {trip.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-950 dark:bg-red-950/20">
              <h3 className="font-bold text-xs text-red-900 dark:text-red-300">
                البرنامج لا يشمل:
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-red-800 dark:text-red-300/90">
                {trip.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reviews List */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                تقييمات وآراء المسافرين ({reviews.length})
              </h3>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-black text-xs">5.0</span>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.length === 0 ? (
                <p className="py-4 text-xs text-slate-400">كن أول من يقيّم هذا البرنامج السياحي!</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {r.clientName} ({r.clientCountry})
                      </span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{r.comment}</p>
                    <span className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>

            {/* Submit Review */}
            <form onSubmit={handleSubmitReview} className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">أضف تقييمك:</span>
              {reviewSuccess && (
                <div className="rounded-lg bg-emerald-50 p-2 text-[11px] text-emerald-700">
                  شكرًا لك! تم إضافة تقييمك بنجاح.
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="اسمك الكامل"
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="البلد / الجنسية"
                  value={reviewCountry}
                  onChange={e => setReviewCountry(e.target.value)}
                  className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <textarea
                rows={2}
                required
                placeholder="شاركنا رأيك في البرنامج ومستوى الخدمة..."
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
              >
                إرسال التقييم
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Guide Card & Booking Inquiry Form */}
        <div className="space-y-6">
          {/* Guide Contact Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 font-black text-slate-950 text-base">
                {guide.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {guide.name}
                </h3>
                <p className="text-xs text-slate-500">{guide.companyName || 'مرشد سياحي معتمد'}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{guide.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{guide.email}</span>
              </div>
            </div>
          </div>

          {/* Booking Inquiry Form */}
          <div className="rounded-3xl border border-amber-300 bg-white p-6 shadow-xl dark:border-amber-900 dark:bg-slate-900">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              احجز أو استفسر عن هذا البرنامج
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              أرسل بياناتك وسيتواصل معك المرشد لتأكيد المواعيد وتفاصيل السفر.
            </p>

            {inquirySuccess ? (
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/40">
                <CheckCircle className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <h4 className="mt-2 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                  تم استلام طلبك بنجاح!
                </h4>
                <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                  سيقوم المرشد بالتواصل معك قريبًا عبر الهاتف أو البريد الإلكتروني.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="محمد عبدالله"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    رقم الهاتف / واتساب *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      تاريخ السفر المتوقع
                    </label>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={e => setTravelDate(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-2 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      عدد الأفراد
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={groupSize}
                      onChange={e => setGroupSize(Number(e.target.value))}
                      className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-2 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    ملاحظات أو رغبات خاصة
                  </label>
                  <textarea
                    rows={2}
                    value={clientMessage}
                    onChange={e => setClientMessage(e.target.value)}
                    placeholder="أي استفسار إضافي..."
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingInquiry}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSendingInquiry ? 'جارٍ الإرسال...' : 'إرسال طلب الحجز والاستفسار'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
