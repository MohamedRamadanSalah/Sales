'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { propertiesApi } from '@/lib/api';
import { formatPrice, getPropertyTitle } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Property } from '@/types';

const statusVariant: Record<string, 'pending' | 'approved' | 'rejected' | 'sold' | 'rented' | 'inactive'> = {
  pending_approval: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  sold: 'sold',
  rented: 'rented',
  inactive: 'inactive',
};

const statusLabels: Record<string, { ar: string; en: string }> = {
  '': { ar: 'الكل', en: 'All' },
  pending_approval: { ar: 'بانتظار الموافقة', en: 'Pending' },
  approved: { ar: 'موافق عليه', en: 'Approved' },
  rejected: { ar: 'مرفوض', en: 'Rejected' },
  sold: { ar: 'مباع', en: 'Sold' },
  rented: { ar: 'مؤجر', en: 'Rented' },
};

export default function AdminPropertiesPage() {
  const { lang } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const { data, error, mutate } = useSWR(
    ['admin-properties', statusFilter],
    () => propertiesApi.adminAll(statusFilter ? { status: statusFilter } : {})
  );

  const properties = data?.data ?? [];

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await propertiesApi.updateStatus(id, status);
      mutate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-12 h-12 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          {t('إدارة العقارات', 'Manage Properties')}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {t('مراجعة وإدارة جميع العقارات المسجلة', 'Review and manage all registered properties')}
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in delay-100">
        {Object.entries(statusLabels).map(([s, label]) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              statusFilter === s
                ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-2)] border border-[var(--color-border)]'
            }`}
          >
            {t(label.ar, label.en)}
          </button>
        ))}
      </div>

      {/* Properties Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden animate-fade-in-up delay-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                <th className="text-start py-4 px-5 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">#</th>
                <th className="text-start py-4 px-5 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {t('العنوان', 'Title')}
                </th>
                <th className="text-start py-4 px-5 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {t('السعر', 'Price')}
                </th>
                <th className="text-start py-4 px-5 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {t('الحالة', 'Status')}
                </th>
                <th className="text-start py-4 px-5 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {t('إجراءات', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p: Property, i: number) => (
                <tr
                  key={p.id}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors duration-200"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="py-4 px-5 text-sm text-[var(--color-text-muted)] font-mono">{p.id}</td>
                  <td className="py-4 px-5">
                    <Link
                      href={`/property/${p.id}`}
                      className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors"
                    >
                      {getPropertyTitle(p, lang)}
                    </Link>
                  </td>
                  <td className="py-4 px-5 font-semibold text-sm text-[var(--color-text)]">
                    {formatPrice(p.price, lang)}
                  </td>
                  <td className="py-4 px-5">
                    <Badge variant={statusVariant[p.status] ?? 'default'}>
                      {p.status in statusLabels ? t(statusLabels[p.status].ar, statusLabels[p.status].en) : p.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex gap-2 flex-wrap">
                      {p.status === 'pending_approval' && (
                        <>
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => handleStatusChange(p.id, 'approved')}
                          >
                            ✓ {t('موافقة', 'Approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleStatusChange(p.id, 'rejected')}
                          >
                            ✕ {t('رفض', 'Reject')}
                          </Button>
                        </>
                      )}
                      {p.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusChange(p.id, 'sold')}
                        >
                          🏷️ {t('مباع', 'Mark Sold')}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-[var(--color-text-muted)]">
                      {t('لا توجد عقارات', 'No properties found')}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
