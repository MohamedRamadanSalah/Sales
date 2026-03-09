'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { analyticsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const { lang } = useAuth();
  const { data, error } = useSWR('analytics-overview', () =>
    analyticsApi.overview()
  );

  const d = data?.data as Record<string, number> | undefined;
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!d) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-12 h-12 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: t('إجمالي العقارات', 'Total Properties'), value: d.total_properties, icon: '🏠', color: 'from-blue-500 to-blue-600' },
    { label: t('إجمالي المستخدمين', 'Total Users'), value: d.total_users, icon: '👥', color: 'from-emerald-500 to-emerald-600' },
    { label: t('إجمالي الطلبات', 'Total Orders'), value: d.total_orders, icon: '📋', color: 'from-purple-500 to-purple-600' },
    { label: t('الإيرادات', 'Revenue'), value: formatPrice(d.total_revenue ?? 0, lang), icon: '💰', color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          {t('لوحة التحكم', 'Dashboard')}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {t('نظرة عامة على أداء المنصة', 'Platform performance overview')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className={`relative overflow-hidden p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] luxury-card animate-fade-in-up delay-${(i + 1) * 100}`}
          >
            <div className={`absolute top-0 end-0 w-20 h-20 rounded-full bg-gradient-to-br ${c.color} opacity-10 -translate-y-1/2 translate-x-1/2`} />
            <span className="text-3xl mb-3 block">{c.icon}</span>
            <p className="text-sm text-[var(--color-text-muted)] mb-1 font-medium">
              {c.label}
            </p>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {typeof c.value === 'number' ? c.value.toLocaleString() : c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {d.pending_approval > 0 && (
          <div className="p-6 rounded-2xl bg-orange-50 border border-orange-200 animate-fade-in-up delay-500">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🔔</span>
              <div className="flex-1">
                <p className="font-bold text-orange-800 text-lg mb-1">
                  {d.pending_approval} {t('عقار بانتظار الموافقة', 'Properties Pending')}
                </p>
                <p className="text-sm text-orange-600 mb-3">
                  {t('تحتاج مراجعة وموافقة', 'Need your review and approval')}
                </p>
                <Link href="/admin/properties?status=pending_approval">
                  <Button variant="accent" size="sm">
                    {t('مراجعة الآن', 'Review Now')} →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        {d.pending_orders > 0 && (
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 animate-fade-in-up delay-600">
            <div className="flex items-start gap-4">
              <span className="text-3xl">📬</span>
              <div className="flex-1">
                <p className="font-bold text-blue-800 text-lg mb-1">
                  {d.pending_orders} {t('طلب بانتظار الرد', 'Orders Pending')}
                </p>
                <p className="text-sm text-blue-600 mb-3">
                  {t('تحتاج استجابة سريعة', 'Need your quick response')}
                </p>
                <Link href="/admin/orders?status=pending">
                  <Button variant="primary" size="sm">
                    {t('مراجعة الآن', 'Review Now')} →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
