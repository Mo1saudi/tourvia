import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  Zap,
  Tag,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { SubscriptionPlan, PaymentRequest } from '../types';

export const SubscriptionsView: React.FC = () => {
  const { user, subscription, aiUsage, refreshProfile } = useAuth();
  const { t } = useLanguage();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [validatedPromo, setValidatedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState<string>('');

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'INSTAPAY' | 'VODAFONE_CASH' | 'CARD' | 'BANK_TRANSFER'>('INSTAPAY');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // My Payments History
  const [myPayments, setMyPayments] = useState<PaymentRequest[]>([]);

  useEffect(() => {
    api.getPlans().then(res => setPlans(res.plans)).catch(console.warn);
    api.getMyPayments().then(res => setMyPayments(res.payments)).catch(console.warn);
  }, []);

  const handleValidatePromo = async () => {
    if (!promoCodeInput.trim() || !selectedPlan) return;
    setPromoError('');
    try {
      const res = await api.validatePromoCode(promoCodeInput, selectedPlan.id);
      setValidatedPromo(res);
    } catch (err: any) {
      setPromoError(err.message || 'كوبون الخصم غير صالح.');
      setValidatedPromo(null);
    }
  };

  const handleOpenPayment = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setValidatedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
    setPaymentSuccess(null);
    setIsPaymentModalOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setIsSubmitting(true);

    try {
      const res = await api.submitPaymentRequest({
        planId: selectedPlan.id,
        paymentMethod,
        senderPhone: senderPhone || user?.phone,
        transactionRef,
        receiptUrl,
        promoCode: validatedPromo?.promo?.code,
      });

      setPaymentSuccess(res.message);
      api.getMyPayments().then(p => setMyPayments(p.payments));
      setTimeout(() => {
        setIsPaymentModalOpen(false);
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'فشل إرسال طلب الدفع.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalAmount = validatedPromo ? validatedPromo.finalPrice : selectedPlan?.price || 0;

  return (
    <div id="subscriptions-view-root" className="space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>باقات الاشتراك وحسابات المرشدين</span>
        </span>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
          اختر الباقة المناسبة لنمو أعمالك السياحية
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          جميع الباقات تمنحك وصولاً كاملاً لمولد البرامج الذكي، صفحات الويب العامة، وحساب التكاليف.
        </p>
      </div>

      {/* Active Subscription Status Card */}
      <div className="mx-auto max-w-4xl rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 to-white p-6 shadow-md dark:border-amber-900 dark:from-slate-900 dark:to-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              باقتك الحالية
            </span>
            <div className="mt-1 flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {subscription?.planCode || 'FREE'} PLAN
              </h3>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                نشط
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              رصيد الذكاء الاصطناعي: {aiUsage?.isUnlimited ? 'غير محدود' : `${Math.max(0, (aiUsage?.lifetimeLimit || 3) - (aiUsage?.lifetimeUsed || 0))} برنامج متبقي`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              تاريخ التجديد: {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'دائم (مدى الحياة)'}
            </span>
          </div>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {plans.map(plan => {
          const isCurrent = (subscription?.planCode || 'FREE') === plan.code;
          const isPro = plan.code === 'PRO';

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                isPro
                  ? 'border-2 border-amber-500 bg-white shadow-xl dark:bg-slate-900'
                  : 'border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              {isPro && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-xs">
                  الأكثر طلبًا
                </span>
              )}

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {plan.nameAr || plan.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {plan.description}
                </p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {plan.price === 0 ? 'مجانًا' : plan.price.toLocaleString()}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-xs font-bold text-slate-400">
                      {plan.currency} / {plan.billingCycle === 'monthly' ? 'شهريًا' : 'مدى الحياة'}
                    </span>
                  )}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-slate-400">المميزات:</span>
                  <ul className="mt-2.5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{plan.aiUnlimited ? 'توليد ذكي غير محدود' : `${plan.aiLimit} برنامج ذكي`}</span>
                    </li>
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  >
                    باقتك الحالية
                  </button>
                ) : plan.price === 0 ? (
                  <button
                    disabled
                    className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    متاحة افتراضيًا
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(plan)}
                    className={`w-full rounded-xl py-2.5 text-xs font-black transition-all ${
                      isPro
                        ? 'bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400'
                        : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950'
                    }`}
                  >
                    ترقية الآن
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Requests History */}
      {myPayments.length > 0 && (
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            سجل طلبات الدفع والاشتراكات
          </h3>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {myPayments.map(p => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    طلب باقة: {p.planId} ({p.amount} {p.currency})
                  </span>
                  <p className="text-[11px] text-slate-400">
                    وسيلة الدفع: {p.paymentMethod} • مرجع: {p.transactionRef || 'تحويل مباشر'}
                  </p>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-black ${
                    p.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : p.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  {p.status === 'APPROVED' ? 'تمت الموافقة والتفعيل' : p.status === 'PENDING' ? 'قيد المراجعة' : 'مرفوض'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  ترقية إلى: {selectedPlan.nameAr || selectedPlan.name}
                </h3>
                <span className="text-xs text-slate-400">
                  المبلغ المطلوب: {finalAmount.toLocaleString()} {selectedPlan.currency}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
                <h4 className="font-bold text-slate-900 dark:text-white">تم إرسال طلب الدفع بنجاح!</h4>
                <p className="text-xs text-slate-500">{paymentSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="mt-4 space-y-4">
                {/* Promo Code Input */}
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    هل لديك كود خصم؟ (Promo Code)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="TRVPROMO2026"
                      value={promoCodeInput}
                      onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleValidatePromo}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-950"
                    >
                      تطبيق
                    </button>
                  </div>
                  {validatedPromo && (
                    <p className="mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ تم خصم {validatedPromo.discountAmount} {selectedPlan.currency} بنجاح!
                    </p>
                  )}
                  {promoError && (
                    <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                      {promoError}
                    </p>
                  )}
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اختر وسيلة الدفع المناسبة:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'INSTAPAY', label: 'InstaPay (انستاباي)', details: 'IPA: tourvia@instapay أو 01012345678' },
                      { id: 'VODAFONE_CASH', label: 'فودافون كاش', details: 'رقم المحفظة: 01012345678' },
                      { id: 'BANK_TRANSFER', label: 'تحويل بنكي (CIB / NBE)', details: 'حساب CIB: 100045678901' },
                      { id: 'CARD', label: 'بطاقة بنكية (فيزا/ماستركارد)', details: 'دفع إلكتروني آمن' },
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`rounded-xl border p-2.5 text-left text-xs font-bold transition-all ${
                          paymentMethod === method.id
                            ? 'border-2 border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <div>{method.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{method.details}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transfer Info */}
                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  <p className="font-bold">تعليمات التحويل:</p>
                  <p className="mt-1">
                    يرجى تحويل مبلغ <strong>{finalAmount.toLocaleString()} {selectedPlan.currency}</strong> عبر الوسيلة المحددة، ثم إدخال رقم العملية المرجعي لتأكيد وتفعيل الباقة فورًا.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رقم الهاتف أو الحساب المحول منه *
                  </label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={e => setSenderPhone(e.target.value)}
                    placeholder="01012345678"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رقم العملية أو المرجع (Reference Number) *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    placeholder="Ref #1234567890"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رابط إيصال التحويل (اختياري)
                  </label>
                  <input
                    type="url"
                    value={receiptUrl}
                    onChange={e => setReceiptUrl(e.target.value)}
                    placeholder="https://... (رابط صورة الإيصال)"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'جارٍ الإرسال...' : 'تأكيد وإرسال طلب التفعيل'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
