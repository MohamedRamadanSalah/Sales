'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { invoiceDetailApi } from '@/lib/api';
import { formatInvoiceDate } from '@/lib/formatters';
import type { ApprovalWorkflow as ApprovalWorkflowType } from '@/types/invoice';

interface Props {
  data: ApprovalWorkflowType;
  invoiceId: string;
  lang: 'ar' | 'en';
  isLoading?: boolean;
  onUpdate: () => void;
}

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED_PENDING_REVIEW';

function StatusBadge({ status, lang }: { status: ApprovalStatus; lang: 'ar' | 'en' }) {
  const config: Record<ApprovalStatus, { variant: 'pending' | 'approved' | 'rejected' | 'default'; ar: string; en: string }> = {
    PENDING: { variant: 'pending', ar: 'بانتظار الموافقة', en: 'Pending' },
    APPROVED: { variant: 'approved', ar: 'تمت الموافقة', en: 'Approved' },
    REJECTED: { variant: 'rejected', ar: 'مرفوض', en: 'Rejected' },
    BLOCKED_PENDING_REVIEW: { variant: 'rejected', ar: 'محجوب للمراجعة', en: 'Blocked — Pending Review' },
  };
  const c = config[status] ?? config.PENDING;
  return <Badge variant={c.variant}>{lang === 'ar' ? c.ar : c.en}</Badge>;
}

function StepIndicator({
  stepNumber,
  label,
  status,
  isLast,
}: {
  stepNumber: number;
  label: string;
  status: ApprovalStatus;
  isLast: boolean;
}) {
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';
  const isBlocked = status === 'BLOCKED_PENDING_REVIEW';

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isApproved
              ? 'bg-emerald-500 text-white'
              : isRejected || isBlocked
              ? 'bg-red-500 text-white'
              : 'bg-[var(--color-bg-2)] text-[var(--color-text-muted)] border-2 border-[var(--color-border)]'
          }`}
        >
          {isApproved ? '✓' : isRejected ? '✗' : stepNumber}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-8 ${
              isApproved ? 'bg-emerald-300' : 'bg-[var(--color-border)]'
            }`}
          />
        )}
      </div>
      <span className="text-sm font-medium text-[var(--color-text)] pt-1">{label}</span>
    </div>
  );
}

