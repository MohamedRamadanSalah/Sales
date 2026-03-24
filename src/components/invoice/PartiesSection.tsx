'use client';

import type { Parties } from '@/types/invoice';

interface Props {
  data: Parties;
  lang: 'ar' | 'en';
  isLoading?: boolean;
}

function maskNationalId(id: string | null): string {
  if (!id) return '—';
  if (id.length <= 4) return id;
  return id.slice(0, 3) + '****' + id.slice(-3);
}

function PersonCard({
  title,
  name,
  nationalId,
  email,
  phone,
  address,
  lang,
}: {
  title: string;
  name: string | null;
  nationalId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  lang: 'ar' | 'en';
}) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const isMissing = !name;

  return (
    <div className={`glass rounded-xl p-5 ${isMissing ? 'border-l-4 border-l-amber-400' : ''}`}>
      <h3 className="text-sm font-bold text-[var(--color-accent-dark)] uppercase tracking-wider mb-3">
        {title}
      </h3>
      {isMissing ? (
        <p className="text-sm text-amber-600 italic">
          {t('بيانات غير متوفرة', 'Data not provided')}
        </p>
      ) : (
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-[var(--color-text-muted)]">{t('الاسم', 'Name')}:</span>{' '}
            <strong className="text-[var(--color-text)]">{name}</strong>
          </div>
          {nationalId && (
            <div>
              <span className="text-[var(--color-text-muted)]">{t('الرقم القومي', 'National ID')}:</span>{' '}
              <span className="screen-only font-mono text-[var(--color-text)]">{maskNationalId(nationalId)}</span>
              <span className="print-only font-mono text-[var(--color-text)]">{nationalId}</span>
            </div>
          )}
          {email && (
            <div>
              <span className="text-[var(--color-text-muted)]">{t('البريد', 'Email')}:</span>{' '}
              <span className="text-[var(--color-text)]">{email}</span>
            </div>
          )}
          {phone && (
            <div>
              <span className="text-[var(--color-text-muted)]">{t('الهاتف', 'Phone')}:</span>{' '}
              <span className="text-[var(--color-text)] direction-ltr">{phone}</span>
            </div>
          )}
          {address && (
            <div>
              <span className="text-[var(--color-text-muted)]">{t('العنوان', 'Address')}:</span>{' '}
              <span className="text-[var(--color-text)]">{address}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentCard({ data, lang }: { data: Parties['agent']; lang: 'ar' | 'en' }) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  if (!data || !data.name) {
    return (
      <div className="glass rounded-xl p-5 opacity-60">
        <h3 className="text-sm font-bold text-[var(--color-accent-dark)] uppercase tracking-wider mb-3">
          {t('الوسيط', 'Agent')}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] italic">
          {t('لا يوجد وسيط', 'No agent assigned')}
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-bold text-[var(--color-accent-dark)] uppercase tracking-wider mb-3">
        {t('الوسيط', 'Agent')}
      </h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-[var(--color-text-muted)]">{t('الاسم', 'Name')}:</span>{' '}
          <strong className="text-[var(--color-text)]">{data.name}</strong>
        </div>
        {data.license_number && (
          <div>
            <span className="text-[var(--color-text-muted)]">{t('رقم الترخيص', 'License')}:</span>{' '}
            <span className="font-mono text-[var(--color-text)]">{data.license_number}</span>
          </div>
        )}
        {data.agency && (
          <div>
            <span className="text-[var(--color-text-muted)]">{t('الوكالة', 'Agency')}:</span>{' '}
            <span className="text-[var(--color-text)]">{data.agency}</span>
          </div>
        )}
        {data.commission_rate != null && (
          <div>
            <span className="text-[var(--color-text-muted)]">{t('العمولة', 'Commission')}:</span>{' '}
            <span className="text-[var(--color-text)]">{data.commission_rate}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCard({ data, lang }: { data: Parties['platform_admin']; lang: 'ar' | 'en' }) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  if (!data) return null;
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-bold text-[var(--color-accent-dark)] uppercase tracking-wider mb-3">
        {t('مدير المنصة', 'Platform Admin')}
      </h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-[var(--color-text-muted)]">{t('معرف المدير', 'Admin ID')}:</span>{' '}
          <span className="text-[var(--color-text)]">{data.assigned_admin_id ?? '—'}</span>
        </div>
        <div>
          <span className="text-[var(--color-text-muted)]">{t('حالة المراجعة', 'Review Status')}:</span>{' '}
          <span className={`font-semibold ${data.review_status === 'AWAITING_REVIEW' ? 'text-amber-600' : 'text-emerald-600'}`}>
            {data.review_status}
          </span>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="invoice-section" data-skeleton>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <div className="skeleton h-6 w-48 rounded mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-[var(--color-border)] p-5">
              <div className="skeleton h-4 w-24 rounded mb-3" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PartiesSection({ data, lang, isLoading }: Props) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (isLoading) return <Skeleton />;

  return (
    <div className="invoice-section animate-fade-in-up delay-100">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
          {t('أطراف المعاملة', 'Parties Involved')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PersonCard
            title={t('المشتري', 'Buyer')}
            name={data.buyer.full_name}
            nationalId={data.buyer.national_id}
            email={data.buyer.contact_email}
            phone={data.buyer.contact_phone}
            address={data.buyer.address}
            lang={lang}
          />
          <PersonCard
            title={t('البائع', 'Seller')}
            name={data.seller.full_name}
            nationalId={data.seller.national_id}
            email={data.seller.contact_email}
            phone={data.seller.contact_phone}
            address={data.seller.address}
            lang={lang}
          />
          <AgentCard data={data.agent} lang={lang} />
          <AdminCard data={data.platform_admin} lang={lang} />
        </div>
      </div>
    </div>
  );
}
