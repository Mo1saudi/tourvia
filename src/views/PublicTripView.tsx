import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Star, 
  Send, 
  Phone, 
  Mail, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Compass,
  Globe,
  Sun,
  Moon,
  AlertTriangle,
  Scale,
  FileText,
  Info,
  Flag,
  X,
  Languages,
  Building2,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { PublicTripPayload, TripReview, WorkingLanguage } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { TourviaLogo } from '../components/TourviaLogo';
import { DownloadPdfButton } from '../components/DownloadPdfButton';
import { 
  translateInclusion, 
  translateExclusion, 
  translateDestinationName, 
  translateTripText 
} from '../i18n/tripTranslator';

interface PublicTripViewProps {
  token: string;
  onBackToApp?: () => void;
}

export const PublicTripView: React.FC<PublicTripViewProps> = ({ token, onBackToApp }) => {
  const { t, language, setLanguage, availableLanguages, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();

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

  // Complaint / Report Form State
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintType, setComplaintType] = useState<'license_misrepresentation' | 'unauthorized_language' | 'pricing_fraud' | 'content_violation' | 'other'>('license_misrepresentation');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [complaintError, setComplaintError] = useState('');

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

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDesc.trim()) return;
    setComplaintSubmitting(true);
    setComplaintError('');
    try {
      await api.submitPublicComplaint(token, {
        reporterName: reporterName.trim() || undefined,
        reporterEmail: reporterEmail.trim() || undefined,
        reporterPhone: reporterPhone.trim() || undefined,
        complaintType,
        description: complaintDesc.trim(),
      });
      setComplaintSuccess(true);
      setComplaintDesc('');
      setReporterName('');
      setReporterEmail('');
      setReporterPhone('');
    } catch (err: any) {
      setComplaintError(err.message || 'فشل إرسال البلاغ');
    } finally {
      setComplaintSubmitting(false);
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
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{t('tripNotFound') || 'البرنامج غير متوفر'}</h2>
          <p className="mt-2 text-xs text-slate-500">{error || 'عذرًا، لم يتم العثور على هذا البرنامج السياحي.'}</p>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="mt-5 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950"
            >
              TOURVIA
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
                    {t('statusVerified')}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {guide.companyTagline || (isRtl ? 'مرشد ووكيل سياحي مرخص' : 'Licensed Tour Guide & Agent')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF button in Header */}
            <DownloadPdfButton trip={trip} guide={guide} variant="compact" />

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1 border border-slate-200 dark:border-slate-700">
              <Globe className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <select
                aria-label={t('selectLanguage')}
                value={language}
                onChange={(e) => setLanguage(e.target.value as WorkingLanguage)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark/Light toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={t('themeToggle')}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {onBackToApp && (
              <button
                type="button"
                onClick={onBackToApp}
                className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#0B1736] dark:text-slate-200 shadow-xs"
              >
                <TourviaLogo size={18} variant="mark" />
                <span>TOURVIA SaaS</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Egyptian atmospheric backdrop */}
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-amber-500/90 px-2.5 py-0.5 font-bold text-slate-950">
              {trip.durationDays} {t('daysUnit')} / {trip.nightsCount} {t('nightsUnit')}
            </span>
            <span className="rounded-md bg-white/20 px-2.5 py-0.5 font-bold backdrop-blur-xs">
              {trip.destinations.map(d => translateDestinationName(d.name, language)).join(' • ')}
            </span>
          </div>

          <h1 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {translateTripText(trip.name, language)}
          </h1>

          <p className="mt-3 text-sm text-slate-300 max-w-3xl leading-relaxed">
            {translateTripText(trip.summary, language)}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4">
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>{t('departureCityLabel')}: {translateDestinationName(trip.startCity || 'Cairo', language)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-amber-400" />
                <span>{t('seasonLabel')}: {trip.season || (isRtl ? 'طوال العام' : 'All Year')}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <span>{t('totalPriceLabel')}: {trip.sellingPrice?.toLocaleString()} {trip.currency || 'EGP'}</span>
              </div>
            </div>

            <div>
              <DownloadPdfButton trip={trip} guide={guide} variant="hero" />
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
              {t('itineraryDetailedTitle')}
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
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 font-black text-xs text-slate-950 shrink-0">
                          {day.dayNumber}
                        </span>
                        <div>
                          <span className="text-sm font-black">{translateTripText(day.title, language)}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            📍 {translateDestinationName(day.destinationName, language)}
                          </span>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-200/80 p-4 space-y-3 dark:border-slate-700/80">
                        {/* Day Activities */}
                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                          {day.morningActivity && (
                            <p><strong>{t('morningActivity')}:</strong> {day.morningActivity}</p>
                          )}
                          {day.afternoonActivity && (
                            <p><strong>{t('afternoonActivity')}:</strong> {day.afternoonActivity}</p>
                          )}
                          {day.eveningActivity && (
                            <p><strong>{t('eveningActivity')}:</strong> {day.eveningActivity}</p>
                          )}
                        </div>

                        {/* Stations Timeline */}
                        {day.stations && day.stations.length > 0 && (
                          <div className="mt-3 border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
                            <span className="text-[11px] font-bold text-slate-400">{t('stationsTitle')}</span>
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
                                      ({st.durationMinutes} {t('minutesUnit')})
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

          {/* Archaeological & Regulatory Site Notices */}
          {payload.siteNotices && payload.siteNotices.length > 0 && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                <Scale className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <h3 className="font-black text-sm">
                  {isRtl ? 'إرشادات وضوابط المواقع الأثرية الرسمية' : 'Official Archaeological Site & Regulatory Guidelines'}
                </h3>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                {isRtl
                  ? 'يرجى مراعاة القواعد المنظمة لزيارة المواقع الأثرية والمتاحف المصرية لضمان تجربة سياحية سلسة وممتثلة:'
                  : 'Please review official site guidelines and visitor protocols for a compliant, seamless experience:'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {payload.siteNotices.map((sn, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {isRtl ? sn.siteNameAr : sn.siteName}
                      </span>
                      {sn.licensedGuideRequired && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          {isRtl ? 'إرشاد مرخص إلزامي' : 'Licensed Guide Mandatory'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isRtl ? sn.noticeAr : sn.notice}
                    </p>
                    {(sn.ticketingNote || sn.photographyPermitRequired) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sn.ticketingNote && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {sn.ticketingNote}
                          </span>
                        )}
                        {sn.photographyPermitRequired && (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            {isRtl ? 'تصريح تصوير تجاري مطلوب' : 'Commercial Photo Permit Required'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-950 dark:bg-emerald-950/20">
              <h3 className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                {t('publicInclusions')}
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-emerald-800 dark:text-emerald-300/90">
                {trip.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{translateInclusion(inc, language)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-950 dark:bg-red-950/20">
              <h3 className="font-bold text-xs text-red-900 dark:text-red-300">
                {t('publicExclusions')}
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-red-800 dark:text-red-300/90">
                {trip.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{translateExclusion(exc, language)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reviews List */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {t('reviewsTitle')} ({reviews.length})
              </h3>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-black text-xs">5.0</span>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.length === 0 ? (
                <p className="py-4 text-xs text-slate-400">{t('beFirstToReview')}</p>
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
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('addYourReview')}</span>
              {reviewSuccess && (
                <div className="rounded-lg bg-emerald-50 p-2 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {t('publicRateSuccess')}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder={t('fullName')}
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="text"
                  placeholder={t('countryNationality')}
                  value={reviewCountry}
                  onChange={e => setReviewCountry(e.target.value)}
                  className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <textarea
                rows={2}
                required
                placeholder={t('reviewPlaceholder')}
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 transition-colors"
              >
                {t('submitReviewBtn')}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Guide Card & Booking Inquiry Form */}
        <div className="space-y-6">
          {/* Guide Contact Card with Compliance & Scope Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 font-black text-slate-950 text-base shrink-0">
                {guide.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {guide.name}
                  </h3>
                  {guide.verificationStatus === 'VERIFIED' ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" title="تم التحقق من بيانات الترخيص لدى منصة TOURVIA">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{isRtl ? 'مرشد موثق' : 'Verified Guide'}</span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {isRtl ? 'قيد المراجعة' : 'Under Review'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {guide.companyName || (isRtl ? 'مرشد سياحي مستقل' : 'Independent Tour Guide')}
                </p>
              </div>
            </div>

            {/* Commercial Scope Notice */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                <span>{isRtl ? 'طبيعة النشاط المهني:' : 'Professional Entity Scope:'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {guide.accountType === 'company'
                  ? (isRtl ? 'شركة / وكالة سياحية مسجلة تقدم خدمات تنظيم الرحلات.' : 'Registered Tourism Agency.')
                  : (isRtl ? 'مرشد سياحي حر يقدم خدمات الإرشاد والشرح الميداني.' : 'Independent licensed tourist guide offering on-site guiding.')}
              </p>
            </div>

            {/* Official Authorized Guiding Languages */}
            {guide.authorizedLanguages && guide.authorizedLanguages.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Languages className="h-3.5 w-3.5 text-amber-500" />
                  <span>{isRtl ? 'لغات الإرشاد المعتمدة بالترخيص:' : 'Authorized Guiding Languages:'}</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {guide.authorizedLanguages.map((l, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact details */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                <span dir="ltr">{guide.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{guide.email}</span>
              </div>
            </div>
          </div>

          {/* Quick PDF Brochure Download Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {t('downloadPdfItinerary')}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {isRtl ? 'نسخة رسمية للطباعة والمشاركة بدون اتصال' : 'Official printable version for offline review'}
                </p>
              </div>
            </div>
            <DownloadPdfButton trip={trip} guide={guide} variant="secondary" className="w-full" />
          </div>

          {/* Booking Inquiry Form */}
          <div className="rounded-3xl border border-amber-300 bg-white p-6 shadow-xl dark:border-amber-900/60 dark:bg-slate-900">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {t('bookInquiryTitle')}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('bookInquiryDesc')}
            </p>

            {inquirySuccess ? (
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/40">
                <CheckCircle className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <h4 className="mt-2 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                  {t('inquiryReceivedTitle')}
                </h4>
                <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                  {t('inquiryReceivedDesc')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t('email')} *
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
                    {t('phone')} / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="+1 555 0199"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {t('travelDateLabel')}
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
                      {t('groupSizeLabel')}
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
                    {t('specialRequestsLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={clientMessage}
                    onChange={e => setClientMessage(e.target.value)}
                    placeholder="..."
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingInquiry}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSendingInquiry ? t('sendingInquiry') : t('sendInquiryBtn')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Global Regulatory & Legal Disclaimer Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-slate-100/70 p-6 dark:border-slate-800 dark:bg-slate-900/70 rounded-3xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-right flex-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Scale className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{isRtl ? 'إشعار الامتثال التنظيمي والشفافية القانونية' : 'Regulatory Transparency & Legal Notice'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
              {payload.regulatoryDisclaimer || (isRtl 
                ? 'تعمل منصة TOURVIA كأداة تقنية وبرمجية ذكية لتنظيم وتصميم عروض البرامج السياحية. منصة TOURVIA ليست جهة حكومية ولا تصدر تراخيص رسمية. تقع مسؤولية الامتثال للقوانين واللوائح السياحية السارية على عاتق المرشد السياحي أو الجهة المنظمة.'
                : 'TOURVIA operates as a specialized software tool for itinerary creation and presentation. TOURVIA is not a government agency and does not issue official licenses. Compliance with Egyptian tourism laws remains the sole responsibility of the tour guide/operator.')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setComplaintModalOpen(true);
              setComplaintSuccess(false);
              setComplaintError('');
            }}
            className="flex items-center gap-1.5 shrink-0 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-950 dark:bg-slate-900 dark:text-red-400 transition-colors shadow-2xs"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>{isRtl ? 'إبلاغ عن مخالفة أو محتوى غير موثق' : 'Report Misrepresentation / Issue'}</span>
          </button>
        </div>
      </footer>

      {/* Complaint / Report Modal */}
      {complaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <Flag className="h-5 w-5" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isRtl ? 'إرسال بلاغ لمركز الامتثال والرقابة' : 'Submit Report to Compliance Center'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setComplaintModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {complaintSuccess ? (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/40 space-y-2">
                <CheckCircle className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-200">
                  {isRtl ? 'تم استلام البلاغ وإحالته للتحقيق بنجاح' : 'Report Logged Successfully'}
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  {isRtl 
                    ? 'يقوم فريق الامتثال والجودة بمراجعة البيانات والتحقق من التراخيص وسنتخذ الإجراءات اللازمة.'
                    : 'Our compliance team is auditing this report and will take appropriate regulatory actions.'}
                </p>
                <button
                  type="button"
                  onClick={() => setComplaintModalOpen(false)}
                  className="mt-3 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  {isRtl ? 'إغلاق' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitComplaint} className="space-y-3.5 text-xs">
                {complaintError && (
                  <div className="rounded-xl bg-red-50 p-3 text-red-700 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{complaintError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'نوع البلاغ / المخالفة *' : 'Report Category *'}
                  </label>
                  <select
                    value={complaintType}
                    onChange={e => setComplaintType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="license_misrepresentation">{isRtl ? 'ادعاء ترخيص غير صحيح / انتحال صفة مرشد' : 'License Misrepresentation / Fake License'}</option>
                    <option value="unauthorized_language">{isRtl ? 'ممارسة الإرشاد بلغة غير مرخصة' : 'Guiding in Unauthorized Language'}</option>
                    <option value="pricing_fraud">{isRtl ? 'تضليل في الأسعار أو الرسوم الأثرية' : 'Pricing Misleading / Hidden Fees'}</option>
                    <option value="content_violation">{isRtl ? 'معلومات أثرية أو تاريخية غير دقيقة أو مسيئة' : 'Inaccurate / Inappropriate Cultural Content'}</option>
                    <option value="other">{isRtl ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'تفاصيل البلاغ والأدلة *' : 'Description & Evidence Details *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={complaintDesc}
                    onChange={e => setComplaintDesc(e.target.value)}
                    placeholder={isRtl ? 'يرجى توضيح سبب البلاغ بالتفصيل...' : 'Please describe the violation in detail...'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      {isRtl ? 'اسمك (اختياري)' : 'Your Name (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={e => setReporterName(e.target.value)}
                      placeholder="Name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      {isRtl ? 'البريد للتواصل (اختياري)' : 'Email (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={reporterEmail}
                      onChange={e => setReporterEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      {isRtl ? 'الهاتف (اختياري)' : 'Phone (Optional)'}
                    </label>
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={e => setReporterPhone(e.target.value)}
                      placeholder="+201..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setComplaintModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={complaintSubmitting}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50 shadow-xs"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>{complaintSubmitting ? (isRtl ? 'جاري الإرسال...' : 'Submitting...') : (isRtl ? 'تأكيد إرسال البلاغ' : 'Submit Report')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
