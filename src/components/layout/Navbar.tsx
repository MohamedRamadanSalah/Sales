'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getT } from '@/i18n/translations';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, lang, setLang, logout } = useAuth();
  const tt = getT(lang);

  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-dark)] to-[var(--color-accent)] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">🏛</span>
            </div>
            <span className="text-xl font-bold text-gold-gradient">
              {lang === 'ar' ? 'عقارات مصر' : 'Egypt Realty'}
            </span>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-6"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tt('search.placeholder')}
                className="w-full px-5 py-2.5 pe-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-300 text-sm"
              />
              <button
                type="submit"
                className="absolute end-1 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-3 py-2 text-sm font-semibold rounded-xl bg-[var(--color-bg-2)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] transition-all duration-300"
            >
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>

            {isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--color-bg-2)] transition-all duration-300"
                >
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {user?.first_name?.[0] ?? '?'}
                  </span>
                  <span className="hidden sm:inline text-sm font-medium text-[var(--color-text)]">
                    {user?.first_name}
                  </span>
                  <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden
                    />
                    <div className="absolute end-0 mt-2 w-56 py-2 bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)] z-20 animate-scale-in">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-[var(--color-border)]">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg-2)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span>👤</span> {tt('nav.profile')}
                        </Link>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg-2)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span>❤️</span> {tt('nav.favorites')}
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg-2)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span>📋</span> {tt('nav.orders')}
                        </Link>
                          <>
                            <div className="my-1 gold-divider mx-4" />
                            <Link
                              href="/my-listings"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg-2)] transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <span>🏠</span> {tt('nav.myListings')}
                            </Link>
                            <Link
                              href="/create-property"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-accent-dark)] font-medium hover:bg-[var(--color-bg-2)] transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <span>➕</span> {tt('nav.postProperty')}
                            </Link>
                          </>
                        {user?.role === 'admin' && (
                          <>
                            <div className="my-1 gold-divider mx-4" />
                            <Link
                              href="/admin/dashboard"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg-2)] transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <span>⚙️</span> {tt('nav.admin')}
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="border-t border-[var(--color-border)] pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-red-50 transition-colors"
                        >
                          <span>🚪</span> {tt('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {tt('nav.login')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="accent" size="sm">
                    {tt('nav.signup')}
                  </Button>
                </Link>
              </div>
            )}

            <button
              type="button"
              className="md:hidden p-2 rounded-xl hover:bg-[var(--color-bg-2)] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--color-border)] animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tt('search.placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
              />
              <Button type="submit" className="w-full mt-2">
                {lang === 'ar' ? 'بحث' : 'Search'}
              </Button>
            </form>
            <nav className="flex flex-col gap-1">
              <Link href="/" className="px-4 py-3 rounded-xl hover:bg-[var(--color-bg-2)] transition-colors font-medium" onClick={() => setMenuOpen(false)}>
                {tt('nav.home')}
              </Link>
              <Link href="/search" className="px-4 py-3 rounded-xl hover:bg-[var(--color-bg-2)] transition-colors font-medium" onClick={() => setMenuOpen(false)}>
                {tt('nav.search')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
