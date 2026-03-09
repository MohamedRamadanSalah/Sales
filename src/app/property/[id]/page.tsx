'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { propertiesApi, ordersApi, favoritesApi } from '@/lib/api';
import { formatPrice, getPropertyTitle, getImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ImageGallery } from '@/components/property/ImageGallery';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Property } from '@/types';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { lang, isLoggedIn } = useAuth();
  const toast = useToast();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data, error } = useSWR(
    id ? ['property', id] : null,
    () => propertiesApi.get(id)
  );

  const property = data?.data as Property | undefined;

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  const handleOrderSubmit = async () => {
    if (!property || !isLoggedIn) return;
    setIsSubmitting(true);
    try {
      await ordersApi.create({ property_id: property.id, notes: orderNotes });
      setOrderModalOpen(false);
      toast.success(
        t('تم إرسال طلبك بنجاح! 🎉', 'Your request has been submitted! 🎉'),
        t('سيتم التواصل معك قريباً من قبل فريقنا', 'Our team will contact you soon')
      );
      router.push('/orders');
    } catch (err) {
      toast.error(
        t('خطأ في إرسال الطلب', 'Error submitting request'),
        (err as Error).message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isLoggedIn) {
      toast.info(
        t('سجل دخول أولاً', 'Login first'),
        t('يرجى تسجيل الدخول لحفظ العقارات في المفضلة', 'Please login to save properties to favorites')
      );
      router.push(`/login?returnUrl=${encodeURIComponent(`/property/${id}`)}`);
      return;
    }
    try {
      if (isFavorite) {
        await favoritesApi.remove(property!.id);
        setIsFavorite(false);
        toast.info(t('تم الإزالة من المفضلة', 'Removed from favorites'));
      } else {
        await favoritesApi.add(property!.id);
        setIsFavorite(true);
        toast.success(t('تم الحفظ في المفضلة! ❤️', 'Saved to favorites! ❤️'));
      }
    } catch (err) {
      toast.error(t('خطأ', 'Error'), (err as Error).message);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <span className="text-5xl block mb-4">😕</span>
        <p className="text-lg font-semibold text-[var(--color-text)] mb-2">
          {t('العقار غير موجود', 'Property Not Found')}
        </p>
        <p className="text-[var(--color-text-muted)] mb-6">{error.message}</p>
        <Button onClick={() => router.push('/search')}>
          {t('العودة للبحث', 'Back to Search')}
        </Button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-12 h-12 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const title = getPropertyTitle(property, lang);
  const locationName = lang === 'en' && property.location_name_en ? property.location_name_en : property.location_name_ar;
  const categoryName = lang === 'en' && property.category_name_en ? property.category_name_en : property.category_name_ar;
  const description = lang === 'en' && property.description_en ? property.description_en : property.description_ar;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <ImageGallery property={property} />

          <div className="mt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={property.listing_type === 'sale' ? 'approved' : 'rented'}>
                {property.listing_type === 'sale'
                  ? t('للبيع', 'For Sale')
                  : t('للإيجار', 'For Rent')}
              </Badge>
              {categoryName && <Badge variant="default">{categoryName}</Badge>}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">{title}</h1>

            <p className="text-2xl font-bold text-[var(--color-primary)] mb-4">
              {formatPrice(property.price, lang)}
              {property.installment_years && property.installment_years > 0 && (
                <span className="text-base font-normal text-[var(--color-text-muted)] ms-2">
                  {t('قسط', 'Installment')}
                </span>
              )}
            </p>

            {property.down_payment && property.down_payment > 0 && (
              <p className="text-[var(--color-text-secondary)] mb-2">
                {t('الدفعة الأولى:', 'Down Payment:')} {formatPrice(property.down_payment, lang)}
              </p>
            )}

            {/* Property Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {property.bedrooms != null && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="text-xl">🛏</span>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('غرف النوم', 'Bedrooms')}</p>
                    <p className="font-bold text-[var(--color-text)]">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="text-xl">🚿</span>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('الحمامات', 'Bathrooms')}</p>
                    <p className="font-bold text-[var(--color-text)]">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                <span className="text-xl">📐</span>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">{t('المساحة', 'Area')}</p>
                  <p className="font-bold text-[var(--color-text)]">{property.area_sqm} m²</p>
                </div>
              </div>
              {property.floor_level != null && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="text-xl">🏢</span>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('الطابق', 'Floor')}</p>
                    <p className="font-bold text-[var(--color-text)]">{property.floor_level}</p>
                  </div>
                </div>
              )}
            </div>

            {locationName && (
              <p className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-6 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                <span className="text-xl">📍</span>
                <span className="font-medium">{locationName}</span>
              </p>
            )}

            {description && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                  {t('الوصف', 'Description')}
                </h3>
                <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">
                  {t('المميزات', 'Amenities')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <Badge key={a.id} variant="default">
                      {lang === 'en' && a.name_en ? a.name_en : a.name_ar}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-96 shrink-0">
          <div className="sticky top-24 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">
              {formatPrice(property.price, lang)}
            </p>
            {property.installment_years && property.installment_years > 0 && (
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                {t('تقسيط حتى', 'Installment up to')} {property.installment_years} {t('سنوات', 'years')}
              </p>
            )}
            <div className="space-y-3">
              <Button
                fullWidth
                size="lg"
                variant="accent"
                onClick={() =>
                  isLoggedIn
                    ? setOrderModalOpen(true)
                    : router.push(`/login?returnUrl=${encodeURIComponent(`/property/${id}`)}`)
                }
              >
                🏷️ {t('طلب شراء', 'Request Purchase')}
              </Button>
              <Button fullWidth variant="secondary" size="lg" onClick={handleFavoriteToggle}>
                {isFavorite ? '❤️' : '🤍'}{' '}
                {isFavorite
                  ? t('إزالة من المفضلة', 'Remove from Favorites')
                  : t('حفظ في المفضلة', 'Save to Favorites')}
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.info(t('تم نسخ الرابط ✓', 'Link copied ✓'));
                }}
                className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                🔗 {t('نسخ الرابط', 'Copy link')}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Order Modal */}
      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title={t('طلب شراء', 'Request Purchase')}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <p className="font-semibold">{t('كيف يعمل هذا؟', 'How does this work?')}</p>
            <p className="mt-1 text-xs">
              {t(
                'سيتم إرسال طلبك لفريق المبيعات. سيتواصلون معك خلال 24 ساعة لمناقشة التفاصيل.',
                'Your request will be sent to the sales team. They will contact you within 24 hours to discuss details.'
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('ملاحظات (اختياري)', 'Notes (optional)')}</label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={t('مثل: أريد زيارة العقار يوم السبت', 'e.g., I want to visit the property on Saturday')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setOrderModalOpen(false)} className="flex-1">
              {t('إلغاء', 'Cancel')}
            </Button>
            <Button variant="accent" onClick={handleOrderSubmit} isLoading={isSubmitting} className="flex-1">
              {t('تأكيد الطلب ✓', 'Confirm Request ✓')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
