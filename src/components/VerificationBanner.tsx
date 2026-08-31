import React from 'react';
import { ShieldAlert, ShieldCheck, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export const VerificationBanner: React.FC<{ onNavigateToProfile?: () => void }> = ({ onNavigateToProfile }) => {
  const { user, aiUsage } = useAuth();
  const { t } = useLanguage();

  if (!user || user.verificationStatus === 'VERIFIED') return null;

  const isPending = user.verificationStatus === 'PENDING_VERIFICATION';
  const isRejected = user.verificationStatus === 'REJECTED';

  const freeRemaining = aiUsage ? Math.max(0, (aiUsage.lifetimeLimit || 3) - aiUsage.lifetimeUsed) : 3;

  return (
    <div
      id="verification-status-banner"
      className={`relative border-b px-4 py-3 sm:px-6 ${
        isPending
          ? 'border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200'
          : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="mt-0.5 shrink-0 sm:mt-0">
            {isPending ? (
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <span className="font-bold">
              {isPending ? t('statusPending') : t('statusRejected')}
            </span>
            <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
              {isPending
                ? `${t('verificationPendingMsg')} (${t('aiFreeRemaining', { count: freeRemaining })})`
                : `${t('verificationRejectedMsg')} ${user.verificationNote || 'يرجى إعادة رفع إثبات ترخيص الإرشاد أو كارنيه النقابة.'}`}
            </p>
          </div>
        </div>

        {onNavigateToProfile && (
          <button
            type="button"
            onClick={onNavigateToProfile}
            className="flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs ring-1 ring-slate-900/10 hover:bg-white dark:bg-slate-800 dark:text-white dark:ring-slate-700"
          >
            <span>{isPending ? 'عرض تفاصيل الملف' : 'تحديث مستند التوثيق'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
