'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/Button';
import { favoritesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function FavoritesContent() {
  const { lang } = useAuth();
  const { data, error } = useSWR('favorites', () => favoritesApi.list());

  const properties = data?.data ?? [];

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-error)] mb-4">{error.message}</p>
        <Link href="/search">
          <Button>{lang === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}</Button>
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-xl text-[var(--color-text-muted)] mb-6">
          {lang === 'ar' ? 'لا توجد عقارات محفوظة بعد' : 'No saved properties yet'}
        </p>
        <Link href="/search">
          <Button variant="accent">{lang === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        {lang === 'ar' ? 'المفضلة' : 'My Favorites'} ({properties.length})
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} isFavorite />
        ))}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}
