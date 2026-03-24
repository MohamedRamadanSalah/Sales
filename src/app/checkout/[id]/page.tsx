'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { DetailedInvoice } from '@/types/invoice';

import { InvoiceHeader } from '@/components/invoice/InvoiceHeader';
import { PropertySection } from '@/components/invoice/PropertySection';
import { FinancialBreakdown } from '@/components/invoice/FinancialBreakdown';
import { TermsConditions } from '@/components/invoice/TermsConditions';
import { PartiesSection } from '@/components/invoice/PartiesSection';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = String(params.id);
  const { lang, isLoggedIn } = useAuth();
  const toast = useToast();

  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'credit_card' | 'instapay' | 'vodafone_cash'>('cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<number | null>(null);

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  const { data, error, isLoading } = useSWR(
    propertyId && isLoggedIn ? ['previewInvoice', propertyId] : null,
    () => ordersApi.previewInvoice(propertyId)
  );

  const invoice = data?.data as DetailedInvoice | undefined;

  // Render Authentication State
  if (!isLoggedIn) {
    if (typeof window !== 'undefined') {
      router.push(`/login?returnUrl=/checkout/${propertyId}`);
    }
    return null;
  }

  // Handle errors
  if (error) {
    const is404 = error.message.includes('404') || error.message.includes('not found');
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <span className="text-6xl mb-6">😕</span>
        <h1 className="text-3xl font-bold mb-4">
          {is404 ? t('العقار غير موجود', 'Property Not Found') : t('حدث خطأ', 'An Error Occurred')}
        </h1>
        <p className="text-[var(--color-text-muted)] max-w-md mb-8">
          {is404
            ? t('لم نتمكن من العثور على هذا العقار للمعاينة الدفع.', 'We could not find this property for checkout review.')
            : error.message}
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          {t('العودة', 'Go Back')}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalId.trim()) {
      toast.error(t('رقم الهوية مطلوب', 'National ID is required'));
      return;
    }
    if (!address.trim()) {
      toast.error(t('العنوان مطلوب', 'Address is required'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await ordersApi.create({
        property_id: Number(propertyId),
        notes,
        national_id: nationalId,
        address,
        payment_method: paymentMethod,
      });

      toast.success(
        t('تم تأكيد الطلب بنجاح! 🎉', 'Request Submitted! 🎉'),
        t('جاري نقلك لصفحة الفاتورة...', 'Redirecting to your invoice...')
      );

      // Show the beautiful success screen instead of forcefully redirecting
      const invoiceId = result.data.invoice_id || result.data.id;
      setCreatedInvoiceId(invoiceId);
      setIsSuccess(true);
    } catch (err) {
      let errorMessage = (err as Error).message;
      
      // Make common validation errors user-friendly
      if (errorMessage.includes('payment_method')) {
        errorMessage = t('طريقة الدفع المحددة غير صالحة.', 'The selected payment method is invalid.');
      } else if (errorMessage.includes('national_id')) {
        errorMessage = t('تنسيق رقم الهوية غير صحيح.', 'Invalid National ID format.');
      }

      toast.error(
        t('عذراً، لم نتمكن من إرسال طلبك', 'Sorry, we could not submit your request'),
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && createdInvoiceId) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 md:p-12 text-center shadow-2xl animate-fade-in-up">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✨</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-600 mb-4">
            {t('تم إرسال طلب الشراء بنجاح!', 'Purchase Request Submitted!')}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-lg mx-auto leading-relaxed">
            {t(
              'لقد قمنا بإنشاء فاتورة مبدئية لطلبك وتم إرسالها إلى البائع للمراجعة والموافقة.',
              'A draft invoice has been generated for your request and sent to the seller for review and approval.'
            )}
          </p>

          <div className="bg-[var(--color-bg-2)] rounded-2xl p-6 mb-10 text-start border border-[var(--color-border)]">
            <h3 className="font-bold text-[var(--color-text)] mb-4">
              {t('الخطوات القادمة:', 'Next Steps:')}
            </h3>
            <ul className="space-y-3 text-[var(--color-text-muted)] text-sm md:text-base">
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">1.</span>
                {t('البائع سيقوم بمراجعة الطلب (عادة خلال 24 ساعة).', 'Seller will review the request (usually within 24 hours).')}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">2.</span>
                {t('سيتم مراجعة الفاتورة من قبل الإدارة للتدقيق القانوني والمالي.', 'Management will audit the invoice for legal and financial compliance.')}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">3.</span>
                {t('سنقوم بإشعارك عند الموافقة النهائية للبدء في إجراءات الدفع والتوقيع.', 'You will be notified upon final approval to proceed with payment and signing.')}
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/invoices/${createdInvoiceId}`)}
              className="px-8 py-4 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex-1"
            >
              {t('عرض الفاتورة للمتابعة', 'View Invoice Status')}
            </button>
            <button
              onClick={() => router.push('/properties')}
              className="px-8 py-4 bg-transparent border-2 border-[var(--color-border)] text-[var(--color-text)] font-semibold rounded-xl hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all flex-1"
            >
              {t('العودة للعقارات', 'Back to Properties')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10">
        
        {/* Header Setup */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
            {t('مراجعة طلب الشراء', 'Checkout Overview')}
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t('قم بمراجعة التفاصيل المالية وإدخال بياناتك لإرسال طلب شراء رسمي للبائع للحصول على الموافقة.', 'Review the financial details and enter your information to submit a formal purchase request to the seller for approval.')}
          </p>
        </div>

        {/* Invoice Components Preview */}
        <div className="print-area space-y-6">
          <PropertySection data={invoice?.property_details!} lang={lang} isLoading={isLoading} />
          <FinancialBreakdown data={invoice?.financial_breakdown!} currency={invoice?.invoice_metadata?.currency || 'EGP'} lang={lang} isLoading={isLoading} />
        </div>

        {/* Buyer Data Form */}
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl mt-8">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
            <span className="text-[var(--color-accent)]">📋</span>
            {t('مطلوب لإكمال الطلب', 'Required for Request')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                {t('رقم الهوية الوطنية / جواز السفر *', 'National ID / Passport *')}
              </label>
              <input
                type="text"
                required
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="12345678901234"
                disabled={isLoading || isSubmitting}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                {t('العنوان للتسجيل *', 'Registration Address *')}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, Country"
                disabled={isLoading || isSubmitting}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              {t('طريقة الدفع المقترحة *', 'Proposed Payment Method *')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'cash', icon: '💵', labelAr: 'كاش', labelEn: 'Cash' },
                { id: 'bank_transfer', icon: '🏦', labelAr: 'تحويل بنكي', labelEn: 'Bank Transfer' },
                { id: 'credit_card', icon: '💳', labelAr: 'بطاقة ائتمان', labelEn: 'Credit Card' },
                { id: 'instapay', icon: '📱', labelAr: 'إنستاباي', labelEn: 'InstaPay' },
                { id: 'vodafone_cash', icon: '🔴', labelAr: 'فودافون كاش', labelEn: 'Vodafone Cash' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-primary)] font-bold'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                  } ${(isLoading || isSubmitting) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2">{method.icon}</span>
                  <span className="text-sm">{lang === 'ar' ? method.labelAr : method.labelEn}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              {t('ملاحظات إضافية (اختياري)', 'Additional Notes (optional)')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('أضف أي تفاصيل تود توضيحها للبائع', 'Add any details you want to clarify to the seller')}
              disabled={isLoading || isSubmitting}
              className="w-full px-4 py-3 min-h-[100px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full group relative overflow-hidden rounded-xl bg-[var(--color-primary)] px-4 py-4 text-white font-bold text-lg transition-all hover:opacity-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('جاري الإرسال...', 'Sending...')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {t('تأكيد وإرسال الطلب للبائع', 'Confirm & Send Request to Seller')}
                <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  {'➔'}
                </span>
              </span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
