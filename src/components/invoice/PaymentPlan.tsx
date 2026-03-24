'use client';

import { Badge } from '@/components/ui/Badge';
import { formatInvoicePrice, formatInvoiceDate } from '@/lib/formatters';
import type { PaymentPlan as PaymentPlanType } from '@/types/invoice';

interface Props {
  data: PaymentPlanType;
  currency: string;
  lang: 'ar' | 'en';
  isLoading?: boolean;
}

function Skeleton() {
  return (
    <div className="invoice-section" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="skeleton h-6 w-48 rounded mb-5" />
        <div className="skeleton h-8 w-40 rounded-full mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2">
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InstallmentStatusBadge({ status, lang }: { status: string; lang: 'ar' | 'en' }) {
  const variant = status === 'paid' ? 'approved' : status === 'overdue' ? 'rejected' : 'pending';
  const labels: Record<string, { ar: string; en: string }> = {
    unpaid: { ar: 'غير مدفوع', en: 'Unpaid' },
    paid: { ar: 'مدفوع', en: 'Paid' },
    overdue: { ar: 'متأخر', en: 'Overdue' },
  };
  const label = labels[status] ?? { ar: status, en: status };
  return <Badge variant={variant}>{lang === 'ar' ? label.ar : label.en}</Badge>;
}

export function PaymentPlan({ data, currency, lang, isLoading }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (isLoading) return <Skeleton />;

  const methodLabels: Record<string, { ar: string; en: string }> = {
    full_payment: { ar: 'دفعة كاملة', en: 'Full Payment' },
    installment: { ar: 'تقسيط', en: 'Installment' },
    mortgage: { ar: 'تمويل عقاري', en: 'Mortgage' },
  };

  return (
    <div className="invoice-section animate-fade-in-up delay-400">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
          {t('خطة الدفع', 'Payment Plan')}
        </h2>

        {/* Payment method badge */}
        <div className="mb-5">
          {data.payment_method ? (
            <Badge variant="default" className="text-sm px-4 py-2">
              {lang === 'ar'
                ? methodLabels[data.payment_method]?.ar ?? data.payment_method
                : methodLabels[data.payment_method]?.en ?? data.payment_method}
            </Badge>
          ) : (
            <span className="text-sm text-amber-600 italic">
              {t('طريقة الدفع غير محددة', 'Payment method not specified')}
            </span>
          )}
        </div>

        {/* Installment schedule */}
        {data.payment_method === 'installment' && data.installment_schedule.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                    {t('رقم القسط', 'Installment #')}
                  </th>
                  <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                    {t('تاريخ الاستحقاق', 'Due Date')}
                  </th>
                  <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                    {t('المبلغ', 'Amount')}
                  </th>
                  <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                    {t('الحالة', 'Status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.installment_schedule.map((item) => (
                  <tr key={item.installment_number} className="border-b border-[var(--color-border)]">
                    <td className="py-3 px-2 font-mono">{item.installment_number}</td>
                    <td className="py-3 px-2">{formatInvoiceDate(item.due_date, lang)}</td>
                    <td className="py-3 px-2 font-medium">{formatInvoicePrice(item.amount, lang, currency)}</td>
                    <td className="py-3 px-2">
                      <InstallmentStatusBadge status={item.status} lang={lang} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mortgage details */}
        {data.payment_method === 'mortgage' && data.mortgage_details.bank_name && (
          <div className="glass rounded-xl p-5 mt-4">
            <h3 className="text-sm font-bold text-[var(--color-accent-dark)] uppercase tracking-wider mb-3">
              {t('تفاصيل التمويل العقاري', 'Mortgage Details')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[var(--color-text-muted)]">{t('البنك', 'Bank')}:</span>{' '}
                <strong>{data.mortgage_details.bank_name}</strong>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">{t('مبلغ القرض', 'Loan Amount')}:</span>{' '}
                <strong>{formatInvoicePrice(data.mortgage_details.loan_amount, lang, currency)}</strong>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">{t('المدة (سنوات)', 'Duration (years)')}:</span>{' '}
                <strong>{data.mortgage_details.duration_years ?? '—'}</strong>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">{t('سعر الفائدة', 'Interest Rate')}:</span>{' '}
                <strong>{data.mortgage_details.interest_rate != null ? `${data.mortgage_details.interest_rate}%` : '—'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {data.payment_method === 'full_payment' && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('سيتم الدفع كمبلغ واحد كامل.', 'Payment will be made as a single full amount.')}
          </p>
        )}
      </div>
    </div>
  );
}
