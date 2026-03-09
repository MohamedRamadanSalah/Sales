'use client';

import { useState, useEffect } from 'react';
import { propertiesApi, locationsApi, type PropertiesParams } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface PropertyFiltersProps {
  filters: PropertiesParams;
  onFiltersChange: (updates: Partial<PropertiesParams>) => void;
}

export function PropertyFilters({ filters, onFiltersChange }: PropertyFiltersProps) {
  const { lang } = useAuth();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [locations, setLocations] = useState<{ id: number; name_ar: string; name_en?: string }[]>([]);

  useEffect(() => {
    propertiesApi.getCategories().then((r) => {
      setCategories(
        (r.data ?? []).map((c: { id: number; name: string }) => ({ id: c.id, name: c.name }))
      );
    });
    locationsApi.list().then((r) => {
      const locs = r.data ?? [];
      setLocations(locs);
    });
  }, []);

  const getName = (loc: { name_ar: string; name_en?: string }) =>
    lang === 'en' && loc.name_en ? loc.name_en : loc.name_ar;

  return (
    <div className="sticky top-24 space-y-6 bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
      <h3 className="font-semibold text-[var(--color-text)]">
        {lang === 'ar' ? 'فلاتر' : 'Filters'}
      </h3>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          {lang === 'ar' ? 'بحث' : 'Search'}
        </label>
        <input
          type="text"
          placeholder={lang === 'ar' ? 'ابحث في العنوان...' : 'Search in title...'}
          value={filters.search ?? ''}
          onChange={(e) =>
            onFiltersChange({ search: e.target.value || undefined, page: 1 })
          }
          className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          {lang === 'ar' ? 'نوع القائمة' : 'Listing Type'}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="listing_type"
              checked={!filters.listing_type || filters.listing_type === 'sale'}
              onChange={() => onFiltersChange({ listing_type: 'sale', page: 1 })}
            />
            <span>{lang === 'ar' ? 'للبيع' : 'For Sale'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="listing_type"
              checked={filters.listing_type === 'rent'}
              onChange={() => onFiltersChange({ listing_type: 'rent', page: 1 })}
            />
            <span>{lang === 'ar' ? 'للإيجار' : 'For Rent'}</span>
          </label>
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            {lang === 'ar' ? 'الفئة' : 'Category'}
          </label>
          <select
            value={filters.category_id ?? ''}
            onChange={(e) =>
              onFiltersChange({
                category_id: e.target.value ? parseInt(e.target.value, 10) : undefined,
                page: 1,
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)]"
          >
            <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {locations.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            {lang === 'ar' ? 'الموقع' : 'Location'}
          </label>
          <select
            value={filters.location_id ?? ''}
            onChange={(e) =>
              onFiltersChange({
                location_id: e.target.value ? parseInt(e.target.value, 10) : undefined,
                page: 1,
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)]"
          >
            <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {getName(l)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          {lang === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)'}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={lang === 'ar' ? 'الحد الأدنى' : 'Min'}
            value={filters.min_price ?? ''}
            onChange={(e) =>
              onFiltersChange({
                min_price: e.target.value ? parseInt(e.target.value, 10) : undefined,
                page: 1,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]"
          />
          <input
            type="number"
            placeholder={lang === 'ar' ? 'الحد الأقصى' : 'Max'}
            value={filters.max_price ?? ''}
            onChange={(e) =>
              onFiltersChange({
                max_price: e.target.value ? parseInt(e.target.value, 10) : undefined,
                page: 1,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          {lang === 'ar' ? 'غرف النوم' : 'Bedrooms'}
        </label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                onFiltersChange({
                  bedrooms: filters.bedrooms === n ? undefined : n,
                  page: 1,
                })
              }
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filters.bedrooms === n
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-2)] hover:bg-[var(--color-border)]'
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          {lang === 'ar' ? 'ترتيب حسب' : 'Sort By'}
        </label>
        <select
          value={`${filters.sort_by ?? 'created_at'}_${filters.sort_order ?? 'desc'}`}
          onChange={(e) => {
            const [sort_by, sort_order] = e.target.value.split('_') as [string, 'asc' | 'desc'];
            onFiltersChange({ sort_by, sort_order, page: 1 });
          }}
          className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)]"
        >
          <option value="created_at_desc">{lang === 'ar' ? 'الأحدث' : 'Newest'}</option>
          <option value="price_asc">{lang === 'ar' ? 'السعر: من الأقل' : 'Price: Low to High'}</option>
          <option value="price_desc">{lang === 'ar' ? 'السعر: من الأعلى' : 'Price: High to Low'}</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => onFiltersChange({})}
        className="w-full py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-2)]"
      >
        {lang === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
      </button>
    </div>
  );
}
