'use client';

interface Props {
  approvalStatus: string;
  paymentStatus?: string;
  lang: 'ar' | 'en';
}

const STEPS = [
  { key: 'submitted', ar: 'مقدم', en: 'Submitted' },
  { key: 'seller', ar: 'مراجعة البائع', en: 'Seller Review' },
  { key: 'admin', ar: 'مراجعة الإدارة', en: 'Admin Review' },
  { key: 'payment', ar: 'الدفع', en: 'Payment' },
];

function getActiveStep(approvalStatus: string, paymentStatus?: string): number {
  if (paymentStatus === 'paid') return 4;
  if (approvalStatus === 'fully_approved') return 3;
  if (['pending_admin', 'blocked_pending_review'].includes(approvalStatus)) return 2;
  if (approvalStatus === 'pending_seller') return 1;
  if (['seller_rejected', 'admin_rejected', 'voided'].includes(approvalStatus)) return -1;
  return 0;
}

export function OrderProgressBar({ approvalStatus, paymentStatus, lang }: Props) {
  const active = getActiveStep(approvalStatus, paymentStatus);
  const isFailed = active === -1;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STEPS.map((step, i) => {
        const isComplete = !isFailed && active > i;
        const isCurrent = !isFailed && active === i;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isFailed
                  ? 'bg-red-400'
                  : isComplete
                    ? 'bg-emerald-500'
                    : isCurrent
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-gray-300'
              }`}
            />
            <span
              className={`text-[10px] ${
                isFailed
                  ? 'text-red-500'
                  : isComplete
                    ? 'text-emerald-600'
                    : isCurrent
                      ? 'text-amber-600 font-semibold'
                      : 'text-gray-400'
              }`}
            >
              {lang === 'ar' ? step.ar : step.en}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-px ${isComplete ? 'bg-emerald-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
