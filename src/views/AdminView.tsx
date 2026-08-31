import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Sparkles,
  Tag,
  Megaphone,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  Award,
  Filter,
  DollarSign,
  Compass,
  FileText,
  Eye,
  Sliders,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Check,
  X,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Settings,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Clock,
  ArrowUpRight,
  Archive,
  RefreshCcw,
  Zap,
  Scale,
} from 'lucide-react';
import { api } from '../services/api';
import { PromoCode, PaymentRequest, User, AuditLogItem, Campaign, AdminAiSettings, Trip } from '../types';
import { useAuth } from '../context/AuthContext';
import { ComplianceCenter } from '../components/admin/ComplianceCenter';
import { HomepageSettingsManager } from '../components/admin/HomepageSettingsManager';

type AdminTab =
  | 'overview'
  | 'compliance'
  | 'homepage'
  | 'users'
  | 'trips'
  | 'payments'
  | 'promos'
  | 'ai'
  | 'campaigns'
  | 'logs'
  | 'settings';

export const AdminView: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Core Data States
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [aiSettings, setAiSettings] = useState<AdminAiSettings>({
    freeAiLifetimeLimit: 3,
    aiProvider: 'gemini',
    aiModel: 'gemini-3.7-flash',
    allowDayRegeneration: true,
    dayRegenConsumesQuota: false,
    fallbackEnabled: true,
  });
  const [aiUsageStats, setAiUsageStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'guide' | 'company' | 'admin'>('all');
  const [userVerificationFilter, setUserVerificationFilter] = useState<'all' | 'VERIFIED' | 'PENDING_VERIFICATION' | 'REJECTED'>('all');

  const [tripSearch, setTripSearch] = useState('');
  const [tripStatusFilter, setTripStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [logSearch, setLogSearch] = useState('');

  // Interactive Modals
  const [selectedUserDetails, setSelectedUserDetails] = useState<any | null>(null);
  const [selectedTripDetails, setSelectedTripDetails] = useState<any | null>(null);

  const [rejectGuideModal, setRejectGuideModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [grantPlanModal, setGrantPlanModal] = useState<{ id: string; name: string } | null>(null);
  const [grantPlanId, setGrantPlanId] = useState('plan_pro');
  const [grantDays, setGrantDays] = useState(30);

  const [approvePaymentModal, setApprovePaymentModal] = useState<PaymentRequest | null>(null);
  const [approvePaymentNote, setApprovePaymentNote] = useState('');

  const [rejectPaymentModal, setRejectPaymentModal] = useState<PaymentRequest | null>(null);
  const [rejectPaymentNote, setRejectPaymentNote] = useState('');

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(20);
  const [newPromoFixed, setNewPromoFixed] = useState<number | undefined>(undefined);
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<number>(100);
  const [newPromoExpiry, setNewPromoExpiry] = useState('');

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignMessage, setNewCampaignMessage] = useState('');
  const [newCampaignPromoCode, setNewCampaignPromoCode] = useState('');
  const [newCampaignSegment, setNewCampaignSegment] = useState<'all' | 'guides' | 'companies'>('all');

  const [aiSettingsSaving, setAiSettingsSaving] = useState(false);

  // Auto clear status toast
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
  };

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [ovRes, uRes, tRes, pRes, prRes, cmpRes, logRes, aiRes, plRes, aiUsageRes] = await Promise.all([
        api.getAdminOverview().catch(() => ({})),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminTrips().catch(() => ({ trips: [] })),
        api.getAdminPayments().catch(() => ({ payments: [] })),
        api.getAdminPromos().catch(() => ({ promoCodes: [] })),
        api.getAdminCampaigns().catch(() => ({ campaigns: [] })),
        api.getAdminAuditLogs().catch(() => ({ auditLogs: [] })),
        api.getAdminAiSettings().catch(() => ({ aiSettings: null })),
        api.getAdminPlans().catch(() => ({ plans: [] })),
        api.getAdminAiUsage().catch(() => null),
      ]);

      setOverview(ovRes);
      setUsers(uRes.users || []);
      setTrips(tRes.trips || []);
      setPayments(pRes.payments || []);
      setPromos(prRes.promoCodes || []);
      setCampaigns(cmpRes.campaigns || []);
      setAuditLogs(logRes.auditLogs || []);
      if (aiRes.aiSettings) setAiSettings(aiRes.aiSettings);
      setPlans(plRes.plans || []);
      setAiUsageStats(aiUsageRes);
    } catch (err) {
      console.warn('Admin fetch error:', err);
      showToast('تعذر جلب بعض بيانات لوحة التحكم', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Handlers
  const handleVerifyGuide = async (userId: string) => {
    try {
      await api.verifyAdminGuide(userId, 'تم التحقق من بيانات واعتماد رخصة العمل السياحي بنجاح من إدارة TOURVIA.');
      showToast('تم توثيق المرشد السياحي وإرسال إشعار رسمي لحسابه');
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'فشل التوثيق', 'error');
    }
  };

  const handleRejectGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectGuideModal || !rejectReason.trim()) return;
    try {
      await api.rejectAdminGuide(rejectGuideModal.id, rejectReason.trim());
      showToast('تم رفض ملف التوثيق وإبلاغ المرشد بسبب الرفض');
      setRejectGuideModal(null);
      setRejectReason('');
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'فشل رفض التوثيق', 'error');
    }
  };

  const handleGrantPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantPlanModal) return;
    try {
      await api.grantAdminPlan(grantPlanModal.id, grantPlanId, Number(grantDays) || 30);
      showToast('تم تفعيل الباقة وترقية رصيد الذكاء الاصطناعي بنجاح');
      setGrantPlanModal(null);
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'فشل منح الباقة', 'error');
    }
  };

  const handleApprovePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvePaymentModal) return;
    try {
      await api.approveAdminPayment(approvePaymentModal.id, approvePaymentNote.trim() || 'تم تأكيد الاستلام وتفعيل الاشتراك فورًا.');
      showToast('تم اعتماد الدفع وتفعيل الباقة للمرشد');
      setApprovePaymentModal(null);
      setApprovePaymentNote('');
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'فشل اعتماد الدفع', 'error');
    }
  };

  const handleRejectPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectPaymentModal || !rejectPaymentNote.trim()) return;
    try {
      await api.rejectAdminPayment(rejectPaymentModal.id, rejectPaymentNote.trim());
      showToast('تم رفض طلب الدفع وإخطار المستخدم');
      setRejectPaymentModal(null);
      setRejectPaymentNote('');
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'فشل رفض الدفع', 'error');
    }
  };

  const handleCreatePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    try {
      await api.createAdminPromo({
        code: newPromoCode.trim().toUpperCase(),
        discountPercent: newPromoDiscount || undefined,
        fixedDiscount: newPromoFixed || undefined,
        maxUses: newPromoMaxUses || undefined,
        expiryDate: newPromoExpiry || undefined,
      });
      showToast('تم إنشاء كود الخصم بنجاح');
      setPromoModalOpen(false);
      setNewPromoCode('');
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'تعذر إنشاء الكود', 'error');
    }
  };

  const handleTogglePromoStatus = async (promo: PromoCode) => {
    try {
      await api.updateAdminPromo(promo.id, { isActive: !promo.isActive });
      showToast(`تم ${promo.isActive ? 'تعطيل' : 'تفعيل'} كود الخصم`);
      loadAll();
    } catch (err: any) {
      showToast('فشل تعديل حالة الكود', 'error');
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف كود الخصم هذا نهائيًا؟')) return;
    try {
      await api.deleteAdminPromo(promoId);
      showToast('تم حذف كود الخصم');
      loadAll();
    } catch (err: any) {
      showToast('فشل حذف الكود', 'error');
    }
  };

  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle.trim() || !newCampaignMessage.trim()) return;
    try {
      await api.createAdminCampaign({
        title: newCampaignTitle.trim(),
        message: newCampaignMessage.trim(),
        promoCode: newCampaignPromoCode.trim().toUpperCase() || undefined,
        targetSegment: newCampaignSegment,
      });
      showToast('تم إطلاق الحملة التسويقية وإرسال الإشعارات لجميع المستخدمين المستهدفين!');
      setCampaignModalOpen(false);
      setNewCampaignTitle('');
      setNewCampaignMessage('');
      setNewCampaignPromoCode('');
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'فشل إرسال الحملة', 'error');
    }
  };

  const handleSaveAiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiSettingsSaving(true);
    try {
      await api.updateAdminAiSettings(aiSettings);
      showToast('تم تحديث إعدادات محرك الذكاء الاصطناعي بنجاح');
      loadAll();
    } catch (err: any) {
      showToast('فشل حفظ إعدادات الذكاء الاصطناعي', 'error');
    } finally {
      setAiSettingsSaving(false);
    }
  };

  const handleToggleArchiveTrip = async (tripId: string) => {
    try {
      const res = await api.toggleArchiveAdminTrip(tripId);
      showToast(res.message || 'تم تحديث حالة الرحلة');
      loadAll();
    } catch (err: any) {
      showToast('تعذر تغيير حالة الأرشفة', 'error');
    }
  };

  const handleToggleUserAdminRole = async (user: User) => {
    const isCurrentlyAdmin = user.role === 'admin';
    const newRole = isCurrentlyAdmin ? 'user' : 'admin';
    const newAccountType = isCurrentlyAdmin ? 'guide' : 'admin';

    if (!window.confirm(`هل أنت متأكد من ${isCurrentlyAdmin ? 'إلغاء صلاحية الإدارة عن' : 'ترقية المستخدم إلى رتبة مدير نظام'} ${user.name}؟`)) {
      return;
    }

    try {
      await api.updateAdminUser(user.id, { role: newRole, accountType: newAccountType });
      showToast(`تم ${isCurrentlyAdmin ? 'إلغاء رتبة الإدارة' : 'الترقية لمدير نظام'} بنجاح`);
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'فشل تغيير الصلاحية', 'error');
    }
  };

  // Filtered Lists
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        !userSearch.trim() ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone?.includes(userSearch) ||
        u.companyName?.toLowerCase().includes(userSearch.toLowerCase());

      const matchRole =
        userRoleFilter === 'all' ||
        u.accountType === userRoleFilter ||
        (userRoleFilter === 'admin' && u.role === 'admin');

      const matchVerif =
        userVerificationFilter === 'all' || u.verificationStatus === userVerificationFilter;

      return matchSearch && matchRole && matchVerif;
    });
  }, [users, userSearch, userRoleFilter, userVerificationFilter]);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const matchSearch =
        !tripSearch.trim() ||
        t.name?.toLowerCase().includes(tripSearch.toLowerCase()) ||
        t.guideName?.toLowerCase().includes(tripSearch.toLowerCase()) ||
        t.summary?.toLowerCase().includes(tripSearch.toLowerCase()) ||
        (t.destinations && t.destinations.some((d: any) => d.name?.toLowerCase().includes(tripSearch.toLowerCase()) || d.nameAr?.includes(tripSearch)));

      const matchStatus =
        tripStatusFilter === 'all' ||
        (tripStatusFilter === 'published' && t.status === 'published' && !t.isArchived) ||
        (tripStatusFilter === 'draft' && t.status === 'draft' && !t.isArchived) ||
        (tripStatusFilter === 'archived' && t.isArchived);

      return matchSearch && matchStatus;
    });
  }, [trips, tripSearch, tripStatusFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (paymentStatusFilter === 'all') return true;
      return p.status === paymentStatusFilter;
    });
  }, [payments, paymentStatusFilter]);

  const filteredAuditLogs = useMemo(() => {
    if (!logSearch.trim()) return auditLogs;
    const q = logSearch.toLowerCase();
    return auditLogs.filter(
      l =>
        l.action?.toLowerCase().includes(q) ||
        l.userEmail?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q)
    );
  }, [auditLogs, logSearch]);

  const metrics = overview?.metrics || {};

  return (
    <div id="admin-control-center-root" className="space-y-6 pb-20">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 shadow-xl text-xs font-black transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Admin Header Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  مركز إدارة وتشغيل منصة TOURVIA
                </h1>
                <span className="rounded-full bg-purple-100 px-3 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  Control Center PRO
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  النظام سليم ومباشر
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                المسؤول الحالي: <span className="font-bold text-slate-800 dark:text-slate-200">{currentAdmin?.name || 'Administrator'}</span> ({currentAdmin?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={loadAll}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث الفوري</span>
            </button>

            <button
              type="button"
              onClick={() => setPromoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>كود خصم جديد</span>
            </button>

            <button
              type="button"
              onClick={() => setCampaignModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 shadow-xs transition-colors"
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span>إطلاق حملة إعلانية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Sidebar & Content Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* ========================================================================= */}
        {/* ADMIN SIDEBAR NAVIGATION */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-20 space-y-4">
          {/* Admin Profile & System Status Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md font-black text-lg shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-black text-sm text-slate-900 dark:text-white truncate">
                    {currentAdmin?.name || 'مدير النظام'}
                  </h2>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    Super Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{currentAdmin?.email}</p>
              </div>
            </div>

            {/* Live System Status Pill */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-2 text-xs border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 font-medium">حالة المنصة:</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                سليم ومباشر
              </span>
            </div>

            {/* Quick Actions in Sidebar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPromoModalOpen(true)}
                className="flex items-center justify-center gap-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 px-2.5 py-2 text-[11px] font-bold transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>كود خصم</span>
              </button>
              <button
                type="button"
                onClick={() => setCampaignModalOpen(true)}
                className="flex items-center justify-center gap-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-900 dark:text-purple-300 px-2.5 py-2 text-[11px] font-bold transition-colors"
              >
                <Megaphone className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>إطلاق حملة</span>
              </button>
            </div>
          </div>

          {/* Grouped Vertical Sidebar Navigation Menu */}
          <nav className="rounded-3xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            {[
              {
                groupTitle: 'الرقابة والمؤشرات',
                items: [
                  { id: 'overview', label: 'لوحة المؤشرات العامة', icon: TrendingUp, count: null },
                  { id: 'compliance', label: 'مركز الامتثال والجاهزية', icon: Scale, count: null, highlight: true },
                  { id: 'logs', label: 'سجل العمليات والأمان', icon: History, count: null },
                ]
              },
              {
                groupTitle: 'إدارة العمليات',
                items: [
                  { id: 'users', label: 'المستخدمون والتوثيق', icon: Users, count: metrics.pendingVerifications },
                  { id: 'trips', label: 'البرامج والرحلات', icon: Compass, count: trips.length },
                  { id: 'payments', label: 'طلبات الدفع والاشتراكات', icon: CreditCard, count: metrics.pendingPayments },
                  { id: 'promos', label: 'أكواد الخصم والعروض', icon: Tag, count: promos.length },
                ]
              },
              {
                groupTitle: 'المحركات والنظام',
                items: [
                  { id: 'homepage', label: 'إعدادات وإحصائيات الرئيسية', icon: Sliders, count: null },
                  { id: 'ai', label: 'عمليات الذكاء الاصطناعي', icon: Sparkles, count: null },
                  { id: 'campaigns', label: 'الحملات والإشعارات', icon: Megaphone, count: campaigns.length },
                  { id: 'settings', label: 'إعدادات النظام والأسعار', icon: Settings, count: null },
                ]
              }
            ].map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {group.groupTitle}
                </div>
                <div className="space-y-1">
                  {group.items.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isCompliance = tab.id === 'compliance';

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as AdminTab)}
                        className={`w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all text-right ${
                          isActive
                            ? isCompliance
                              ? 'bg-amber-500 text-slate-950 shadow-xs ring-1 ring-amber-600/30 font-black'
                              : 'bg-purple-600 text-white shadow-xs font-black'
                            : isCompliance
                            ? 'bg-amber-50/60 text-amber-900 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:text-amber-300'
                            : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? isCompliance ? 'text-slate-950' : 'text-white'
                              : isCompliance ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
                          }`} />
                          <span className="truncate">{tab.label}</span>
                        </div>

                        {tab.count !== null && tab.count > 0 && (
                          <span
                            className={`flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full text-[10px] font-black shrink-0 ${
                              isActive
                                ? 'bg-white text-purple-700 shadow-2xs'
                                : 'bg-red-500 text-white shadow-2xs'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Quick Refresh Widget */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <button
              type="button"
              onClick={loadAll}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-purple-600' : 'text-slate-500'}`} />
              <span>{isLoading ? 'جاري المزامنة...' : 'تحديث البيانات الفوري'}</span>
            </button>
            <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
              <span>إجمالي الحسابات: {metrics.totalUsers || 0}</span>
              <span>البرامج: {trips.length}</span>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN WORKSPACE CONTENT AREA */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* Mobile Horizontal Quick Tab Selector (Visible on small screens) */}
          <div className="lg:hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex min-w-max gap-1">
              {[
                { id: 'overview', label: 'المؤشرات', icon: TrendingUp },
                { id: 'compliance', label: 'الامتثال', icon: Scale },
                { id: 'homepage', label: 'الرئيسية', icon: Sliders },
                { id: 'users', label: 'المستخدمون', icon: Users, count: metrics.pendingVerifications },
                { id: 'trips', label: 'البرامج', icon: Compass },
                { id: 'payments', label: 'المدفوعات', icon: CreditCard, count: metrics.pendingPayments },
                { id: 'promos', label: 'العروض', icon: Tag },
                { id: 'ai', label: 'الذكاء الاصطناعي', icon: Sparkles },
                { id: 'campaigns', label: 'الحملات', icon: Megaphone },
                { id: 'logs', label: 'السجلات', icon: History },
                { id: 'settings', label: 'الإعدادات', icon: Settings },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Top Header Banner */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
                  {activeTab === 'overview' && <TrendingUp className="h-5 w-5" />}
                  {activeTab === 'compliance' && <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                  {activeTab === 'users' && <Users className="h-5 w-5" />}
                  {activeTab === 'trips' && <Compass className="h-5 w-5" />}
                  {activeTab === 'payments' && <CreditCard className="h-5 w-5" />}
                  {activeTab === 'promos' && <Tag className="h-5 w-5" />}
                  {activeTab === 'ai' && <Sparkles className="h-5 w-5" />}
                  {activeTab === 'campaigns' && <Megaphone className="h-5 w-5" />}
                  {activeTab === 'logs' && <History className="h-5 w-5" />}
                  {activeTab === 'settings' && <Settings className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {activeTab === 'overview' && 'لوحة المؤشرات والتحليلات العامة'}
                    {activeTab === 'compliance' && 'مركز الامتثال والجاهزية التنظيمية (Compliance Center)'}
                    {activeTab === 'users' && 'إدارة المستخدمين والمرشدين وتوثيق التراخيص'}
                    {activeTab === 'trips' && 'كتالوج البرامج السياحية والرحلات المصممة'}
                    {activeTab === 'payments' && 'طلبات الدفع ومراجعة اشتراكات الباقات'}
                    {activeTab === 'promos' && 'إدارة أكواد الخصم والقسائم الترويجية'}
                    {activeTab === 'ai' && 'محركات الذكاء الاصطناعي والحصص التشغيلية'}
                    {activeTab === 'campaigns' && 'الحملات التسويقية والإشعارات الجماعية'}
                    {activeTab === 'logs' && 'سجل الأمان والتدقيق الإداري المفصل'}
                    {activeTab === 'settings' && 'إعدادات النظام العامة وباقات الاشتراك'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeTab === 'overview' && 'نظرة شاملة ومباشرة على أداء المنصة والحسابات النشطة'}
                    {activeTab === 'compliance' && 'متابعة شروط قانون الإرشاد السياحي المصري وضوابط المواقع الأثرية'}
                    {activeTab === 'users' && 'مراجعة طلبات التوثيق الرسمية وإدارة صلاحيات الحسابات'}
                    {activeTab === 'trips' && 'عرض وفحص الرحلات المنشورة وإحصائيات المشاهدات العامة'}
                    {activeTab === 'payments' && 'التحقق من إيصالات التحويل البنكي وتفعيل الباقات تلقائياً'}
                    {activeTab === 'promos' && 'إنشاء وتخصيص كوبونات الخصم للمرشدين والشركات'}
                    {activeTab === 'ai' && 'ضبط نماذج Gemini وسياسات إعادة التوليد والحصص المجانية'}
                    {activeTab === 'campaigns' && 'إرسال تنبيهات وعروض مباشرة لجميع المسجلين في المنصة'}
                    {activeTab === 'logs' && 'تتبع كافة التغييرات والإجراءات الإدارية لحظة بلحظة'}
                    {activeTab === 'settings' && 'تعديل أسعار الباقات وخيارات الأمان وبوابات الدفع'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={loadAll}
                  disabled={isLoading}
                  title="تحديث البيانات"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
                </button>
              </div>
            </div>
          </div>

      {/* ========================================================================= */}
      {/* 0. COMPLIANCE & REGULATORY READINESS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'compliance' && (
        <ComplianceCenter onRefreshParent={loadAll} />
      )}

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">إجمالي الحسابات</span>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {metrics.totalUsers || 0}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">مرشدين وشركات</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">مرشدين موثقين</span>
                <Award className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {metrics.verifiedGuides || 0}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">رخص سياحية معتمدة</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">بانتظار التوثيق</span>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-500">
                {metrics.pendingVerifications || 0}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">مستندات جاهزة للمراجعة</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">إجمالي البرامج</span>
                <Compass className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {metrics.totalTrips || 0}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{metrics.publishedTrips || 0} منشور أونلاين</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">توليدات الذكاء الاصطناعي</span>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
                {metrics.totalAiGenerations || 0}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">برنامج تم تصميمه بالذكاء</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">إجمالي الإيرادات</span>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">
                {(metrics.totalRevenue || 0).toLocaleString()} <span className="text-xs font-normal">EGP</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{metrics.pendingPayments || 0} طلب قيد الانتظار</p>
            </div>
          </div>

          {/* Attention / Action Alerts */}
          {(metrics.pendingVerifications > 0 || metrics.pendingPayments > 0) && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      إجراءات إدارية تتطلب اهتمامك الفوري
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      يوجد {metrics.pendingVerifications || 0} طلب توثيق مرشد و {metrics.pendingPayments || 0} طلب دفع باقة بانتظار الاعتماد.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {metrics.pendingVerifications > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('users')}
                      className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
                    >
                      مراجعة المرشدين ({metrics.pendingVerifications})
                    </button>
                  )}
                  {metrics.pendingPayments > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('payments')}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      مراجعة المدفوعات ({metrics.pendingPayments})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Two Columns: Recent Operations & Quick Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Audit Feed */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-purple-600" />
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    سجل العمليات والأنشطة الإدارية الأخيرة
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                >
                  <span>عرض الكل</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">لا توجد عمليات مسجلة حتى الآن.</p>
                ) : (
                  auditLogs.slice(0, 7).map(log => (
                    <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {log.action}
                          </span>
                          <span className="text-[11px] text-slate-500">{log.userEmail}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions & Platform Status */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-purple-600" />
                  <span>إجراءات سريعة</span>
                </h3>
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => setPromoModalOpen(true)}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 p-3 text-xs font-bold text-slate-800 hover:bg-purple-50 hover:border-purple-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-purple-950/30 transition-all text-right"
                  >
                    <span>+ إنشاء كود خصم ترويجي</span>
                    <Tag className="h-4 w-4 text-amber-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCampaignModalOpen(true)}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 p-3 text-xs font-bold text-slate-800 hover:bg-purple-50 hover:border-purple-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-purple-950/30 transition-all text-right"
                  >
                    <span>+ إطلاق إشعار وحملة لجميع المرشدين</span>
                    <Megaphone className="h-4 w-4 text-purple-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 p-3 text-xs font-bold text-slate-800 hover:bg-purple-50 hover:border-purple-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-purple-950/30 transition-all text-right"
                  >
                    <span>فحص المرشدين وطلبات التوثيق</span>
                    <Award className="h-4 w-4 text-emerald-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 p-3 text-xs font-bold text-slate-800 hover:bg-purple-50 hover:border-purple-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-purple-950/30 transition-all text-right"
                  >
                    <span>مراقبة محرك الذكاء الاصطناعي والحصص</span>
                    <Sparkles className="h-4 w-4 text-blue-500" />
                  </button>
                </div>
              </div>

              {/* Engine Status Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <span>حالة خدمات المنصة</span>
                </h3>
                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">محرك الذكاء الاصطناعي:</span>
                    <span className="font-bold text-purple-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Gemini 3.7 Flash
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">قاعدة البيانات:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      JSON Persistent Store
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">حماية المسارات:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Server-Side RBAC Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. USERS & GUIDES MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="ابحث بالاسم، البريد، الهاتف، أو اسم الشركة..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">كل أنواع الحسابات</option>
                <option value="guide">مرشدين سياحيين (Guides)</option>
                <option value="company">شركات سياحية (Companies)</option>
                <option value="admin">مديري النظام (Admins)</option>
              </select>

              <select
                value={userVerificationFilter}
                onChange={e => setUserVerificationFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">كل حالات التوثيق</option>
                <option value="PENDING_VERIFICATION">بانتظار التوثيق (Pending)</option>
                <option value="VERIFIED">موثق رسميًا (Verified)</option>
                <option value="REJECTED">مرفوض (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-5 py-3.5">المستخدم / المرشد</th>
                  <th className="px-4 py-3.5">النوع / الرتبة</th>
                  <th className="px-4 py-3.5">حالة التوثيق</th>
                  <th className="px-4 py-3.5">الباقة الحالية</th>
                  <th className="px-4 py-3.5">رصيد الذكاء</th>
                  <th className="px-4 py-3.5">البرامج</th>
                  <th className="px-5 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      لا يوجد مستخدمون يطابقون معايير البحث.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                              {u.role === 'admin' && (
                                <span className="rounded-md bg-purple-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{u.email}</span>
                              <span>•</span>
                              <span>{u.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="capitalize font-bold text-slate-700 dark:text-slate-300">
                          {u.accountType === 'guide' ? 'مرشد مستقل' : u.accountType === 'company' ? 'شركة سياحة' : 'مدير نظام'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {u.verificationStatus === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <CheckCircle className="h-3 w-3" />
                            موثق رسميًا
                          </span>
                        ) : u.verificationStatus === 'PENDING_VERIFICATION' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse">
                            <Clock className="h-3 w-3" />
                            بانتظار المراجعة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                            <XCircle className="h-3 w-3" />
                            غير موثق / مرفوض
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                          {u.activeSubscription?.planCode || 'FREE'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-purple-600 font-bold dark:text-purple-400">
                          {u.aiUsage?.isUnlimited ? '∞ غير محدود' : `${u.aiUsage?.lifetimeUsed || 0} / ${u.aiUsage?.lifetimeLimit || 3}`}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {u.tripsCount || 0}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {u.verificationStatus === 'PENDING_VERIFICATION' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleVerifyGuide(u.id)}
                                title="توثيق المرشد"
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 shadow-2xs"
                              >
                                قبول
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectGuideModal({ id: u.id, name: u.name })}
                                title="رفض التوثيق"
                                className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-500 shadow-2xs"
                              >
                                رفض
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setGrantPlanModal({ id: u.id, name: u.name })}
                            className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                          >
                            منح باقة
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedUserDetails(u)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            التفاصيل
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleUserAdminRole(u)}
                            title={u.role === 'admin' ? 'إلغاء رتبة الإدارة' : 'ترقية إلى مدير نظام'}
                            className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800"
                          >
                            <Shield className={`h-4 w-4 ${u.role === 'admin' ? 'text-purple-600 fill-purple-600' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRIPS & PROGRAMS MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          {/* Trip Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={tripSearch}
                onChange={e => setTripSearch(e.target.value)}
                placeholder="ابحث باسم البرنامج، المرشد، الوجهة (مثل الأقصر، القاهرة)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <select
              value={tripStatusFilter}
              onChange={e => setTripStatusFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">كل الحالات</option>
              <option value="published">البرامج المنشورة (Published)</option>
              <option value="draft">المسودات (Drafts)</option>
              <option value="archived">المؤرشفة (Archived)</option>
            </select>
          </div>

          {/* Trips Grid / List */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.length === 0 ? (
              <div className="col-span-full py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                لا توجد برامج تطابق معايير البحث.
              </div>
            ) : (
              filteredTrips.map(trip => (
                <div
                  key={trip.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          trip.isArchived
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            : trip.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {trip.isArchived ? 'مؤرشف' : trip.status === 'published' ? 'منشور أونلاين' : 'مسودة'}
                      </span>

                      <span className="text-[11px] font-bold text-slate-400">
                        {trip.durationDays} أيام / {trip.nightsCount || (trip.durationDays - 1)} ليالي
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                      {trip.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {trip.summary || 'برنامج سياحي متكامل ومخصص'}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>المرشد: {trip.guideName || 'غير محدد'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-amber-500" />
                        {trip.destinations?.length || 0} وجهات
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-blue-500" />
                        {trip.viewCount || 0} مشاهدة
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-purple-500" />
                        {new Date(trip.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTripDetails(trip)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      معاينة التفاصيل
                    </button>

                    <div className="flex items-center gap-1.5">
                      {trip.publicToken && (
                        <a
                          href={`/?trip=${trip.publicToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-xl bg-purple-50 px-2.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>رابط العميل</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleArchiveTrip(trip.id)}
                        title={trip.isArchived ? 'إلغاء الأرشفة' : 'أرشفة البرنامج'}
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PAYMENTS & SUBSCRIPTIONS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Plans Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">{plan.code}</span>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    {plan.activeSubscribers || 0} مشترك
                  </span>
                </div>
                <h4 className="mt-1 text-base font-black text-slate-900 dark:text-white">
                  {plan.nameAr || plan.name}
                </h4>
                <div className="mt-2 text-xl font-black text-emerald-600">
                  {plan.price === 0 ? 'مجانًا' : `${plan.price} ${plan.currency}`}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  رصيد ذكاء: {plan.aiUnlimited ? 'غير محدود' : `${plan.aiLimit} برنامج`}
                </p>
              </div>
            ))}
          </div>

          {/* Payment Requests Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  طلبات الدفع والتحويلات البنكية / إنستاباي
                </h3>
                <p className="text-xs text-slate-400">
                  مراجعة واعتماد طلبات الترقية اليدوية والاشتراكات
                </p>
              </div>

              <select
                value={paymentStatusFilter}
                onChange={e => setPaymentStatusFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">كل الحالات</option>
                <option value="PENDING">قيد الانتظار (Pending)</option>
                <option value="APPROVED">معتمدة (Approved)</option>
                <option value="REJECTED">مرفوضة (Rejected)</option>
              </select>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3">المرشد / المستخدم</th>
                    <th className="px-4 py-3">الباقة المطلوبة</th>
                    <th className="px-4 py-3">المبلغ</th>
                    <th className="px-4 py-3">طريقة الدفع</th>
                    <th className="px-4 py-3">رقم العملية / المرجع</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        لا توجد طلبات دفع مسجلة.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          <div>{p.userName || 'مستخدم'}</div>
                          <div className="text-[11px] font-normal text-slate-400">{p.userEmail}</div>
                        </td>

                        <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">
                          {p.planName || p.planId}
                        </td>

                        <td className="px-4 py-3 font-bold text-emerald-600">
                          {p.amount} {p.currency}
                        </td>

                        <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {p.paymentMethod}
                        </td>

                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {p.transactionReference || 'لا يوجد'}
                        </td>

                        <td className="px-4 py-3">
                          {p.status === 'APPROVED' ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              تم الاعتماد
                            </span>
                          ) : p.status === 'PENDING' ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse">
                              قيد المراجعة
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                              مرفوض
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {p.status === 'PENDING' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setApprovePaymentModal(p);
                                  setApprovePaymentNote('تم تأكيد التحويل وتفعيل الباقة.');
                                }}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 shadow-2xs"
                              >
                                اعتماد وتفعيل
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectPaymentModal(p);
                                  setRejectPaymentNote('لم يتم العثور على التحويل بالرقم المرجعي المذكور.');
                                }}
                                className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-500 shadow-2xs"
                              >
                                رفض
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {p.adminNote || 'مكتمل'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PROMO CODES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'promos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                أكواد الخصم والكوبونات الترويجية
              </h3>
              <p className="text-xs text-slate-400">
                إنشاء وإدارة كوبونات الخصم للمرشدين وشركات السياحة
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPromoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة كود جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promos.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">
                لا توجد أكواد خصم نشطة حاليًا.
              </div>
            ) : (
              promos.map(promo => (
                <div
                  key={promo.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-black text-purple-600 dark:text-purple-400">
                        {promo.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTogglePromoStatus(promo)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          promo.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        }`}
                      >
                        {promo.isActive ? 'مفعل وشغال' : 'معطل'}
                      </button>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>نسبة الخصم:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {promo.discountPercent ? `${promo.discountPercent}%` : `${promo.fixedDiscount} EGP`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>مرات الاستخدام:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {promo.usedCount || 0} / {promo.maxUses || '∞'}
                        </span>
                      </div>
                      {promo.expiryDate && (
                        <div className="flex justify-between">
                          <span>تاريخ الانتهاء:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {new Date(promo.expiryDate).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeletePromo(promo.id)}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      حذف الكود
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. AI ENGINE OPERATIONS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* AI Settings Form */}
            <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  إعدادات محرك Gemini AI
                </h3>
              </div>

              <form onSubmit={handleSaveAiSettings} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    حد البرامج المجانية مدى الحياة (Free Limit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={aiSettings.freeAiLifetimeLimit}
                    onChange={e => setAiSettings({ ...aiSettings, freeAiLifetimeLimit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    عدد البرامج المجانية التي يحصل عليها أي مرشد جديد عند التسجيل
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نموذج الذكاء الاصطناعي (Model)
                  </label>
                  <select
                    value={aiSettings.aiModel}
                    onChange={e => setAiSettings({ ...aiSettings, aiModel: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="gemini-3.7-flash">Gemini 3.7 Flash (Ultra Fast & Accurate)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSettings.allowDayRegeneration}
                      onChange={e => setAiSettings({ ...aiSettings, allowDayRegeneration: e.target.checked })}
                      className="h-4 w-4 rounded-md text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      السماح بإعادة توليد يوم محدد بالذكاء
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSettings.fallbackEnabled}
                      onChange={e => setAiSettings({ ...aiSettings, fallbackEnabled: e.target.checked })}
                      className="h-4 w-4 rounded-md text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      تفعيل وضع الطوارئ الاحتياطي الذكي (Fallback Generator)
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={aiSettingsSaving}
                  className="w-full rounded-xl bg-purple-600 py-2.5 font-bold text-white hover:bg-purple-700 shadow-xs transition-colors"
                >
                  {aiSettingsSaving ? 'جارٍ الحفظ...' : 'حفظ إعدادات الذكاء الاصطناعي'}
                </button>
              </form>
            </div>

            {/* AI Generation Monitoring Log */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    سجل التوليد والمراقبة الفورية (Live Generation Feed)
                  </h3>
                </div>
                <span className="text-xs font-bold text-purple-600">
                  إجمالي التوليدات: {aiUsageStats?.totalGenerations || metrics.totalAiGenerations || 0}
                </span>
              </div>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {!aiUsageStats?.recentGenerations || aiUsageStats.recentGenerations.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">لا توجد عمليات توليد مسجلة حتى الآن.</p>
                ) : (
                  aiUsageStats.recentGenerations.map((item: any, idx: number) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{item.tripName || 'برنامج سياحي'}</span>
                          <span className="rounded-full bg-purple-100 px-2 py-0.2 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {item.durationDays || 3} أيام
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          المرشد: {item.userName} ({item.userEmail})
                        </p>
                      </div>

                      <div className="text-left">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <Check className="h-3 w-3" />
                          ناجح
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(item.timestamp).toLocaleTimeString('ar-EG')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MARKETING & CAMPAIGNS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                الحملات التسويقية والإشعارات الجماعية
              </h3>
              <p className="text-xs text-slate-400">
                بث إعلانات وعروض ترويجية فورية في لوحات تحكم المرشدين
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCampaignModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs"
            >
              <Megaphone className="h-4 w-4" />
              <span>إطلاق حملة جديدة</span>
            </button>
          </div>

          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                لم يتم إرسال أي حملات حتى الآن.
              </div>
            ) : (
              campaigns.map(camp => (
                <div
                  key={camp.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                          <Megaphone className="h-4 w-4" />
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{camp.title}</h4>
                      </div>
                      <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {camp.message}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 whitespace-nowrap">
                      تم التسليم لـ {camp.sentCount || 0} مستخدم
                    </span>
                  </div>

                  {camp.promoCode && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 font-bold">
                      <Tag className="h-3.5 w-3.5" />
                      <span>كود الخصم المرفق: {camp.promoCode}</span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    تاريخ الإرسال: {new Date(camp.createdAt).toLocaleString('ar-EG')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. AUDIT LOGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                placeholder="ابحث في سجل العمليات بالإيميل، الإجراء، أو التفاصيل..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">
              إجمالي السجلات: {filteredAuditLogs.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-5 py-3.5">الوقت والتاريخ</th>
                  <th className="px-4 py-3.5">المستخدم / المسؤول</th>
                  <th className="px-4 py-3.5">نوع العملية (Action)</th>
                  <th className="px-5 py-3.5">تفاصيل الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      لا توجد سجلات تطابق البحث.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {log.userEmail || 'System'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. HOMEPAGE SETTINGS & DYNAMIC STATS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'homepage' && (
        <HomepageSettingsManager onRefreshAll={loadAll} showToast={showToast} />
      )}

      {/* ========================================================================= */}
      {/* 10. SYSTEM SETTINGS & ADMIN INFO TAB */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                <span>بيانات مدير النظام الحالي</span>
              </h3>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">الاسم الكامل:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentAdmin?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">البريد الإلكتروني:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentAdmin?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">رقم الهاتف:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentAdmin?.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">الرتبة:</span>
                  <span className="font-bold text-purple-600 uppercase">SUPER ADMINISTRATOR</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">حالة الحساب:</span>
                  <span className="font-bold text-emerald-600">موثق ومعتمد رسميًا</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span>إعدادات النظام العامة</span>
              </h3>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">العملة الافتراضية:</span>
                  <span className="font-bold text-slate-900 dark:text-white">الجنيه المصري (EGP)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">محرك الذكاء الاصطناعي:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Google GenAI (Gemini 3.7 Flash)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">التحقق بخطوتين وتحدي الأمان:</span>
                  <span className="font-bold text-emerald-600">مفعل (PIN + Math Anti-Bot)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">إصدار النظام:</span>
                  <span className="font-mono text-purple-600 font-bold">TOURVIA SaaS v1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ACTION MODALS */}
      {/* ========================================================================= */}

      {/* 1. Reject Guide Modal */}
      {rejectGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              رفض توثيق المرشد: {rejectGuideModal.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              يرجى كتابة سبب واضح للرفض (مثال: صورة الكارنيه غير واضحة، انتهاء صلاحية الترخيص).
            </p>
            <form onSubmit={handleRejectGuideSubmit} className="mt-4 space-y-4 text-xs">
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="اكتب سبب الرفض هنا..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectGuideModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 shadow-xs"
                >
                  تأكيد الرفض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Grant Plan Modal */}
      {grantPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              منح باقة وترقية حساب: {grantPlanModal.name}
            </h3>
            <form onSubmit={handleGrantPlanSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اختر الباقة
                </label>
                <select
                  value={grantPlanId}
                  onChange={e => setGrantPlanId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="plan_basic">باقة الانطلاق (Basic) - 15 برنامج ذكاء</option>
                  <option value="plan_pro">باقة المرشد المحترف (Pro) - 60 برنامج ذكاء</option>
                  <option value="plan_enterprise">باقة الشركات والوكالات (Enterprise) - غير محدود</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المدة بالأيام
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={grantDays}
                  onChange={e => setGrantDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGrantPlanModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 shadow-xs"
                >
                  تفعيل ومنح الباقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Approve Payment Modal */}
      {approvePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              تأكيد استلام الدفعة وتفعيل الباقة
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              المستخدم: <span className="font-bold text-slate-800 dark:text-slate-200">{approvePaymentModal.userName}</span> ({approvePaymentModal.userEmail})
              <br />
              المبلغ: <span className="font-bold text-emerald-600">{approvePaymentModal.amount} {approvePaymentModal.currency}</span> • الباقة: {approvePaymentModal.planName}
            </p>
            <form onSubmit={handleApprovePaymentSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظة إدارية (اختياري)
                </label>
                <input
                  type="text"
                  value={approvePaymentNote}
                  onChange={e => setApprovePaymentNote(e.target.value)}
                  placeholder="تم التأكد من كشف حساب إنستاباي..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApprovePaymentModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  تأكيد الاعتماد وتفعيل الباقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Reject Payment Modal */}
      {rejectPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              رفض طلب الدفع
            </h3>
            <form onSubmit={handleRejectPaymentSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  سبب الرفض
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectPaymentNote}
                  onChange={e => setRejectPaymentNote(e.target.value)}
                  placeholder="لم يصل التحويل، أو الرقم المرجعي خاطئ..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectPaymentModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 shadow-xs"
                >
                  تأكيد الرفض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create Promo Code Modal */}
      {promoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              إنشاء كود خصم جديد
            </h3>
            <form onSubmit={handleCreatePromoSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  كود الخصم (Promo Code)
                </label>
                <input
                  type="text"
                  required
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                  placeholder="EGYPT2026, SUMMER50"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono font-black text-slate-900 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نسبة الخصم (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPromoDiscount}
                    onChange={e => setNewPromoDiscount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الحد الأقصى للاستخدام
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPromoMaxUses}
                    onChange={e => setNewPromoMaxUses(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تاريخ الانتهاء (اختياري)
                </label>
                <input
                  type="date"
                  value={newPromoExpiry}
                  onChange={e => setNewPromoExpiry(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPromoModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 shadow-xs"
                >
                  إنشاء وتفعيل الكود
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Broadcast Campaign Modal */}
      {campaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              إطلاق حملة إعلانية وإشعار جماعي
            </h3>
            <form onSubmit={handleCreateCampaignSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الإشعار
                </label>
                <input
                  type="text"
                  required
                  value={newCampaignTitle}
                  onChange={e => setNewCampaignTitle(e.target.value)}
                  placeholder="عرض خاص لموسم السياحة..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نص الرسالة
                </label>
                <textarea
                  required
                  rows={3}
                  value={newCampaignMessage}
                  onChange={e => setNewCampaignMessage(e.target.value)}
                  placeholder="اكتب تفاصيل العرض والرسالة الموجهة للمرشدين..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كود خصم مرفق (اختياري)
                  </label>
                  <input
                    type="text"
                    value={newCampaignPromoCode}
                    onChange={e => setNewCampaignPromoCode(e.target.value.toUpperCase())}
                    placeholder="WELCOME50"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-900 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الجمهور المستهدف
                  </label>
                  <select
                    value={newCampaignSegment}
                    onChange={e => setNewCampaignSegment(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="all">جميع المستخدمين</option>
                    <option value="guides">المرشدين فقط</option>
                    <option value="companies">شركات السياحة فقط</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 shadow-xs"
                >
                  بث الإشعار فورًا
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. User Details Drawer / Modal */}
      {selectedUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تفاصيل حساب: {selectedUserDetails.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">البريد الإلكتروني:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedUserDetails.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">رقم الهاتف:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedUserDetails.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">الشركة / العلامة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedUserDetails.companyName || 'مرشد مستقل'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">اللغات العاملة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{(selectedUserDetails.workingLanguages || []).join(', ').toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">تاريخ التسجيل:</span>
                <span className="font-bold text-slate-900 dark:text-white">{new Date(selectedUserDetails.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
              {selectedUserDetails.proofDocumentUrl && (
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1 text-xs font-semibold">مستند التوثيق / الترخيص المرفوع:</span>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2">
                    {selectedUserDetails.proofDocumentUrl.startsWith('data:') || selectedUserDetails.proofDocumentUrl.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i) ? (
                      <div className="space-y-2">
                        <img
                          src={selectedUserDetails.proofDocumentUrl}
                          alt="مستند الترخيص"
                          referrerPolicy="no-referrer"
                          className="max-h-48 rounded-lg border border-slate-200 dark:border-slate-700 object-contain w-full bg-slate-900/10"
                        />
                        <a
                          href={selectedUserDetails.proofDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>فتح الصورة بحجمها الكامل</span>
                        </a>
                      </div>
                    ) : (
                      <a
                        href={selectedUserDetails.proofDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-purple-600 font-bold underline text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>فتح وفحص صورة المستند</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Trip Details Modal */}
      {selectedTripDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {selectedTripDetails.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTripDetails(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedTripDetails.summary}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">المرشد المسؤول:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTripDetails.guideName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">المدة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTripDetails.durationDays} أيام</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">المحطات والأنشطة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTripDetails.stationsCount || 0} محطة</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">عدد المشاهدات:</span>
                <span className="font-bold text-purple-600">{selectedTripDetails.viewCount || 0} مشاهدة</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              {selectedTripDetails.publicToken && (
                <a
                  href={`/?trip=${selectedTripDetails.publicToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>معاينة الرابط المباشر للعميل</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setSelectedTripDetails(null)}
                className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
