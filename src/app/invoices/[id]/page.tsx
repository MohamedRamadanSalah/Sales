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

// ─── Missing Info Banner ──────────────────────────────────────────────────────

interface MissingField {
  key: string;
  label: { ar: string; en: string };
}

const REQUIRED_FIELDS: MissingField[] = [
  { key: 'parties.buyer.full_name',              label: { ar: 'اسم المشتري',          en: 'Buyer Name' } },
  { key: 'parties.buyer.national_id',            label: { ar: 'الرقم القومي للمشتري', en: 'Buyer National ID' } },
  { key: 'parties.seller.full_name',             label: { ar: 'اسم البائع',           en: 'Seller Name' } },
  { key: 'property_details.property_id',         label: { ar: 'معرف العقار',          en: 'Property ID' } },
  { key: 'property_details.title',               label: { ar: 'عنوان العقار',         en: 'Property Title' } },
  { key: 'property_details.area_sqm',            label: { ar: 'المساحة',              en: 'Property Area' } },
  { key: 'property_details.legal_status',        label: { ar: 'الحالة القانونية',     en: 'Legal Status' } },
  { key: 'financial_breakdown.base_price',       label: { ar: 'السعر الأساسي',        en: 'Base Price' } },
  { key: 'financial_breakdown.total_amount_due', label: { ar: 'إجمالي المبلغ',        en: 'Total Amount Due' } },
  { key: 'approval_workflow.seller_approval',    label: { ar: 'موافقة البائع',        en: 'Seller Approval' } },
  { key: 'approval_workflow.admin_approval',     label: { ar: 'موافقة المدير',        en: 'Admin Approval' } },
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

// ─── Error States ─────────────────────────────────────────────────────────────

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

// ─── Invoice Status Bar (shows relational meta alongside JSON data) ────────────

function InvoiceStatusBar({
  approvalStatus,
  paymentStatus,
  totalWithFees,
  lang,
}: {
  approvalStatus: string;
  paymentStatus: string;
  totalWithFees: number | null;
  lang: 'ar' | 'en';
}) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  const approvalColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_seller: 'bg-amber-100 text-amber-800',
    seller_approved: 'bg-blue-100 text-blue-800',
    seller_rejected: 'bg-red-100 text-red-800',
    pending_admin: 'bg-purple-100 text-purple-800',
    admin_approved: 'bg-emerald-100 text-emerald-800',
    admin_rejected: 'bg-red-100 text-red-800',
    blocked_pending_review: 'bg-orange-100 text-orange-800',
    fully_approved: 'bg-emerald-200 text-emerald-900',
    voided: 'bg-gray-100 text-gray-500',
  };

  const paymentColor: Record<string, string> = {
    unpaid: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  const formattedTotal = totalWithFees != null
    ? new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(totalWithFees)
    : null;

  return (
    <div className="flex flex-wrap gap-3 mb-6 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-muted)]">{t('الموافقة', 'Approval')}:</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${approvalColor[approvalStatus] ?? 'bg-gray-100 text-gray-700'}`}>
          {approvalStatus.replace(/_/g, ' ')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-muted)]">{t('الدفع', 'Payment')}:</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${paymentColor[paymentStatus] ?? 'bg-gray-100 text-gray-700'}`}>
          {paymentStatus}
        </span>
      </div>
      {formattedTotal && (
        <div className="flex items-center gap-2 ms-auto">
          <span className="text-xs text-[var(--color-text-muted)]">{t('الإجمالي', 'Total')}:</span>
          <span className="text-sm font-bold text-[var(--color-text)]">{formattedTotal}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page Content ────────────────────────────────────────────────────────

function InvoicePageContent() {
  const params = useParams();
  const { lang } = useAuth();
  const invoiceId = params.id as string;
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: response, error, isLoading, mutate } = useSWR(
    invoiceId ? `invoice-detail-${invoiceId}` : null,
    () => invoiceDetailApi.getDetailedInvoice(invoiceId),
    { revalidateOnFocus: false }
  );

  const handleUpdate = useCallback(() => { mutate(); }, [mutate]);

  if (error) {
    const status = error.status ?? (
      error.message?.includes('404') ? 404
        : error.message?.includes('403') ? 403
        : 500
    );
    return <ErrorState status={status} message={error.message} lang={lang} onRetry={() => mutate()} />;
  }

  const invoice: DetailedInvoice | undefined = response?.data;
  const meta = response?.meta;
  const showLoading = isLoading || !invoice;

  // The viewer role is supplied by the backend — no guessing needed
  const viewerRole = invoice?._viewer_role;
  const isAdmin = viewerRole === 'admin';

  const missingFields = invoice ? getMissingRequiredFields(invoice) : [];
  const fallback: DetailedInvoice = invoice ?? ({} as DetailedInvoice);

  return (
    <div className="invoice-page-container max-w-4xl mx-auto px-4 py-8">

      {/* Missing info banner */}
      {!showLoading && !isDismissed && missingFields.length > 0 && (
        <MissingInfoBanner fields={missingFields} lang={lang} onDismiss={() => setIsDismissed(true)} />
      )}

      {/* Invoice status bar — sourced from the relational meta, not the JSON blob */}
      {!showLoading && meta && (
        <InvoiceStatusBar
          approvalStatus={meta.approval_status}
          paymentStatus={meta.payment_status}
          totalWithFees={meta.total_with_fees}
          lang={lang}
        />
      )}

      {/* Section 1: Header */}
      <InvoiceHeader data={fallback.invoice_metadata} lang={lang} isLoading={showLoading} />

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

      {/* Section 6: Legal & Compliance — admin-only (stripped from buyer/seller by backend) */}
      {(showLoading || isAdmin) && fallback.legal_compliance_flags && (
        <div className="mt-6">
          <LegalCompliance data={fallback.legal_compliance_flags} lang={lang} isLoading={showLoading} />
        </div>
      )}

      {/* Section 7: Approval Workflow — viewerRole drives which action buttons appear */}
      <div className="mt-6">
        <ApprovalWorkflow
          data={fallback.approval_workflow}
          invoiceId={invoiceId}
          lang={lang}
          isLoading={showLoading}
          onUpdate={handleUpdate}
          viewerRole={viewerRole}
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

      {/* Section 10: Audit Trail — admin-only (stripped from buyer/seller by backend) */}
      {(showLoading || isAdmin) && fallback.audit_trail && (
        <div className="mt-6 mb-12">
          <AuditTrail data={fallback.audit_trail} lang={lang} isLoading={showLoading} />
        </div>
      )}
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
