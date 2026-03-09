'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { Property } from '@/types';

interface ImageGalleryProps {
  property: Property;
}

export function ImageGallery({ property }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = property.images?.length
    ? property.images
    : property.primary_image
    ? [{ id: 0, image_url: property.primary_image, is_primary: true, sort_order: 0 } as const]
    : [];

  const activeUrl = images[activeIndex]
    ? getImageUrl(images[activeIndex].image_url)
    : getImageUrl(property.primary_image);

  if (!activeUrl) {
    return (
      <div className="aspect-video rounded-xl bg-[var(--color-bg-2)] flex items-center justify-center">
        <span className="text-[var(--color-text-muted)]">
          No image
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--color-bg-2)]">
        <Image
          src={activeUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 70vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                i === activeIndex
                  ? 'border-[var(--color-primary)]'
                  : 'border-transparent'
              }`}
            >
              <Image
                src={getImageUrl(img.image_url)}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
