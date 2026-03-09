import { getLanguage } from './auth';

export function formatPrice(price: number, locale?: 'ar' | 'en'): string {
  const lang = locale ?? (typeof window !== 'undefined' ? getLanguage() : 'ar');
  const formatted = price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG');
  return lang === 'ar' ? `${formatted} ج.م` : `EGP ${formatted}`;
}

export function formatDate(dateStr: string | Date, locale?: 'ar' | 'en'): string {
  const lang = locale ?? (typeof window !== 'undefined' ? getLanguage() : 'ar');
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string | Date, locale?: 'ar' | 'en'): string {
  const lang = locale ?? (typeof window !== 'undefined' ? getLanguage() : 'ar');
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getPropertyTitle(property: { title_ar: string; title_en?: string | null }, lang?: 'ar' | 'en'): string {
  const l = lang ?? (typeof window !== 'undefined' ? getLanguage() : 'ar');
  if (l === 'en' && property.title_en) return property.title_en;
  return property.title_ar;
}

export function getLocationName(loc: { name_ar: string; name_en?: string }, lang?: 'ar' | 'en'): string {
  const l = lang ?? (typeof window !== 'undefined' ? getLanguage() : 'ar');
  if (l === 'en' && loc.name_en) return loc.name_en;
  return loc.name_ar;
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-property.svg';
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  return `${base}/uploads/${path.replace(/^\/uploads\//, '')}`;
}