function SellerActions({
  data,
  invoiceId,
  lang,
  onUpdate,
}: {
  data: ApprovalWorkflowType;
  invoiceId: string;
  lang: 'ar' | 'en';
  onUpdate: () => void;
}) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (data.seller_approval.status !== 'PENDING') return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await invoiceDetailApi.sellerApproval(invoiceId, { status: 'APPROVED' });
      onUpdate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (reason.trim().length < 20) {
      setError(t('سبب الرفض يجب أن يكون 20 حرف على الأقل', 'Rejection reason must be at least 20 characters'));
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await invoiceDetailApi.sellerApproval(invoiceId, { status: 'REJECTED', reason: reason.trim() });
      onUpdate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="invoice-approval-actions mt-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="sm" onClick={handleApprove} isLoading={isSubmitting && !showReject}
          className="!bg-emerald-600 hover:!bg-emerald-700">
          {t('الموافقة', 'Approve')}
        </Button>
        <Button variant="danger" size="sm" onClick={() => setShowReject(!showReject)} disabled={isSubmitting}>
          {t('رفض', 'Reject')}
        </Button>
      </div>
      {showReject && (
        <div className="invoice-approval-textarea space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('سبب الرفض (20 حرف على الأقل)...', 'Rejection reason (min 20 chars)...')}
            className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${reason.trim().length >= 20 ? 'text-emerald-600' : 'text-[var(--color-text-muted)]'}`}>
              {reason.trim().length}/20
            </span>
            <Button variant="danger" size="sm" onClick={handleReject} isLoading={isSubmitting}>
              {t('تأكيد الرفض', 'Confirm Rejection')}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </div>
  );
}

function AdminActions({
  data,
  invoiceId,
  lang,
  onUpdate,
}: {
  data: ApprovalWorkflowType;
  invoiceId: string;
  lang: 'ar' | 'en';
  onUpdate: () => void;
}) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const [action, setAction] = useState<'none' | 'reject' | 'changes'>('none');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const status = data.admin_approval.status;
  if (status !== 'PENDING' && status !== 'BLOCKED_PENDING_REVIEW') return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await invoiceDetailApi.adminApproval(invoiceId, { status: 'APPROVED' });
      onUpdate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (text.trim().length < 1) {
      setError(t('سبب الرفض مطلوب', 'Rejection reason is required'));
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await invoiceDetailApi.adminApproval(invoiceId, { status: 'REJECTED', reason: text.trim() });
      onUpdate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (text.trim().length < 1) {
      setError(t('الملاحظات مطلوبة', 'Notes are required'));
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await invoiceDetailApi.adminApproval(invoiceId, {
        status: 'BLOCKED_PENDING_REVIEW',
        notes: text.trim(),
      });
      onUpdate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="invoice-approval-actions mt-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="sm" onClick={handleApprove} isLoading={isSubmitting && action === 'none'}
          className="!bg-emerald-600 hover:!bg-emerald-700">
          {t('الموافقة', 'Approve')}
        </Button>
        <Button variant="danger" size="sm" onClick={() => { setAction('reject'); setText(''); }} disabled={isSubmitting}>
          {t('رفض', 'Reject')}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => { setAction('changes'); setText(''); }} disabled={isSubmitting}>
          {t('طلب تعديلات', 'Request Changes')}
        </Button>
      </div>

      {action !== 'none' && (
        <div className="invoice-approval-textarea space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              action === 'reject'
                ? t('سبب الرفض...', 'Rejection reason...')
                : t('ملاحظات التعديل المطلوبة...', 'Change request notes...')
            }
            className={`w-full px-4 py-3 rounded-lg border bg-[var(--color-surface)] text-sm resize-none focus:outline-none focus:ring-2 ${
              action === 'reject'
                ? 'border-red-200 focus:ring-red-300'
                : 'border-amber-200 focus:ring-amber-300'
            }`}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              variant={action === 'reject' ? 'danger' : 'secondary'}
              size="sm"
              onClick={action === 'reject' ? handleReject : handleRequestChanges}
              isLoading={isSubmitting}
            >
              {action === 'reject'
                ? t('تأكيد الرفض', 'Confirm Rejection')
                : t('إرسال طلب التعديل', 'Submit Change Request')}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="invoice-section" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="skeleton h-6 w-48 rounded mb-5" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="skeleton h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-4 w-48 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ApprovalWorkflow({ data, invoiceId, lang, isLoading, onUpdate }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const { user } = useAuth();
  const userRole = user?.role;

  if (isLoading) return <Skeleton />;

  const isSeller = userRole === 'broker' || userRole === 'client';
  const isAdmin = userRole === 'admin';

  return (
    <div className="invoice-section animate-fade-in-up delay-600">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
          {t('سير الموافقة', 'Approval Workflow')}
        </h2>

        {/* Blocked banner */}
        {data.admin_approval.status === 'BLOCKED_PENDING_REVIEW' && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">
              🚫 {t('الفاتورة محجوبة للمراجعة', 'Invoice Blocked — Pending Review')}
            </p>
            {data.admin_approval.notes && (
              <p className="text-sm text-red-600">{data.admin_approval.notes}</p>
            )}
          </div>
        )}

        {/* Rejection banner */}
        {data.final_status === 'REJECTED' && data.rejection_reason && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">
              {t('سبب الرفض', 'Rejection Reason')}:
            </p>
            <p className="text-sm text-red-600">{data.rejection_reason}</p>
          </div>
        )}

        {/* Step indicators */}
        <div className="mb-6">
          <StepIndicator
            stepNumber={1}
            label={t('موافقة البائع', 'Seller Approval')}
            status={data.seller_approval.status}
            isLast={false}
          />
          <StepIndicator
            stepNumber={2}
            label={t('موافقة المدير', 'Admin Approval')}
            status={data.admin_approval.status}
            isLast={false}
          />
          <StepIndicator
            stepNumber={3}
            label={t('الحالة النهائية', 'Final Status')}
            status={data.final_status as ApprovalStatus}
            isLast={true}
          />
        </div>

        {/* Step details */}
        <div className="space-y-4">
          {/* Seller approval */}
          <div className="bg-[var(--color-bg-2)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {t('موافقة البائع', 'Seller Approval')}
              </span>
              <StatusBadge status={data.seller_approval.status} lang={lang} />
            </div>
            {data.seller_approval.approved_at && (
              <p className="text-xs text-[var(--color-text-muted)]">
                {formatInvoiceDate(data.seller_approval.approved_at, lang)}
              </p>
            )}
            {/* Seller action buttons */}
            {isSeller && (
              <SellerActions data={data} invoiceId={invoiceId} lang={lang} onUpdate={onUpdate} />
            )}
          </div>

          {/* Admin approval */}
          <div className="bg-[var(--color-bg-2)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {t('موافقة المدير', 'Admin Approval')}
              </span>
              <StatusBadge status={data.admin_approval.status} lang={lang} />
            </div>
            {data.admin_approval.approved_at && (
              <p className="text-xs text-[var(--color-text-muted)]">
                {formatInvoiceDate(data.admin_approval.approved_at, lang)}
              </p>
            )}
            {data.admin_approval.admin_id && (
              <p className="text-xs text-[var(--color-text-muted)]">
                {t('معرف المدير', 'Admin ID')}: {data.admin_approval.admin_id}
              </p>
            )}
            {/* Admin action buttons */}
            {isAdmin && (
              <AdminActions data={data} invoiceId={invoiceId} lang={lang} onUpdate={onUpdate} />
            )}
          </div>

          {/* Final status */}
          <div className="bg-[var(--color-bg-2)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {t('الحالة النهائية', 'Final Status')}
              </span>
              <StatusBadge status={data.final_status as ApprovalStatus} lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
