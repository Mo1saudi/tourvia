import React from 'react';
import { MapPin, Calculator, Tag, FileText, Check } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'أنشئ برامج سياحية احترافية',
    desc: 'برامج متعددة الأيام مع محطات وأنشطة ومواعيد وملاحظات وصور. رتب رحلتك بالكامل في واجهة واحدة بسيطة.',
    points: ['Multi-day Itineraries', 'Stops & Activities', 'Timing & Notes', 'Maps & Images'],
    accentBg: 'bg-amber-100 dark:bg-amber-950/50',
    accentText: 'text-amber-600 dark:text-amber-400',
    mock: (
      <div className="space-y-2">
        {['اليوم 1: القاهرة الكبرى', 'اليوم 2: الأهرامات وسقارة', 'اليوم 3: المتحف الحضاري'].map((d, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-[10px] font-black text-slate-950">{i + 1}</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{d}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Calculator,
    title: 'اعرف تكلفة رحلتك قبل أن تبيعها',
    desc: 'احسب كل بند تكلفة بدقة: النقل، الفنادق، الوجبات، التذاكر، المرشد، والأنشطة. اعرف إجمالي التكلفة والربح فورًا.',
    points: ['Transportation', 'Hotels & Meals', 'Tickets & Guide', 'Total Cost & Profit'],
    accentBg: 'bg-blue-100 dark:bg-blue-950/50',
    accentText: 'text-blue-600 dark:text-blue-400',
    mock: (
      <div className="space-y-1.5">
        {[
          { label: 'النقل', value: '4,200' },
          { label: 'الفنادق', value: '6,000' },
          { label: 'الوجبات', value: '2,500' },
          { label: 'التذاكر', value: '3,500' },
          { label: 'المرشد', value: '2,500' },
        ].map((c, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{c.value} EGP</span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 dark:bg-slate-800">
          <span className="text-xs font-black text-white">الإجمالي</span>
          <span className="text-sm font-black text-amber-400">18,700 EGP</span>
        </div>
      </div>
    ),
  },
  {
    icon: Tag,
    title: 'اعرف السعر المناسب',
    desc: 'يقترح النظام ثلاثة مستويات تسعير بناءً على التكلفة والهامش المستهدف. اختر ما يناسب عميلك.',
    points: ['Economy · Standard · Premium', 'Price & Margin', 'Profit per Tier'],
    accentBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    mock: (
      <div className="grid grid-cols-3 gap-2">
        {[
          { tier: 'Economy', price: '5,200', margin: '18%', cls: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50' },
          { tier: 'Standard', price: '6,000', margin: '22%', cls: 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30' },
          { tier: 'Premium', price: '7,500', margin: '31%', cls: 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30' },
        ].map((p, i) => (
          <div key={i} className={`rounded-xl border p-3 text-center ${p.cls}`}>
            <p className="text-[10px] font-bold text-slate-400">{p.tier}</p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{p.price}</p>
            <p className="text-[9px] text-slate-400">هامش {p.margin}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: FileText,
    title: 'قدم برنامجك للعميل بشكل احترافي',
    desc: 'أنشئ رابط عرض عام للعميل يحتوي على الغلاف، البرنامج اليومي، الخدمات، السعر، وشروط الحجز. مع إمكانية القبول أو طلب تعديل.',
    points: ['Public Proposal Link', 'Cover & Itinerary', 'Accept / Request Changes', 'No Internal Costs Shown'],
    accentBg: 'bg-purple-100 dark:bg-purple-950/50',
    accentText: 'text-purple-600 dark:text-purple-400',
    mock: (
      <div className="space-y-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">عرض سعر للعميل</p>
          <p className="mt-1 text-[10px] text-slate-400">tourvia.com/proposal/8F4K29</p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-emerald-100 py-2 text-center text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">✓ قبول العرض</div>
          <div className="flex-1 rounded-lg bg-amber-100 py-2 text-center text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">✎ طلب تعديل</div>
        </div>
      </div>
    ),
  },
];

export const FeatureShowcase: React.FC = () => {
  return (
    <section className="bg-white py-20 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">المميزات</span>
          <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
            كل أدوات عملك السياحي في مكان واحد
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            من بناء البرنامج إلى حساب التكلفة، التسعير، وعرض السعر للعميل — Tourvia يغطي دورة عملك بالكامل.
          </p>
        </div>
        <div className="mt-14 space-y-16">
          {features.map((f, idx) => {
            const Icon = f.icon;
            const isReversed = idx % 2 === 1;
            return (
              <div key={idx} className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div className={isReversed ? 'lg:order-2' : ''}>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.accentBg} ${f.accentText}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {f.points.map((p, i) => (
                      <li key={i} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={isReversed ? 'lg:order-1' : ''}>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-lg dark:border-slate-800 dark:bg-slate-800/30">
                    {f.mock}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
