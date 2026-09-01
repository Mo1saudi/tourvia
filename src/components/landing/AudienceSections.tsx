import React from 'react';
import { Compass, Building2, Check } from 'lucide-react';

const guideFeatures = ['Create', 'Calculate', 'Price', 'Present', 'Manage'];
const agencyFeatures = ['Team Workspace', 'Roles & Permissions', 'Shared Programs', 'Analytics', 'Activity Timeline'];

export const AudienceSections: React.FC = () => {
  return (
    <section className="bg-white py-20 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* For Guides */}
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/50 to-white p-8 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30">
              <Compass className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">مصمم للمرشد السياحي</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              كل ما تحتاجه لإنشاء وإدارة برامجك السياحية في مكان واحد.
            </p>
            <ul className="mt-5 space-y-2.5">
              {guideFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* For Agencies */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-8 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-slate-900">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Building2 className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">ولشركات السياحة والفرق</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              مساحة عمل مشتركة مع أدوار وصلاحيات وإحصائيات للفريق بالكامل.
            </p>
            <ul className="mt-5 space-y-2.5">
              {agencyFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
