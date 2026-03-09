'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

type FieldErrors = Record<string, string>;

function CreatePropertyContent() {
  const { lang } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [locations, setLocations] = useState<{ id: number; name_ar: string; name_en?: string }[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [createdPropertyId, setCreatedPropertyId] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{ id: number; image_url: string }[]>([]);
  const [previewFiles, setPreviewFiles] = useState<{ file: File; preview: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    category_id: 0,
    location_id: 0,
    listing_type: 'sale' as 'sale' | 'rent',
    property_origin: 'primary' as 'primary' | 'resale',
    finishing_type: 'fully_finished',
    legal_status: 'registered',
    price: 0,
    area_sqm: 0,
    bedrooms: 0,
    bathrooms: 0,
    floor_level: undefined as number | undefined,
    down_payment: undefined as number | undefined,
    installment_years: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    propertiesApi.getCategories().then((r) => {
      setCategories(
        (r.data ?? []).map((c: { id: number; name: string }) => ({ id: c.id, name: c.name }))
      );
    });
    locationsApi.list().then((r) => {
      const locs = r.data ?? [];
      const flatten = (arr: typeof locs): typeof locs =>
        arr.flatMap((l) => [{ ...l }, ...(l.children ? flatten(l.children) : [])]);
      setLocations(flatten(locs));
    });
  }, []);

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const getName = (loc: { name_ar: string; name_en?: string }) =>
    lang === 'en' && loc.name_en ? loc.name_en : loc.name_ar;

  // ═══════════════ VALIDATION ═══════════════
  const validateStep1 = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.title_ar || form.title_ar.length < 5) {
      errs.title_ar = t(
        'العنوان بالعربية مطلوب (5 أحرف على الأقل)',
        'Arabic title required (min 5 characters)'
      );
    }
    if (!form.description_ar || form.description_ar.length < 10) {
      errs.description_ar = t(
        'الوصف بالعربية مطلوب (10 أحرف على الأقل)',
        'Arabic description required (min 10 characters)'
      );
    }
    if (!form.category_id) {
      errs.category_id = t('اختر الفئة', 'Select a category');
    }
    if (!form.location_id) {
      errs.location_id = t('اختر الموقع', 'Select a location');
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning(t('تحقق من البيانات', 'Check your inputs'), Object.values(errs)[0]);
    }
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.price || form.price <= 0) {
      errs.price = t('السعر مطلوب ويجب أن يكون أكبر من صفر', 'Price is required and must be > 0');
    }
    if (!form.area_sqm || form.area_sqm <= 0) {
      errs.area_sqm = t('المساحة مطلوبة ويجب أن تكون أكبر من صفر', 'Area is required and must be > 0');
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning(t('تحقق من البيانات', 'Check your inputs'), Object.values(errs)[0]);
    }
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    setFieldErrors({});
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !createdPropertyId) {
      // Submit property first, then move to step 4
      handleSubmitProperty();
      return;
    }
    setStep((s) => s + 1);
  };

  // ═══════════════ CREATE PROPERTY ═══════════════
  const handleSubmitProperty = async () => {
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        title_en: form.title_en || form.title_ar,
        description_en: form.description_en || form.description_ar,
      };
      const res = await propertiesApi.create(payload);
      setCreatedPropertyId(res.data.id);
      toast.success(
        t('تم إنشاء العقار بنجاح! 🎉', 'Property created successfully! 🎉'),
        t('الآن أضف صور العقار', 'Now add property images')
      );
      setStep(4);
    } catch (err) {
      toast.error(
        t('خطأ في إنشاء العقار', 'Error creating property'),
        (err as Error).message
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════ IMAGE HANDLING ═══════════════
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newFiles = Array.from(files).slice(0, 10 - previewFiles.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviewFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removePreview = (idx: number) => {
    setPreviewFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleUploadImages = async () => {
    if (!createdPropertyId || previewFiles.length === 0) {
      toast.warning(
        t('لا توجد صور', 'No images'),
        t('اختر صور العقار أولاً', 'Select property images first')
      );
      return;
    }
    setIsUploading(true);
    try {
      const fd = new FormData();
      previewFiles.forEach((p) => fd.append('images', p.file));
      const res = await imagesApi.upload(createdPropertyId, fd);
      setUploadedImages(res.data.images ?? []);
      setPreviewFiles([]);
      toast.success(
        t('تم رفع الصور بنجاح! 📸', 'Images uploaded successfully! 📸'),
        t(`تم رفع ${res.data.images?.length ?? 0} صورة`, `${res.data.images?.length ?? 0} images uploaded`)
      );
    } catch (err) {
      toast.error(
        t('خطأ في رفع الصور', 'Error uploading images'),
        (err as Error).message
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinish = () => {
    toast.success(
      t('تم الانتهاء! 🏠', 'All done! 🏠'),
      t('عقارك الآن قيد المراجعة من الإدارة وسيتم إعلامك عند الموافقة', 'Your property is now under review and you will be notified upon approval')
    );
    router.push(`/property/${createdPropertyId}`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const newFiles = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 10 - previewFiles.length)
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    if (newFiles.length === 0) {
      toast.warning(t('نوع الملف غير مدعوم', 'Unsupported file type'), t('يرجى اختيار صور فقط', 'Please select images only'));
      return;
    }
    setPreviewFiles((prev) => [...prev, ...newFiles]);
  };

  const steps = [
    { num: 1, labelAr: 'معلومات أساسية', labelEn: 'Basic Info', icon: '📝' },
    { num: 2, labelAr: 'التفاصيل والسعر', labelEn: 'Details & Price', icon: '💰' },
    { num: 3, labelAr: 'مواصفات إضافية', labelEn: 'Specifications', icon: '⚙️' },
    { num: 4, labelAr: 'صور العقار', labelEn: 'Property Images', icon: '📸' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-accent-dark)] to-[var(--color-accent)] flex items-center justify-center shadow-lg">
          <span className="text-2xl">🏠</span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          {t('إضافة عقار جديد', 'List a New Property')}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          {t(
            'أضف تفاصيل عقارك وصوره ليتم مراجعته والموافقة عليه',
            'Add your property details and images for review and approval'
          )}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1.5 mb-10 animate-fade-in delay-100">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => {
                // Can only go back, or forward if already created property
                if (s.num < step || (s.num === 4 && createdPropertyId)) setStep(s.num);
              }}
              disabled={s.num > step && !(s.num === 4 && createdPropertyId)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-300 text-center ${
                step === s.num
                  ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'
              }`}
            >
              <span className="text-lg">{step > s.num ? '✅' : s.icon}</span>
              <span className="text-[10px] font-semibold leading-tight">{t(s.labelAr, s.labelEn)}</span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`w-6 h-0.5 mx-0.5 rounded ${
                  step > s.num ? 'bg-emerald-300' : 'bg-[var(--color-border)]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] p-8 animate-scale-in delay-200">
        {/* ═══ STEP 1: Basic Info ═══ */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Input
                label={t('العنوان (عربي) *', 'Title (Arabic) *')}
                value={form.title_ar}
                onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
                required
                minLength={5}
                placeholder={t('مثال: شقة فاخرة في المعادي', 'e.g., Luxury Apartment in Maadi')}
              />
              {fieldErrors.title_ar && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.title_ar}
                </p>
              )}
            </div>
            <Input
              label={t('العنوان (إنجليزي)', 'Title (English)')}
              value={form.title_en}
              onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
              placeholder={t('اختياري', 'Optional')}
            />
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                {t('الوصف (عربي) *', 'Description (Arabic) *')}
              </label>
              <textarea
                value={form.description_ar}
                onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                placeholder={t('صف عقارك بالتفصيل...', 'Describe your property in detail...')}
              />
              {fieldErrors.description_ar && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.description_ar}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                {t('الوصف (إنجليزي)', 'Description (English)')}
              </label>
              <textarea
                value={form.description_en}
                onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                placeholder={t('اختياري', 'Optional')}
              />
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                {t('نوع القائمة', 'Listing Type')}
              </label>
              <div className="flex gap-3">
                {[
                  { val: 'sale', ar: 'للبيع', en: 'For Sale', icon: '🏷️' },
                  { val: 'rent', ar: 'للإيجار', en: 'For Rent', icon: '🔑' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, listing_type: opt.val as 'sale' | 'rent' }))
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-300 font-medium ${
                      form.listing_type === opt.val
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md'
                        : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    <span>{opt.icon}</span> {t(opt.ar, opt.en)}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Origin */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                {t('نوع العقار', 'Property Origin')}
              </label>
              <div className="flex gap-3">
                {[
                  { val: 'primary', ar: 'أولي', en: 'Primary', icon: '🆕' },
                  { val: 'resale', ar: 'إعادة بيع', en: 'Resale', icon: '🔄' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        property_origin: opt.val as 'primary' | 'resale',
                      }))
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-300 font-medium ${
                      form.property_origin === opt.val
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md'
                        : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    <span>{opt.icon}</span> {t(opt.ar, opt.en)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                {t('الفئة *', 'Category *')}
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category_id: parseInt(e.target.value, 10) }))
                }
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
              >
                <option value={0}>{t('— اختر الفئة —', '— Select Category —')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fieldErrors.category_id && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.category_id}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                {t('الموقع *', 'Location *')}
              </label>
              <select
                value={form.location_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location_id: parseInt(e.target.value, 10) }))
                }
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
              >
                <option value={0}>{t('— اختر الموقع —', '— Select Location —')}</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {getName(l)}
                  </option>
                ))}
              </select>
              {fieldErrors.location_id && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.location_id}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Details & Price ═══ */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center gap-2 mb-2">
              <span>💡</span>
              {t(
                'أدخل السعر كرقم بدون فواصل. مثال: 2500000',
                'Enter price as a number without commas. Example: 2500000'
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label={t('السعر (ج.م) *', 'Price (EGP) *')}
                  type="number"
                  value={form.price || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: parseInt(e.target.value, 10) || 0 }))
                  }
                  required
                  placeholder="0"
                />
                {fieldErrors.price && (
                  <p className="text-xs text-red-500 mt-1">⚠️ {fieldErrors.price}</p>
                )}
              </div>
              <div>
                <Input
                  label={t('المساحة (م²) *', 'Area (m²) *')}
                  type="number"
                  value={form.area_sqm || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, area_sqm: parseInt(e.target.value, 10) || 0 }))
                  }
                  required
                  placeholder="0"
                />
                {fieldErrors.area_sqm && (
                  <p className="text-xs text-red-500 mt-1">⚠️ {fieldErrors.area_sqm}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('غرف النوم', 'Bedrooms')}
                type="number"
                value={form.bedrooms || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bedrooms: parseInt(e.target.value, 10) || 0 }))
                }
                placeholder="0"
              />
              <Input
                label={t('الحمامات', 'Bathrooms')}
                type="number"
                value={form.bathrooms || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bathrooms: parseInt(e.target.value, 10) || 0 }))
                }
                placeholder="0"
              />
            </div>
            <Input
              label={t('الطابق', 'Floor Level')}
              type="number"
              value={form.floor_level ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  floor_level: e.target.value ? parseInt(e.target.value, 10) : undefined,
                }))
              }
              placeholder={t('اختياري', 'Optional')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('الدفعة الأولى', 'Down Payment')}
                type="number"
                value={form.down_payment ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    down_payment: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
                placeholder={t('اختياري', 'Optional')}
              />
              <Input
                label={t('سنوات التقسيط', 'Installment Years')}
                type="number"
                value={form.installment_years || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    installment_years: parseInt(e.target.value, 10) || 0,
                  }))
                }
                placeholder="0"
              />
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Specifications ═══ */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                {t('نوع التشطيب', 'Finishing Type')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FINISHING_TYPES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setForm((x) => ({ ...x, finishing_type: f.value }))}
                    className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 font-medium text-sm ${
                      form.finishing_type === f.value
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md'
                        : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    {t(f.ar, f.en)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                {t('الحالة القانونية', 'Legal Status')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {LEGAL_STATUSES.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setForm((x) => ({ ...x, legal_status: l.value }))}
                    className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 font-medium text-sm ${
                      form.legal_status === l.value
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md'
                        : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    {t(l.ar, l.en)}
                  </button>
                ))}
              </div>
            </div>

            {/* Info message */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <div>
                <p className="font-semibold">{t('ما سيحدث بعد ذلك؟', 'What happens next?')}</p>
                <p className="mt-1">
                  {t(
                    'الخطوة التالية هي إضافة صور العقار. بعد ذلك سيتم إرسال العقار للمراجعة من قبل الإدارة.',
                    'The next step is adding property images. After that, your property will be submitted for admin review.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: Image Upload ═══ */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Success banner */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-bold">{t('تم إنشاء العقار!', 'Property Created!')}</p>
                <p className="text-xs mt-0.5">
                  {t(
                    'الآن أضف صوراً لعقارك لجذب المشترين. يمكنك إضافة حتى 10 صور.',
                    'Now add images to attract buyers. You can upload up to 10 images.'
                  )}
                </p>
              </div>
            </div>

            {/* Already uploaded images */}
            {uploadedImages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
                  {t('الصور المرفوعة', 'Uploaded Images')} ({uploadedImages.length})
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-emerald-200">
                      <img
                        src={getImageUrl(img.image_url)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 end-1 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        ✅
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-accent)] rounded-2xl p-10 text-center cursor-pointer hover:bg-[var(--color-bg)] transition-all duration-300 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">📤</span>
              <p className="font-semibold text-[var(--color-text)]">
                {t('اسحب الصور هنا أو اضغط للاختيار', 'Drag images here or click to browse')}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {t('PNG, JPG, WEBP — حتى 10 صور', 'PNG, JPG, WEBP — up to 10 images')}
              </p>
            </div>

            {/* Preview files */}
            {previewFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
                  {t('صور جاهزة للرفع', 'Ready to upload')} ({previewFiles.length})
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {previewFiles.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--color-border)]">
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                        className="absolute top-1 end-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="accent"
                  onClick={handleUploadImages}
                  isLoading={isUploading}
                  className="w-full"
                >
                  {isUploading
                    ? t('جاري الرفع...', 'Uploading...')
                    : t(`رفع ${previewFiles.length} صورة`, `Upload ${previewFiles.length} images`)}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ═══ Navigation ═══ */}
        <div className="flex gap-4 mt-10 pt-6 border-t border-[var(--color-border)]">
          {step > 1 && step < 4 && (
            <Button
              variant="secondary"
              onClick={() => { setFieldErrors({}); setStep((s) => s - 1); }}
              className="flex-1"
            >
              ← {t('السابق', 'Back')}
            </Button>
          )}
          {step < 3 && (
            <Button variant="primary" onClick={goNext} className="flex-1">
              {t('التالي', 'Next')} →
            </Button>
          )}
          {step === 3 && (
            <Button variant="accent" onClick={goNext} isLoading={isLoading} className="flex-1">
              {t('إنشاء العقار والمتابعة', 'Create Property & Continue')} →
            </Button>
          )}
          {step === 4 && (
            <Button variant="primary" onClick={handleFinish} className="flex-1">
              {uploadedImages.length > 0
                ? t('عرض العقار ✓', 'View Property ✓')
                : t('تخطي وعرض العقار', 'Skip & View Property')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreatePropertyPage() {
  return (
    <ProtectedRoute>
      <CreatePropertyContent />
    </ProtectedRoute>
  );
}
