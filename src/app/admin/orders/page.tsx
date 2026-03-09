'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';

export default function AdminOrdersPage() {
  const { lang } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [invoiceModal, setInvoiceModal] = useState<{ orderId: number } | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({ amount: 0, due_date: '', payment_method: 'bank_transfer' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, error, mutate } = useSWR(
    ['admin-orders', statusFilter],
    () => ordersApi.adminAll(statusFilter ? { status: statusFilter } : {})
  );

  const orders = data?.data ?? [];

  const handleOrderStatus = async (id: number, status: string) => {
    try {
      await ordersApi.updateStatus(id, status);
      mutate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCreateInvoice = async () => {
    if (!invoiceModal || !invoiceForm.amount || !invoiceForm.due_date) return;
    setIsSubmitting(true);
    try {
      await ordersApi.createInvoice({
        order_id: invoiceModal.orderId,
        amount: invoiceForm.amount,
        due_date: invoiceForm.due_date,
        payment_method: invoiceForm.payment_method,
      });
      setInvoiceModal(null);
      mutate();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const statusVariant = (s: string) =>
    s === 'completed' || s === 'accepted' ? 'approved' : s === 'rejected' ? 'rejected' : 'pending';

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
        {t('إدارة الطلبات', 'Manage Orders')}
      </h1>

      <div className="flex gap-2 mb-6">
        {['', 'pending', 'accepted', 'completed', 'rejected'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm ${
              statusFilter === s ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-2)]'
            }`}
          >
            {s || t('الكل', 'All')}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-start py-3 px-2 font-semibold">#</th>
              <th className="text-start py-3 px-2 font-semibold">
                {t('العقار', 'Property')}
              </th>
              <th className="text-start py-3 px-2 font-semibold">
                {t('المبلغ', 'Amount')}
              </th>
              <th className="text-start py-3 px-2 font-semibold">
                {t('الحالة', 'Status')}
              </th>
              <th className="text-start py-3 px-2 font-semibold">
                {t('التاريخ', 'Date')}
              </th>
              <th className="text-start py-3 px-2 font-semibold">
                {t('إجراءات', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: { id: number; property_id: number; total_amount: number; status: string; created_at: string }) => (
              <tr key={o.id} className="border-b border-[var(--color-border)]">
                <td className="py-3 px-2">{o.id}</td>
                <td className="py-3 px-2">
                  <Link href={`/property/${o.property_id}`} className="text-[var(--color-primary)] hover:underline">
                    #{o.property_id}
                  </Link>
                </td>
                <td className="py-3 px-2 font-medium">
                  {formatPrice(o.total_amount, lang)}
                </td>
                <td className="py-3 px-2">
                  <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                </td>
                <td className="py-3 px-2">{formatDate(o.created_at, lang)}</td>
                <td className="py-3 px-2 flex gap-2 flex-wrap">
                  {o.status === 'pending' && (
                    <>
                      <Button size="sm" variant="primary" onClick={() => handleOrderStatus(o.id, 'accepted')}>
                        {t('قبول', 'Accept')}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleOrderStatus(o.id, 'rejected')}>
                        {t('رفض', 'Reject')}
                      </Button>
                    </>
                  )}
                  {o.status === 'accepted' && (
                    <>
                      <Button size="sm" variant="primary" onClick={() => handleOrderStatus(o.id, 'completed')}>
                        {t('إكمال', 'Complete')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setInvoiceModal({ orderId: o.id })}>
                        {t('فاتورة', 'Invoice')}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!invoiceModal}
        onClose={() => setInvoiceModal(null)}
        title={t('إنشاء فاتورة', 'Create Invoice')}
      >
        <div className="space-y-4">
          <Input
            label={t('المبلغ', 'Amount')}
            type="number"
            value={invoiceForm.amount || ''}
            onChange={(e) => setInvoiceForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label={t('تاريخ الاستحقاق', 'Due Date')}
            type="date"
            value={invoiceForm.due_date}
            onChange={(e) => setInvoiceForm((f) => ({ ...f, due_date: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium mb-2">{t('طريقة الدفع', 'Payment Method')}</label>
            <select
              value={invoiceForm.payment_method}
              onChange={(e) => setInvoiceForm((f) => ({ ...f, payment_method: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
            </select>
          </div>
          <Button onClick={handleCreateInvoice} isLoading={isSubmitting}>
            {t('إنشاء', 'Create')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
