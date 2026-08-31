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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';

export const ProfileView: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyTagline, setCompanyTagline] = useState(user?.companyTagline || '');
  const [syndicateNumber, setSyndicateNumber] = useState(user?.syndicateNumber || '');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || '');
  const [proofDocumentUrl, setProofDocumentUrl] = useState(user?.proofDocumentUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [workingLanguages, setWorkingLanguages] = useState<string[]>(user?.workingLanguages || ['العربية', 'English']);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(false);

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
    try {
      await api.requestVerification({
        syndicateNumber,
        licenseNumber,
        proofDocumentUrl,
      });
      await refreshProfile();
      setVerificationRequested(true);
      alert('تم إرسال طلب التوثيق إلى إدارة TOURVIA بنجاح. سيتم مراجعة بياناتك خلال 24 ساعة.');
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">بيانات الترخيص والنقابة</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">رقم ترخيص وزارة السياحة</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                placeholder="EGY-GUIDE-8842"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">رقم عضوية نقابة المرشدين</label>
              <input
                type="text"
                value={syndicateNumber}
                onChange={e => setSyndicateNumber(e.target.value)}
                placeholder="SYN-10492"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              رابط صورة ترخيص الإرشاد / الكارنيه (Proof Document URL)
            </label>
            <input
              type="url"
              value={proofDocumentUrl}
              onChange={e => setProofDocumentUrl(e.target.value)}
              placeholder="https://... (رابط سحابي أو مباشر لصورة الكارنيه)"
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
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
