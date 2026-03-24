'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { invoiceDetailApi } from '@/lib/api';
import type { DetailedInvoice } from '@/types/invoice';

import { InvoiceHeader } from '@/components/invoice/InvoiceHeader';
import { PartiesSection } from '@/components/invoice/PartiesSection';
import { PropertySection } from '@/components/invoice/PropertySection';
import { FinancialBreakdown } from '@/components/invoice/FinancialBreakdown';
import { PaymentPlan } from '@/components/invoice/PaymentPlan';
import { LegalCompliance } from '@/components/invoice/LegalCompliance';
import { ApprovalWorkflow } from '@/components/invoice/ApprovalWorkflow';
import { DocumentChecklist } from '@/components/invoice/DocumentChecklist';
import { TermsConditions } from '@/components/invoice/TermsConditions';
import { AuditTrail } from '@/components/invoice/AuditTrail';

import '../invoice-print.css';

// ─── GAP 3: Required fields for missing info banner ───
interface MissingField {
  key: string;
  label: { ar: string; en: string };
}

const REQUIRED_FIELDS: MissingField[] = [
  { key: 'parties.buyer.full_name', label: { ar: 'اسم المشتري', en: 'Buyer Name' } },
  { key: 'parties.buyer.national_id', label: { ar: 'الرقم القومي للمشتري', en: 'Buyer National ID' } },
  { key: 'parties.buyer.contact_email', label: { ar: 'بريد المشتري', en: 'Buyer Email' } },
  { key: 'parties.seller.full_name', label: { ar: 'اسم البائع', en: 'Seller Name' } },
  { key: 'parties.seller.national_id', label: { ar: 'الرقم القومي للبائع', en: 'Seller National ID' } },
  { key: 'property_details.property_id', label: { ar: 'معرف العقار', en: 'Property ID' } },
  { key: 'property_details.title', label: { ar: 'عنوان العقار', en: 'Property Title' } },
  { key: 'property_details.area_sqm', label: { ar: 'المساحة', en: 'Property Area' } },
  { key: 'property_details.registration_number', label: { ar: 'رقم التسجيل', en: 'Registration Number' } },
  { key: 'property_details.deed_number', label: { ar: 'رقم السند', en: 'Deed Number' } },
  { key: 'property_details.legal_status', label: { ar: 'الحالة القانونية', en: 'Legal Status' } },
  { key: 'financial_breakdown.base_price', label: { ar: 'السعر الأساسي', en: 'Base Price' } },
  { key: 'financial_breakdown.total_amount_due', label: { ar: 'إجمالي المبلغ', en: 'Total Amount Due' } },
  { key: 'approval_workflow.seller_approval', label: { ar: 'موافقة البائع', en: 'Seller Approval' } },
  { key: 'approval_workflow.admin_approval', label: { ar: 'موافقة المدير', en: 'Admin Approval' } },
];

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function getMissingRequiredFields(invoice: DetailedInvoice): MissingField[] {
  return REQUIRED_FIELDS.filter((field) => {
    const value = getNestedValue(invoice as unknown as Record<string, unknown>, field.key);
    return value === null || value === undefined;
  });
}

