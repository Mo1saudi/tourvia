import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

interface MathChallengeModalProps {
  isOpen: boolean;
  onSuccess: (challengeId: string, answer: number) => void;
  onCancel: () => void;
  title?: string;
}

export const MathChallengeModal: React.FC<MathChallengeModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  title,
}) => {
  const { t, isRtl } = useLanguage();
  const [challengeId, setChallengeId] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes countdown

  const fetchChallenge = async () => {
    setIsLoading(true);
    setError('');
    setUserAnswer('');
    try {
      const data = await api.getMathChallenge();
      setChallengeId(data.challengeId);
      setQuestion(data.question);
      setTimeLeft(180);
    } catch (err: any) {
      setError(err.message || 'Failed to load security challenge.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChallenge();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          fetchChallenge(); // auto-refresh when expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswer = userAnswer.trim().replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
    const num = parseInt(cleanAnswer, 10);

    if (isNaN(num)) {
      setError(t('mathChallengeWrong'));
      return;
    }

    onSuccess(challengeId, num);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div
      id="math-challenge-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="math-challenge-dialog"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-slate-800"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {title || t('mathChallenge')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                التحقق الأمني لمنع الروبوتات وحماية المنصة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchChallenge}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            title="تحديث المسألة"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-4 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
              حل المعادلة الرياضية للمتابعة:
            </span>
            <div className="mt-2 text-3xl font-extrabold tracking-widest text-slate-900 dark:text-white">
              {isLoading ? '...' : question}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              صلاحية المسألة: <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{formattedTime}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('mathChallengePlaceholder')}
            </label>
            <input
              type="text"
              autoFocus
              required
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="مثال: 11"
              className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-lg font-bold text-slate-900 shadow-xs focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !userAnswer.trim()}
              className="flex w-1/2 items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-amber-400 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>تأكيد ومتابعة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
