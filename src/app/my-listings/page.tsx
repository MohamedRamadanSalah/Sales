'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { propertiesApi } from '@/lib/api';
import { formatPrice, getPropertyTitle } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Property } from '@/types';

function MyListingsContent() {
  const { lang } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data, error, mutate } = useSWR('properties-my', () =>
    propertiesApi.my()
  );

  const properties = data?.data ?? [];
  const filtered =
    statusFilter === 'all'
      ? properties
      : properties.filter((p: Property) => p.status === statusFilter);

  const statusVariant: Record<string, 'pending' | 'approved' | 'rejected' | 'sold' | 'rented' | 'inactive'> = {
    pending_approval: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    sold: 'sold',
    rented: 'rented',
    inactive: 'inactive',
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-error)]">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {lang === 'ar' ? 'عقاراتي' : 'My Listings'}
        </h1>
        <Link href="/create-property">
          <Button variant="accent">
            {lang === 'ar' ? 'إضافة عقار' : 'Add Property'}
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'pending_approval', 'approved', 'rejected', 'sold', 'rented', 'inactive'].map(
          (s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-2)] hover:bg-[var(--color-border)]'
              }`}
            >
              {s === 'all'
                ? (lang === 'ar' ? 'الكل' : 'All')
                : s.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                {lang === 'ar' ? 'العنوان' : 'Title'}
              </th>
              <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                {lang === 'ar' ? 'السعر' : 'Price'}
              </th>
              <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                {lang === 'ar' ? 'الحالة' : 'Status'}
              </th>
              <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                {lang === 'ar' ? 'إجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[var(--color-text-muted)]">
                  {lang === 'ar' ? 'لا توجد عقارات' : 'No properties'}
                </td>
              </tr>
            ) : (
              filtered.map((p: Property) => (
                <tr key={p.id} className="border-b border-[var(--color-border)]">
                  <td className="py-3 px-2">
                    <Link
                      href={`/property/${p.id}`}
                      className="text-[var(--color-primary)] hover:underline font-medium"
                    >
                      {getPropertyTitle(p, lang)}
                    </Link>
                  </td>
                  <td className="py-3 px-2 font-medium">
                    {formatPrice(p.price, lang)}
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={statusVariant[p.status] ?? 'default'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <Link href={`/edit-property/${p.id}`}>
                      <Button variant="ghost" size="sm">
                        {lang === 'ar' ? 'تعديل' : 'Edit'}
                      </Button>
                    </Link>
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

export default function MyListingsPage() {
  return (
    <ProtectedRoute>
      <MyListingsContent />
    </ProtectedRoute>
  );
}
