import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Share2,
  Presentation,
  Smartphone,
  Play,
  Pause,
  ArrowRight,
  Navigation,
  DollarSign,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ProductSlideshowProps {
  onNavigate: (view: string, targetId?: string) => void;
}

export const ProductSlideshow: React.FC<ProductSlideshowProps> = ({ onNavigate }) => {
  const { t, isRtl } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const slides = [
    {
      id: 1,
      badge: isRtl ? 'الخطوة 1: هوية واضحة' : 'Step 1: Guide Identity',
      title: t('slide1Title'),
      desc: t('slide1Desc'),
      icon: ShieldCheck,
      color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
      tagColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
      preview: {
        headline: isRtl ? 'رحلة أسرار الفراعنة والأقصر' : 'Pharaohs & Luxor Mysteries',
        sub: isRtl ? 'مرشد سياحي معتمد: تامر المصري (نقابة المرشدين)' : 'Verified Guide: Tamer El-Masry (Licensed)',
        chips: [isRtl ? '5 أيام / 4 ليالي' : '5 Days / 4 Nights', isRtl ? 'ترخيص #2948' : 'License #2948', 'English / Arabic / French'],
        image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80',
      }
    },
    {
      id: 2,
      badge: isRtl ? 'الخطوة 2: توزيع الوجهات' : 'Step 2: Destination Flow',
      title: t('slide2Title'),
      desc: t('slide2Desc'),
      icon: MapPin,
      color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
      tagColor: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300',
      preview: {
        headline: isRtl ? 'توزيع الليالي والمحطات' : 'Nights & Cities Distribution',
        sub: isRtl ? 'القاهرة (2 ليلة) -> الأقصر (1 ليلة) -> أسوان (1 ليلة)' : 'Cairo (2N) -> Luxor (1N) -> Aswan (1N)',
        chips: [isRtl ? 'أهرامات الجيزة' : 'Giza Pyramids', isRtl ? 'معبد الكرنك' : 'Karnak Temple', isRtl ? 'وادي الملوك' : 'Valley of Kings', isRtl ? 'فيلة وأسوان' : 'Philae Aswan'],
        image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80',
      }
    },
    {
      id: 3,
      badge: isRtl ? 'الخطوة 3: جدول زمني محكم' : 'Step 3: Precise Timetable',
      title: t('slide3Title'),
      desc: t('slide3Desc'),
      icon: Clock,
      color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
      tagColor: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300',
      preview: {
        headline: isRtl ? 'تنظيم اليوم بالساعة والدقيقة' : 'Hourly Scheduled Timetable',
        sub: isRtl ? 'صباحي: 09:00 ص الأهرامات • ظهيرة: 01:30 م المتحف الكبير • مساء: خان الخليلي' : '09:00 AM Pyramids • 01:30 PM Grand Museum • 06:00 PM Bazaar',
        chips: [isRtl ? 'توقيتات دقيقة' : 'Exact Times', isRtl ? 'فترات راحة' : 'Rest Breaks', isRtl ? 'وجبات محددة' : 'Scheduled Meals'],
        image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=600&q=80',
      }
    },
    {
      id: 4,
      badge: isRtl ? 'الخطوة 4: الشفافية والأسعار' : 'Step 4: Transparent Pricing',
      title: t('slide4Title'),
      desc: t('slide4Desc'),
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
      tagColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
      preview: {
        headline: isRtl ? 'المشتملات والخدمات والسعر' : 'Clear Inclusions & Total Price',
        sub: isRtl ? 'فنادق 5 نجوم • سيارات VIP مكيفة • تذاكر المزارات • إرشاد مرخص' : '5-Star Hotels • Private VIP Van • Monument Tickets • Licensed Guide',
        chips: [isRtl ? 'مشمول بالكامل' : 'All-Inclusive', isRtl ? 'سعر واضح للفرد' : 'Clear Per-Person Rate', isRtl ? 'إمكانية إخفاء السعر' : 'Optional Hidden Price'],
        image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80',
      }
    },
    {
      id: 5,
      badge: isRtl ? 'الخطوة 5: الخريطة التفاعلية' : 'Step 5: Interactive Route Map',
      title: t('slide5Title'),
      desc: t('slide5Desc'),
      icon: Navigation,
      color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30',
      tagColor: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300',
      preview: {
        headline: isRtl ? 'خريطة مسار النيل والمعالم' : 'Nile Valley Interactive Map',
        sub: isRtl ? 'محطات متصلة بنظام ملاحة جغرافي يوضح مسار الرحلة والمسافات' : 'Connected stations with geographic distance and travel route indicators',
        chips: [isRtl ? 'مسار جغرافي حي' : 'Live Route', isRtl ? 'نقاط توقف محددة' : 'Waypoint Stops', isRtl ? 'حساب المسافات' : 'Distance Calculation'],
        image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80',
      }
    },
    {
      id: 6,
      badge: isRtl ? 'الخطوة 6: العرض والمشاركة' : 'Step 6: Live Web & PDF',
      title: t('slide6Title'),
      desc: t('slide6Desc'),
      icon: Smartphone,
      color: 'from-amber-500/20 to-rose-600/5 border-amber-500/30',
      tagColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
      preview: {
        headline: isRtl ? 'رابط مباشر + وضع العرض + كتيب PDF' : 'Live Client Link + Slideshow + PDF Brochure',
        sub: isRtl ? 'شارك على واتساب، افتح شاشة العرض التقديمي للعملاء، أو حمّل PDF فوري' : 'Share on WhatsApp, open presentation mode for travelers, or download print PDF',
        chips: [isRtl ? 'رابط ويب تفاعلي' : 'Live Web Link', isRtl ? 'عرض شرائح' : 'Slide Mode', isRtl ? 'تصدير PDF فوري' : 'Instant PDF Export'],
        image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80',
      }
    },
  ];

  // Autoplay loop with pause on hover
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (isRtl) handlePrev();
        else handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) handleNext();
        else handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRtl]);

  const activeSlide = slides[currentSlide];

  return (
    <section 
      id="product-slideshow" 
      className="border-t border-slate-200 bg-slate-50/60 py-20 dark:border-slate-800 dark:bg-slate-950/60"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={e => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={e => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) {
          if (isRtl) handlePrev();
          else handleNext();
        } else if (diff < -50) {
          if (isRtl) handleNext();
          else handlePrev();
        }
        touchStartX.current = null;
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
            <Presentation className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isRtl ? 'عرض رحلة المنتج المرئية' : 'Visual Product Showcase'}</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            {t('slideshowSectionTitle')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('slideshowSectionSubtitle')}
          </p>
        </div>

        {/* Step Tabs Bar (Clickable) */}
        <div className="mt-10 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                currentSlide === idx
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-105'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <span className="opacity-75">{idx + 1}.</span>
              <span>{s.badge.split(':')[1] || s.badge}</span>
            </button>
          ))}
        </div>

        {/* Main Interactive Slide Display */}
        <div className="mt-8 relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                <activeSlide.icon className="h-4 w-4 text-amber-500" />
                <span>{activeSlide.badge}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white leading-snug">
                {activeSlide.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeSlide.desc}
              </p>

              {/* Bullet Highlights */}
              <div className="pt-2 flex flex-wrap gap-2">
                {activeSlide.preview.chips.map((chip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                    <span>{chip}</span>
                  </span>
                ))}
              </div>

              {/* Action Link */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('public_preview', 'tv_demo_egypt_explorer_2026')}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 transition-transform hover:scale-102"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t('liveClientExperience')}</span>
                  <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Right Interactive Preview Mockup Card */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 p-6 text-white shadow-xl dark:border-slate-800">
                <img
                  src={activeSlide.preview.image}
                  alt={activeSlide.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-black text-slate-950">
                      TOURVIA LIVE PREVIEW
                    </span>
                    <span className="text-[11px] text-slate-300 font-bold">
                      {currentSlide + 1} / {slides.length}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-white">
                      {activeSlide.preview.headline}
                    </h4>
                    <p className="mt-1 text-xs text-slate-300">
                      {activeSlide.preview.sub}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {activeSlide.preview.chips.map((c, idx) => (
                      <span key={idx} className="rounded-md bg-white/15 px-2.5 py-1 text-[10px] font-bold text-slate-100 backdrop-blur-xs">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>✨ {isRtl ? 'توليد فوري بالذكاء الاصطناعي' : 'Instant AI Generation'}</span>
                    <span className="text-amber-400 font-bold">TOURVIA OS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
            {/* Prev / Next & Autoplay */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                aria-label="Previous Slide"
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-amber-500" />
                    <span>{isRtl ? 'إيقاف مؤقت' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-amber-500" />
                    <span>{isRtl ? 'تشغيل تلقائي' : 'Auto Play'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                aria-label="Next Slide"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    currentSlide === i
                      ? 'w-8 bg-amber-500'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
