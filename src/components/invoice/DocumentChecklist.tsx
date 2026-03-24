'use client';

import type { DocumentChecklistItem } from '@/types/invoice';

interface Props {
  data: DocumentChecklistItem[];
  lang: 'ar' | 'en';
  isLoading?: boolean;
}

const statusConfig: Record<string, { icon: string; color: string; label: { ar: string; en: string } }> = {
  provided: { icon: '✅', color: 'text-emerald-600', label: { ar: 'مقدم', en: 'Provided' } },
  missing: { icon: '❌', color: 'text-red-500', label: { ar: 'مفقود', en: 'Missing' } },
  expired: { icon: '⚠️', color: 'text-amber-500', label: { ar: 'منتهي الصلاحية', en: 'Expired' } },
};

function Skeleton() {
  return (
    <div className="invoice-section" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="skeleton h-6 w-48 rounded mb-5" />
        <div className="skeleton h-8 w-56 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-5 w-5 rounded" />
              <div className="skeleton h-4 w-44 rounded" />
              <div className="skeleton h-4 w-20 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DocumentChecklist({ data, lang, isLoading }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (isLoading) return <Skeleton />;

  const provided = data.filter((d) => d.status === 'provided').length;
  const total = data.length;

  return (
    <div className="invoice-section animate-fade-in-up delay-700">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
          {t('قائمة المستندات المطلوبة', 'Attached Documents Checklist')}
        </h2>

        {/* Summary count */}
        <div className="mb-5 flex items-center gap-3">
          <div
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${
              provided === total
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {t(`${provided} من ${total} مستندات مقدمة`, `${provided}/${total} documents provided`)}
          </div>
        </div>

        {/* Document list */}
        <div className="space-y-1">
          {data.map((doc, i) => {
            const config = statusConfig[doc.status] ?? statusConfig.missing;
            return (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-sm text-[var(--color-text)]">{doc.document}</span>
                </div>
                <span className={`text-xs font-semibold ${config.color}`}>
                  {lang === 'ar' ? config.label.ar : config.label.en}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
