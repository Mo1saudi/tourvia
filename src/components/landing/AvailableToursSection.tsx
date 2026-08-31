import React, { useMemo, useState } from 'react';
import { Search, MapPin, Clock, X, Star, Compass } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface AvailableToursSectionProps {
  onNavigate: (view: string, targetId?: string) => void;
}

interface Tour {
  id: string;
  titleAr: string;
  titleEn: string;
  locationAr: string;
  locationEn: string;
  interestsAr: string[];
  interestsEn: string[];
  durationDays: number;
  rating: number;
  image: string;
}

// Curated featured Egyptian tours — display only (no pricing), shown to landing visitors.
const TOURS: Tour[] = [
  {
    id: 'tour_giza_classic',
    titleAr: 'أهرامات الجيزة والقاهرة الكلاسيكية',
    titleEn: 'Giza Pyramids & Classic Cairo',
    locationAr: 'القاهرة والجيزة',
    locationEn: 'Cairo & Giza',
    interestsAr: ['آثار فرعونية', 'متاحف', 'تسوق'],
    interestsEn: ['Pharaonic', 'Museums', 'Shopping'],
    durationDays: 3,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tour_luxor_nile',
    titleAr: 'الأقصر ووادي الملوك وكرنك',
    titleEn: 'Luxor, Valley of the Kings & Karnak',
    locationAr: 'الأقصر',
    locationEn: 'Luxor',
    interestsAr: ['آثار فرعونية', 'معابد', 'مقابر ملكية'],
    interestsEn: ['Pharaonic', 'Temples', 'Royal Tombs'],
    durationDays: 4,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tour_redsea_relax',
    titleAr: 'الغردقة والغوص في البحر الأحمر',
    titleEn: 'Hurghada & Red Sea Diving',
    locationAr: 'الغردقة',
    locationEn: 'Hurghada',
    interestsAr: ['غوص', 'شواطئ', 'استرخاء'],
    interestsEn: ['Diving', 'Beaches', 'Relaxation'],
    durationDays: 4,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229c8ef9?auto=format&fit=crop&w=800&q=80',
  },
];

export const AvailableToursSection: React.FC<AvailableToursSectionProps> = ({ onNavigate: _onNavigate }) => {
  const { isRtl } = useLanguage();
  const [query, setQuery] = useState('');

  const filteredTours = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOURS;
    return TOURS.filter((tour) => {
      const haystack = [
        tour.titleAr, tour.titleEn,
        tour.locationAr, tour.locationEn,
        ...tour.interestsAr, ...tour.interestsEn,
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <section id="explore-tours" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
            <Compass className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isRtl ? 'استكشف البرامج السياحية المتاحة' : 'Explore Available Tours'}</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            {isRtl ? 'شكل البرامج السياحية في TOURVIA' : 'How TOURVIA Tour Programs Look'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {isRtl
              ? 'استعرض نماذج من البرامج السياحية المعتمدة في مصر حسب الموقع أو نوع النشاط — للعرض فقط.'
              : 'Browse sample verified Egyptian tour programs by location or interest — for display only.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 mx-auto max-w-2xl">
          <div className="relative">
            <Search className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRtl ? 'ابحث بالوجهة أو الاهتمام (مثال: الأقصر، غوص، معابد)...' : 'Search by destination or interest (e.g. Luxor, diving, temples)...'}
              className={`w-full rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-900 shadow-md placeholder:font-normal placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={isRtl ? 'مسح البحث' : 'Clear search'}
                className={`absolute top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 ${isRtl ? 'left-2' : 'right-2'}`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Result count */}
          <p className="mt-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
            {isRtl
              ? `${filteredTours.length} برنامج سياحي للعرض`
              : `${filteredTours.length} tour${filteredTours.length === 1 ? '' : 's'} on display`}
          </p>
        </div>

        {/* Tours Grid */}
        {filteredTours.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((tour) => (
              <article
                key={tour.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={tour.image}
                    alt={isRtl ? tour.titleAr : tour.titleEn}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black text-slate-950 shadow">
                    <Star className="h-3 w-3 fill-slate-950" />
                    {tour.rating.toFixed(1)}
                  </span>
                  <span className="absolute bottom-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-950 shadow dark:bg-slate-900/90 dark:text-white">
                    <Clock className="h-3 w-3 text-amber-500" />
                    {tour.durationDays} {isRtl ? 'أيام' : 'Days'}
                  </span>
                </div>

                {/* Body — display only, no pricing or purchase actions */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{isRtl ? tour.locationAr : tour.locationEn}</span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-black leading-snug text-slate-950 dark:text-white">
                    {isRtl ? tour.titleAr : tour.titleEn}
                  </h3>

                  {/* Interest tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(isRtl ? tour.interestsAr : tour.interestsEn).map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Search className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="mt-4 text-sm font-black text-slate-900 dark:text-white">
              {isRtl ? 'لا توجد برامج مطابقة' : 'No matching tours found'}
            </h3>
            <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'جرّب كلمة بحث أخرى مثل "معابد" أو "غوص" أو "الأقصر".'
                : 'Try another keyword like "temples", "diving", or "Luxor".'}
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-4 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-sm transition-colors hover:bg-amber-400"
            >
              {isRtl ? 'مسح البحث' : 'Clear search'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
