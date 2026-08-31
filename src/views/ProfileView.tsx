import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Award,
  Key,
  Globe,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Save,
  Sun,
  Moon,
  Palette,
  Scale,
  Languages,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { ProofDocumentUploader } from '../components/ProofDocumentUploader';

const AVAILABLE_GUIDE_LANGUAGES = [
  'English',
  'العربية (Arabic)',
  'Français (French)',
  'Deutsch (German)',
  'Italiano (Italian)',
  'Español (Spanish)',
  'Русский (Russian)',
  '中文 (Chinese)',
  '日本語 (Japanese)',
  'Português (Portuguese)',
  'Polski (Polish)',
  'Türkçe (Turkish)',
  'Nederlands (Dutch)',
  'Čeština (Czech)'
];

export const ProfileView: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { t, isRtl, language, setLanguage, availableLanguages } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyTagline, setCompanyTagline] = useState(user?.companyTagline || '');
  const [syndicateNumber, setSyndicateNumber] = useState(user?.syndicateNumber || '');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || '');
  const [proofDocumentUrl, setProofDocumentUrl] = useState(user?.proofDocumentUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [workingLanguages, setWorkingLanguages] = useState<string[]>(user?.workingLanguages || ['العربية', 'English']);
  const [authorizedLanguages, setAuthorizedLanguages] = useState<string[]>(user?.authorizedLanguages || ['English', 'العربية (Arabic)']);
  const [complianceAccepted, setComplianceAccepted] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(false);

  const toggleAuthorizedLang = (lang: string) => {
    if (authorizedLanguages.includes(lang)) {
      setAuthorizedLanguages(authorizedLanguages.filter(l => l !== lang));
    } else {
      setAuthorizedLanguages([...authorizedLanguages, lang]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await api.updateProfile({
        name,
        phone,
        companyName,
        companyTagline,
        syndicateNumber,
        licenseNumber,
        proofDocumentUrl,
        bio,
        workingLanguages,
        authorizedLanguages,
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'فشل حفظ التعديلات.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!syndicateNumber && !licenseNumber) {
      alert('يرجى كتابة رقم ترخيص الإرشاد أو رقم القيد بالنقابة أولاً.');
      return;
    }
    if (!complianceAccepted) {
      alert('يرجى الموافقة على إقرار الالتزام بالضوابط والترخيص القانوني.');
      return;
    }
    try {
      await api.requestVerification({
        syndicateNumber,
        licenseNumber,
        proofDocumentUrl,
      });
      await refreshProfile();
      setVerificationRequested(true);
      alert('تم إرسال طلب التوثيق إلى إدارة TOURVIA بنجاح. سيتم مراجعة بياناتك والتحقق من الترخيص خلال 24 ساعة.');
    } catch (err: any) {
      alert(err.message || 'فشل إرسال طلب التوثيق.');
    }
  };

  return (
    <div id="profile-view-root" className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
          الملف الشخصي وإعدادات الحساب
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          إدارة بياناتك المهنية، ترخيص نقابة المرشدين السياحيين، والعلامة التجارية.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Status Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  user?.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-500 text-white'
                    : user?.verificationStatus === 'PENDING_VERIFICATION'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  حالة التوثيق والاعتماد المهني
                </h3>
                <p className="text-xs text-slate-500">
                  {user?.verificationStatus === 'VERIFIED'
                    ? 'حسابك موثق كمرشد سياحي معتمد رسميًا بختم الموثوقية.'
                    : user?.verificationStatus === 'PENDING_VERIFICATION'
                    ? 'طلب التوثيق قيد المراجعة والتدقيق بواسطة فريق TOURVIA.'
                    : 'قم بتقديم بيانات الترخيص للحصول على علامة المرشد المعتمد وزيادة ثقة العملاء.'}
                </p>
              </div>
            </div>

            {user?.verificationStatus === 'VERIFIED' ? (
              <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ معتمد رسميًا
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestVerification}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                {user?.verificationStatus === 'PENDING_VERIFICATION' ? 'تحديث مستندات التوثيق' : 'طلب التوثيق الآن'}
              </button>
            )}
          </div>
        </div>

        {/* Basic Personal Info */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">البيانات الأساسية</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الاسم الكامل *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">رقم الهاتف / واتساب *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">اسم الشركة أو المكتب التجاري (اختياري)</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="وكالة النيل للسياحة"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الشعار أو الوصف المختصر</label>
              <input
                type="text"
                value={companyTagline}
                onChange={e => setCompanyTagline(e.target.value)}
                placeholder="خبراء السياحة الثقافية والتاريخية"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">نبذة تعريفية للمسافرين (Bio)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="مرشد سياحي معتمد بخبرة أكثر من 10 سنوات في المعالم الأثرية والمتاحف..."
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* License & Syndicate Info */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-500" />
              <span>بيانات الترخيص والنقابة والامتثال القانوني</span>
            </h3>
            <span className="text-[11px] text-slate-400">قانون الإرشاد السياحي المصري رقم 121 لسنة 1983</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">رقم ترخيص وزارة السياحة والآثار</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                placeholder="EGY-GUIDE-8842"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">رقم عضوية نقابة المرشدين السياحيين</label>
              <input
                type="text"
                value={syndicateNumber}
                onChange={e => setSyndicateNumber(e.target.value)}
                placeholder="SYN-10492"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Authorized Guiding Languages (As on official license) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Languages className="h-4 w-4 text-amber-500" />
              <span>لغات الإرشاد المعتمدة في ترخيصك الرسمي (Authorized Guiding Languages):</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              حدد اللغات المصرح لك رسمياً بالإرشاد بها كما هي مدونة في كارنيه وزارة السياحة والنقابة:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_GUIDE_LANGUAGES.map(lang => {
                const isSelected = authorizedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleAuthorizedLang(lang)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-2xs ring-1 ring-amber-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {isSelected ? `✓ ${lang}` : `+ ${lang}`}
                  </button>
                );
              })}
            </div>
          </div>

          <ProofDocumentUploader
            value={proofDocumentUrl}
            onChange={setProofDocumentUrl}
            label={isRtl ? 'صورة ترخيص الإرشاد / الكارنيه (Proof Document)' : 'Guide License / Syndicate Card'}
            hint={
              isRtl
                ? 'ملاحظة أمنية: هذا المستند يُستخدم فقط للتحقيق الإداري من قبل إدارة TOURVIA ولا يتم نشره للعامة مطلقاً.'
                : 'Security Notice: This document is strictly used by TOURVIA administration for verification and will never be published publicly.'
            }
          />

          {/* Legal Compliance Declaration Checkbox */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={complianceAccepted}
                onChange={e => setComplianceAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-[11px] font-medium text-amber-950 dark:text-amber-200 leading-relaxed">
                <strong>إقرار الامتثال والمسؤولية المهنية:</strong> أقر بأنني أحمل ترخيصاً سارياً للإرشاد السياحي صادر من وزارة السياحة والآثار المصرية ومقيد بنقابة المرشدين باللغات المحددة أعلاه، وأتحمل كامل المسؤولية القانونية والأخلاقية عن صحة المعلومات والبرامج والأسعار المنشورة عبر حسابي.
              </span>
            </label>
          </div>
        </div>

        {/* Appearance & Theme Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('appAppearance')}</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('themeDescription')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-xs font-bold ${
                theme === 'light'
                  ? 'border-amber-500 bg-amber-50/70 text-slate-950 dark:bg-amber-950/40 dark:text-amber-200 ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Sun className="h-4 w-4" />
                </div>
                <span>{t('themeLight')}</span>
              </div>
              {theme === 'light' && <CheckCircle className="h-4 w-4 text-amber-500" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-xs font-bold ${
                theme === 'dark'
                  ? 'border-amber-500 bg-amber-50/70 text-slate-950 dark:bg-amber-950/40 dark:text-amber-200 ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-amber-400 dark:bg-slate-700 dark:text-amber-400">
                  <Moon className="h-4 w-4" />
                </div>
                <span>{t('themeDark')}</span>
              </div>
              {theme === 'dark' && <CheckCircle className="h-4 w-4 text-amber-500" />}
            </button>
          </div>
        </div>

        {/* Security & Recovery Key */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">رمز الاسترداد الآمن (Emergency Recovery Key)</h3>
          </div>
          <p className="text-xs text-slate-500">
            احتفظ بهذا الرمز في مكان آمن لاستعادة حسابك في حالة فقدان كلمة المرور:
          </p>
          <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3 font-mono text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <span>{user?.recoveryCode || 'TRV-REC-8924-XXXX'}</span>
            <span className="text-[10px] text-slate-400">مشفر ومحمي</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              تم حفظ التعديلات بنجاح!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
