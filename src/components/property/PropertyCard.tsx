'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types';
import { formatPrice, getPropertyTitle, getImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { favoritesApi } from '@/lib/api';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
}

const statusVariant: Record<string, 'pending' | 'approved' | 'rejected' | 'sold' | 'rented' | 'inactive'> = {
  pending_approval: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  sold: 'sold',
  rented: 'rented',
  inactive: 'inactive',
};

export function PropertyCard({ property, isFavorite: initialFavorite = false }: PropertyCardProps) {
  const { lang, isLoggedIn } = useAuth();
  const title = getPropertyTitle(property, lang);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const imgUrl = property.primary_image || property.images?.[0]?.image_url;
  const fullImgUrl = getImageUrl(imgUrl);

  const locationName = lang === 'en' && property.location_name_en
    ? property.location_name_en
    : property.location_name_ar;

  const categoryName = lang === 'en' && property.category_name_en
    ? property.category_name_en
    : property.category_name_ar;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    try {
      if (isFavorite) {
        await favoritesApi.remove(property.id);
        setIsFavorite(false);
      } else {
        await favoritesApi.add(property.id);
        setIsFavorite(true);
      }
    } catch {
      // ignore
    }
  };

  return (
    <Link
      href={`/property/${property.id}`}
      className="block bg-[var(--color-surface)] rounded-2xl overflow-hidden luxury-card border border-[var(--color-border)] group"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-[var(--color-bg-2)] overflow-hidden">
        <Image
          src={fullImgUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-property.svg';
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 start-3 flex gap-2 flex-wrap">
          <Badge variant={property.listing_type === 'sale' ? 'approved' : 'rented'}>
            {property.listing_type === 'sale'
              ? (lang === 'ar' ? 'للبيع' : 'For Sale')
              : (lang === 'ar' ? 'للإيجار' : 'For Rent')}
          </Badge>
          <Badge variant="default">
            {property.property_origin === 'primary'
              ? (lang === 'ar' ? 'أولي' : 'Primary')
              : (lang === 'ar' ? 'إعادة بيع' : 'Resale')}
          </Badge>
        </div>

        {/* Favorite Button */}
        {isLoggedIn && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-3 end-3 p-2.5 rounded-xl bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-500'}`}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}

        {/* Price on Image */}
        <div className="absolute bottom-3 start-3">
          <p className="text-lg font-bold text-white drop-shadow-lg">
            {formatPrice(property.price, lang)}
            {property.installment_years && property.installment_years > 0 && (
              <span className="text-xs font-normal text-white/80 ms-2 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {lang === 'ar' ? 'قسط' : 'Installment'}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-[var(--color-text)] line-clamp-2 mb-2 text-base group-hover:text-[var(--color-primary)] transition-colors">
          {title}
        </h3>
        {locationName && (
          <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5 mb-3">
            <span className="text-[var(--color-accent)]">📍</span>
            {locationName}
          </p>
        )}

        {/* Specs */}
        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)] pt-3 border-t border-[var(--color-border)]">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <span className="text-base">🛏</span>
              <span className="font-medium text-[var(--color-text)]">{property.bedrooms}</span>
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <span className="text-base">🚿</span>
              <span className="font-medium text-[var(--color-text)]">{property.bathrooms}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="text-base">📐</span>
            <span className="font-medium text-[var(--color-text)]">{property.area_sqm} m²</span>
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {categoryName && (
            <Badge variant="default">{categoryName}</Badge>
          )}
          {property.status && statusVariant[property.status] && (
            <Badge variant={statusVariant[property.status]}>
              {property.status}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
