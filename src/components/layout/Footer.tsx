'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getT } from '@/i18n/translations';

export function Footer() {
  const { lang } = useAuth();
  const tt = getT(lang);

  return (
    <footer className="bg-[var(--color-primary-dark)] text-white mt-auto">
      {/* Gold divider */}
      <div className="gold-divider" />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-dark)] to-[var(--color-accent)] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">🏛</span>
              </div>
              <span className="text-xl font-bold text-[var(--color-accent)]">
                {lang === 'ar' ? 'عقارات مصر' : 'Egypt Realty'}
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {lang === 'ar'
                ? 'منصة عقارية موثوقة للعثور على منزل أحلامك في مصر. نقدم أفضل العقارات الفاخرة بأسعار مناسبة.'
                : 'Your trusted premium real estate platform. Find your dream home in Egypt with verified listings and professional service.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[var(--color-accent)] mb-5 text-sm uppercase tracking-wider">
              {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-white/70 hover:text-[var(--color-accent)] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                  {tt('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-white/70 hover:text-[var(--color-accent)] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                  {tt('nav.search')}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-white/70 hover:text-[var(--color-accent)] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                  {tt('nav.login')}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-white/70 hover:text-[var(--color-accent)] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                  {tt('nav.signup')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sale */}
          <div>
            <h4 className="font-bold text-[var(--color-accent)] mb-5 text-sm uppercase tracking-wider">
              {lang === 'ar' ? 'للبيع' : 'For Sale'}
            </h4>
            <Link
              href="/search?listing_type=sale"
              className="text-sm text-white/70 hover:text-[var(--color-accent)] transition-colors duration-300 flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
              {lang === 'ar' ? 'عرض جميع العقارات للبيع' : 'View all properties for sale'}
            </Link>
          </div>

          {/* For Rent */}
          <div>
            <h4 className="font-bold text-[var(--color-accent)] mb-5 text-sm uppercase tracking-wider">
              {lang === 'ar' ? 'للإيجار' : 'For Rent'}
            </h4>
            <Link
              href="/search?listing_type=rent"
              className="text-sm text-white/70 hover:text-[var(--color-accent)] transition-colors duration-300 flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
              {lang === 'ar' ? 'عرض جميع العقارات للإيجار' : 'View all properties for rent'}
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} Egypt Realty — {tt('footer.copyright')}
          </p>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>Crafted with</span>
            <span className="text-[var(--color-accent)]">♦</span>
            <span>for Egypt&apos;s finest properties</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
