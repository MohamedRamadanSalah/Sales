'use client';

import { formatInvoiceDate } from '@/lib/formatters';
import type { AuditTrail as AuditTrailType } from '@/types/invoice';

interface Props {
  data: AuditTrailType;
  lang: 'ar' | 'en';
  isLoading?: boolean;
}

function Skeleton() {
  return (
    <div className="invoice-section" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="skeleton h-6 w-40 rounded mb-5" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="skeleton h-3 w-3 rounded-full mt-1" />
              <div className="space-y-1 flex-1">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuditTrail({ data, lang, isLoading }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (isLoading) return <Skeleton />;

  return (
    <div className="invoice-section animate-fade-in-up delay-800">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
          {t('سجل التدقيق', 'Audit Trail')}
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Creation entry */}
          <div className="flex items-start gap-4 pb-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] mt-1.5" />
              {data.modification_history.length > 0 && (
                <div className="w-0.5 flex-1 bg-[var(--color-border)] mt-1" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {t('تم إنشاء الفاتورة', 'Invoice Created')}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {t('بواسطة', 'By')}: {data.created_by}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {formatInvoiceDate(data.creation_timestamp, lang)}
              </p>
            </div>
          </div>

          {/* Modification entries */}
          {data.modification_history.map((entry, i) => (
            <div key={i} className="flex items-start gap-4 pb-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[var(--color-border)] mt-1.5" />
                {i < data.modification_history.length - 1 && (
                  <div className="w-0.5 flex-1 bg-[var(--color-border)] mt-1" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">{entry.action}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {t('بواسطة', 'By')}: {entry.by}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatInvoiceDate(entry.timestamp, lang)}
                </p>
                {entry.details && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">{entry.details}</p>
                )}
              </div>
            </div>
          ))}

          {/* Last modified (if different from creation) */}
          {data.last_modified_at !== data.creation_timestamp && (
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[var(--color-text-muted)] mt-1.5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[var(--color-text-muted)]">
                  {t('آخر تعديل', 'Last Modified')}: {formatInvoiceDate(data.last_modified_at, lang)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
