import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'هل أستطيع البدء مجانًا؟',
    a: 'نعم، حسب حدود الخطة الحالية. يمكنك تجربة المنصة بـ 3 برامج سياحية بالذكاء الاصطناعي مدى الحياة مجانًا.',
  },
  {
    q: 'هل يمكنني إنشاء برامج متعددة؟',
    a: 'يعتمد ذلك على الخطة الحالية. الخطة المجانية تتيح 3 برامج مدى الحياة، بينما الخطط المدفوعة تتيح عددًا أكبر.',
  },
  {
    q: 'هل يمكنني إرسال البرنامج للعميل؟',
    a: 'نعم، من خلال Proposal System إذا كانت الميزة متاحة في خطتك. تنشئ رابطًا عامًا للعميل لعرض البرنامج والقبول أو طلب تعديل.',
  },
  {
    q: 'هل Tourvia مناسب للشركات؟',
    a: 'نعم، من خلال Workspace و Team Features المتاحة في خطط Agency و Enterprise.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="bg-slate-50 py-20 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
            الأسئلة الشائعة
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
              >
                <span className="text-sm font-black text-slate-900 dark:text-white">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-amber-500 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
