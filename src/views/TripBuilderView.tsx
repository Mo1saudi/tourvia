import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  MapPin,
  Clock,
  Car,
  DollarSign,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Share2,
  Presentation,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  AlertTriangle,
  FileCheck,
  Save,
  HelpCircle,
  ArrowUpDown,
  Plane,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Trip, TripDestination, TripDay, Station, TransportationLeg, TripCosts, WorkingLanguage } from '../types';
import { DownloadPdfButton } from '../components/DownloadPdfButton';

interface TripBuilderViewProps {
  tripId?: string | null;
  onNavigate?: (view: string, tripId?: string) => void;
  onFinish?: () => void;
  onCancel?: () => void;
}

export const TripBuilderView: React.FC<TripBuilderViewProps> = ({ tripId, onNavigate, onFinish, onCancel }) => {
  const { user, aiUsage, updateAiUsageLocal } = useAuth();
  const { t, isRtl, availableLanguages } = useLanguage();

  const handleNav = (view: string, targetId?: string) => {
    if (onNavigate) {
      onNavigate(view, targetId);
    } else if (onFinish) {
      onFinish();
    }
  };

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiRegeneratingDayIndex, setAiRegeneratingDayIndex] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [publishedData, setPublishedData] = useState<{ publicToken: string; publicLinkUrl: string } | null>(null);

  // Form State
  const [tripState, setTripState] = useState<Trip>({
    id: '',
    guideId: user?.id || '',
    name: 'برنامج سياحي مصري كلاسيكي',
    summary: 'جولة شاملة تغطي أهم المعالم التاريخية والثقافية مع تنظيم كامل للمحطات والتنقل.',
    durationDays: 5,
    nightsCount: 4,
    startCity: 'القاهرة',
    endCity: 'القاهرة',
    budgetLevel: 'moderate',
    season: 'all-year',
    travelerTypes: ['families', 'couples'],
    targetLanguages: ['ar', 'en'],
    status: 'draft',
    isArchived: false,
    version: 1,
    destinations: [
      { id: 'dest_1', name: 'القاهرة والجيزة', nightsCount: 2, order: 1, highlightAttractions: ['أهرامات الجيزة', 'المتحف المصري الكبير', 'خان الخليلي'] },
      { id: 'dest_2', name: 'الأقصر', nightsCount: 2, order: 2, highlightAttractions: ['معبد الكرنك', 'وادي الملوك', 'معبد حتشبسوت'] },
    ],
    days: [],
    transportation: [
      { id: 'trans_1', fromDestination: 'القاهرة والجيزة', toDestination: 'الأقصر', type: 'FLIGHT', estimatedDurationMinutes: 65, distanceKm: 650, notes: 'رحلة طيران داخلية من مطار القاهرة إلى مطار الأقصر' },
      { id: 'trans_2', fromDestination: 'الأقصر', toDestination: 'القاهرة', type: 'TRAIN', estimatedDurationMinutes: 540, distanceKm: 650, notes: 'قطار النوم الفاخر أو طيران العودة' },
    ],
    costs: {
      accommodationCost: 12000,
      transportationCost: 8000,
      activitiesTicketsCost: 4500,
      guideFees: 6000,
      mealsCost: 3500,
      miscCost: 1000,
      totalCost: 35000,
      sellingPrice: 48000,
      calculatedProfit: 13000,
      profitMarginPercent: 27,
      currency: 'EGP',
      travelerGroupSize: 4,
    },
    inclusions: [
      'الإقامة الفندقية 4 أو 5 نجوم مع الإفطار',
      'جميع الانتقالات بسيارات سياحية مكيفة ومعقمة',
      'مرشد سياحي معتمد ومرافق طوال الرحلة',
      'تذاكر دخول المعالم المذكورة في البرنامج',
    ],
    exclusions: [
      'تذاكر الطيران الدولي',
      'المصاريف الشخصية والإكراميات',
      'الأنشطة الاختيارية (مثل منطاد الأقصر الطائر)',
    ],
    notes: 'البرنامج قابل للتخصيص حسب تفضيلات المجموعة ومواعيد الطيران.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Load existing trip if editing
  useEffect(() => {
    if (tripId) {
      setIsLoading(true);
      api.getTrip(tripId)
        .then(res => {
          setTripState(res.trip);
          if (res.trip.publicToken) {
            setPublishedData({
              publicToken: res.trip.publicToken,
              publicLinkUrl: `${window.location.origin}/#/public/${res.trip.publicToken}`,
            });
          }
        })
        .catch(err => {
          console.warn('Failed to load trip for editing:', err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [tripId]);

  // Recalculate financial costs & profit automatically
  const updateCosts = (costUpdates: Partial<TripCosts>) => {
    setTripState(prev => {
      const merged = { ...prev.costs, ...costUpdates };
      const total =
        (merged.accommodationCost || 0) +
        (merged.transportationCost || 0) +
        (merged.activitiesTicketsCost || 0) +
        (merged.guideFees || 0) +
        (merged.mealsCost || 0) +
        (merged.miscCost || 0);

      const selling = merged.sellingPrice || 0;
      const profit = Math.max(0, selling - total);
      const margin = selling > 0 ? Number(((profit / selling) * 100).toFixed(1)) : 0;

      return {
        ...prev,
        costs: {
          ...merged,
          totalCost: total,
          calculatedProfit: profit,
          profitMarginPercent: margin,
        },
      };
    });
  };

  // AI Readiness Check
  const isAiReady =
    tripState.name.trim().length > 3 &&
    tripState.durationDays > 0 &&
    tripState.destinations.length >= 1;

  // AI Generate Entire Trip
  const handleAiGenerate = async () => {
    setIsAiGenerating(true);
    setSaveMessage('');
    try {
      const res = await api.generateAiTrip({
        name: tripState.name,
        durationDays: tripState.durationDays,
        nightsCount: tripState.nightsCount,
        destinations: tripState.destinations,
        targetLanguages: tripState.targetLanguages,
        budgetLevel: tripState.budgetLevel,
        travelerTypes: tripState.travelerTypes,
        userCustomInstructions: tripState.notes,
      });

      if (res.success) {
        setTripState(prev => ({
          ...prev,
          summary: res.tripSummary || prev.summary,
          days: res.days || prev.days,
          transportation: (res.transportation && res.transportation.length > 0) ? res.transportation : prev.transportation,
        }));

        if (aiUsage && res.quotaRemaining !== undefined) {
          updateAiUsageLocal({
            lifetimeUsed: (aiUsage.lifetimeUsed || 0) + 1,
          });
        }

        setSaveMessage('تم توليد وتنسيق مسار الرحلة بالذكاء الاصطناعي بنجاح!');
        setTimeout(() => setCurrentStep(4), 1200); // Advance to Itinerary step
      }
    } catch (err: any) {
      alert(err.message || 'AI Generation failed. Please verify your quota and inputs.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // AI Regenerate Single Day
  const handleRegenerateSingleDay = async (dayIndex: number) => {
    setAiRegeneratingDayIndex(dayIndex);
    try {
      const targetDay = tripState.days[dayIndex];
      const res = await api.regenerateAiDay({
        tripName: tripState.name,
        dayNumber: targetDay.dayNumber,
        destinationName: targetDay.destinationName,
        targetLanguages: tripState.targetLanguages,
        customFeedback: 'قم بتنويع الأنشطة وإضافة محطات مميزة مع مواعيد دقيقة',
      });

      if (res.success && res.day) {
        const updatedDays = [...tripState.days];
        updatedDays[dayIndex] = res.day;
        setTripState(prev => ({ ...prev, days: updatedDays }));
        setSaveMessage(`تمت إعادة صياغة اليوم ${targetDay.dayNumber} بالذكاء الاصطناعي بنجاح.`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate day.');
    } finally {
      setAiRegeneratingDayIndex(null);
    }
  };

  // Save Trip to Backend
  const handleSaveTrip = async (publish = false) => {
    setIsLoading(true);
    setSaveMessage('');
    try {
      let saved: Trip;
      if (tripState.id) {
        const res = await api.updateTrip(tripState.id, tripState);
        saved = res.trip;
      } else {
        const res = await api.createTrip(tripState);
        saved = res.trip;
        setTripState(prev => ({ ...prev, id: saved.id }));
      }

      if (publish && saved.id) {
        const pubRes = await api.publishTrip(saved.id);
        saved = pubRes.trip;
        setPublishedData({
          publicToken: pubRes.publicToken,
          publicLinkUrl: pubRes.publicLinkUrl,
        });
        setSaveMessage('تم نشر الرحلة رسميًا وتوليد رابط العميل بنجاح!');
      } else {
        setSaveMessage('تم حفظ المسودة بنجاح.');
      }
      setTripState(saved);
    } catch (err: any) {
      alert(err.message || 'Failed to save trip.');
    } finally {
      setIsLoading(false);
    }
  };

  // Destination Management
  const addDestination = () => {
    if (tripState.destinations.length >= 6) return;
    const newDest: TripDestination = {
      id: `dest_${Date.now()}`,
      name: 'وجهة جديدة (مثل أسوان)',
      nightsCount: 1,
      order: tripState.destinations.length + 1,
      highlightAttractions: [],
    };
    setTripState(prev => ({
      ...prev,
      destinations: [...prev.destinations, newDest],
    }));
  };

  const removeDestination = (id: string) => {
    if (tripState.destinations.length <= 1) return;
    setTripState(prev => ({
      ...prev,
      destinations: prev.destinations.filter(d => d.id !== id),
    }));
  };

  // Steps Navigation Meta
  const steps = [
    { num: 1, title: 'البيانات الأساسية' },
    { num: 2, title: 'الوجهات والمحطات' },
    { num: 3, title: 'التوليد الذكي (AI)' },
    { num: 4, title: 'الجدول اليومي' },
    { num: 5, title: 'وسائل التنقل' },
    { num: 6, title: 'التكاليف والأرباح' },
    { num: 7, title: 'المراجعة والنشر' },
  ];

  return (
    <div id="trip-builder-root" className="space-y-6 pb-20">
      {/* Toast Save Message */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {tripState.status === 'published' ? 'منشور' : 'مسودة'}
            </span>
            <h1 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-md">
              {tripState.name || 'رحلة جديدة'}
            </h1>
          </div>
          <p className="text-[11px] text-slate-400">
            {tripState.durationDays} أيام • {tripState.destinations.length} وجهات • الإصدار v{tripState.version || 1}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download PDF */}
          <DownloadPdfButton
            trip={tripState}
            guide={user}
            variant="compact"
            onSuccess={() => setSaveMessage('تم تحميل ملف PDF بنجاح!')}
          />
          <button
            type="button"
            onClick={() => handleSaveTrip(false)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Save className="h-4 w-4 text-slate-500" />
            <span>حفظ كمسودة</span>
          </button>
          <button
            type="button"
            onClick={() => handleSaveTrip(true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-md hover:bg-amber-400"
          >
            <Share2 className="h-4 w-4" />
            <span>نشر البرنامج للعملاء</span>
          </button>
        </div>
      </div>

      {/* Step Indicator Wizard Bar */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-w-max items-center justify-between gap-1">
          {steps.map(step => (
            <button
              key={step.num}
              type="button"
              onClick={() => setCurrentStep(step.num)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                currentStep === step.num
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : currentStep > step.num
                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                  currentStep === step.num
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {step.num}
              </span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: BASIC INFO */}
      {currentStep === 1 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            1. البيانات الأساسية للبرنامج السياحي
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              عنوان الرحلة أو اسم البرنامج *
            </label>
            <input
              type="text"
              required
              value={tripState.name}
              onChange={e => setTripState({ ...tripState, name: e.target.value })}
              placeholder="مثال: أسرار الفراعنة والنيل الساحر"
              className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              نبذة تعريفية أو ملخص البرنامج للعميل
            </label>
            <textarea
              rows={3}
              value={tripState.summary}
              onChange={e => setTripState({ ...tripState, summary: e.target.value })}
              placeholder="وصف جذاب لأبرز المعالم والتجارب التي سيعيشها السائح..."
              className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                عدد الأيام *
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={tripState.durationDays}
                onChange={e => {
                  const days = Math.max(1, Number(e.target.value));
                  setTripState({ ...tripState, durationDays: days, nightsCount: Math.max(0, days - 1) });
                }}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                عدد الليالي
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={tripState.nightsCount}
                onChange={e => setTripState({ ...tripState, nightsCount: Number(e.target.value) })}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                مدينة البداية / الوصول
              </label>
              <input
                type="text"
                value={tripState.startCity}
                onChange={e => setTripState({ ...tripState, startCity: e.target.value })}
                placeholder="القاهرة (مطار القاهرة الدولي)"
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                مدينة المغادرة / النهاية
              </label>
              <input
                type="text"
                value={tripState.endCity}
                onChange={e => setTripState({ ...tripState, endCity: e.target.value })}
                placeholder="القاهرة أو الغردقة"
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                مستوى الميزانية والتصنيف
              </label>
              <select
                value={tripState.budgetLevel}
                onChange={e => setTripState({ ...tripState, budgetLevel: e.target.value as any })}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="economy">اقتصادي (Budget / Economy)</option>
                <option value="moderate">متوسط / كلاسيكي (Moderate / Classic)</option>
                <option value="luxury">فاخر (VIP / Luxury 5 Stars)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                الموسم المناسب للرحلة
              </label>
              <select
                value={tripState.season}
                onChange={e => setTripState({ ...tripState, season: e.target.value as any })}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="winter">الشتوي (أكتوبر - أبريل)</option>
                <option value="summer">الصيفي والساحلي (مايو - سبتمبر)</option>
                <option value="all-year">مناسب طوال العام</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400"
            >
              <span>التالي: الوجهات والمحطات</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DESTINATIONS & STATIONS */}
      {currentStep === 2 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                2. الوجهات السياحية وتوزيع الليالي
              </h2>
              <p className="text-xs text-slate-500">
                حدد المدن والمناطق التي يمر بها البرنامج (من 1 إلى 5 وجهات).
              </p>
            </div>

            <button
              type="button"
              onClick={addDestination}
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة وجهة</span>
            </button>
          </div>

          <div className="space-y-3">
            {tripState.destinations.map((dest, idx) => (
              <div
                key={dest.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 font-black text-xs text-slate-950">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={dest.name}
                      onChange={e => {
                        const updated = [...tripState.destinations];
                        updated[idx].name = e.target.value;
                        setTripState({ ...tripState, destinations: updated });
                      }}
                      placeholder="اسم الوجهة (مثال: الأقصر)"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">الليالي:</span>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={dest.nightsCount}
                        onChange={e => {
                          const updated = [...tripState.destinations];
                          updated[idx].nightsCount = Number(e.target.value);
                          setTripState({ ...tripState, destinations: updated });
                        }}
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeDestination(dest.id)}
                      disabled={tripState.destinations.length <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Highlights tags */}
                <div className="mt-3">
                  <label className="block text-[11px] font-bold text-slate-500">
                    أبرز المعالم والأنشطة المقترحة في هذه الوجهة (مفصولة بفواصل):
                  </label>
                  <input
                    type="text"
                    value={dest.highlightAttractions?.join('، ') || ''}
                    onChange={e => {
                      const updated = [...tripState.destinations];
                      updated[idx].highlightAttractions = e.target.value.split(/[,،]/).map(s => s.trim()).filter(Boolean);
                      setTripState({ ...tripState, destinations: updated });
                    }}
                    placeholder="معبد الكرنك، وادي الملوك، جزيرة الموز..."
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400"
            >
              <span>التالي: التوليد بالذكاء الاصطناعي</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI SYNTHESIS ENGINE */}
      {currentStep === 3 && (
        <div className="rounded-3xl border border-amber-300/80 bg-gradient-to-b from-amber-50/50 to-white p-6 shadow-xl dark:border-amber-900/50 dark:from-slate-900 dark:to-slate-900 space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
              محرك الصياغة السياحية بالذكاء الاصطناعي
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              سيقوم الذكاء الاصطناعي بتنظيم جدول زمني احترافي لكل يوم، مع تحديد المحطات الصباحية والمسائية، أوقات الزيارة، وسيلة التنقل، والمسافات المقدرة.
            </p>
          </div>

          {/* AI Readiness Card */}
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/80">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              جاهزية البيانات للتوليد:
            </span>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>اسم ومدة الرحلة ({tripState.durationDays} أيام):</span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <span>الوجهات المحددة ({tripState.destinations.length} وجهات):</span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <span>رصيد التوليد المتبقي:</span>
                <span className="font-bold text-amber-600">
                  {aiUsage?.isUnlimited ? 'غير محدود' : `${Math.max(0, (aiUsage?.lifetimeLimit || 3) - (aiUsage?.lifetimeUsed || 0))} متبقي`}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions Input */}
          <div className="mx-auto max-w-xl">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              توجيهات مخصصة للذكاء الاصطناعي (اختياري):
            </label>
            <input
              type="text"
              value={tripState.notes || ''}
              onChange={e => setTripState({ ...tripState, notes: e.target.value })}
              placeholder="مثال: ركّز على المطاعم التراثية، واجعل اليوم الأخير مخصصًا للتسوق والراحة..."
              className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Trigger Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isAiGenerating || !isAiReady}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-8 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 disabled:opacity-50 transition-all hover:scale-102"
            >
              <Sparkles className={`h-5 w-5 ${isAiGenerating ? 'animate-spin' : ''}`} />
              <span>{isAiGenerating ? 'جارٍ صياغة البرنامج السياحي...' : 'توليد الجدول اليومي والمحطات الآن'}</span>
            </button>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <span>تخطي أو المتابعة للجدول اليومي</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DETAILED DAILY ITINERARY */}
      {currentStep === 4 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                4. الجدول اليومي ومحطات الزيارة
              </h2>
              <p className="text-xs text-slate-500">
                يمكنك تعديل أي محطة، إضافة محطات جديدة، أو إعادة توليد أي يوم منفردًا بالذكاء الاصطناعي.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newDay: TripDay = {
                  id: `day_${Date.now()}`,
                  dayNumber: tripState.days.length + 1,
                  title: `اليوم ${tripState.days.length + 1}: استكشاف حر`,
                  destinationName: tripState.destinations[0]?.name || 'القاهرة',
                  morningActivity: 'زيارة المعالم الصباحية والأسواق التراثية',
                  afternoonActivity: 'جولة حرة وغداء في مطعم محلي',
                  eveningActivity: 'سهرة نيلية أو عشاء بإطلالة مميزة',
                  stations: [
                    { id: `st_${Date.now()}_1`, name: 'محطة الصباح', time: '09:00', durationMinutes: 120, activityType: 'sightseeing', notes: 'جولة بصحبة المرشد' },
                  ],
                };
                setTripState(prev => ({ ...prev, days: [...prev.days, newDay] }));
              }}
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة يوم</span>
            </button>
          </div>

          {tripState.days.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 p-6 dark:border-slate-800">
              <Sparkles className="mx-auto h-10 w-10 text-amber-500 animate-pulse" />
              <h3 className="mt-2 font-bold text-slate-900 dark:text-white">الجدول اليومي فارغ حاليًا</h3>
              <p className="mt-1 text-xs text-slate-500">
                استخدم محرك الذكاء الاصطناعي في الخطوة 3 لإنشاء الجدول بضغطة زر واحدة.
              </p>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                الذهاب للتوليد الذكي
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tripState.days.map((day, dIdx) => (
                <div
                  key={day.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  {/* Day Header */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 font-black text-xs text-slate-950">
                        {day.dayNumber}
                      </span>
                      <input
                        type="text"
                        value={day.title}
                        onChange={e => {
                          const updated = [...tripState.days];
                          updated[dIdx].title = e.target.value;
                          setTripState({ ...tripState, days: updated });
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white w-72"
                      />
                      <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        📍 {day.destinationName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRegenerateSingleDay(dIdx)}
                        disabled={aiRegeneratingDayIndex === dIdx}
                        className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        title="إعادة صياغة هذا اليوم بالذكاء الاصطناعي"
                      >
                        <RefreshCw className={`h-3 w-3 ${aiRegeneratingDayIndex === dIdx ? 'animate-spin' : ''}`} />
                        <span>إعادة توليد اليوم (AI)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = tripState.days.filter((_, idx) => idx !== dIdx);
                          setTripState({ ...tripState, days: updated });
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stations List */}
                  <div className="mt-3 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500">محطات اليوم:</span>
                    {day.stations.map((st, sIdx) => (
                      <div
                        key={st.id}
                        className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5 shadow-2xs dark:bg-slate-900"
                      >
                        <input
                          type="time"
                          value={st.time || '09:00'}
                          onChange={e => {
                            const updated = [...tripState.days];
                            updated[dIdx].stations[sIdx].time = e.target.value;
                            setTripState({ ...tripState, days: updated });
                          }}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <input
                          type="text"
                          value={st.name}
                          onChange={e => {
                            const updated = [...tripState.days];
                            updated[dIdx].stations[sIdx].name = e.target.value;
                            setTripState({ ...tripState, days: updated });
                          }}
                          placeholder="اسم المحطة (مثل: أهرامات الجيزة)"
                          className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <select
                          value={st.type}
                          onChange={e => {
                            const updated = [...tripState.days];
                            updated[dIdx].stations[sIdx].type = e.target.value as any;
                            setTripState({ ...tripState, days: updated });
                          }}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="ATTRACTION">معلم سياحي</option>
                          <option value="ACTIVITY">نشاط / تجربة</option>
                          <option value="MEAL">وجبة طعام</option>
                          <option value="TRANSIT">تنقل / وصول</option>
                          <option value="REST">استراحة</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...tripState.days];
                            updated[dIdx].stations = updated[dIdx].stations.filter((_, idx) => idx !== sIdx);
                            setTripState({ ...tripState, days: updated });
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...tripState.days];
                        updated[dIdx].stations.push({
                          id: `st_${Date.now()}`,
                          name: 'محطة جديدة',
                          time: '14:00',
                          durationMinutes: 60,
                          type: 'ATTRACTION',
                        });
                        setTripState({ ...tripState, days: updated });
                      }}
                      className="mt-1 text-[11px] font-bold text-amber-600 hover:underline dark:text-amber-400"
                    >
                      + إضافة محطة لهذا اليوم
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400"
            >
              <span>التالي: وسائل التنقل</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: TRANSPORTATION LOGISTICS */}
      {currentStep === 5 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                5. وسائل وخطوط التنقل بين الوجهات
              </h2>
              <p className="text-xs text-slate-500">
                تحديد وسيلة الانتقال، المسافة، والوقت المقدر بين كل مدينة ومحطة.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newLeg: TransportationLeg = {
                  id: `trans_${Date.now()}`,
                  fromDestination: tripState.destinations[0]?.name || 'نقطة الانطلاق',
                  toDestination: tripState.destinations[1]?.name || 'نقطة الوصول',
                  type: 'PRIVATE_VAN',
                  estimatedDurationMinutes: 120,
                  distanceKm: 150,
                  estimatedCost: 0,
                  notes: 'سيارة سياحية خاصة ومكيفة',
                };
                setTripState(prev => ({
                  ...prev,
                  transportation: [...prev.transportation, newLeg],
                }));
              }}
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة مسار تنقل</span>
            </button>
          </div>

          <div className="space-y-3">
            {tripState.transportation.map((leg, idx) => (
              <div
                key={leg.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    {leg.type === 'FLIGHT' ? <Plane className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <span>{leg.fromDestination}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span>{leg.toDestination}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{leg.notes || 'تنقل سياحي منظم'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={leg.type}
                    onChange={e => {
                      const updated = [...tripState.transportation];
                      updated[idx].type = e.target.value as any;
                      setTripState({ ...tripState, transportation: updated });
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="PRIVATE_VAN">سيارة فان خاصة (Private Van)</option>
                    <option value="TOURIST_BUS">أتوبيس سياحي (Tourist Bus)</option>
                    <option value="FLIGHT">طيران داخلي (Flight)</option>
                    <option value="TRAIN">قطار / قطار النوم (Train)</option>
                    <option value="BOAT">مركب نيلية / فلوكة (Boat / Cruise)</option>
                  </select>

                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-500">المدة:</span>
                    <input
                      type="number"
                      value={leg.estimatedDurationMinutes}
                      onChange={e => {
                        const updated = [...tripState.transportation];
                        updated[idx].estimatedDurationMinutes = Number(e.target.value);
                        setTripState({ ...tripState, transportation: updated });
                      }}
                      className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="text-slate-400">دقيقة</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = tripState.transportation.filter((_, i) => i !== idx);
                      setTripState({ ...tripState, transportation: updated });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400"
            >
              <span>التالي: التكاليف والأرباح</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: OPERATIONAL COSTS & PROFIT CALCULATOR */}
      {currentStep === 6 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              6. حساب التكاليف وهوامش الربح
            </h2>
            <p className="text-xs text-slate-500">
              جميع التكاليف سرية ولا تظهر في صفحة العميل العامة. يتم احتساب الأرباح تلقائيًا.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Cost Breakdown Inputs */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                التكاليف التشغيلية (EGP):
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  الإقامة الفندقية (إجمالي الليالي):
                </label>
                <input
                  type="number"
                  value={tripState.costs.accommodationCost}
                  onChange={e => updateCosts({ accommodationCost: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  النقل والانتقالات والطيران الداخلي:
                </label>
                <input
                  type="number"
                  value={tripState.costs.transportationCost}
                  onChange={e => updateCosts({ transportationCost: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  تذاكر المزارات والأنشطة:
                </label>
                <input
                  type="number"
                  value={tripState.costs.activitiesTicketsCost}
                  onChange={e => updateCosts({ activitiesTicketsCost: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  أتعاب المرشد السياحي / المنظم:
                </label>
                <input
                  type="number"
                  value={tripState.costs.guideFees}
                  onChange={e => updateCosts({ guideFees: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  الوجبات والنفقات المتنوعة:
                </label>
                <input
                  type="number"
                  value={tripState.costs.mealsCost}
                  onChange={e => updateCosts({ mealsCost: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Selling Price & Profit Card */}
            <div className="flex flex-col justify-between rounded-2xl bg-slate-950 p-6 text-white shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  تسعير البرنامج للعميل:
                </span>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400">
                      سعر بيع البرنامج الإجمالي المقترح (EGP):
                    </label>
                    <input
                      type="number"
                      value={tripState.costs.sellingPrice}
                      onChange={e => updateCosts({ sellingPrice: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-lg font-black text-amber-400 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>إجمالي التكلفة التشغيلية:</span>
                      <span className="font-bold text-white">
                        {tripState.costs.totalCost.toLocaleString()} EGP
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>سعر البيع المقترح:</span>
                      <span className="font-bold text-amber-400">
                        {tripState.costs.sellingPrice.toLocaleString()} EGP
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
                      <span className="font-bold text-slate-300">صافي الربح المتوقع:</span>
                      <span className="text-xl font-black text-emerald-400">
                        +{tripState.costs.calculatedProfit.toLocaleString()} EGP
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>نسبة هامش الربح:</span>
                      <span className="font-bold text-emerald-400">
                        {tripState.costs.profitMarginPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-[11px] text-slate-400">
                🔒 يتم حفظ التكاليف وهوامش الربح في قاعدة البيانات بأمان تام ولا تظهر على صفحة العميل العامة.
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(7)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400"
            >
              <span>التالي: المراجعة والنشر</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: REVIEW, CHECKLIST & PUBLISH */}
      {currentStep === 7 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              7. المراجعة النهائية ونشر البرنامج للعملاء
            </h2>
            <p className="text-xs text-slate-500">
              تأكد من اكتمال عناصر البرنامج قبل توليد رابط المشاركة أو ملف العرض.
            </p>
          </div>

          {/* Pre-flight Checklist */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              قائمة الفحص قبل النشر (Pre-flight Checklist):
            </h3>

            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>الاسم والملخص التعريفي مكتمل</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>توزيع الليالي والوجهات مكتمل ({tripState.destinations.length} وجهات)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>الجدول اليومي والمحطات مجدولة ({tripState.days.length} أيام)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>التكاليف وسعر البيع محدد بدقة ({tripState.costs.sellingPrice} EGP)</span>
              </div>
            </div>
          </div>

          {/* Published Share Link (if published) */}
          {publishedData ? (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-sm">البرنامج منشور ومتاح الآن عبر الرابط العام!</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-white p-3 dark:border-emerald-800 dark:bg-slate-900">
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">
                  {publishedData.publicLinkUrl}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(publishedData.publicLinkUrl);
                    setSaveMessage('تم نسخ الرابط العام!');
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  نسخ الرابط
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleNav('public_preview', publishedData.publicToken)}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-2xs hover:bg-slate-100 dark:bg-slate-800 dark:text-white"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>معاينة صفحة العميل</span>
                </button>
                <DownloadPdfButton
                  trip={tripState}
                  guide={user}
                  variant="secondary"
                  onSuccess={() => setSaveMessage('تم تحميل ملف PDF بنجاح!')}
                />
                <button
                  type="button"
                  onClick={() => handleNav('presentation', tripState.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  <Presentation className="h-3.5 w-3.5" />
                  <span>عرض الشرائح (Slide Presentation)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
              <h3 className="font-bold text-slate-900 dark:text-white">جاهز لنشر البرنامج؟</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                عند النشر، سيتم إنشاء رابط عام آمن يحمل بياناتك وهويتك السياحية لمشاركته مع عملائك ووكالات السفر.
              </p>
              <button
                type="button"
                onClick={() => handleSaveTrip(true)}
                disabled={isLoading}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400"
              >
                <Share2 className="h-4 w-4" />
                <span>نشر وتوليد الرابط العام الآن</span>
              </button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={() => {
                if (onFinish) onFinish();
                else handleNav('trips');
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              العودة لقائمة الرحلات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
