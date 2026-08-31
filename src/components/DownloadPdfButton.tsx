import React, { useState } from 'react';
import { Download, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Trip, User, WorkingLanguage } from '../types';
import { exportTripToPdf } from '../utils/pdfExport';
import { useLanguage } from '../i18n/LanguageContext';

interface DownloadPdfButtonProps {
  trip: Trip;
  guide?: Partial<User> | null;
  variant?: 'primary' | 'secondary' | 'compact' | 'icon' | 'hero';
  className?: string;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

export const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({
  trip,
  guide,
  variant = 'primary',
  className = '',
  onSuccess,
  onError,
}) => {
  const { t, language } = useLanguage();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setIsSuccess(false);

    try {
      await exportTripToPdf(trip, {
        guide,
        language: language as WorkingLanguage,
        companyName: guide?.companyName || guide?.name,
        phone: guide?.phone,
        email: guide?.email,
        sellingPrice: trip.sellingPrice || trip.costs?.sellingPrice,
        currency: trip.currency || trip.costs?.currency,
        notes: trip.notes,
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to export PDF:', err);
      if (onError) onError(err);
      else alert(t('pdfExportError') || 'Failed to download PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  // Icon only
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isExporting}
        title={t('downloadPdf')}
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors disabled:opacity-50 ${className}`}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        ) : isSuccess ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </button>
    );
  }

  // Compact navbar pill
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isExporting}
        className={`flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-500 hover:text-slate-950 dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-slate-950 transition-all shadow-xs disabled:opacity-50 ${className}`}
      >
        {isExporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isSuccess ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        <span>{isExporting ? t('loading') : t('downloadPdf')}</span>
      </button>
    );
  }

  // Hero prominent CTA
  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isExporting}
        className={`flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg hover:bg-amber-400 transition-all hover:scale-102 disabled:opacity-50 ${className}`}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSuccess ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{isExporting ? t('generatingPdf') : isSuccess ? t('pdfExportSuccess') : t('downloadPdfItinerary')}</span>
      </button>
    );
  }

  // Secondary style
  if (variant === 'secondary') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isExporting}
        className={`flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 ${className}`}
      >
        {isExporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
        ) : isSuccess ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-amber-500" />
        )}
        <span>{isExporting ? t('generatingPdf') : t('downloadPdf')}</span>
      </button>
    );
  }

  // Primary Default
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isExporting}
      className={`flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 transition-all disabled:opacity-50 ${className}`}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSuccess ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>{isExporting ? t('generatingPdf') : isSuccess ? t('pdfExportSuccess') : t('downloadPdf')}</span>
    </button>
  );
};
