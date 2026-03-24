/**
 * RTL-Aware Formatting Utilities for Invoice Detail
 * All invoice section components MUST use these — no inline formatting.
 */

export function formatInvoicePrice(
  amount: number | null | undefined,
  locale: 'ar' | 'en',
  currency: string = 'EGP'
): string {
  if (amount == null || isNaN(amount)) return '—';
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return '—';
  }
}

export function formatInvoiceDate(
  isoString: string | null | undefined,
  locale: 'ar' | 'en'
): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      dateStyle: 'long',
    });
  } catch {
    return '—';
  }
}
