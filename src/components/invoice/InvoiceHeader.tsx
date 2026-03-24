'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatInvoiceDate } from '@/lib/formatters';
import type { InvoiceMetadata } from '@/types/invoice';

interface Props {
  data: InvoiceMetadata;
  lang: 'ar' | 'en';
  isLoading?: boolean;
}

function getStatusVariant(status: string): 'pending' | 'approved' | 'rejected' | 'default' {
  if (status === 'PENDING_APPROVAL') return 'pending';
  if (status === 'APPROVED') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  return 'default';
}

function StatusLabel({ status, lang }: { status: string; lang: 'ar' | 'en' }) {
  const labels: Record<string, { ar: string; en: string }> = {
    PENDING_APPROVAL: { ar: 'بانتظار الموافقة', en: 'Pending Approval' },
    APPROVED: { ar: 'تمت الموافقة', en: 'Approved' },
    REJECTED: { ar: 'مرفوض', en: 'Rejected' },
    VOIDED: { ar: 'ملغى', en: 'Voided' },
  };
  const label = labels[status] ?? { ar: status, en: status };
  return <>{lang === 'ar' ? label.ar : label.en}</>;
}

function TransactionLabel({ type, lang }: { type: string; lang: 'ar' | 'en' }) {
  const labels: Record<string, { ar: string; en: string }> = {
    BUY: { ar: 'شراء', en: 'Purchase' },
    SELL: { ar: 'بيع', en: 'Sale' },
    RENT: { ar: 'إيجار', en: 'Rent' },
  };
  const label = labels[type] ?? { ar: type, en: type };
  return <>{lang === 'ar' ? label.ar : label.en}</>;
}

function Countdown({ expiryDate }: { expiryDate: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const expiry = new Date(expiryDate).getTime();
      const diff = expiry - now;
      if (diff <= 0) {
        setRemaining('EXPIRED');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  const isExpired = remaining === 'EXPIRED';

  return (
    <span
      className={`invoice-countdown font-mono text-sm px-3 py-1 rounded-lg ${
        isExpired
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}
    >
      {isExpired ? '⏰ Expired' : `⏳ ${remaining}`}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="invoice-section invoice-section-header" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="skeleton h-8 w-64 rounded-lg" />
            <div className="skeleton h-4 w-48 rounded" />
            <div className="flex gap-3">
              <div className="skeleton h-6 w-28 rounded-full" />
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>
          </div>
          <div className="skeleton h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceHeader({ data, lang, isLoading }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (isLoading) return <Skeleton />;

  return (
    <div className="invoice-section invoice-section-header animate-fade-in-up">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] luxury-card">
        {/* Gold accent bar at top */}
        <div className="gold-divider mb-6" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left: Invoice info */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {t('فاتورة', 'Invoice')} <span className="text-gold-gradient">{data.invoice_id}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--color-text-secondary)]">
              <span>
                {t('تاريخ الإصدار', 'Issue Date')}: <strong>{formatInvoiceDate(data.issue_date, lang)}</strong>
              </span>
              <span>
                {t('تاريخ الانتهاء', 'Expiry Date')}: <strong>{formatInvoiceDate(data.expiry_date, lang)}</strong>
              </span>
              <span>
                {t('العملة', 'Currency')}: <strong>{data.currency}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant={getStatusVariant(data.status)}
                className={data.status === 'PENDING_APPROVAL' ? 'animate-pulse-gold' : ''}
              >
                <StatusLabel status={data.status} lang={lang} />
              </Badge>
              <Badge variant="default">
                <TransactionLabel type={data.transaction_type} lang={lang} />
              </Badge>
            </div>
          </div>

          {/* Right: Countdown */}
          <div className="flex flex-col items-end gap-2">
            <Countdown expiryDate={data.expiry_date} />
            <button
              type="button"
              onClick={() => window.print()}
              className="invoice-print-btn text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('طباعة', 'Print')}
            </button>
          </div>
        </div>

        <div className="gold-divider mt-6" />
      </div>
    </div>
  );
}
