'use client';

import useSWR from 'swr';
import { analyticsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AdminActivityPage() {
  const { lang } = useAuth();
  const { data, error } = useSWR('recent-activity', () =>
    analyticsApi.recentActivity(100)
  );

  const activities = (data?.data ?? []) as Array<{
    id?: number;
    user_email?: string;
    action?: string;
    entity_type?: string;
    entity_id?: number;
    details?: string | Record<string, unknown>;
    ip_address?: string;
    created_at?: string;
  }>;

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (error) return <div className="text-[var(--color-error)]">{error.message}</div>;
  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        {t('سجل النشاط', 'Activity Log')}
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-start py-3 px-2 font-semibold">
                {t('المستخدم', 'User')}
              </th>
              <th className="text-start py-3 px-2 font-semibold">
                {t('الإجراء', 'Action')}
              </th>
              <th className="text-start py-3 px-2 font-semibold">
                {t('الوحدة', 'Entity')}
              </th>
              <th className="text-start py-3 px-2 font-semibold">
                {t('التفاصيل', 'Details')}
              </th>
              <th className="text-start py-3 px-2 font-semibold">
                {t('التاريخ', 'Date')}
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-text-muted)]">
                  {t('لا توجد سجلات', 'No activity records')}
                </td>
              </tr>
            ) : (
              activities.map((a, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]">
                  <td className="py-3 px-2">{a.user_email ?? '-'}</td>
                  <td className="py-3 px-2">{a.action ?? '-'}</td>
                  <td className="py-3 px-2">
                    {a.entity_type ?? '-'}
                    {a.entity_id != null ? ` #${a.entity_id}` : ''}
                  </td>
                  <td className="py-3 px-2 text-sm text-[var(--color-text-muted)] max-w-xs truncate">
                    {a.details
                      ? typeof a.details === 'object'
                        ? Object.entries(a.details).map(([k, v]) => `${k}: ${v}`).join(', ')
                        : String(a.details)
                      : '-'}
                  </td>
                  <td className="py-3 px-2 text-sm">
                    {a.created_at ? formatDateTime(a.created_at, lang) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
