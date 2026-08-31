import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Presentation,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Navigation,
  Compass,
  Star,
  Users,
  Building,
  Check
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ProgramsPreviewSectionProps {
  onNavigate: (view: string, targetId?: string) => void;
}

export const ProgramsPreviewSection: React.FC<ProgramsPreviewSectionProps> = ({ onNavigate }) => {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'destinations' | 'inclusions' | 'map'>('itinerary');
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Safe static demo data for marketing preview
  const demoDays = [
    {
      dayNumber: 1,
      title: isRtl ? 'اليوم الأول: وصول القاهرة وأهرامات الجيزة' : 'Day 1: Cairo Arrival & Giza Pyramids Plateau',
      city: isRtl ? 'القاهرة والجيزة' : 'Cairo & Giza',
      morning: isRtl ? 'استقبال بمطار القاهرة والانتقال لفندق مينا هاوس المطل على الأهرامات' : 'Arrival at Cairo Airport, private transfer to Marriott Mena House hotel',
      afternoon: isRtl ? 'جولة خاصة لأهرامات الجيزة، تمثال أبو الهول، وركوب الخيل بالصحراء' : 'Private VIP tour of Giza Pyramids Plateau & Great Sphinx',
      evening: isRtl ? 'عشاء ترحيبي فاخر مع عرض الصوت والضوء الأسطوري' : 'Welcome dinner with Nile view & Pyramids Sound and Light show',
      stations: [
        { time: '09:00 AM', name: isRtl ? 'أهرامات خوفو وخفرع ومنقرع' : 'Great Pyramids of Giza', type: 'LANDMARK' },
        { time: '12:30 PM', name: isRtl ? 'أبو الهول ومعبد الوادي' : 'Great Sphinx & Valley Temple', type: 'LANDMARK' },
        { time: '04:00 PM', name: isRtl ? 'استراحة الغداء في مطعم فاخر' : 'Traditional Egyptian Lunch', type: 'MEAL' },
      ]
    },
    {
      dayNumber: 2,
      title: isRtl ? 'اليوم الثاني: المتحف المصري الكبير والقاهرة التاريخية' : 'Day 2: Grand Egyptian Museum & Historic Cairo',
      city: isRtl ? 'القاهرة' : 'Cairo',
      morning: isRtl ? 'زيارة قاعات الملك توت عنخ آمون بالمتحف المصري الكبير (GEM)' : 'Touring Grand Egyptian Museum (GEM) Tutankhamun galleries',
      afternoon: isRtl ? 'استكشاف قلعة صلاح الدين، جامع محمد علي، ومصر القديمة' : 'Citadel of Saladin, Mosque of Muhammad Ali & Coptic Cairo',
      evening: isRtl ? 'جولة تسوق وأجواء ساحرة في خان الخليلي ومقهى الفيشاوي' : 'Evening walking tour in Khan El-Khalili bazaar & Al-Fishawy cafe',
      stations: [
        { time: '09:30 AM', name: isRtl ? 'المتحف المصري الكبير (GEM)' : 'Grand Egyptian Museum (GEM)', type: 'MUSEUM' },
        { time: '01:30 PM', name: isRtl ? 'قلعة صلاح الدين الأيوبي' : 'Citadel of Saladin', type: 'LANDMARK' },
        { time: '05:00 PM', name: isRtl ? 'سوق خان الخليلي والمعز' : 'Khan El-Khalili Bazaar', type: 'SHOPPING' },
      ]
    },
    {
      dayNumber: 3,
      title: isRtl ? 'اليوم الثالث: السفر إلى الأقصر ومعابد الكرنك' : 'Day 3: Flight to Luxor & Karnak Temple Complex',
      city: isRtl ? 'الأقصر' : 'Luxor',
      morning: isRtl ? 'طيران داخلي صباحي إلى الأقصر والتسكين في نايل كروز 5 نجوم ديلوكس' : 'Morning flight to Luxor, check-in to 5-Star Deluxe Nile Cruise',
      afternoon: isRtl ? 'زيارة مجمع معابد الكرنك الضخم وقاعة الأعمدة الكبرى' : 'Comprehensive tour of Karnak Temple Complex & Hypostyle Hall',
      evening: isRtl ? 'جولة مسائية ساحرة بمعبد الأقصر المضاء ليلاً على كورنيش النيل' : 'Night tour of illuminated Luxor Temple along the Nile',
      stations: [
        { time: '10:30 AM', name: isRtl ? 'معبد الكرنك وطريق الكباش' : 'Karnak Temple & Avenue of Sphinxes', type: 'LANDMARK' },
        { time: '01:00 PM', name: isRtl ? 'غداء بوفيه فاخر على متن السفينة' : 'Nile Cruise Lunch Buffet', type: 'MEAL' },
        { time: '06:30 PM', name: isRtl ? 'معبد الأقصر المضاء ليلاً' : 'Illuminated Luxor Temple', type: 'LANDMARK' },
      ]
    },
    {
      dayNumber: 4,
      title: isRtl ? 'اليوم الرابع: وادي الملوك ومعبد حتشبسوت' : 'Day 4: Valley of the Kings & Hatshepsut Temple',
      city: isRtl ? 'الأقصر (البر الغربي)' : 'Luxor (West Bank)',
      morning: isRtl ? 'ركوب منطاد الهواء الساخن عند شروق الشمس فوق آثار الأقصر' : 'Optional Sunrise Hot Air Balloon flight over Luxor ruins',
      afternoon: isRtl ? 'استكشاف مقابر الفراعنة بوادي الملوك ومعبد الملكة حتشبسوت بالدير البحري' : 'Exploring Royal Tombs in Valley of the Kings & Hatshepsut Temple',
      evening: isRtl ? 'الإبحار في النيل الهادئ والاستمتاع بغروب الشمس الذهبي' : 'Afternoon Nile sailing towards Edfu with tea time on sundeck',
      stations: [
        { time: '05:30 AM', name: isRtl ? 'منطاد الأقصر الطائر' : 'Hot Air Balloon Ride', type: 'ACTIVITY' },
        { time: '08:30 AM', name: isRtl ? 'مقابر وادي الملوك الملكية' : 'Valley of the Kings Tombs', type: 'LANDMARK' },
        { time: '11:00 AM', name: isRtl ? 'معبد حتشبسوت وتمثالا ممنون' : 'Hatshepsut Temple & Colossi of Memnon', type: 'LANDMARK' },
      ]
    },
    {
      dayNumber: 5,
      title: isRtl ? 'اليوم الخامس: معبد إدفو وكوم أمبو وخاتمة الرحلة' : 'Day 5: Edfu & Kom Ombo Temples & Farewell',
      city: isRtl ? 'أسوان' : 'Aswan',
      morning: isRtl ? 'زيارة معبد حورس في إدفو بعربات الحنطور التراثية' : 'Visiting Horus Temple in Edfu via traditional horse carriage',
      afternoon: isRtl ? 'زيارة معبد كوم أمبو المزدوج ومتحف التماسيح المحنطة' : 'Exploring Kom Ombo Dual Temple & Mummified Crocodile Museum',
      evening: isRtl ? 'عشاء نوبي احتفالي ختامي والتوصيل للمطار للعودة' : 'Farewell Nubian cultural dinner and airport transfer',
      stations: [
        { time: '08:00 AM', name: isRtl ? 'معبد حورس في إدفو' : 'Horus Temple in Edfu', type: 'LANDMARK' },
        { time: '02:00 PM', name: isRtl ? 'معبد كوم أمبو' : 'Kom Ombo Temple', type: 'LANDMARK' },
        { time: '07:00 PM', name: isRtl ? 'العشاء النوبي والتوديع' : 'Nubian Cultural Dinner & Transfer', type: 'MEAL' },
      ]
    },
  ];

  const currentDayData = demoDays.find(d => d.dayNumber === selectedDay) || demoDays[0];

  return (
    <section id="programs" className="scroll-mt-20 border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isRtl ? 'عرض حي لبرنامج سياحي ذكي' : 'Interactive Itinerary Preview'}</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            {t('programsSectionTitle')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('programsSectionSubtitle')}
          </p>
        </div>

        {/* Action Buttons Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('public_preview', 'tv_demo_egypt_explorer_2026')}
            className="flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-all hover:scale-102"
          >
            <Eye className="h-4 w-4" />
            <span>{t('liveClientExperience')}</span>
          </button>
          
          <button
            type="button"
            onClick={() => onNavigate('presentation', 'trip_egypt_classic_5d')}
            className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
          >
            <Presentation className="h-4 w-4 text-amber-500" />
            <span>{isRtl ? 'العرض التقديمي (Slideshow)' : 'Presentation Mode'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('auth_register')}
            className="flex items-center gap-2 rounded-2xl border border-amber-300/80 bg-amber-50/50 px-6 py-3 text-xs font-bold text-amber-950 hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>{t('ctaCreateTrip')}</span>
          </button>
        </div>

        {/* Main Interactive Preview Container */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          
          {/* Top Demo Header Bar */}
          <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-black text-slate-950 shadow-sm">
                5D
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-black text-slate-950 dark:text-white">
                    {isRtl ? 'مصر الكلاسيكية وسحر النيل (5 أيام / 4 ليالي)' : 'Egypt Pharaohs & Nile Odyssey (5 Days / 4 Nights)'}
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{isRtl ? 'مرشد معتمد' : 'Verified Guide'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isRtl ? 'القاهرة • الجيزة • الأقصر • إدفو • كوم أمبو • أسوان' : 'Cairo • Giza • Luxor • Edfu • Kom Ombo • Aswan'}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('itinerary')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'itinerary'
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {isRtl ? 'الجدول اليومي' : 'Daily Itinerary'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('destinations')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'destinations'
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {isRtl ? 'الوجهات' : 'Destinations'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inclusions')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'inclusions'
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {isRtl ? 'المشتملات والأسعار' : 'Inclusions & Pricing'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'map'
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {isRtl ? 'خريطة المسار' : 'Route Map'}
              </button>
            </div>
          </div>

          {/* Tab Content 1: Itinerary with Day Selector */}
          {activeTab === 'itinerary' && (
            <div className="p-6 sm:p-8">
              {/* Day Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
                {demoDays.map(day => (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => setSelectedDay(day.dayNumber)}
                    className={`flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                      selectedDay === day.dayNumber
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isRtl ? `اليوم ${day.dayNumber}` : `Day ${day.dayNumber}`}</span>
                    <span className="text-[10px] opacity-80">({day.city})</span>
                  </button>
                ))}
              </div>

              {/* Day Detail Card */}
              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-800">
                  <div>
                    <h4 className="text-lg font-black text-slate-950 dark:text-white">
                      {currentDayData.title}
                    </h4>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                      📍 {currentDayData.city}
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {isRtl ? `${currentDayData.stations.length} محطات رئيسية` : `${currentDayData.stations.length} Highlight Stops`}
                  </span>
                </div>

                {/* Timeline Periods */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span>{isRtl ? 'الفترة الصباحية (Morning)' : 'Morning'}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentDayData.morning}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-200/60 bg-blue-50/40 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-700 dark:text-blue-300">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{isRtl ? 'فترة الظهيرة (Afternoon)' : 'Afternoon'}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentDayData.afternoon}
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-200/60 bg-purple-50/40 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-700 dark:text-purple-300">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span>{isRtl ? 'الفترة المسائية (Evening)' : 'Evening'}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentDayData.evening}
                    </p>
                  </div>
                </div>

                {/* Stations Timeline */}
                <div className="mt-6 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isRtl ? 'محطات المزارات السياحية المجدولة' : 'Scheduled Tourist Stops'}
                  </h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentDayData.stations.map((st, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
                          {st.time}
                        </span>
                        <span>{st.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Destinations */}
          {activeTab === 'destinations' && (
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    {isRtl ? 'الليلة 1 - 2' : 'Nights 1 - 2'}
                  </span>
                  <MapPin className="h-4 w-4 text-amber-500" />
                </div>
                <h4 className="mt-2 text-base font-black text-slate-900 dark:text-white">
                  {isRtl ? 'القاهرة والجيزة' : 'Cairo & Giza'}
                </h4>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {isRtl ? 'أهرامات الجيزة، أبو الهول، المتحف المصري الكبير، وخان الخليلي.' : 'Giza Pyramids, Sphinx, GEM Museum, and historic markets.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                    {isRtl ? 'الليلة 3' : 'Night 3'}
                  </span>
                  <MapPin className="h-4 w-4 text-blue-500" />
                </div>
                <h4 className="mt-2 text-base font-black text-slate-900 dark:text-white">
                  {isRtl ? 'الأقصر (البر الشرقي والغربي)' : 'Luxor (East & West Banks)'}
                </h4>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {isRtl ? 'مجمع معابد الكرنك، معبد الأقصر، وادي الملوك، ومعبد حتشبسوت.' : 'Karnak Temple, Luxor Temple, Valley of the Kings, and Hatshepsut.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {isRtl ? 'الليلة 4' : 'Night 4'}
                  </span>
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </div>
                <h4 className="mt-2 text-base font-black text-slate-900 dark:text-white">
                  {isRtl ? 'إدفو وكوم أمبو' : 'Edfu & Kom Ombo'}
                </h4>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {isRtl ? 'الإبحار في النيل وزيارة معبد حورس ومعبد كوم أمبو المزدوج.' : 'Nile sailing, Horus Temple in Edfu, and dual Kom Ombo temple.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    {isRtl ? 'الليلة 5' : 'Night 5'}
                  </span>
                  <MapPin className="h-4 w-4 text-purple-500" />
                </div>
                <h4 className="mt-2 text-base font-black text-slate-900 dark:text-white">
                  {isRtl ? 'أسوان والنوبة' : 'Aswan & Nubia'}
                </h4>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {isRtl ? 'معبد فيلة، السد العالي، القرية النوبية، وجولات الفلوكة النيلية.' : 'Philae Temple, High Dam, Nubian Village, and Felucca sailing.'}
                </p>
              </div>
            </div>
          )}

          {/* Tab Content 3: Inclusions & Pricing */}
          {activeTab === 'inclusions' && (
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inclusions */}
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-6 dark:border-emerald-900/30 dark:bg-emerald-950/10">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <h4 className="font-bold text-sm">
                    {isRtl ? 'الخدمات المشمولة في البرنامج (Inclusions)' : 'Included Services'}
                  </h4>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'إقامة 4 ليالي في فنادق ونايل كروز 5 نجوم ديلوكس' : '4 Nights luxury stay in 5-Star Hotel & Deluxe Nile Cruise'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'مرشد سياحي مصري مرخص ومرافق طوال الرحلة' : 'Licensed Egyptian Tour Guide accompanying full itinerary'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'تذاكر دخول كافة المزارات والمعابد المذكورة' : 'All entry tickets to mentioned temples & historical sites'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'انتقالات خاصة بسيارات VIP مكيفة حديثة' : 'Private VIP modern AC transport and airport pickups'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'وجبات الإفطار والغداء اليومية ومياه معدنية مجانية' : 'Daily breakfast and lunch meals with mineral water'}</span>
                  </li>
                </ul>
              </div>

              {/* Exclusions & Price */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950/40">
                <div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <XCircle className="h-5 w-5 text-rose-500" />
                    <h4 className="font-bold text-sm">
                      {isRtl ? 'غير مشمول (Exclusions)' : 'Excluded Services'}
                    </h4>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li>• {isRtl ? 'تذاكر الطيران الدولي إلى مصر' : 'International flights to Egypt'}</li>
                    <li>• {isRtl ? 'المصاريف الشخصية وركوب المنطاد الاختياري' : 'Personal expenses and optional hot air balloon'}</li>
                    <li>• {isRtl ? 'إكراميات طاقم العمل والسائقين' : 'Gratuities & tips'}</li>
                  </ul>
                </div>

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                      {isRtl ? 'سعر البرنامج التقديري' : 'Estimated Package Price'}
                    </span>
                    <p className="text-lg font-black text-slate-950 dark:text-white">
                      14,500 EGP <span className="text-xs font-normal text-slate-500">/ {isRtl ? 'للفرد' : 'per person'}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('public_preview', 'tv_demo_egypt_explorer_2026')}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 shadow-sm"
                  >
                    {t('liveClientExperience')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 4: Interactive Route Map Simulation */}
          {activeTab === 'map' && (
            <div className="p-6 sm:p-8">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {isRtl ? 'مسار الرحلة الجغرافي عبر وادي النيل' : 'Geographic Nile Valley Travel Route'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {isRtl ? 'القاهرة -> الأقصر -> إدفو -> كوم أمبو -> أسوان' : 'Cairo -> Luxor -> Edfu -> Kom Ombo -> Aswan'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                    {isRtl ? 'إجمالي المسافة: ~890 كم' : 'Total Distance: ~890 km'}
                  </span>
                </div>

                {/* Visual Route Nodes */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-center">
                    <span className="text-[10px] font-black text-amber-400">المحطة 1</span>
                    <h5 className="mt-1 font-bold text-xs">أهرامات الجيزة</h5>
                    <span className="text-[10px] text-slate-400">Cairo & Giza</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-center">
                    <span className="text-[10px] font-black text-amber-400">المحطة 2</span>
                    <h5 className="mt-1 font-bold text-xs">معبد الكرنك</h5>
                    <span className="text-[10px] text-slate-400">Luxor East</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-center">
                    <span className="text-[10px] font-black text-amber-400">المحطة 3</span>
                    <h5 className="mt-1 font-bold text-xs">وادي الملوك</h5>
                    <span className="text-[10px] text-slate-400">Luxor West</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-center">
                    <span className="text-[10px] font-black text-amber-400">المحطة 4</span>
                    <h5 className="mt-1 font-bold text-xs">معبد إدفو</h5>
                    <span className="text-[10px] text-slate-400">Edfu Horus</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-center">
                    <span className="text-[10px] font-black text-amber-400">المحطة 5</span>
                    <h5 className="mt-1 font-bold text-xs">معبد فيلة وأسوان</h5>
                    <span className="text-[10px] text-slate-400">Philae Aswan</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => onNavigate('public_preview', 'tv_demo_egypt_explorer_2026')}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{isRtl ? 'عرض الخريطة التفاعلية الكاملة في رابط العميل' : 'Open Full Interactive Map in Client Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