// ─── Missing Info Banner (GAP 3) ───
function MissingInfoBanner({
  fields,
  lang,
  onDismiss,
}: {
  fields: MissingField[];
  lang: 'ar' | 'en';
  onDismiss: () => void;
}) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  if (fields.length === 0) return null;

  return (
    <div className="invoice-missing-banner bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 relative animate-fade-in">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-3 end-3 p-1 rounded-lg hover:bg-amber-100 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-2">
            {t(`${fields.length} حقل مطلوب مفقود`, `${fields.length} required field(s) missing`)}
          </p>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {fields.map((f) => (
              <li key={f.key}>{lang === 'ar' ? f.label.ar : f.label.en}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Error States (GAP 1) ───
function ErrorState({
  status,
  message,
  lang,
  onRetry,
}: {
  status: number;
  message: string;
  lang: 'ar' | 'en';
  onRetry: () => void;
}) {
  const router = useRouter();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (status === 404) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">📄</div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">
          {t('الفاتورة غير موجودة', 'Invoice Not Found')}
        </h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          {t('لم يتم العثور على الفاتورة المطلوبة.', 'The requested invoice could not be found.')}
        </p>
        <Button variant="primary" onClick={() => router.back()}>
          {t('رجوع', 'Go Back')}
        </Button>
      </div>
    );
  }

  if (status === 403) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">
          {t('غير مصرح لك', 'Access Denied')}
        </h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          {t('ليس لديك صلاحية لعرض هذه الفاتورة.', "You don't have permission to view this invoice.")}
        </p>
        <Button variant="primary" onClick={() => router.push('/')}>
          {t('الصفحة الرئيسية', 'Go Home')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">
        {t('حدث خطأ', 'Something Went Wrong')}
      </h1>
      <p className="text-[var(--color-text-muted)] mb-6">{message}</p>
      <Button variant="primary" onClick={onRetry}>
        {t('إعادة المحاولة', 'Retry')}
      </Button>
    </div>
  );
}

// ─── Main Page Content ───
function InvoicePageContent() {
  const params = useParams();
  const { lang } = useAuth();
  const invoiceId = params.id as string;
  const [isDismissed, setIsDismissed] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    invoiceId ? `invoice-detail-${invoiceId}` : null,
    () => invoiceDetailApi.getDetailedInvoice(invoiceId),
    { revalidateOnFocus: false }
  );

  const handleUpdate = useCallback(() => {
    mutate();
  }, [mutate]);

  // ─── GAP 1: Error states ───
  if (error) {
    const status = error.status ?? (error.message?.includes('404') ? 404 : error.message?.includes('403') ? 403 : 500);
    return <ErrorState status={status} message={error.message} lang={lang} onRetry={() => mutate()} />;
  }

  const invoice: DetailedInvoice | undefined = data?.data;
  const showLoading = isLoading || !invoice;

  // Missing fields for banner
  const missingFields = invoice ? getMissingRequiredFields(invoice) : [];

  // Use a fallback structure for skeleton rendering
  const fallback: DetailedInvoice = invoice ?? ({} as DetailedInvoice);

  return (
    <div className="invoice-page-container max-w-4xl mx-auto px-4 py-8">
      {/* GAP 3: Missing info banner */}
      {!showLoading && !isDismissed && missingFields.length > 0 && (
        <MissingInfoBanner fields={missingFields} lang={lang} onDismiss={() => setIsDismissed(true)} />
      )}

      {/* Section 1: Header */}
      <InvoiceHeader
        data={fallback.invoice_metadata}
        lang={lang}
        isLoading={showLoading}
      />

      {/* Section 2: Parties */}
      <div className="mt-6">
        <PartiesSection data={fallback.parties} lang={lang} isLoading={showLoading} />
      </div>

      {/* Section 3: Property Details */}
      <div className="mt-6">
        <PropertySection data={fallback.property_details} lang={lang} isLoading={showLoading} />
      </div>

      {/* Section 4: Financial Breakdown */}
      <div className="mt-6">
        <FinancialBreakdown
          data={fallback.financial_breakdown}
          currency={fallback.invoice_metadata?.currency ?? 'EGP'}
          lang={lang}
          isLoading={showLoading}
        />
      </div>

      {/* Section 5: Payment Plan */}
      <div className="mt-6">
        <PaymentPlan
          data={fallback.payment_plan}
          currency={fallback.invoice_metadata?.currency ?? 'EGP'}
          lang={lang}
          isLoading={showLoading}
        />
      </div>

      {/* Section 6: Legal & Compliance */}
      <div className="mt-6">
        <LegalCompliance data={fallback.legal_compliance_flags} lang={lang} isLoading={showLoading} />
      </div>

      {/* Section 7: Approval Workflow */}
      <div className="mt-6">
        <ApprovalWorkflow
          data={fallback.approval_workflow}
          invoiceId={invoiceId}
          lang={lang}
          isLoading={showLoading}
          onUpdate={handleUpdate}
        />
      </div>

      {/* Section 8: Document Checklist */}
      <div className="mt-6">
        <DocumentChecklist
          data={fallback.attached_documents_checklist}
          lang={lang}
          isLoading={showLoading}
        />
      </div>

      {/* Section 9: Terms & Conditions */}
      <div className="mt-6">
        <TermsConditions data={fallback.terms_and_conditions} lang={lang} isLoading={showLoading} />
      </div>

      {/* Section 10: Audit Trail */}
      <div className="mt-6 mb-12">
        <AuditTrail data={fallback.audit_trail} lang={lang} isLoading={showLoading} />
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <ProtectedRoute>
      <InvoicePageContent />
    </ProtectedRoute>
  );
}
