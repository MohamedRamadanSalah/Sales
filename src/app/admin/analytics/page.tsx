'use client';

import useSWR from 'swr';
import { analyticsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AdminAnalyticsPage() {
  const { lang } = useAuth();
  const { data: overview } = useSWR('analytics-overview', () => analyticsApi.overview());
  const { data: revenue } = useSWR('analytics-revenue', () => analyticsApi.revenue());
  const { data: properties } = useSWR('analytics-properties', () => analyticsApi.properties());

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const o = overview?.data as Record<string, number> | undefined;
  const r = revenue?.data as Record<string, unknown> | undefined;
  const p = properties?.data as Record<string, unknown> | undefined;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        {t('التحليلات', 'Analytics')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {o && (
          <>
            <div className="p-6 rounded-xl bg-[var(--color-surface)] border">
              <p className="text-sm text-[var(--color-text-muted)]">{t('المستخدمين', 'Users')}</p>
              <p className="text-2xl font-bold">{o.total_users}</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-surface)] border">
              <p className="text-sm text-[var(--color-text-muted)]">{t('العقارات', 'Properties')}</p>
              <p className="text-2xl font-bold">{o.total_properties}</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-surface)] border">
              <p className="text-sm text-[var(--color-text-muted)]">{t('الطلبات', 'Orders')}</p>
              <p className="text-2xl font-bold">{o.total_orders}</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-surface)] border">
              <p className="text-sm text-[var(--color-text-muted)]">{t('الإيرادات', 'Revenue')}</p>
              <p className="text-2xl font-bold">{formatPrice(o.total_revenue ?? 0, lang)}</p>
            </div>
          </>
        )}
      </div>

      {r && (r.financial_summary as Record<string, number>) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('ملخص مالي', 'Financial Summary')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50">
              <p className="text-sm text-green-800">{t('المحصل', 'Collected')}</p>
              <p className="text-xl font-bold text-green-900">
                {formatPrice((r.financial_summary as Record<string, number>).total_collected ?? 0, lang)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50">
              <p className="text-sm text-amber-800">{t('المعلق', 'Pending')}</p>
              <p className="text-xl font-bold text-amber-900">
                {formatPrice((r.financial_summary as Record<string, number>).total_pending ?? 0, lang)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">{t('الفواتير', 'Invoices')}</p>
              <p className="text-xl font-bold text-blue-900">
                {(r.financial_summary as Record<string, number>).total_invoices ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {p && (p.by_status as Array<{ status: string; count: string }>) && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{t('العقارات حسب الحالة', 'Properties by Status')}</h2>
          <div className="flex flex-wrap gap-4">
            {((p as { by_status?: Array<{ status: string; count: string }> }).by_status ?? []).map(
              (s) => (
                <div key={s.status} className="px-4 py-2 rounded-lg bg-[var(--color-bg-2)]">
                  <span className="font-medium">{s.status}</span>: {s.count}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
