'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { propertiesApi, locationsApi, type PropertiesParams } from '@/lib/api';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { useAuth } from '@/context/AuthContext';
import { Property } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const { lang } = useAuth();
  const [filters, setFilters] = useState<PropertiesParams>({});

  useEffect(() => {
    const params: PropertiesParams = {};
    const q = searchParams.get('q');
    if (q) params.search = q;
    const lt = searchParams.get('listing_type');
    if (lt) params.listing_type = lt;
    const cat = searchParams.get('category_id');
    if (cat) params.category_id = parseInt(cat, 10);
    const loc = searchParams.get('location_id');
    if (loc) params.location_id = parseInt(loc, 10);
    const minP = searchParams.get('min_price');
    if (minP) params.min_price = parseInt(minP, 10);
    const maxP = searchParams.get('max_price');
    if (maxP) params.max_price = parseInt(maxP, 10);
    const beds = searchParams.get('bedrooms');
    if (beds) params.bedrooms = parseInt(beds, 10);
    const sort = searchParams.get('sort_by');
    if (sort) params.sort_by = sort;
    const order = searchParams.get('sort_order');
    if (order) params.sort_order = order as 'asc' | 'desc';
    const page = searchParams.get('page');
    if (page) params.page = parseInt(page, 10);
    params.limit = 20;
    setFilters(params);
  }, [searchParams]);

  const { data, error, mutate } = useSWR(
    ['properties', filters],
    () => propertiesApi.list(filters),
    { revalidateOnFocus: false }
  );

  const updateFilters = useCallback(
    (updates: Partial<PropertiesParams>) => {
      const next = { ...filters, ...updates };
      const sp = new URLSearchParams();
      if (next.search) sp.set('q', next.search);
      if (next.listing_type) sp.set('listing_type', next.listing_type);
      if (next.category_id) sp.set('category_id', String(next.category_id));
      if (next.location_id) sp.set('location_id', String(next.location_id));
      if (next.min_price) sp.set('min_price', String(next.min_price));
      if (next.max_price) sp.set('max_price', String(next.max_price));
      if (next.bedrooms) sp.set('bedrooms', String(next.bedrooms));
      if (next.sort_by) sp.set('sort_by', next.sort_by);
      if (next.sort_order) sp.set('sort_order', next.sort_order);
      if (next.page && next.page > 1) sp.set('page', String(next.page));
      setFilters(next);
      window.history.replaceState({}, '', `?${sp.toString()}`);
    },
    [filters]
  );

  const properties = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="mb-10 animate-fade-in">
        <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-2">
          {lang === 'ar' ? 'استكشف' : 'Explore'}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)]">
          {lang === 'ar' ? 'البحث عن عقارات' : 'Find Your Property'}
        </h1>
        <div className="gold-divider w-20 mt-4" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-80 shrink-0">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sticky top-24 shadow-sm">
            <PropertyFilters
              filters={filters}
              onFiltersChange={updateFilters}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {pagination && (
              <p className="text-sm text-[var(--color-text-muted)] bg-[var(--color-bg-2)] px-4 py-2 rounded-xl">
                {lang === 'ar'
                  ? `عرض ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} من ${pagination.total} عقار`
                  : `Showing ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} properties`}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p>{error.message}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {!error && !data && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl skeleton"
                />
              ))}
            </div>
          )}

          {/* Empty */}
          {!error && data && properties.length === 0 && (
            <div className="text-center py-20 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
              <span className="text-5xl mb-4 block">🏠</span>
              <p className="text-[var(--color-text-muted)] text-lg mb-4">
                {lang === 'ar' ? 'لا توجد عقارات مطابقة' : 'No properties match your filters'}
              </p>
              <button
                type="button"
                onClick={() => updateFilters({})}
                className="text-[var(--color-accent-dark)] font-semibold hover:text-[var(--color-accent)] transition-colors"
              >
                {lang === 'ar' ? 'مسح الفلاتر' : 'Clear all filters'} →
              </button>
            </div>
          )}

          {/* Results Grid */}
          {!error && properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((p: Property, i: number) => (
                  <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <PropertyCard property={p} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => updateFilters({ page: pagination.page - 1 })}
                    className="px-5 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-2)] disabled:opacity-40 transition-all font-medium text-sm"
                  >
                    {lang === 'ar' ? '← السابق' : '← Previous'}
                  </button>
                  <span className="px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm">
                    {pagination.page} / {pagination.total_pages}
                  </span>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.total_pages}
                    onClick={() => updateFilters({ page: pagination.page + 1 })}
                    className="px-5 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-2)] disabled:opacity-40 transition-all font-medium text-sm"
                  >
                    {lang === 'ar' ? 'التالي →' : 'Next →'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="w-10 h-10 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
