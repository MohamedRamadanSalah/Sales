'use client';

import { formatInvoicePrice } from '@/lib/formatters';
import type { FinancialBreakdown as FinancialBreakdownType } from '@/types/invoice';

interface Props {
  data: FinancialBreakdownType;
  currency: string;
  lang: 'ar' | 'en';
  isLoading?: boolean;
}

function LineItem({
  label,
  amount,
  currency,
  lang,
  isBold,
  isTotal,
  isNegative,
  subLabel,
}: {
  label: string;
  amount: number | null;
  currency: string;
  lang: 'ar' | 'en';
  isBold?: boolean;
  isTotal?: boolean;
  isNegative?: boolean;
  subLabel?: string;
}) {
  return (
    <div
      className={`flex justify-between items-center py-3 ${
        isTotal
          ? 'border-t-2 border-[var(--color-accent)] mt-2 pt-4'
          : 'border-b border-[var(--color-border)]'
      }`}
    >
      <div>
        <span className={`text-sm ${isBold || isTotal ? 'font-bold text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}`}>
          {label}
        </span>
        {subLabel && (
          <span className="block text-xs text-[var(--color-text-muted)]">{subLabel}</span>
        )}
      </div>
      <span
        className={`text-sm font-mono ${
          isTotal
            ? 'text-lg font-bold text-[var(--color-primary)]'
            : isNegative
            ? 'text-emerald-600'
            : isBold
            ? 'font-bold text-[var(--color-text)]'
            : 'text-[var(--color-text)]'
        }`}
      >
        {isNegative && amount != null ? '- ' : ''}
        {formatInvoicePrice(amount != null ? Math.abs(amount) : null, lang, currency)}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="invoice-section" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="skeleton h-6 w-48 rounded mb-5" />
        <div className="invoice-financial-table space-y-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex justify-between py-3">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FinancialBreakdown({ data, currency, lang, isLoading }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (isLoading) return <Skeleton />;

  return (
    <div className="invoice-section animate-fade-in-up delay-300">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
          {t('التفاصيل المالية', 'Financial Breakdown')}
        </h2>

        <div className="invoice-financial-table">
          {/* Base price */}
          <LineItem
            label={t('السعر الأساسي', 'Base Price')}
            amount={data.base_price}
            currency={currency}
            lang={lang}
            isBold
          />

          {/* Price per sqm */}
          <LineItem
            label={t('السعر لكل م²', 'Price per sqm')}
            amount={data.price_per_sqm}
            currency={currency}
            lang={lang}
          />

          {/* Negotiated discount */}
          {data.negotiated_discount.amount > 0 && (
            <LineItem
              label={t('خصم تفاوضي', 'Negotiated Discount')}
              amount={data.negotiated_discount.amount}
              currency={currency}
              lang={lang}
              isNegative
              subLabel={data.negotiated_discount.reason ?? undefined}
            />
          )}

          {/* Platform commission */}
          <LineItem
            label={t('عمولة المنصة', 'Platform Commission')}
            amount={data.platform_commission.amount}
            currency={currency}
            lang={lang}
            subLabel={data.platform_commission.percentage != null ? `${data.platform_commission.percentage}%` : undefined}
          />

          {/* Agent commission */}
          {data.agent_commission.amount != null && (
            <LineItem
              label={t('عمولة الوسيط', 'Agent Commission')}
              amount={data.agent_commission.amount}
              currency={currency}
              lang={lang}
              subLabel={data.agent_commission.percentage != null ? `${data.agent_commission.percentage}%` : undefined}
            />
          )}

          {/* Fees */}
          <LineItem
            label={t('رسوم التوثيق القانوني', 'Legal Documentation Fees')}
            amount={data.legal_documentation_fees}
            currency={currency}
            lang={lang}
          />
          <LineItem
            label={t('رسوم التسجيل', 'Registration Fees')}
            amount={data.registration_fees}
            currency={currency}
            lang={lang}
          />
          <LineItem
            label={t('رسوم التوثيق', 'Notarization Fees')}
            amount={data.notarization_fees}
            currency={currency}
            lang={lang}
          />

          {/* VAT */}
          <LineItem
            label={t('ضريبة القيمة المضافة', 'VAT')}
            amount={data.vat.amount}
            currency={currency}
            lang={lang}
            subLabel={data.vat.percentage != null ? `${data.vat.percentage}%` : undefined}
          />

          {/* Other fees */}
          {data.other_fees.map((fee, i) => (
            <LineItem
              key={i}
              label={fee.label}
              amount={fee.amount}
              currency={currency}
              lang={lang}
            />
          ))}

          {/* Totals */}
          <LineItem
            label={t('إجمالي المبلغ المستحق', 'Total Amount Due')}
            amount={data.total_amount_due}
            currency={currency}
            lang={lang}
            isTotal
          />

          {/* Deposit */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--color-bg-2)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">
                {t('العربون المطلوب', 'Deposit Required')}
              </p>
              <p className="text-lg font-bold text-[var(--color-primary)]">
                {formatInvoicePrice(data.deposit_required.amount, lang, currency)}
              </p>
              {data.deposit_required.deadline && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {t('الموعد النهائي', 'Deadline')}: {data.deposit_required.deadline}
                </p>
              )}
            </div>
            <div className="bg-[var(--color-bg-2)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">
                {t('المبلغ المتبقي', 'Remaining Balance')}
              </p>
              <p className="text-lg font-bold text-[var(--color-accent-dark)]">
                {formatInvoicePrice(data.remaining_balance, lang, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
