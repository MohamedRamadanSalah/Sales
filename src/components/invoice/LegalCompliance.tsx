'use client';

import type { LegalComplianceFlags } from '@/types/invoice';

interface Props {
  data: LegalComplianceFlags;
  lang: 'ar' | 'en';
  isLoading?: boolean;
}

function FlagRow({
  label,
  value,
  dangerWhen,
}: {
  label: string;
  value: boolean | null;
  dangerWhen: boolean;
}) {
  if (value === null) {
    return (
      <div className="flex items-center gap-3 py-2">
        <span className="text-amber-500 text-lg">⚠️</span>
        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-xs text-amber-500 ml-auto font-medium">Unverified</span>
      </div>
    );
  }
  const isDanger = value === dangerWhen;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`text-lg ${isDanger ? 'text-red-500' : 'text-emerald-500'}`}>
        {isDanger ? '🚨' : '✅'}
      </span>
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <span
        className={`text-xs ml-auto font-medium ${
          isDanger ? 'text-red-600' : 'text-emerald-600'
        }`}
      >
        {value ? 'Yes' : 'No'}
      </span>
    </div>
  );
}

function AmlBadge({ status, lang }: { status: string; lang: 'ar' | 'en' }) {
  const colorMap: Record<string, string> = {
    passed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    flagged: 'bg-red-50 text-red-700 border-red-200',
  };
  const labels: Record<string, { ar: string; en: string }> = {
    passed: { ar: 'تم التحقق', en: 'Passed' },
    pending: { ar: 'قيد المراجعة', en: 'Pending' },
    flagged: { ar: 'مُبلَّغ عنه', en: 'Flagged' },
  };
  const label = labels[status] ?? { ar: status, en: status };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        colorMap[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      {lang === 'ar' ? label.ar : label.en}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="invoice-section" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="skeleton h-6 w-56 rounded mb-5" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="skeleton h-6 w-6 rounded-full" />
              <div className="skeleton h-4 w-48 rounded" />
              <div className="skeleton h-4 w-16 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LegalCompliance({ data, lang, isLoading }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (isLoading) return <Skeleton />;

  return (
    <div className="invoice-section animate-fade-in-up delay-500">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
          {t('الامتثال القانوني', 'Legal & Compliance Flags')}
        </h2>

        <div className="divide-y divide-[var(--color-border)]">
          <FlagRow
            label={t('سند ملكية نظيف', 'Title is Clear')}
            value={data.is_title_clear}
            dangerWhen={false}
          />
          <FlagRow
            label={t('ديون مستحقة', 'Outstanding Debts')}
            value={data.outstanding_debts}
            dangerWhen={true}
          />
          <FlagRow
            label={t('رهونات أو أعباء', 'Liens or Encumbrances')}
            value={data.liens_or_encumbrances}
            dangerWhen={true}
          />
          <FlagRow
            label={t('يتطلب شهادة عدم ممانعة', 'Requires NOC')}
            value={data.requires_noc}
            dangerWhen={true}
          />
        </div>

        {/* Outstanding debts details */}
        {data.outstanding_debts && data.outstanding_debts_details.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-700 mb-2">
              {t('تفاصيل الديون', 'Debt Details')}:
            </p>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {data.outstanding_debts_details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}

        {/* AML check */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            {t('فحص غسيل الأموال', 'Anti-Money Laundering Check')}
          </span>
          <AmlBadge status={data.anti_money_laundering_check} lang={lang} />
        </div>

        {/* Compliance notes */}
        {data.compliance_notes && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>⚠️ {t('ملاحظات', 'Notes')}:</strong> {data.compliance_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
