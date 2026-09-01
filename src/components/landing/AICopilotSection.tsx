import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';

export const AICopilotSection: React.FC = () => {
  const quickQuestions = [
    'هل البرنامج مزدحم؟',
    'هل السعر مناسب؟',
    'كيف أقلل التكلفة؟',
    'كيف أرفع الربح؟',
    'ما أفضل ترتيب للمحطات؟',
    'هل يوجد تعارض؟',
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-amber-500/10 blur-[80px]" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>الذكاء الاصطناعي</span>
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            مساعدك الذكي في بناء الرحلات
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
            اسأل Tourvia AI أي سؤال عن برنامجك — من كثافة الأيام إلى تسعير الرحلة. يحلل بياناتك ويعطيك اقتراحات عملية.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
          <div className="flex justify-end">
            <div className="max-w-xs rounded-2xl rounded-tl-md bg-amber-500 px-4 py-2.5 text-xs font-medium text-slate-950">
              هل البرنامج مزدحم؟
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="max-w-md rounded-2xl rounded-tr-md border border-slate-800 bg-slate-800/50 px-4 py-2.5 text-xs leading-relaxed text-slate-300">
              اليوم الثاني مزدحم نسبيًا. أقترح نقل خان الخليلي إلى اليوم الثالث لتقليل وقت الانتقال. هذا سيوفر حوالي 35 دقيقة من التنقل.
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {quickQuestions.map((q, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
              <MessageCircle className="h-3 w-3 text-amber-500" />
              {q}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
