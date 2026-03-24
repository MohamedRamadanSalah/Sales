'use client';

import type { InvoicePropertyDetails } from '@/types/invoice';

interface Props {
  data: InvoicePropertyDetails;
  lang: 'ar' | 'en';
  isLoading?: boolean;
}

function LegalStatusBanner({ status, lang }: { status: string | null; lang: 'ar' | 'en' }) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  if (!status) {
    return (
      <div className="rounded-lg px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm">
        ⚠️ {t('الحالة القانونية غير محددة', 'Legal status not specified')}
      </div>
    );
  }
  const isClean = status === 'clean title';
  return (
    <div
      className={`rounded-lg px-4 py-2 text-sm font-semibold ${
        isClean
          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          : 'bg-red-50 border border-red-200 text-red-700'
      }`}
    >
      {isClean ? '✅' : '🚨'}{' '}
      {t('الحالة القانونية', 'Legal Status')}: {status}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-b-0">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--color-text)]">{value ?? '—'}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="invoice-section" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="skeleton h-6 w-48 rounded mb-5" />
        <div className="skeleton h-10 w-full rounded-lg mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PropertySection({ data, lang, isLoading }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (isLoading) return <Skeleton />;

  const furnishLabels: Record<string, { ar: string; en: string }> = {
    furnished: { ar: 'مفروش', en: 'Furnished' },
    'semi-furnished': { ar: 'نصف مفروش', en: 'Semi-Furnished' },
    unfurnished: { ar: 'غير مفروش', en: 'Unfurnished' },
  };

  const conditionLabels: Record<string, { ar: string; en: string }> = {
    new: { ar: 'جديد', en: 'New' },
    good: { ar: 'جيد', en: 'Good' },
    'needs renovation': { ar: 'يحتاج تجديد', en: 'Needs Renovation' },
  };

  const typeLabels: Record<string, { ar: string; en: string }> = {
    apartment: { ar: 'شقة', en: 'Apartment' },
    villa: { ar: 'فيلا', en: 'Villa' },
    land: { ar: 'أرض', en: 'Land' },
    commercial: { ar: 'تجاري', en: 'Commercial' },
    townhouse: { ar: 'تاون هاوس', en: 'Townhouse' },
  };

  const locationStr = [
    data.location.building_number,
    data.location.street,
    data.location.district,
    data.location.city,
    data.location.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="invoice-section animate-fade-in-up delay-200">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
          {t('تفاصيل العقار', 'Property Details')}
        </h2>

        {/* Title + Legal Status */}
        {data.title && (
          <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">{data.title}</h3>
        )}
        <div className="mb-5">
          <LegalStatusBanner status={data.legal_status} lang={lang} />
        </div>

        {/* Two-column details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <DetailRow label={t('معرف العقار', 'Property ID')} value={data.property_id} />
          <DetailRow
            label={t('النوع', 'Type')}
            value={data.type ? (lang === 'ar' ? typeLabels[data.type]?.ar : typeLabels[data.type]?.en) ?? data.type : null}
          />
          <DetailRow label={t('الموقع', 'Location')} value={locationStr || null} />
          <DetailRow
            label={t('الطابق / الوحدة', 'Floor / Unit')}
            value={
              data.location.floor || data.location.unit_number
                ? `${data.location.floor ?? '—'} / ${data.location.unit_number ?? '—'}`
                : null
            }
          />
          <DetailRow label={t('المساحة (م²)', 'Area (sqm)')} value={data.area_sqm} />
          <DetailRow label={t('رقم التسجيل', 'Registration No.')} value={data.registration_number} />
          <DetailRow label={t('رقم السند', 'Deed No.')} value={data.deed_number} />
          <DetailRow label={t('سنة البناء', 'Year Built')} value={data.year_built} />
          <DetailRow
            label={t('التأثيث', 'Furnishing')}
            value={
              data.furnishing_status
                ? (lang === 'ar'
                    ? furnishLabels[data.furnishing_status]?.ar
                    : furnishLabels[data.furnishing_status]?.en) ?? data.furnishing_status
                : null
            }
          />
          <DetailRow
            label={t('الحالة', 'Condition')}
            value={
              data.condition
                ? (lang === 'ar'
                    ? conditionLabels[data.condition]?.ar
                    : conditionLabels[data.condition]?.en) ?? data.condition
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
