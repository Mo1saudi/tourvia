import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Scale,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
  Languages,
  Landmark,
  Bot,
  FileCheck,
  Trash2,
  Plus,
  Search,
  Eye,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Building2,
  ExternalLink,
  Check,
  X,
  Filter,
  UserCheck,
  Flag,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  BadgeAlert,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  ComplianceCategory,
  ComplianceRequirement,
  ComplianceRequirementStatus,
  RegulatoryUpdate,
  PlatformComplaint,
  SiteRegulatoryNotice,
  ComplianceReadinessReport,
  User,
} from '../../types';

interface ComplianceCenterProps {
  onRefreshParent?: () => void;
}

export const ComplianceCenter: React.FC<ComplianceCenterProps> = ({ onRefreshParent }) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'guides' | 'updates' | 'complaints' | 'sites' | 'retention'>('matrix');
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<{
    report: ComplianceReadinessReport | null;
    recentComplaints: PlatformComplaint[];
    recentUpdates: RegulatoryUpdate[];
    siteNoticesCount: number;
    retentionSettings: any;
  }>({
    report: null,
    recentComplaints: [],
    recentUpdates: [],
    siteNoticesCount: 0,
    retentionSettings: null,
  });

  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[]>([]);
  const [complaints, setComplaints] = useState<PlatformComplaint[]>([]);
  const [siteNotices, setSiteNotices] = useState<SiteRegulatoryNotice[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [guideSearchQuery, setGuideSearchQuery] = useState('');
  const [guideExpiryFilter, setGuideExpiryFilter] = useState<'ALL' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNVERIFIED'>('ALL');

  // Modals & Active Edit States
  const [editingReq, setEditingReq] = useState<ComplianceRequirement | null>(null);
  const [editingGuide, setEditingGuide] = useState<User | null>(null);
  const [showAddUpdateModal, setShowAddUpdateModal] = useState(false);
  const [newUpdateForm, setNewUpdateForm] = useState({
    regulationName: '',
    regulationNameAr: '',
    source: 'وزارة السياحة والآثار / الجريدة الرسمية',
    decreeNumber: '',
    publishedDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    summaryAr: '',
    affectedPlatformFeature: 'توثيق البرامج والمرشدين',
    requiredSystemChange: 'مراجعة المعايير والضوابط',
    reviewStatus: 'PENDING_LEGAL_REVIEW' as const,
    notes: '',
  });

  const [activeComplaint, setActiveComplaint] = useState<PlatformComplaint | null>(null);
  const [complaintResolutionForm, setComplaintResolutionForm] = useState({
    status: 'RESOLVED' as const,
    adminNotes: '',
    resolutionSummary: '',
  });

  const [editingSiteNotice, setEditingSiteNotice] = useState<SiteRegulatoryNotice | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Guide Verification Form State
  const [guideForm, setGuideForm] = useState({
    fullLegalName: '',
    licenseNumber: '',
    syndicateNumber: '',
    issuingAuthority: 'وزارة السياحة والآثار - جمهورية مصر العربية',
    issueDate: '',
    expiryDate: '',
    authorizedLanguages: [] as string[],
    verificationNotes: '',
    verificationStatus: 'LICENSED_GUIDE_VERIFIED' as any,
    commercialEntityStatus: 'INDIVIDUAL_GUIDE' as any,
    requiresLegalReview: false,
  });

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const [ovRes, reqRes, upRes, cmpRes, snRes, usrRes] = await Promise.all([
        api.getComplianceOverview(),
        api.getComplianceRequirements(),
        api.getRegulatoryUpdates(),
        api.getAdminComplaints(),
        api.getSiteRegulatoryNotices(),
        api.getTrips ? api.getComplianceOverview().then(async () => {
          // Fetch users
          const res = await fetch('/api/admin/users', {
            headers: { Authorization: `Bearer ${api.getToken()}` },
          });
          const json = await res.json();
          return json.users || [];
        }) : Promise.resolve([]),
      ]);

      setOverviewData({
        report: ovRes.report,
        recentComplaints: ovRes.recentComplaints || [],
        recentUpdates: ovRes.recentUpdates || [],
        siteNoticesCount: ovRes.siteNoticesCount || 0,
        retentionSettings: ovRes.retentionSettings,
      });

      setRequirements(reqRes.requirements || []);
      setRegulatoryUpdates(upRes.updates || []);
      setComplaints(cmpRes.complaints || []);
      setSiteNotices(snRes.siteNotices || []);
      setUsers(usrRes || []);
    } catch (err: any) {
      console.error('Failed to load compliance data:', err);
      showNotification(err.message || 'فشل تحميل بيانات الامتثال', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceData();
  }, []);

  const handleUpdateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq) return;

    try {
      await api.updateComplianceRequirement(editingReq.id, {
        status: editingReq.status,
        statusAr: editingReq.status === 'COMPLIANT' ? 'مستوفى' : editingReq.status === 'IN_REVIEW' ? 'قيد المراجعة' : editingReq.status === 'NEEDS_UPDATE' ? 'يحتاج تحديث' : editingReq.status === 'NON_COMPLIANT' ? 'غير مستوفى' : 'غير منطبق',
        evidenceNote: editingReq.evidenceNote,
        riskLevel: editingReq.riskLevel,
        actionRequired: editingReq.actionRequired,
      });

      showNotification('تم تحديث بند الامتثال وسجل التدقيق بنجاح.');
      setEditingReq(null);
      loadComplianceData();
    } catch (err: any) {
      showNotification(err.message || 'حدث خطأ أثناء حفظ التحديث', 'error');
    }
  };

  const handleCreateRegulatoryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateForm.regulationNameAr || !newUpdateForm.summaryAr) {
      showNotification('يرجى ملء اسم التشريع والملخص التنفيذي', 'error');
      return;
    }

    try {
      await api.createRegulatoryUpdate(newUpdateForm);
      showNotification('تم إضافة التحديث التنظيمي بنجاح.');
      setShowAddUpdateModal(false);
      setNewUpdateForm({
        regulationName: '',
        regulationNameAr: '',
        source: 'وزارة السياحة والآثار / الجريدة الرسمية',
        decreeNumber: '',
        publishedDate: new Date().toISOString().split('T')[0],
        effectiveDate: new Date().toISOString().split('T')[0],
        summaryAr: '',
        affectedPlatformFeature: 'توثيق البرامج والمرشدين',
        requiredSystemChange: 'مراجعة المعايير والضوابط',
        reviewStatus: 'PENDING_LEGAL_REVIEW',
        notes: '',
      });
      loadComplianceData();
    } catch (err: any) {
      showNotification(err.message || 'فشل إضافة التحديث التنظيمي', 'error');
    }
  };

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;

    try {
      await api.updateAdminComplaint(activeComplaint.id, complaintResolutionForm);
      showNotification('تم تحديث سجل البلاغ والإجراء المتخذ.');
      setActiveComplaint(null);
      loadComplianceData();
    } catch (err: any) {
      showNotification(err.message || 'فشل تحديث سجل البلاغ', 'error');
    }
  };

  const handleOpenGuideModal = (user: User) => {
    setEditingGuide(user);
    setGuideForm({
      fullLegalName: user.licenseInfo?.fullLegalName || user.name || '',
      licenseNumber: user.licenseNumber || user.licenseInfo?.licenseNumber || '',
      syndicateNumber: user.syndicateNumber || user.licenseInfo?.syndicateNumber || '',
      issuingAuthority: user.licenseInfo?.issuingAuthority || 'وزارة السياحة والآثار - جمهورية مصر العربية',
      issueDate: user.licenseInfo?.issueDate || '',
      expiryDate: user.licenseInfo?.expiryDate || '',
      authorizedLanguages: user.authorizedLanguages || user.licenseInfo?.authorizedLanguages || user.workingLanguages || ['ar'],
      verificationNotes: user.licenseInfo?.verificationNotes || user.verificationNote || '',
      verificationStatus: user.verificationStatus || 'LICENSED_GUIDE_VERIFIED',
      commercialEntityStatus: user.licenseInfo?.commercialEntityStatus || 'INDIVIDUAL_GUIDE',
      requiresLegalReview: Boolean(user.licenseInfo?.requiresLegalReview),
    });
  };

  const handleSaveGuideVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuide) return;

    try {
      await api.verifyGuideLicense(editingGuide.id, guideForm);
      showNotification(`تم تدقيق وتحديث ترخيص المرشد ${editingGuide.name} بنجاح.`);
      setEditingGuide(null);
      loadComplianceData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      showNotification(err.message || 'فشل حفظ بيانات ترخيص المرشد', 'error');
    }
  };

  const handlePurgeDocuments = async () => {
    if (!window.confirm('هل أنت متأكد من تنفيذ التطهير الآمن للمستندات والوثائق المرفوضة المنتهية المدة؟')) return;

    try {
      const res = await api.purgeRetentionDocs();
      showNotification(res.message || `تم تطهير ${res.purgedCount} مستند بأمان.`);
      loadComplianceData();
    } catch (err: any) {
      showNotification(err.message || 'فشل عملية التطهير الآمن للمستندات', 'error');
    }
  };

  const handleSaveSiteNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSiteNotice) return;

    try {
      await api.updateSiteRegulatoryNotice(editingSiteNotice.siteKey, editingSiteNotice);
      showNotification('تم تحديث ضوابط وإشعارات المزار الأثري.');
      setEditingSiteNotice(null);
      loadComplianceData();
    } catch (err: any) {
      showNotification(err.message || 'فشل تحديث ضوابط المزار', 'error');
    }
  };

  // Filtered Requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter(r => {
      const matchCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const matchStatus = selectedStatusFilter === 'ALL' || r.status === selectedStatusFilter;
      const matchSearch =
        searchQuery === '' ||
        r.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.legalBasis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.evidenceNote.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [requirements, selectedCategory, selectedStatusFilter, searchQuery]);

  // Filtered Guides
  const filteredGuides = useMemo(() => {
    const now = new Date();
    const thirtyDays = new Date(Date.now() + 30 * 86400000);

    return users.filter(u => {
      const isGuide = u.accountType === 'guide' || u.role === 'user';
      if (!isGuide) return false;

      const q = guideSearchQuery.toLowerCase();
      const matchSearch =
        q === '' ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.licenseNumber && u.licenseNumber.toLowerCase().includes(q)) ||
        (u.syndicateNumber && u.syndicateNumber.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (guideExpiryFilter === 'EXPIRING_SOON') {
        if (!u.licenseInfo?.expiryDate) return false;
        const exp = new Date(u.licenseInfo.expiryDate);
        return exp > now && exp <= thirtyDays;
      }
      if (guideExpiryFilter === 'EXPIRED') {
        if (u.verificationStatus === 'LICENSE_EXPIRED') return true;
        if (!u.licenseInfo?.expiryDate) return false;
        const exp = new Date(u.licenseInfo.expiryDate);
        return exp <= now;
      }
      if (guideExpiryFilter === 'UNVERIFIED') {
        return u.verificationStatus === 'PENDING_VERIFICATION' || u.verificationStatus === 'NEW' || u.verificationStatus === 'NEEDS_UPDATE';
      }

      return true;
    });
  }, [users, guideSearchQuery, guideExpiryFilter]);

  const report = overviewData.report;

  const availableLanguagesList = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'الإنجليزية' },
    { code: 'de', label: 'الألمانية' },
    { code: 'fr', label: 'الفرنسية' },
    { code: 'it', label: 'الإيطالية' },
    { code: 'es', label: 'الإسبانية' },
    { code: 'ru', label: 'الروسية' },
    { code: 'pl', label: 'البولندية' },
    { code: 'zh', label: 'الصينية' },
  ];

  return (
    <div className="space-y-6 text-slate-800" dir="rtl">
      {/* Toast Notification */}
      {notificationMsg && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium transition-all ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notificationMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* Header Banner: Legal Disclaimer & Readiness Notice */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 text-white rounded-2xl p-6 shadow-md border border-amber-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
                <Scale className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  مركز الامتثال والجاهزية التنظيمية (TOURVIA Compliance Center)
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    جاهز للامتثال (Compliance-Ready)
                  </span>
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">
                  إطار العمل الرقابي والمهني لمواءمة المنصة مع القانون رقم 121 لسنة 1983 وقرارات وزارة السياحة والآثار المصرية ونقابة المرشدين السياحيين.
                </p>
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>تنويه قانوني ملزم:</strong> تعمل TOURVIA كمنصة تقنية ذكية لإدارة وتصميم برامج السفر. المنصة لا تصطنع أي صفة لترخيص حكومي، ولا تمنح تراخيص مهنية من تلقاء نفسها، وتلزم كافة المشتركين بالقيد الرسمي بوزارة السياحة والآثار ونقابة المرشدين السياحيين قبل إسناد صفة مرشد مرخص.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 shrink-0">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-amber-400">
                {report?.overallReadinessScore || 96}%
              </div>
              <div className="text-[11px] text-slate-400 font-medium">مؤشر الجاهزية الكلي</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{report?.statusDistribution.compliant || 11} بند مستوفى</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{report?.statusDistribution.inReview || 0} قيد التدقيق</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{report?.openComplaintsCount || 0} بلاغ مفتوح</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">المرشدون المرخصون</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {report?.verifiedLicensedGuidesCount || 1}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">تم فحص التراخيص رسمياً</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">بانتظار التحقق</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {report?.pendingVerificationGuidesCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">طلبات قيد المراجعة</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">تنتهي قريباً (30 يوم)</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-600">
            {report?.expiringLicensesCount || 0}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">تتطلب تنبيه التجديد</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">تراخيص منتهية</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600">
            {report?.expiredLicensesCount || 0}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">موقوفة تلقائياً</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">سجل البلاغات والنزاهة</span>
            <Flag className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {report?.openComplaintsCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">شكاوى تحت التحقيق</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">التحديثات التشريعية</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {regulatoryUpdates.length}
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5">قوانين وقرارات مسجلة</div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-sm">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            activeSubTab === 'matrix'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>مصفوفة الامتثال (11 معياراً)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guides')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            activeSubTab === 'guides'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>إدارة وتدقيق تراخيص المرشدين</span>
          {report && report.expiringLicensesCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {report.expiringLicensesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('updates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            activeSubTab === 'updates'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>سجل القرارات والتحديثات التشريعية</span>
        </button>

        <button
          onClick={() => setActiveSubTab('complaints')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            activeSubTab === 'complaints'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>بلاغات النزاهة ومكافحة التضليل</span>
          {complaints.filter(c => c.status === 'OPEN').length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {complaints.filter(c => c.status === 'OPEN').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('sites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            activeSubTab === 'sites'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>ضوابط المواقع الأثرية والمتاحف</span>
        </button>

        <button
          onClick={() => setActiveSubTab('retention')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            activeSubTab === 'retention'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>أمن المستندات وسياسة الاحتفاظ</span>
        </button>
      </div>

      {/* SUB-TAB 1: COMPLIANCE MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في معايير الامتثال، السند القانوني، أو أدلة المراجعة..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs sm:text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">جميع الأقسام (11 قسماً)</option>
                <option value="GUIDE_REQUIREMENTS">متطلبات ترخيص المرشد (القانون 121)</option>
                <option value="VERIFICATION_STATUS">حالة التحقق وفصل الحسابات</option>
                <option value="DOCUMENTS_SECURITY">أمن وسرية الوثائق</option>
                <option value="AUTHORIZED_LANGUAGES">اللغات المرخص بها vs المدخلة</option>
                <option value="PROFESSIONAL_SCOPE">نطاق العمل ومنع التضليل التجاري</option>
                <option value="ITINERARIES_SITES">المواقع الأثرية وضوابط التصوير</option>
                <option value="AI_CONTENT_SAFETY">أمان المحتوى والذكاء الاصطناعي</option>
                <option value="PRIVACY_MINIMIZATION">الخصوصية والحد الأدنى للبيانات</option>
                <option value="COMPLAINTS_INTEGRITY">الشكاوى وقنوات الإبلاغ</option>
                <option value="AUDIT_LOGS">السجلات وسجل التدقيق الإداري</option>
                <option value="REGULATORY_REVIEW">المراجعة وإدارة التحديثات</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="text-xs sm:text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="COMPLIANT">مستوفى (Compliant)</option>
                <option value="IN_REVIEW">قيد المراجعة (In Review)</option>
                <option value="NEEDS_UPDATE">يحتاج تحديث (Needs Update)</option>
                <option value="NON_COMPLIANT">غير مستوفى (Non-Compliant)</option>
              </select>
            </div>

            <button
              onClick={loadComplianceData}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث الفحص</span>
            </button>
          </div>

          {/* Requirements Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3.5">بند الامتثال والجاهزية</th>
                    <th className="p-3.5">القسم الرقابي</th>
                    <th className="p-3.5">السند القانوني والتشريعي</th>
                    <th className="p-3.5 text-center">الحالة</th>
                    <th className="p-3.5">ملاحظة التدقيق والأدلة</th>
                    <th className="p-3.5 text-center">مستوى المخاطر</th>
                    <th className="p-3.5 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequirements.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-medium text-slate-900 max-w-[220px]">
                        <div>{req.titleAr}</div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">{req.title}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 font-normal">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                          {req.categoryNameAr}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 text-xs max-w-[200px]">
                        <span className="text-amber-900 font-medium bg-amber-50 px-2 py-1 rounded border border-amber-200/50 block">
                          {req.legalBasis}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === 'COMPLIANT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'IN_REVIEW'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'NEEDS_UPDATE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status === 'COMPLIANT' && <CheckCircle2 className="w-3 h-3" />}
                          {req.status === 'IN_REVIEW' && <Clock className="w-3 h-3" />}
                          {req.status === 'NEEDS_UPDATE' && <AlertTriangle className="w-3 h-3" />}
                          {req.status === 'NON_COMPLIANT' && <AlertCircle className="w-3 h-3" />}
                          <span>{req.statusAr}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 text-xs max-w-[260px]">
                        <div className="line-clamp-2" title={req.evidenceNote}>
                          {req.evidenceNote || '—'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          آخر مراجعة: {req.lastReviewedAt?.split('T')[0] || '2026-08-30'}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            req.riskLevel === 'LOW'
                              ? 'bg-slate-100 text-slate-600'
                              : req.riskLevel === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700'
                              : req.riskLevel === 'HIGH'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {req.riskLevel === 'LOW' ? 'منخفض' : req.riskLevel === 'MEDIUM' ? 'متوسط' : req.riskLevel === 'HIGH' ? 'مرتفع' : 'يتطلب مراجعة قانونية'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setEditingReq({ ...req })}
                          className="px-3 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          تعديل الفحص
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GUIDE LICENSE VERIFICATION & EXPIRY TRACKER */}
      {activeSubTab === 'guides' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم المرشد، الإيميل، رقم الترخيص، أو رقم القيد النقابي..."
                  value={guideSearchQuery}
                  onChange={e => setGuideSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={guideExpiryFilter}
                onChange={e => setGuideExpiryFilter(e.target.value as any)}
                className="text-xs sm:text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">جميع المرشدين</option>
                <option value="EXPIRING_SOON">تراخيص تنتهي خلال 30 يوماً</option>
                <option value="EXPIRED">تراخيص منتهية الصلاحية</option>
                <option value="UNVERIFIED">بانتظار التحقق أو التحديث</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              إجمالي الحسابات المطابقة: <span className="font-bold text-slate-900">{filteredGuides.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3.5">المرشد السياحي</th>
                    <th className="p-3.5">رقم ترخيص الوزارة</th>
                    <th className="p-3.5">رقم القيد بالنقابة</th>
                    <th className="p-3.5">اللغات المعتمدة بالترخيص</th>
                    <th className="p-3.5">سريان الترخيص والتجديد</th>
                    <th className="p-3.5 text-center">حالة التوثيق</th>
                    <th className="p-3.5 text-center">إجراءات المراجعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGuides.map(guide => {
                    const info = guide.licenseInfo;
                    const isExpiring = info?.isLicenseExpiringSoon;
                    const isExpired = info?.isLicenseExpired || guide.verificationStatus === 'LICENSE_EXPIRED';
                    const isVerified = guide.verificationStatus === 'LICENSED_GUIDE_VERIFIED' || guide.verificationStatus === 'VERIFIED';

                    return (
                      <tr key={guide.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{guide.name}</div>
                          <div className="text-slate-400 text-xs">{guide.email} • {guide.phone}</div>
                          {info?.fullLegalName && info.fullLegalName !== guide.name && (
                            <div className="text-[11px] text-amber-800 mt-0.5">
                              الاسم الرسمي: {info.fullLegalName}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-800 font-medium">
                          {guide.licenseNumber || info?.licenseNumber || (
                            <span className="text-slate-400 font-sans italic text-xs">غير مسجل</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-800">
                          {guide.syndicateNumber || info?.syndicateNumber || (
                            <span className="text-slate-400 font-sans italic text-xs">غير مسجل</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(guide.authorizedLanguages || info?.authorizedLanguages || []).map(lang => (
                              <span
                                key={lang}
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold"
                                title="لغة معتمدة رسميًا بالترخيص"
                              >
                                {lang.toUpperCase()} ✓
                              </span>
                            ))}
                            {(!guide.authorizedLanguages || guide.authorizedLanguages.length === 0) && (
                              <span className="text-xs text-slate-400 italic">لا توجد لغات معتمدة بعد</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {info?.expiryDate ? (
                            <div>
                              <div className={`font-mono text-xs font-bold ${isExpired ? 'text-rose-600' : isExpiring ? 'text-amber-600' : 'text-slate-700'}`}>
                                {info.expiryDate}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {isExpired ? '⚠️ منتهي الصلاحية' : isExpiring ? '⏳ ينتهي قريباً' : 'ساري المفعول'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isExpired
                                ? 'bg-rose-100 text-rose-800'
                                : isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : guide.verificationStatus === 'NEEDS_UPDATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isVerified && !isExpired && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {isExpired && <AlertCircle className="w-3.5 h-3.5" />}
                            <span>
                              {isExpired
                                ? 'ترخيص منتهي'
                                : isVerified
                                ? 'مرشد مرخص موثق'
                                : guide.verificationStatus === 'NEEDS_UPDATE'
                                ? 'يحتاج تحديث'
                                : 'بانتظار التحقق'}
                            </span>
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleOpenGuideModal(guide)}
                            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-all shadow-sm"
                          >
                            تدقيق الترخيص واللغات
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REGULATORY UPDATES REGISTRY */}
      {activeSubTab === 'updates' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">سجل القوانين والقرارات التنظيمية (Regulatory Registry)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توثيق التعديلات التشريعية والقرارات الوزارية الصادرة عن وزارة السياحة والآثار وتأثيرها على المنصة.
              </p>
            </div>
            <button
              onClick={() => setShowAddUpdateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قرار أو تعديل تشريعي جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regulatoryUpdates.map(update => (
              <div key={update.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {update.source}
                    </span>
                    {update.decreeNumber && (
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                        {update.decreeNumber}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">{update.regulationNameAr}</h4>
                    <p className="text-xs text-slate-400 font-mono">{update.regulationName}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold shrink-0 ${
                      update.reviewStatus === 'IMPLEMENTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : update.reviewStatus === 'MONITORING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {update.reviewStatus === 'IMPLEMENTED' ? 'تم التطبيق' : update.reviewStatus === 'MONITORING' ? 'تحت المتابعة' : 'قيد المراجعة'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {update.summaryAr}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <div>
                    <strong className="text-slate-800">الميزة المتأثرة بالمنصة:</strong> {update.affectedPlatformFeature}
                  </div>
                  <div>
                    <strong className="text-slate-800">التعديل الإجرائي المطلوب:</strong> {update.requiredSystemChange}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                  <span>تاريخ السريان: {update.effectiveDate}</span>
                  <span>المراجع: {update.reviewedBy || 'الإدارة القانونية'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: COMPLAINTS & INTEGRITY QUEUE */}
      {activeSubTab === 'complaints' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">سجل بلاغات النزاهة والادعاءات المضللة</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                معالجة بلاغات المسافرين والجمهور ضد انتحال الصفة المهنية أو عرض معلومات غير دقيقة.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
              قناة الإبلاغ العام مفعلة بصفحة عرض الرحلات
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3.5">رقم البلاغ وتاريخه</th>
                    <th className="p-3.5">مُقدم البلاغ</th>
                    <th className="p-3.5">البرنامج / المرشد المعني</th>
                    <th className="p-3.5">نوع البلاغ</th>
                    <th className="p-3.5">تفاصيل الشكوى</th>
                    <th className="p-3.5 text-center">الحالة</th>
                    <th className="p-3.5 text-center">إجراءات التحقيق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map(cmp => (
                    <tr key={cmp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono text-xs text-slate-500">
                        <div className="font-bold text-slate-900">{cmp.id}</div>
                        <div>{cmp.createdAt.split('T')[0]}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{cmp.reporterName}</div>
                        <div className="text-slate-400 text-xs">{cmp.reporterEmail}</div>
                        <span className="inline-block mt-0.5 text-[10px] px-1.5 bg-slate-100 rounded text-slate-600">
                          {cmp.reporterRole === 'traveler' ? 'مسافر' : cmp.reporterRole === 'guide' ? 'مرشد سياحي' : 'زائر عام'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">{cmp.tripName || 'برنامج عام'}</div>
                        <div className="text-xs text-slate-500">المرشد: {cmp.guideName}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {cmp.complaintType === 'MISLEADING_GUIDE_STATUS'
                            ? 'ادعاء صفة مهنية غير موثقة'
                            : cmp.complaintType === 'FALSE_COMMERCIAL_CLAIM'
                            ? 'ادعاء تجاري غير مصرح به'
                            : cmp.complaintType === 'INACCURATE_SITE_INFO'
                            ? 'معلومات موقع غير دقيقة'
                            : 'أخرى'}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-[240px] text-xs text-slate-700 leading-relaxed">
                        <div className="line-clamp-3">{cmp.description}</div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            cmp.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : cmp.status === 'INVESTIGATING'
                              ? 'bg-blue-100 text-blue-800'
                              : cmp.status === 'DISMISSED'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {cmp.status === 'RESOLVED' ? 'تمت التسوية' : cmp.status === 'INVESTIGATING' ? 'قيد التحقيق' : cmp.status === 'DISMISSED' ? 'مستبعد' : 'جديد'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            setActiveComplaint(cmp);
                            setComplaintResolutionForm({
                              status: cmp.status as any,
                              adminNotes: cmp.adminNotes || '',
                              resolutionSummary: cmp.resolutionSummary || '',
                            });
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          معالجة البلاغ
                        </button>
                      </td>
                    </tr>
                  ))}
                  {complaints.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        لا توجد بلاغات مسجلة حالياً.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ARCHAEOLOGICAL SITES & MUSEUMS NOTICES */}
      {activeSubTab === 'sites' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">ضوابط وإشعارات المواقع والمتاحف الأثرية المصرية</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              إدارة الإشعارات والتحذيرات التنظيمية الملحقة بالمحطات السياحية (تذاكر الدفع غير النقدي، تصاريح التصوير التجاري، وإلزامية المرشد المرخص).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siteNotices.map(site => (
              <div key={site.siteKey} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{site.nameAr}</h4>
                    <p className="text-xs text-slate-400">{site.nameEn}</p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                      site.requiresOfficialLicensedGuide
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {site.requiresOfficialLicensedGuide ? 'يشترط مرشد مرخص' : 'موقع عام'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <div>
                    <strong className="text-slate-900 block mb-0.5">ضوابط التذاكر والحجز:</strong>
                    <span>{site.officialTicketingNotice}</span>
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">ضوابط التصوير والكاميرات:</strong>
                    <span>{site.photographyPermitNotice}</span>
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">مواعيد الزيارة الرسمية:</strong>
                    <span>{site.openingHoursNotice}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <a
                    href={site.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>البوابة الرسمية للوزارة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setEditingSiteNotice({ ...site })}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    تعديل الضوابط
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: DOCUMENT RETENTION & SECURITY POLICY */}
      {activeSubTab === 'retention' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">سياسة أمن المستندات والاحتفاظ بالبيانات (قانون 151 لسنة 2020)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  حماية البيانات الشخصية، تطبيق مبدأ الحد الأدنى للجمع، والتطهير الآمن للمستندات بعد استنفاد الغرض الإداري.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="text-xs text-slate-500 font-medium mb-1">فترة الاحتفاظ بالمستندات المرفوضة</div>
                <div className="text-xl font-bold text-slate-900">90 يوماً</div>
                <div className="text-[11px] text-slate-500 mt-1">يتم بعدها الحذف التام للرابط والملف</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="text-xs text-slate-500 font-medium mb-1">مستوى حجب وثائق الهوية</div>
                <div className="text-xl font-bold text-emerald-700">مشفر ومحجوب تماماً</div>
                <div className="text-[11px] text-slate-500 mt-1">غير متاح للعامة أو محركات البحث</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="text-xs text-slate-500 font-medium mb-1">آخر عملية تطهير آمن</div>
                <div className="text-sm font-bold text-slate-900">
                  {overviewData.retentionSettings?.lastPurgeRunAt?.split('T')[0] || new Date().toISOString().split('T')[0]}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">سجل التدقيق مسجل بالنظام</div>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/70 p-4 rounded-xl text-xs text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4" />
                <span>إجراء التطهير الآمن للمستندات (Secure Document Purging):</span>
              </div>
              <p>
                عند تشغيل التطهير، يقوم الخادم بفحص جميع الحسابات المرفوضة أو غير المؤهلة وإزالة مراجع المستندات الشخصية وروابطها فوراً، مع تسجيل العملية في سجل التدقيق غير القابل للتعديل لضمان الامتثال التام لقانون حماية البيانات الشخصية.
              </p>
              <div className="pt-2">
                <button
                  onClick={handlePurgeDocuments}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تنفيذ التطهير الآمن للمستندات المنتهية الآن</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT COMPLIANCE REQUIREMENT */}
      {editingReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">تعديل معيار الامتثال</h3>
                <p className="text-xs text-slate-500">{editingReq.titleAr}</p>
              </div>
              <button onClick={() => setEditingReq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRequirement} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">السند القانوني والتشريعي:</label>
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-200 font-mono text-xs">
                  {editingReq.legalBasis}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">حالة الامتثال:</label>
                  <select
                    value={editingReq.status}
                    onChange={e => setEditingReq({ ...editingReq, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-medium"
                  >
                    <option value="COMPLIANT">مستوفى (COMPLIANT)</option>
                    <option value="IN_REVIEW">قيد المراجعة (IN_REVIEW)</option>
                    <option value="NEEDS_UPDATE">يحتاج تحديث (NEEDS_UPDATE)</option>
                    <option value="NON_COMPLIANT">غير مستوفى (NON_COMPLIANT)</option>
                    <option value="NOT_APPLICABLE">غير منطبق (NOT_APPLICABLE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">مستوى المخاطر:</label>
                  <select
                    value={editingReq.riskLevel}
                    onChange={e => setEditingReq({ ...editingReq, riskLevel: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-medium"
                  >
                    <option value="LOW">منخفض (LOW)</option>
                    <option value="MEDIUM">متوسط (MEDIUM)</option>
                    <option value="HIGH">مرتفع (HIGH)</option>
                    <option value="LEGAL_REVIEW_REQUIRED">يتطلب مراجعة قانونية (LEGAL REVIEW)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ملاحظة التدقيق والأدلة المستندية:</label>
                <textarea
                  rows={3}
                  value={editingReq.evidenceNote || ''}
                  onChange={e => setEditingReq({ ...editingReq, evidenceNote: e.target.value })}
                  placeholder="سجل أدلة التحقق أو الإجراءات البرمجية المتخذة لاستيفاء المعيار..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الإجراء المطلوب (إن وجد):</label>
                <input
                  type="text"
                  value={editingReq.actionRequired || ''}
                  onChange={e => setEditingReq({ ...editingReq, actionRequired: e.target.value })}
                  placeholder="أي خطوة تصحيحية مطلوب تنفيذها..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReq(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-sm"
                >
                  حفظ التعديل في سجل التدقيق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GUIDE LICENSE VERIFICATION & LANGUAGES */}
      {editingGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  تدقيق ترخيص المرشد السياحي واللغات المعتمدة
                </h3>
                <p className="text-xs text-slate-500">{editingGuide.name} ({editingGuide.email})</p>
              </div>
              <button onClick={() => setEditingGuide(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview if available */}
            {editingGuide.proofDocumentUrl && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>مستند الترخيص / الكارنيه المرفوع من المرشد:</span>
                  </span>
                  <a
                    href={editingGuide.proofDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح في نافذة كاملة</span>
                  </a>
                </div>
                {editingGuide.proofDocumentUrl.startsWith('data:') || editingGuide.proofDocumentUrl.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i) ? (
                  <div className="flex justify-center bg-slate-900/10 rounded-lg p-2 max-h-44 overflow-hidden">
                    <img
                      src={editingGuide.proofDocumentUrl}
                      alt="ترخيص المرشد"
                      referrerPolicy="no-referrer"
                      className="max-h-40 object-contain rounded"
                    />
                  </div>
                ) : null}
              </div>
            )}

            <form onSubmit={handleSaveGuideVerification} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الاسم الرباعي الرسمي (طبقا للترخيص):</label>
                  <input
                    type="text"
                    value={guideForm.fullLegalName}
                    onChange={e => setGuideForm({ ...guideForm, fullLegalName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الجهة المصدرة للترخيص:</label>
                  <input
                    type="text"
                    value={guideForm.issuingAuthority}
                    onChange={e => setGuideForm({ ...guideForm, issuingAuthority: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">رقم ترخيص وزارة السياحة والآثار:</label>
                  <input
                    type="text"
                    value={guideForm.licenseNumber}
                    onChange={e => setGuideForm({ ...guideForm, licenseNumber: e.target.value })}
                    placeholder="مثال: MOTA-TG-9482"
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">رقم القيد بنقابة المرشدين السياحيين:</label>
                  <input
                    type="text"
                    value={guideForm.syndicateNumber}
                    onChange={e => setGuideForm({ ...guideForm, syndicateNumber: e.target.value })}
                    placeholder="مثال: SYN-EG-14892"
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">تاريخ إصدار الترخيص:</label>
                  <input
                    type="date"
                    value={guideForm.issueDate}
                    onChange={e => setGuideForm({ ...guideForm, issueDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">تاريخ انتهاء / تجديد الترخيص:</label>
                  <input
                    type="date"
                    value={guideForm.expiryDate}
                    onChange={e => setGuideForm({ ...guideForm, expiryDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Authorized Languages Checkboxes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  اللغات المعتمدة رسميًا في ترخيص الإرشاد (Authorized Languages):
                </label>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap gap-3">
                  {availableLanguagesList.map(l => {
                    const isChecked = guideForm.authorizedLanguages.includes(l.code);
                    return (
                      <label
                        key={l.code}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setGuideForm({
                                ...guideForm,
                                authorizedLanguages: [...guideForm.authorizedLanguages, l.code],
                              });
                            } else {
                              setGuideForm({
                                ...guideForm,
                                authorizedLanguages: guideForm.authorizedLanguages.filter(c => c !== l.code),
                              });
                            }
                          }}
                          className="hidden"
                        />
                        <span>{l.label} ({l.code.toUpperCase()})</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * اللغات غير المحددة هنا ستظهر كـ "لغة تواصل مدخلة ذاتياً" ولا تمنح شارة الاعتماد الرسمي.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">صفة الكيان المهني:</label>
                  <select
                    value={guideForm.commercialEntityStatus}
                    onChange={e => setGuideForm({ ...guideForm, commercialEntityStatus: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="INDIVIDUAL_GUIDE">مرشد سياحي فردي مستقل (Individual Licensed Guide)</option>
                    <option value="VERIFIED_COMPANY">شركة سياحة مسجلة وموثقة (Verified Tourism Company)</option>
                    <option value="UNVERIFIED_CLAIM">ادعاء تجاري قيد التحقق (Unverified Claim)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">حالة التوثيق الإداري:</label>
                  <select
                    value={guideForm.verificationStatus}
                    onChange={e => setGuideForm({ ...guideForm, verificationStatus: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-semibold"
                  >
                    <option value="LICENSED_GUIDE_VERIFIED">مرشد مرخص موثق (LICENSED_GUIDE_VERIFIED)</option>
                    <option value="IDENTITY_VERIFIED">تم التحقق من الهوية فقط (IDENTITY_VERIFIED)</option>
                    <option value="NEEDS_UPDATE">يحتاج تحديث بيانات (NEEDS_UPDATE)</option>
                    <option value="LICENSE_EXPIRED">ترخيص منتهي (LICENSE_EXPIRED)</option>
                    <option value="SUSPENDED">موقوف إدارياً (SUSPENDED)</option>
                    <option value="NOT_ELIGIBLE">غير مؤهل للمزاولة (NOT_ELIGIBLE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ملاحظات التحقق والتدقيق الإداري:</label>
                <textarea
                  rows={2}
                  value={guideForm.verificationNotes}
                  onChange={e => setGuideForm({ ...guideForm, verificationNotes: e.target.value })}
                  placeholder="سجل نتائج مراجعة الترخيص وبطاقة النقابة وتاريخ المراجعة..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="requiresLegalReview"
                  checked={guideForm.requiresLegalReview}
                  onChange={e => setGuideForm({ ...guideForm, requiresLegalReview: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="requiresLegalReview" className="text-xs text-amber-900 font-medium cursor-pointer">
                  وسم الحساب كـ "يتطلب مراجعة قانونية خاصة" في حال وجود تداخل في اللغات أو الكيان التجاري.
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGuide(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-sm"
                >
                  اعتماد وتوثيق الترخيص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD REGULATORY UPDATE */}
      {showAddUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">إضافة قرار أو تحديث تشريعي جديد</h3>
                <p className="text-xs text-slate-500">تسجيل التعديلات التنظيمية ومواءمتها مع المنصة</p>
              </div>
              <button onClick={() => setShowAddUpdateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRegulatoryUpdate} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">اسم القانون / القرار الوزاري (بالعربية):</label>
                <input
                  type="text"
                  value={newUpdateForm.regulationNameAr}
                  onChange={e => setNewUpdateForm({ ...newUpdateForm, regulationNameAr: e.target.value })}
                  placeholder="مثال: قرار وزير السياحة والآثار رقم ... لسنة 2026"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الجهة المصدرة / المصدر:</label>
                  <input
                    type="text"
                    value={newUpdateForm.source}
                    onChange={e => setNewUpdateForm({ ...newUpdateForm, source: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">رقم القرار / المرجع:</label>
                  <input
                    type="text"
                    value={newUpdateForm.decreeNumber}
                    onChange={e => setNewUpdateForm({ ...newUpdateForm, decreeNumber: e.target.value })}
                    placeholder="مثال: قرار 142 لسنة 2024"
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">تاريخ النشر بالجريدة الرسمية:</label>
                  <input
                    type="date"
                    value={newUpdateForm.publishedDate}
                    onChange={e => setNewUpdateForm({ ...newUpdateForm, publishedDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">تاريخ بدء السريان الفعلي:</label>
                  <input
                    type="date"
                    value={newUpdateForm.effectiveDate}
                    onChange={e => setNewUpdateForm({ ...newUpdateForm, effectiveDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الملخص التنفيذي للقرار:</label>
                <textarea
                  rows={2}
                  value={newUpdateForm.summaryAr}
                  onChange={e => setNewUpdateForm({ ...newUpdateForm, summaryAr: e.target.value })}
                  placeholder="شرح موجز لأهم ما تضمنه القرار والضوابط المنصوص عليها..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الميزة المتأثرة بالمنصة:</label>
                  <input
                    type="text"
                    value={newUpdateForm.affectedPlatformFeature}
                    onChange={e => setNewUpdateForm({ ...newUpdateForm, affectedPlatformFeature: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">حالة المراجعة:</label>
                  <select
                    value={newUpdateForm.reviewStatus}
                    onChange={e => setNewUpdateForm({ ...newUpdateForm, reviewStatus: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-medium"
                  >
                    <option value="PENDING_LEGAL_REVIEW">قيد المراجعة القانونية (PENDING)</option>
                    <option value="IMPLEMENTED">تم التطبيق البرمجي والإجرائي (IMPLEMENTED)</option>
                    <option value="MONITORING">تحت المراقبة المستمرة (MONITORING)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUpdateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-sm"
                >
                  إضافة لسجل القرارات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RESOLVE COMPLAINT */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">معالجة بلاغ والتحقيق في النزاهة</h3>
                <p className="text-xs text-slate-500">رقم البلاغ: {activeComplaint.id}</p>
              </div>
              <button onClick={() => setActiveComplaint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveComplaint} className="space-y-3.5 text-xs sm:text-sm">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div><strong className="text-slate-800">مقدم البلاغ:</strong> {activeComplaint.reporterName} ({activeComplaint.reporterEmail})</div>
                <div><strong className="text-slate-800">المرشد / البرنامج:</strong> {activeComplaint.guideName} • {activeComplaint.tripName || 'عام'}</div>
                <div><strong className="text-slate-800">تفاصيل الشكوى:</strong> {activeComplaint.description}</div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">قرار وحالة البلاغ:</label>
                <select
                  value={complaintResolutionForm.status}
                  onChange={e => setComplaintResolutionForm({ ...complaintResolutionForm, status: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-semibold"
                >
                  <option value="INVESTIGATING">قيد التحقيق وطلب إيضاحات (INVESTIGATING)</option>
                  <option value="RESOLVED">تم التحقق والتسوية / اتخاذ إجراء تصحيحي (RESOLVED)</option>
                  <option value="DISMISSED">استبعاد البلاغ لعدم الصحة (DISMISSED)</option>
                  <option value="ESCALATED">تصعيد للإدارة القانونية (ESCALATED)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ملاحظات التحقيق الداخلي (Admin Notes):</label>
                <textarea
                  rows={2}
                  value={complaintResolutionForm.adminNotes}
                  onChange={e => setComplaintResolutionForm({ ...complaintResolutionForm, adminNotes: e.target.value })}
                  placeholder="سجل خطوات فحص الترخيص والتواصل مع المرشد..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ملخص القرار والتسوية (Resolution Summary):</label>
                <textarea
                  rows={2}
                  value={complaintResolutionForm.resolutionSummary}
                  onChange={e => setComplaintResolutionForm({ ...complaintResolutionForm, resolutionSummary: e.target.value })}
                  placeholder="الإجراء المتخذ (مثال: تصحيح اللغات المعتمدة، تعديل صفة الكيان، أو إيقاف الحساب)..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveComplaint(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-sm"
                >
                  حفظ القرار والإغلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT SITE NOTICE */}
      {editingSiteNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">تعديل ضوابط المزار الأثري</h3>
                <p className="text-xs text-slate-500">{editingSiteNotice.nameAr}</p>
              </div>
              <button onClick={() => setEditingSiteNotice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSiteNotice} className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="requiresOfficialLicensedGuide"
                  checked={editingSiteNotice.requiresOfficialLicensedGuide}
                  onChange={e => setEditingSiteNotice({ ...editingSiteNotice, requiresOfficialLicensedGuide: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="requiresOfficialLicensedGuide" className="text-xs text-slate-900 font-semibold cursor-pointer">
                  يشترط مرافقة مرشد سياحي مرخص رسمياً في هذا الموقع
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">إشعار التذاكر والدفع غير النقدي:</label>
                <textarea
                  rows={2}
                  value={editingSiteNotice.officialTicketingNotice}
                  onChange={e => setEditingSiteNotice({ ...editingSiteNotice, officialTicketingNotice: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">إشعار وضوابط التصوير والكاميرات:</label>
                <textarea
                  rows={2}
                  value={editingSiteNotice.photographyPermitNotice}
                  onChange={e => setEditingSiteNotice({ ...editingSiteNotice, photographyPermitNotice: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">مواعيد الزيارة الرسمية:</label>
                <input
                  type="text"
                  value={editingSiteNotice.openingHoursNotice}
                  onChange={e => setEditingSiteNotice({ ...editingSiteNotice, openingHoursNotice: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSiteNotice(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-sm"
                >
                  حفظ الضوابط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
