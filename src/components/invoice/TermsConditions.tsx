'use client';

import { useState } from 'react';
import type { TermsAndConditions as TermsType } from '@/types/invoice';

interface Props {
  data: TermsType;
  lang: 'ar' | 'en';
  isLoading?: boolean;
}

function AccordionItem({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-start"
      >
        <span className="text-sm font-semibold text-[var(--color-text)]">{title}</span>
        <svg
          className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="invoice-section" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="skeleton h-6 w-52 rounded mb-5" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-4 border-b border-[var(--color-border)]">
            <div className="skeleton h-4 w-48 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TermsConditions({ data, lang, isLoading }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (isLoading) return <Skeleton />;

  return (
    <div className="invoice-section animate-fade-in-up delay-700">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
          {t('الشروط والأحكام', 'Terms & Conditions')}
        </h2>

        <AccordionItem title={t('سياسة الإلغاء', 'Cancellation Policy')} defaultOpen>
          <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <div className="bg-[var(--color-bg-2)] rounded-lg p-3">
              <p className="font-semibold text-[var(--color-text)] mb-1">
                {t('قبل موافقة المدير', 'Before Admin Approval')}
              </p>
              <p>{data.cancellation_policy.before_admin_approval}</p>
            </div>
            <div className="bg-[var(--color-bg-2)] rounded-lg p-3">
              <p className="font-semibold text-[var(--color-text)] mb-1">
                {t('بعد الموافقة وقبل التوقيع', 'After Approval, Before Signing')}
              </p>
              <p>{data.cancellation_policy.after_admin_approval_before_signing}</p>
            </div>
            <div className="bg-[var(--color-bg-2)] rounded-lg p-3">
              <p className="font-semibold text-[var(--color-text)] mb-1">
                {t('بعد توقيع العقد', 'After Contract Signing')}
              </p>
              <p>{data.cancellation_policy.after_contract_signing}</p>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title={t('تسوية النزاعات', 'Dispute Resolution')}>
          <p className="text-sm text-[var(--color-text-secondary)]">{data.dispute_resolution}</p>
        </AccordionItem>

        <AccordionItem title={t('القانون الحاكم', 'Governing Law')}>
          <p className="text-sm text-[var(--color-text-secondary)]">{data.governing_law}</p>
        </AccordionItem>

        <AccordionItem title={t('شرط الصلاحية', 'Validity Clause')}>
          <p className="text-sm text-[var(--color-text-secondary)] bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⏰ {data.validity_clause}
          </p>
        </AccordionItem>
      </div>
    </div>
  );
}
