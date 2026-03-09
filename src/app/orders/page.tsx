'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate, getPropertyTitle } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';

function OrdersContent() {
  const { lang } = useAuth();
  const { data, error } = useSWR('orders-my', () => ordersApi.my());

  const orders = data?.data ?? [];

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-error)] mb-4">{error.message}</p>
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

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-xl text-[var(--color-text-muted)] mb-6">
          {lang === 'ar' ? 'لا توجد طلبات شراء بعد' : 'No purchase requests yet'}
        </p>
        <Link href="/search">
          <Button variant="accent">{lang === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}</Button>
        </Link>
      </div>
    );
  }

  const statusVariant = (
    s: string
  ): 'pending' | 'approved' | 'rejected' | 'default' => {
    if (s === 'pending') return 'pending';
    if (s === 'accepted' || s === 'completed') return 'approved';
    if (s === 'rejected') return 'rejected';
    return 'default';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        {lang === 'ar' ? 'طلباتي' : 'My Orders'}
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                {lang === 'ar' ? 'العقار' : 'Property'}
              </th>
              <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                {lang === 'ar' ? 'المبلغ' : 'Amount'}
              </th>
              <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                {lang === 'ar' ? 'الحالة' : 'Status'}
              </th>
              <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                {lang === 'ar' ? 'التاريخ' : 'Date'}
              </th>
              <th className="text-start py-3 px-2 font-semibold text-[var(--color-text)]">
                {lang === 'ar' ? 'إجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: Order) => (
              <tr key={o.id} className="border-b border-[var(--color-border)]">
                <td className="py-3 px-2">
                  <Link
                    href={`/property/${o.property_id}`}
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    {(o as Order & { property_title?: string }).property_title ??
                      (o.property ? getPropertyTitle(o.property, lang) : `#${o.property_id}`)}
                  </Link>
                </td>
                <td className="py-3 px-2 font-medium">
                  {formatPrice(o.total_amount, lang)}
                </td>
                <td className="py-3 px-2">
                  <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                </td>
                <td className="py-3 px-2 text-[var(--color-text-secondary)]">
                  {formatDate(o.created_at, lang)}
                </td>
                <td className="py-3 px-2">
                  <Link href={`/property/${o.property_id}`}>
                    <Button variant="ghost" size="sm">
                      {lang === 'ar' ? 'عرض' : 'View'}
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
