import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  CreditCard,
  Building,
  UserCheck,
  Shield,
  Zap,
  ArrowRight,
  Star
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface HomepagePlansSectionProps {
  onNavigate: (view: string, targetId?: string) => void;
}

export const HomepagePlansSection: React.FC<HomepagePlansSectionProps> = ({ onNavigate }) => {
  const { t, isRtl } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      code: 'FREE',
      name: isRtl ? 'الباقة المجانية' : 'Free Explorer',
      badge: isRtl ? 'مجاني للأبد' : 'Forever Free',
      price: 0,
      period: isRtl ? 'مدى الحياة' : 'Lifetime',
      desc: isRtl ? 'ابدأ تجربة TOURVIA واستكشف قدرات الذكاء الاصطناعي السياحي فوراً.' : 'Test TOURVIA with 3 lifetime AI travel programs.',
      features: isRtl
        ? [
            '3 برامج سياحية بالذكاء الاصطناعي مدى الحياة',
            'حتى 3 وجهات ومحافظات لكل برنامج',
            'روابط ويب تفاعلية مباشرة للعملاء',
            'حساب التكاليف وهوامش الربح الأساسية',
            'دعم كامل للأجهزة الذكية',
          ]
        : [
            '3 Lifetime AI Trip Generations',
            'Up to 3 Destinations per Trip',
            'Live Public Client Web Links',
            'Basic Cost & Profit Calculation',
            'Full Smartphone & Mobile Support',
          ],
      popular: false,
      ctaText: t('startFree'),
      ctaVariant: 'secondary',
    },
    {
      code: 'BASIC',
      name: isRtl ? 'باقة المرشد الأساسية' : 'Guide Starter',
      badge: isRtl ? 'للمرشد المستقل' : 'Solo Guide',
      price: billingCycle === 'yearly' ? 290 : 350,
      period: isRtl ? 'شهرياً' : '/ month',
      desc: isRtl ? 'للمرشدين النشطين الراغبين في إنشاء برامج منتظمة وتصدير PDF.' : 'For active tour guides creating regular itineraries with PDF export.',
      features: isRtl
        ? [
            '15 برنامج بالذكاء الاصطناعي شهرياً',
            'حتى 5 وجهات ومحافظات لكل برنامج',
            'تصدير كتيبات PDF عالية الدقة للطباعة',
            'وضع العرض التقديمي (Slideshow) أمام العملاء',
            'استقبال استفسارات وتقييمات العملاء عبر الرابط',
          ]
        : [
            '15 AI Trip Generations / month',
            'Up to 5 Destinations per Trip',
            'High-Res PDF Export & Printouts',
            'Client Presentation & Slideshow Mode',
            'Receive Inquiries & Client Reviews',
          ],
      popular: false,
      ctaText: t('choosePlan'),
      ctaVariant: 'secondary',
    },
    {
      code: 'PRO',
      name: isRtl ? 'باقة المحترفين' : 'Professional Guide',
      badge: t('mostPopular'),
      price: billingCycle === 'yearly' ? 620 : 750,
      period: isRtl ? 'شهرياً' : '/ month',
      desc: isRtl ? 'سعة ذكاء اصطناعي عالية، هوية بصرية مخصصة بشعارك، وخرائط تفاعلية.' : 'High AI quota, White-label branding, interactive maps, and priority support.',
      features: isRtl
        ? [
            '60 برنامج ذكي شهرياً مع أولوية المعالجة',
            'وجهات ومحطات غير محدودة بكافة محافظات مصر',
            'إضافة شعارك وألوان هويتك التجارية على البرامج',
            'خرائط مسار تفاعلية مربوطة بالأماكن الجغرافية',
            'تحليلات أرباح تفصيلية وتصدير CSV',
            'توثيق رخصة الإرشاد ودعم فني ذو أولوية',
          ]
        : [
            '60 AI Trip Generations / month',
            'Unlimited Destinations & Stations in Egypt',
            'Custom Logo & Brand Colors on Itineraries',
            'Interactive Geographic Route Maps',
            'Detailed Profit Analytics & CSV Export',
            'Guide License Verification & Priority Support',
          ],
      popular: true,
      ctaText: t('choosePlan'),
      ctaVariant: 'primary',
    },
    {
      code: 'PREMIUM',
      name: isRtl ? 'باقة الشركات والوكالات' : 'Enterprise / Agency',
      badge: isRtl ? 'للشركات والفرق' : 'Agencies & Teams',
      price: billingCycle === 'yearly' ? 1500 : 1800,
      period: isRtl ? 'شهرياً' : '/ month',
      desc: isRtl ? 'برامج ذكاء اصطناعي غير محدودة، تجربة بيضاء بالكامل، ودعم فرق العمل.' : 'Unlimited AI programs, full white-labeling, multi-member teams and campaign tools.',
      features: isRtl
        ? [
            'توليد برامج ذكاء اصطناعي غير محدود',
            'تجربة عميل مخصصة بالكامل باسم وكالتك (White-Label)',
            'دعم فرق العمل حتى 10 مرشدين وموظفين',
            'محرك حملات تسويقية وتتبع أكواد الخصم والترويج',
            'مدير حساب مخصص وتدريب فريق العمل',
          ]
        : [
            'Unlimited AI Trip Generations',
            'Full White-Label Client Experience',
            'Team Multi-User Access (Up to 10 Guides)',
            'Advanced Marketing Campaigns & Promo Codes',
            'Dedicated Account Manager & VIP Support',
          ],
      popular: false,
      ctaText: t('choosePlan'),
      ctaVariant: 'secondary',
    },
  ];

  const handleAction = (planCode: string) => {
    if (isAuthenticated) {
      onNavigate('subscriptions');
    } else {
      onNavigate('auth_register');
    }
  };

  return (
    <section id="plans" className="scroll-mt-20 border-t border-slate-200 bg-slate-50/70 py-20 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
            <CreditCard className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isRtl ? 'خطط مرنة وشفافة' : 'Transparent Pricing Plans'}</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            {t('plansSectionTitle')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('plansSectionSubtitle')}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {isRtl ? 'الدفع الشهري' : 'Monthly Billing'}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>{isRtl ? 'الدفع السنوي' : 'Annual Billing'}</span>
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {isRtl ? 'خصم 20%' : 'Save 20%'}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          {plans.map(plan => (
            <div
              key={plan.code}
              className={`relative flex flex-col justify-between rounded-3xl border transition-all duration-200 ${
                plan.popular
                  ? 'border-amber-500 bg-white shadow-xl ring-2 ring-amber-500/20 dark:bg-slate-900 dark:border-amber-500'
                  : 'border-slate-200/90 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900'
              } p-6 sm:p-7`}
            >
              {/* Most Popular Ribbon */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1 text-[11px] font-black text-slate-950 shadow-md">
                  ⭐ {plan.badge}
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">
                    {plan.name}
                  </h3>
                  {!plan.popular && (
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 min-h-[34px] leading-relaxed">
                  {plan.desc}
                </p>

                {/* Price */}
                <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-950 dark:text-white">
                      {plan.price === 0 ? (isRtl ? 'مجاناً' : 'Free') : `${plan.price} EGP`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs text-slate-400 font-bold">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? 'المميزات المشمولة:' : 'Features Included:'}
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="mt-8 border-t border-slate-100 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleAction(plan.code)}
                  className={`w-full rounded-2xl py-3 text-xs font-black transition-all ${
                    plan.popular
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 hover:bg-amber-400 hover:scale-102'
                      : 'border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
