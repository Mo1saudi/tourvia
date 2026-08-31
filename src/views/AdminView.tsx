import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '../services/api';
import { PromoCode, PaymentRequest, User, AuditLogItem, Campaign } from '../types';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'promos' | 'campaigns' | 'logs'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Action Modals
  const [rejectGuideModal, setRejectGuideModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [grantPlanModal, setGrantPlanModal] = useState<{ id: string; name: string } | null>(null);
  const [grantPlanId, setGrantPlanId] = useState('plan_pro');
  const [grantDays, setGrantDays] = useState(30);

  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(25);

  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignMessage, setNewCampaignMessage] = useState('');

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [ovRes, uRes, pRes, prRes, cmpRes, logRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminPayments(),
        api.getAdminPromos(),
        api.getAdminCampaigns(),
        api.getAdminAuditLogs(),
      ]);
      setOverview(ovRes);
      setUsers(uRes.users);
      setPayments(pRes.payments);
      setPromos(prRes.promoCodes);
      setCampaigns(cmpRes.campaigns);
      setAuditLogs(logRes.auditLogs);
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleVerifyGuide = async (userId: string) => {
    try {
      await api.verifyAdminGuide(userId, 'تم التحقق من الكارنيه والمستندات بنجاح من إدارة TOURVIA.');
      alert('تم توثيق المرشد وإرسال إشعار رسمي له.');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Verification failed.');
    }
  };

  const handleRejectGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectGuideModal || !rejectReason) return;
    try {
      await api.rejectAdminGuide(rejectGuideModal.id, rejectReason);
      alert('تم رفض التوثيق وإبلاغ المرشد بالسبب.');
      setRejectGuideModal(null);
      setRejectReason('');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    }
  };

  const handleGrantPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantPlanModal) return;
    try {
      await api.grantAdminPlan(grantPlanModal.id, grantPlanId, grantDays);
      alert('تم تفعيل الباقة وتحديث رصيد الذكاء الاصطناعي بنجاح.');
      setGrantPlanModal(null);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Grant plan failed.');
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    if (!window.confirm('هل أنت متأكد من تأكيد استلام الدفعة وتفعيل الباقة للمستخدم؟')) return;
    try {
      await api.approveAdminPayment(paymentId);
      alert('تم اعتماد الدفع وتفعيل الباقة فورًا.');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to approve payment.');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    const note = window.prompt('سبب رفض طلب الدفع:');
    if (!note) return;
    try {
      await api.rejectAdminPayment(paymentId, note);
      alert('تم رفض طلب الدفع.');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to reject payment.');
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode) return;
    try {
      await api.createAdminPromo({
        code: newPromoCode,
        discountPercent: newPromoDiscount,
      });
      alert('تم إنشاء كود الخصم بنجاح.');
      setNewPromoCode('');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to create promo code.');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle || !newCampaignMessage) return;
    try {
      await api.createAdminCampaign({
        title: newCampaignTitle,
        message: newCampaignMessage,
      });
      alert('تم إرسال الحملة الإعلانية وإشعار جميع المستخدمين بنجاح!');
      setNewCampaignTitle('');
      setNewCampaignMessage('');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast campaign.');
    }
  };

  const metrics = overview?.metrics || {};

  return (
    <div id="admin-view-root" className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              لوحة التحكم الرئيسية للمنصة (Admin Panel)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            إدارة المرشدين والتوثيق، اعتماد المدفوعات، أكواد الخصم، ومراقبة العمليات.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAll}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-w-max gap-1">
          {[
            { id: 'overview', label: 'نظرة عامة', count: null },
            { id: 'users', label: 'المستخدمون والتوثيق', count: metrics.pendingVerifications },
            { id: 'payments', label: 'طلبات الدفع', count: metrics.pendingPayments },
            { id: 'promos', label: 'أكواد الخصم', count: promos.length },
            { id: 'campaigns', label: 'الحملات والإشعارات', count: null },
            { id: 'logs', label: 'سجل العمليات (Audit Logs)', count: null },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-400">إجمالي المرشدين</span>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{metrics.totalUsers || 0}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-400">المرشدين الموثقين</span>
              <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.verifiedGuides || 0}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-400">توثيق بانتظار المراجعة</span>
              <div className="mt-1 text-2xl font-black text-amber-500">{metrics.pendingVerifications || 0}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-400">إجمالي البرامج</span>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{metrics.totalTrips || 0}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-400">توليدات الذكاء الاصطناعي</span>
              <div className="mt-1 text-2xl font-black text-amber-500">{metrics.totalAiGenerations || 0}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-400">إيرادات الاشتراكات</span>
              <div className="mt-1 text-xl font-black text-emerald-600">{(metrics.totalRevenue || 0).toLocaleString()} EGP</div>
            </div>
          </div>

          {/* Quick Pending Verifications list */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              طلبات التوثيق العاجلة
            </h3>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {users.filter(u => u.verificationStatus === 'PENDING_VERIFICATION').length === 0 ? (
                <p className="py-4 text-xs text-slate-400">لا توجد طلبات توثيق معلقة حاليًا.</p>
              ) : (
                users.filter(u => u.verificationStatus === 'PENDING_VERIFICATION').map(u => (
                  <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                      <p className="text-[11px] text-slate-400">{u.email} • {u.phone}</p>
                      {u.proofDocumentUrl && (
                        <a href={u.proofDocumentUrl} target="_blank" rel="noreferrer" className="text-amber-600 underline">
                          معاينة مستند الترخيص
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleVerifyGuide(u.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                      >
                        قبول وتوثيق
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectGuideModal({ id: u.id, name: u.name })}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
                      >
                        رفض
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & VERIFICATION */}
      {activeTab === 'users' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              قائمة المستخدمين والمرشدين ({users.length})
            </h3>
            <input
              type="text"
              placeholder="ابحث بالاسم أو البريد..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="py-3 px-4">المرشد / الشركة</th>
                  <th className="py-3 px-4">نوع الحساب</th>
                  <th className="py-3 px-4">حالة التوثيق</th>
                  <th className="py-3 px-4">الباقة الحالية</th>
                  <th className="py-3 px-4">استهلاك AI</th>
                  <th className="py-3 px-4">البرامج</th>
                  <th className="py-3 px-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users
                  .filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                  .map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email} • {u.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                        {u.accountType === 'company' ? 'شركة سياحة' : u.role === 'admin' ? 'مدير نظام (Admin)' : 'مرشد سياحي'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            u.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : u.verificationStatus === 'PENDING_VERIFICATION'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {u.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">
                        {u.activeSubscription?.planCode || 'FREE'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {u.aiUsage?.lifetimeUsed || 0} / {u.aiUsage?.lifetimeLimit || 3}
                      </td>
                      <td className="py-3 px-4 font-bold">{u.tripsCount || 0}</td>
                      <td className="py-3 px-4 flex items-center gap-1.5">
                        {u.verificationStatus !== 'VERIFIED' && (
                          <button
                            type="button"
                            onClick={() => handleVerifyGuide(u.id)}
                            className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                          >
                            توثيق
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setGrantPlanModal({ id: u.id, name: u.name })}
                          className="rounded-md bg-purple-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-purple-500"
                        >
                          منح باقة
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENTS QUEUE */}
      {activeTab === 'payments' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              طلبات الدفع والترقية ({payments.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="py-3 px-4">المستخدم</th>
                  <th className="py-3 px-4">الباقة والمبلغ</th>
                  <th className="py-3 px-4">وسيلة الدفع والمرجع</th>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.userName}</div>
                      <div className="text-[10px] text-slate-400">{p.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-600">
                      {p.planId} ({p.amount} {p.currency})
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <div>{p.paymentMethod}</div>
                      <div className="text-[10px] text-slate-400">{p.transactionRef}</div>
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          p.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : p.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'PENDING' && (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprovePayment(p.id)}
                            className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                          >
                            موافقة وتفعيل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectPayment(p.id)}
                            className="rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-500"
                          >
                            رفض
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PROMO CODES */}
      {activeTab === 'promos' && (
        <div className="space-y-6">
          {/* Create Promo Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">إنشاء كود خصم جديد</h3>
            <form onSubmit={handleCreatePromo} className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500">كود الخصم (الكوبون):</label>
                <input
                  type="text"
                  required
                  placeholder="TOURVIA50"
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                  className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono uppercase dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500">نسبة الخصم (%):</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={newPromoDiscount}
                  onChange={e => setNewPromoDiscount(Number(e.target.value))}
                  className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs w-28 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500"
              >
                إضافة الكوبون
              </button>
            </form>
          </div>

          {/* Promos Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">الأكواد الفعالة</h3>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {promos.map(pr => (
                <div key={pr.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-black text-sm text-purple-600">{pr.code}</span>
                    <p className="text-[11px] text-slate-500">
                      خصم: {pr.discountPercent}% • تم الاستخدام: {pr.usedCount} مرات
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    فعّال
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">إرسال إشعار تسويقي لجميع المرشدين</h3>
            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">عنوان الحملة / الإشعار:</label>
                <input
                  type="text"
                  required
                  placeholder="عرض خاص للمرشدين المعتمدين بمناسبة موسم الشتاء"
                  value={newCampaignTitle}
                  onChange={e => setNewCampaignTitle(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">نص الرسالة:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="استفد الآن من خصم 30% على باقة PRO بكود WINTER30..."
                  value={newCampaignMessage}
                  onChange={e => setNewCampaignMessage(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-purple-500"
              >
                إرسال الإشعار لجميع المشتركين
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">سجل الحملات السابقة</h3>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {campaigns.map(c => (
                <div key={c.id} className="py-3 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>{c.title}</span>
                    <span className="text-slate-400 font-normal">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{c.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">سجل العمليات الإدارية (Audit Log)</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-purple-600">[{log.action}]</span>
                  <span className="mr-2 text-slate-800 dark:text-slate-200">{log.details}</span>
                  <div className="text-[10px] text-slate-400">بواسطة: {log.userEmail}</div>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject Guide Modal */}
      {rejectGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white">رفض توثيق: {rejectGuideModal.name}</h3>
            <form onSubmit={handleRejectGuideSubmit} className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">سبب الرفض الإلزامي:</label>
              <textarea
                rows={3}
                required
                placeholder="صورة الكارنيه غير واضحة أو منتهية الصلاحية..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectGuideModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
                >
                  تأكيد الرفض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Plan Modal */}
      {grantPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white">منح باقة للمستخدم: {grantPlanModal.name}</h3>
            <form onSubmit={handleGrantPlanSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">اختر الباقة:</label>
                <select
                  value={grantPlanId}
                  onChange={e => setGrantPlanId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="plan_basic">Basic Plan (15 AI Trips)</option>
                  <option value="plan_pro">Pro Plan (60 AI Trips)</option>
                  <option value="plan_agency">Agency Plan (Unlimited AI)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">مدة الصلاحية (بالأيام):</label>
                <input
                  type="number"
                  value={grantDays}
                  onChange={e => setGrantDays(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGrantPlanModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
                >
                  تفعيل ومنح الباقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
