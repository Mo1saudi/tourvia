import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Mail,
  Phone,
  User as UserIcon,
  Building2,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Copy,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { MathChallengeModal } from '../components/MathChallengeModal';
import { TourviaLogo } from '../components/TourviaLogo';
import { ProofDocumentUploader } from '../components/ProofDocumentUploader';
import { WorkingLanguage } from '../types';

interface AuthViewProps {
  initialMode?: 'login' | 'register' | 'recover';
  onNavigate: (view: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login', onNavigate }) => {
  const { login } = useAuth();
  const { t, isRtl, availableLanguages } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register' | 'recover'>(initialMode);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Math Challenge State
  const [isMathModalOpen, setIsMathModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'login' | 'register' | null>(null);

  // Registration Generated Recovery Code Modal
  const [generatedRecoveryCode, setGeneratedRecoveryCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [identifier, setIdentifier] = useState(''); // for login
  const [accountType, setAccountType] = useState<'guide' | 'company'>('guide');
  const [selectedLanguages, setSelectedLanguages] = useState<WorkingLanguage[]>(['ar', 'en']);
  const [proofDocumentUrl, setProofDocumentUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyTagline, setCompanyTagline] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);

  // Recovery Fields
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [newPin, setNewPin] = useState('');

  const toggleLanguage = (code: WorkingLanguage) => {
    if (selectedLanguages.includes(code)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter(c => c !== code));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, code]);
    }
  };

  const handleTriggerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier || !pin) {
      setError('يرجى إدخال البريد الإلكتروني أو الهاتف والرمز السري.');
      return;
    }
    setPendingAction('login');
    setIsMathModalOpen(true);
  };

  const handleTriggerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !phone || !pin) {
      setError('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }
    if (pin.length !== 6) {
      setError('يجب أن يتكون الرمز السري من 6 أرقام بالضبط.');
      return;
    }
    setPendingAction('register');
    setIsMathModalOpen(true);
  };

  const handleMathSuccess = async (challengeId: string, answer: number) => {
    setIsMathModalOpen(false);
    setIsLoading(true);
    setError('');

    try {
      if (pendingAction === 'login') {
        const res = await api.login({
          identifier,
          pin,
          mathChallengeId: challengeId,
          mathAnswer: answer,
          rememberDevice,
        });
        login(res);
        onNavigate('dashboard');
      } else if (pendingAction === 'register') {
        const res = await api.register({
          name,
          email,
          phone,
          pin,
          accountType,
          workingLanguages: selectedLanguages,
          proofDocumentUrl,
          companyName: accountType === 'company' ? companyName : undefined,
          companyTagline: accountType === 'company' ? companyTagline : undefined,
          mathChallengeId: challengeId,
          mathAnswer: answer,
        });
        login(res);
        setGeneratedRecoveryCode(res.recoveryCode);
      }
    } catch (err: any) {
      setError(err.message || 'فشلت العملية، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await api.recoverPin({
        identifier: recoveryIdentifier,
        recoveryCode: recoveryCodeInput,
        newPin,
      });
      setSuccessMsg(res.message);
      setTimeout(() => {
        setMode('login');
        setIdentifier(recoveryIdentifier);
        setPin(newPin);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'رمز الاستعادة غير صالح.');
    } finally {
      setIsLoading(false);
    }
  };

  // If new user registered, display Recovery Code Safety Modal
  if (generatedRecoveryCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
            تم إنشاء حسابك بنجاح!
          </h2>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            احتفظ برمز الاستعادة السري الخاص بحسابك في مكان آمن لاسترجاع حسابك في حال نسيان الرمز السري:
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3.5 dark:border-amber-900 dark:bg-amber-950/40">
            <span className="font-mono text-sm font-black text-amber-900 dark:text-amber-300">
              {generatedRecoveryCode}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(generatedRecoveryCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copiedCode ? 'تم النسخ' : 'نسخ'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setGeneratedRecoveryCode(null);
              onNavigate('dashboard');
            }}
            className="mt-6 w-full rounded-xl bg-slate-950 py-3 text-xs font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            الانتقال إلى لوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 py-12 px-4 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-md ring-1 ring-slate-200 dark:bg-[#0B1736] dark:ring-amber-500/20">
            <TourviaLogo size={52} variant="mark" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {mode === 'login' && t('loginTitle')}
            {mode === 'register' && t('registerTitle')}
            {mode === 'recover' && t('recoverPin')}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' && 'أدخل بيانات الدخول والرمز السري المكون من 6 أرقام'}
            {mode === 'register' && 'سجّل كمرشد أو شركة سياحة واحصل على 3 برامج ذكية مجانًا'}
            {mode === 'recover' && t('recoveryCodeHint')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleTriggerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('emailOrPhone')}
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="tamer.guide@tourvia.app أو 01012345678"
                    className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('pin')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('recover');
                      setError('');
                    }}
                    className="text-[11px] font-semibold text-amber-600 hover:underline dark:text-amber-400"
                  >
                    {t('forgotPin')}
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="••••••"
                    className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-center text-lg tracking-widest text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  {t('pinHint')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={e => setRememberDevice(e.target.checked)}
                    className="rounded-sm accent-amber-500"
                  />
                  <span>{t('rememberDevice')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 transition-transform active:scale-98"
              >
                <Lock className="h-4 w-4" />
                <span>{isLoading ? t('loading') : t('ctaGuideLogin')}</span>
              </button>

              {/* Quick Admin & Demo Login Badges */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-3.5 dark:border-purple-900/40 dark:bg-purple-950/30">
                <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950 dark:text-purple-200">
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                    <span>حسابات الوصول السريع التجريبية / الإدارة</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-600 font-bold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md">
                    PIN: 123456
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('mohamedseo2002@gmail.com');
                      setPin('123456');
                      setError('');
                    }}
                    className="flex flex-col items-start rounded-xl border border-purple-200 bg-white p-2 text-right hover:border-purple-400 hover:bg-purple-50/50 dark:border-slate-800 dark:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-black text-purple-700 dark:text-purple-300">
                        🛡️ مدير النظام الأساسي (Mohamed)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 truncate w-full">
                      mohamedseo2002@gmail.com
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('tamer.guide@tourvia.app');
                      setPin('123456');
                      setError('');
                    }}
                    className="flex flex-col items-start rounded-xl border border-amber-200 bg-white p-2 text-right hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-800 dark:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-black text-amber-700 dark:text-amber-300">
                        🧭 مرشد سياحي معتمد (تامر)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 truncate w-full">
                      tamer.guide@tourvia.app
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
                >
                  {t('noAccount')}
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleTriggerRegister} className="space-y-4">
              {/* Account Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('accountType')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('guide')}
                    className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold transition-all ${
                      accountType === 'guide'
                        ? 'border-2 border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>مرشد سياحي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('company')}
                    className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold transition-all ${
                      accountType === 'company'
                        ? 'border-2 border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>شركة / وكالة سياحة</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="تامر المصري"
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {accountType === 'company' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    اسم الشركة أو الوكالة السياحية
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="مثال: Nile Wonders Tours"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="guide@example.com"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+201012345678"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('pin')} (6 أرقام) *
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="••••••"
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-center text-lg tracking-widest text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Working Languages Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('workingLanguages')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableLanguages.map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => toggleLanguage(l.code)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                        selectedLanguages.includes(l.code)
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {l.nativeName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tourism Proof Document Uploader */}
              <ProofDocumentUploader
                value={proofDocumentUrl}
                onChange={setProofDocumentUrl}
                label={t('tourismProof')}
                hint={t('tourismProofHint')}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 transition-transform active:scale-98"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isLoading ? t('loading') : t('ctaRegister')}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
                >
                  {t('haveAccount')}
                </button>
              </div>
            </form>
          )}

          {/* RECOVER PIN FORM */}
          {mode === 'recover' && (
            <form onSubmit={handleRecoverPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('emailOrPhone')}
                </label>
                <input
                  type="text"
                  required
                  value={recoveryIdentifier}
                  onChange={e => setRecoveryIdentifier(e.target.value)}
                  placeholder="البريد الإلكتروني أو الهاتف المسجل"
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('recoveryCode')}
                </label>
                <input
                  type="text"
                  required
                  value={recoveryCodeInput}
                  onChange={e => setRecoveryCodeInput(e.target.value)}
                  placeholder="TRV-XXXX-XXXX-XX"
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-xs uppercase text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  الرمز السري الجديد (6 أرقام)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder="••••••"
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-center text-lg tracking-widest text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400"
              >
                <KeyRound className="h-4 w-4" />
                <span>{isLoading ? t('loading') : 'تعيين الرمز السري الجديد'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security Math Challenge Modal */}
      <MathChallengeModal
        isOpen={isMathModalOpen}
        onSuccess={handleMathSuccess}
        onCancel={() => setIsMathModalOpen(false)}
      />
    </div>
  );
};
