'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getT } from '@/i18n/translations';

const links = [
  { href: '/admin/dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard' },
  { href: '/admin/properties', labelAr: 'العقارات', labelEn: 'Properties' },
  { href: '/admin/orders', labelAr: 'الطلبات', labelEn: 'Orders' },
  { href: '/admin/locations', labelAr: 'المواقع', labelEn: 'Locations' },
  { href: '/admin/analytics', labelAr: 'التحليلات', labelEn: 'Analytics' },
  { href: '/admin/activity', labelAr: 'سجل النشاط', labelEn: 'Activity' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { lang } = useAuth();
  const tt = getT(lang);

  return (
    <aside className="w-64 shrink-0 bg-[var(--color-primary-dark)] text-white min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {links.map((l) => {
          const isActive = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[var(--color-accent)] text-[var(--color-primary-dark)]'
                  : 'hover:bg-white/10'
              }`}
            >
              {lang === 'ar' ? l.labelAr : l.labelEn}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
