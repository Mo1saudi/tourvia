import React, { useState, useEffect } from 'react';
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  Printer,
  Calendar,
  MapPin,
  Clock,
  Car,
  ShieldCheck,
  CheckCircle,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import { api } from '../services/api';
import { Trip, WorkingLanguage } from '../types';
import { TourviaLogo } from '../components/TourviaLogo';
import { DownloadPdfButton } from '../components/DownloadPdfButton';
import { useLanguage } from '../i18n/LanguageContext';
import {
  translateInclusion,
  translateExclusion,
  translateDestinationName,
  translateTripText,
} from '../i18n/tripTranslator';

interface PresentationViewProps {
  tripId: string;
  onExit: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ tripId, onExit }) => {
  const { t, language, setLanguage, availableLanguages, isRtl } = useLanguage();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getTrip(tripId)
      .then(res => setTrip(res.trip))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false));
  }, [tripId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (isRtl) {
          prevSlide();
        } else {
          nextSlide();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (isRtl) {
          nextSlide();
        } else {
          prevSlide();
        }
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (isLoading || !trip) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white">
        <Compass className="h-10 w-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Slide count
  const totalSlides = 3 + trip.days.length;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div id="presentation-fullscreen-root" className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none">
      {/* Top Floating Controls Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#0B1736]/90 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <TourviaLogo size={22} variant="mark" />
          <span className="font-heading font-black text-amber-400 text-xs">TOURVIA PRESENTATION</span>
          <span className="text-xs text-slate-300 hidden sm:inline">• {translateTripText(trip.name, language)}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg px-2 py-1 border border-slate-700">
            <Globe className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <select
              aria-label={t('selectLanguage')}
              value={language}
              onChange={(e) => setLanguage(e.target.value as WorkingLanguage)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-hidden cursor-pointer"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            {t('slideCountText').replace('{current}', String(currentSlide + 1)).replace('{total}', String(totalSlides))}
          </span>

          <DownloadPdfButton trip={trip} variant="compact" />

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200 hover:bg-slate-700"
            title="PDF"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>PDF</span>
          </button>
          
          <button
            type="button"
            onClick={onExit}
            className="flex items-center justify-center rounded-lg bg-slate-800 p-1 text-slate-400 hover:bg-red-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        {/* SLIDE 0: COVER */}
        {currentSlide === 0 && (
          <div className="max-w-4xl text-center space-y-6 animate-in zoom-in-95">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400">
              <Compass className="h-4 w-4" />
              <span>{trip.durationDays} {t('daysUnit')} • {trip.nightsCount} {t('nightsUnit')}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              {translateTripText(trip.name, language)}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {translateTripText(trip.summary, language)}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {trip.destinations.map(d => (
                <span key={d.id} className="rounded-xl bg-slate-800/80 px-4 py-2 text-xs font-bold text-amber-300">
                  📍 {translateDestinationName(d.name, language)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 1: DESTINATIONS OVERVIEW */}
        {currentSlide === 1 && (
          <div className="max-w-4xl w-full space-y-6 animate-in fade-in">
            <div className="text-center">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{t('tagline')}</span>
              <h2 className="text-3xl font-black mt-1">{t('itineraryDetailedTitle')}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4">
              {trip.destinations.map((d, i) => (
                <div key={d.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{d.nightsCount} {t('nightsUnit')}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white">{translateDestinationName(d.name, language)}</h3>
                  <div className="pt-2 text-xs text-slate-400 space-y-1">
                    {d.highlightAttractions?.map((a, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDES 2..N: DAILY ITINERARY */}
        {currentSlide >= 2 && currentSlide < 2 + trip.days.length && (() => {
          const dayIndex = currentSlide - 2;
          const day = trip.days[dayIndex];
          if (!day) return null;

          return (
            <div className="max-w-4xl w-full space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 font-black text-slate-950 text-base">
                    {day.dayNumber}
                  </span>
                  <div>
                    <h2 className="text-2xl font-black text-white">{translateTripText(day.title, language)}</h2>
                    <span className="text-xs text-amber-400">📍 {translateDestinationName(day.destinationName, language)}</span>
                  </div>
                </div>
              </div>

              {/* Day Activities */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {day.morningActivity && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-xs font-bold text-amber-400">{t('morningActivity')}:</span>
                    <p className="mt-2 text-xs text-slate-300">{day.morningActivity}</p>
                  </div>
                )}
                {day.afternoonActivity && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-xs font-bold text-amber-400">{t('afternoonActivity')}:</span>
                    <p className="mt-2 text-xs text-slate-300">{day.afternoonActivity}</p>
                  </div>
                )}
                {day.eveningActivity && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-xs font-bold text-amber-400">{t('eveningActivity')}:</span>
                    <p className="mt-2 text-xs text-slate-300">{day.eveningActivity}</p>
                  </div>
                )}
              </div>

              {/* Stations List */}
              {day.stations && day.stations.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-400">{t('stationsTitle')}:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {day.stations.map(st => (
                      <div key={st.id} className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-2.5 text-xs">
                        <span className="font-mono font-bold text-amber-400">{st.time || '09:00'}</span>
                        <span className="font-bold text-white">{st.name}</span>
                        {st.durationMinutes && <span className="text-[10px] text-slate-400">({st.durationMinutes} {t('minutesUnit')})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* SLIDE N+1: INCLUSIONS & EXCLUSIONS */}
        {currentSlide === 2 + trip.days.length && (
          <div className="max-w-4xl w-full space-y-6 animate-in fade-in">
            <div className="text-center">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{t('slideDetailsTitle')}</span>
              <h2 className="text-3xl font-black mt-1">{t('slideIncludedExcludedTitle')}</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-4">
              <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/30 p-6 space-y-3">
                <h3 className="font-bold text-emerald-300 text-sm">{t('publicInclusions')}:</h3>
                <ul className="space-y-2 text-xs text-emerald-200/90">
                  {trip.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{translateInclusion(inc, language)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-red-800/60 bg-red-950/30 p-6 space-y-3">
                <h3 className="font-bold text-red-300 text-sm">{t('publicExclusions')}:</h3>
                <ul className="space-y-2 text-xs text-red-200/90">
                  {trip.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>{translateExclusion(exc, language)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE N+2: CONTACT & CLOSING */}
        {currentSlide === 2 + trip.days.length + 1 && (
          <div className="max-w-2xl text-center space-y-6 animate-in fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500 text-slate-950 shadow-xl">
              <ShieldCheck className="h-9 w-9" />
            </div>

            <h2 className="text-3xl font-black">{t('slideReadyToCreateMemories')}</h2>
            <p className="text-sm text-slate-300">
              {t('slideReadyDesc')}
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentSlide(0)}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                {isRtl ? 'إعادة العرض من البداية' : 'Restart Presentation'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Navigation Arrows */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 backdrop-blur-md border-t border-slate-800">
        <button
          type="button"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex items-center gap-1 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-30 transition-colors"
        >
          {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <span>{t('prevSlide')}</span>
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-6 bg-amber-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="flex items-center gap-1 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 disabled:opacity-30 transition-colors"
        >
          <span>{t('nextSlide')}</span>
          {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
