'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { propertiesApi, locationsApi, imagesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getImageUrl } from '@/lib/utils';

const FINISHING_TYPES = [
  { value: 'core_and_shell', ar: 'هيكل وقشرة', en: 'Core & Shell' },
  { value: 'semi_finished', ar: 'نصف تشطيب', en: 'Semi-Finished' },
  { value: 'fully_finished', ar: 'تشطيب كامل', en: 'Fully Finished' },
  { value: 'furnished', ar: 'مفروش', en: 'Furnished' },
];
const LEGAL_STATUSES = [
  { value: 'registered', ar: 'مسجل', en: 'Registered' },
  { value: 'primary_contract', ar: 'عقد أولي', en: 'Primary Contract' },
  { value: 'unregistered', ar: 'غير مسجل', en: 'Unregistered' },
];

const statusMap: Record<string, { ar: string; en: string; variant: 'pending' | 'approved' | 'rejected' | 'sold' }> = {
  pending_approval: { ar: 'في انتظار الموافقة', en: 'Pending Approval', variant: 'pending' },
  approved: { ar: 'تم القبول', en: 'Approved', variant: 'approved' },
  rejected: { ar: 'مرفوض', en: 'Rejected', variant: 'rejected' },
  sold: { ar: 'مباع', en: 'Sold', variant: 'sold' },
};

function EditPropertyContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { lang } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, error, mutate } = useSWR(id ? ['property', id] : null, () =>
    propertiesApi.get(id)
  );
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [locations, setLocations] = useState<{ id: number; name_ar: string; name_en?: string }[]>([]);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      setForm({
        title_ar: p.title_ar,
        title_en: p.title_en ?? '',
        description_ar: p.description_ar,
        description_en: p.description_en ?? '',
        category_id: p.category_id,
        location_id: p.location_id,
        listing_type: p.listing_type,
        property_origin: p.property_origin,
        finishing_type: p.finishing_type,
        legal_status: p.legal_status,
        price: p.price,
        area_sqm: p.area_sqm,
        bedrooms: p.bedrooms ?? 0,
        bathrooms: p.bathrooms ?? 0,
        floor_level: p.floor_level,
        down_payment: p.down_payment,
        installment_years: p.installment_years ?? 0,
      });
    }
  }, [data]);

  useEffect(() => {
    propertiesApi.getCategories().then((r) => {
      setCategories((r.data ?? []).map((c: { id: number; name: string }) => ({ id: c.id, name: c.name })));
    });
    locationsApi.list().then((r) => {
      const locs = r.data ?? [];
      const flatten = (arr: typeof locs): typeof locs =>
        arr.flatMap((l) => [{ ...l }, ...(l.children ? flatten(l.children) : [])]);
      setLocations(flatten(locs));
    });
  }, []);

  const property = data?.data;
  const images = property?.images ?? [];
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const getName = (loc: { name_ar: string; name_en?: string }) =>
    lang === 'en' && loc.name_en ? loc.name_en : loc.name_ar;
  const status = property?.status ? statusMap[property.status] : null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await propertiesApi.update(id, form);
      mutate();
      toast.success(
        t('تم حفظ التغييرات ✓', 'Changes saved ✓'),
        t('سيتم مراجعة التعديلات من قبل الإدارة', 'Your changes will be reviewed by admin')
      );
    } catch (err) {
      toast.error(t('خطأ في الحفظ', 'Save error'), (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < Math.min(files.length, 10); i++) fd.append('images', files[i]);
      await imagesApi.upload(id, fd);
      mutate();
      toast.success(
        t('تم رفع الصور! 📸', 'Images uploaded! 📸'),
        t(`تم رفع ${files.length} صورة بنجاح`, `${files.length} images uploaded successfully`)
      );
    } catch (err) {
      toast.error(t('خطأ في رفع الصور', 'Upload error'), (err as Error).message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm(t('حذف هذه الصورة؟', 'Delete this image?'))) return;
    try {
      await imagesApi.delete(imageId);
      mutate();
      toast.info(t('تم حذف الصورة', 'Image deleted'));
    } catch (err) {
      toast.error(t('خطأ', 'Error'), (err as Error).message);
    }
  };

  if (error || !property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <span className="text-5xl mb-4 block">😕</span>
        <p className="text-[var(--color-text-muted)] mb-4">
          {error?.message ?? t('العقار غير موجود أو ليس لديك صلاحية', 'Property not found or no access')}
        </p>
        <Link href="/"><Button>{t('الرئيسية', 'Home')}</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {t('تعديل العقار', 'Edit Property')} #{id}
          </h1>
          {status && (
            <Badge variant={status.variant} className="mt-2">
              {t(status.ar, status.en)}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/property/${id}`}>
            <Button variant="secondary" size="sm">👁 {t('عرض', 'View')}</Button>
          </Link>
        </div>
      </div>

      {/* Images Section */}
      <section className="mb-8 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 animate-fade-in-up delay-100">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          📸 {t('صور العقار', 'Property Images')}
          <span className="text-xs bg-[var(--color-bg)] px-2 py-0.5 rounded-full text-[var(--color-text-muted)]">
            {images.length}/10
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((img: { id: number; image_url: string }) => (
            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-[var(--color-border)]">
              <img
                src={getImageUrl(img.image_url)}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-2 end-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                ✕
              </button>
            </div>
          ))}
          {/* Add more placeholder */}
          {images.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-accent)] flex flex-col items-center justify-center gap-2 hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            >
              <span className="text-2xl">📤</span>
              <span className="text-xs text-[var(--color-text-muted)]">{t('إضافة', 'Add')}</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-accent)]">
            <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            {t('جاري الرفع...', 'Uploading...')}
          </div>
        )}
      </section>

      {/* Form Section */}
      <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 space-y-5 animate-fade-in-up delay-200">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">
          📝 {t('تفاصيل العقار', 'Property Details')}
        </h2>
        <Input
          label={t('العنوان (عربي)', 'Title (Arabic)')}
          value={(form.title_ar as string) ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
        />
        <Input
          label={t('العنوان (إنجليزي)', 'Title (English)')}
          value={(form.title_en as string) ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
        />
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            {t('الوصف (عربي)', 'Description (Arabic)')}
          </label>
          <textarea
            value={(form.description_ar as string) ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('السعر', 'Price')}
            type="number"
            value={(form.price as number) ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, price: parseInt(e.target.value, 10) || 0 }))}
          />
          <Input
            label={t('المساحة (م²)', 'Area (m²)')}
            type="number"
            value={(form.area_sqm as number) ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, area_sqm: parseInt(e.target.value, 10) || 0 }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">{t('الفئة', 'Category')}</label>
            <select
              value={(form.category_id as number) ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, category_id: parseInt(e.target.value, 10) }))}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">{t('الموقع', 'Location')}</label>
            <select
              value={(form.location_id as number) ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, location_id: parseInt(e.target.value, 10) }))}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{getName(l)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">{t('نوع التشطيب', 'Finishing')}</label>
            <select
              value={(form.finishing_type as string) ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, finishing_type: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
            >
              {FINISHING_TYPES.map((f) => (
                <option key={f.value} value={f.value}>{t(f.ar, f.en)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">{t('القانونية', 'Legal')}</label>
            <select
              value={(form.legal_status as string) ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, legal_status: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
            >
              {LEGAL_STATUSES.map((l) => (
                <option key={l.value} value={l.value}>{t(l.ar, l.en)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="pt-4">
          <Button variant="accent" onClick={handleSave} isLoading={isSaving} className="w-full">
            {t('حفظ التغييرات ✓', 'Save Changes ✓')}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function EditPropertyPage() {
  return (
    <ProtectedRoute>
      <EditPropertyContent />
    </ProtectedRoute>
  );
}
