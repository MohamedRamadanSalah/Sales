'use client';

import { useEffect, useRef } from 'react';

interface PropertyMapProps {
  lat: number;
  lng: number;
}

export function PropertyMap({ lat, lng }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadMap = async () => {
      const L = await import('leaflet');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - leaflet CSS
      await import('leaflet/dist/leaflet.css');

      const map = L.map(containerRef.current!).setView([lat, lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      L.marker([lat, lng]).addTo(map);
    };

    loadMap();
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full h-64 rounded-xl overflow-hidden border border-[var(--color-border)]"
    />
  );
}
