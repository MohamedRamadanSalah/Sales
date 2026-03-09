'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getT } from '@/i18n/translations';
import { Button } from '@/components/ui/Button';
import { PropertyCard } from '@/components/property/PropertyCard';
import useSWR from 'swr';
import { propertiesApi } from '@/lib/api';
import { Property } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────
   Animated Counter Hook
   ───────────────────────────────────────────── */
function useAnimatedCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  const start = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { start(); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView, start]);

  useEffect(() => {
    if (!started) return;
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return { count, ref };
}

/* ─────────────────────────────────────────────
   Featured Properties
   ───────────────────────────────────────────── */
function FeaturedProperties() {
  const { lang } = useAuth();
  const { data, error } = useSWR('featured', () =>
    propertiesApi.list({ limit: 8, sort_by: 'created_at', sort_order: 'desc' })
  );

  if (error || !data?.data?.length) return null;

  return (
    <section className="py-20 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14 animate-fade-in">
          <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-3">
            {lang === 'ar' ? 'اكتشف' : 'Discover'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)]">
            {lang === 'ar' ? 'أحدث العقارات المميزة' : 'Latest Premium Properties'}
          </h2>
          <div className="gold-divider w-24 mx-auto mt-5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.data.map((p: Property, i: number) => (
            <div key={p.id} className={`animate-fade-in-up delay-${(i % 4 + 1) * 100}`}>
              <PropertyCard property={p} />
            </div>
          ))}
        </div>
        <div className="mt-12 text-center animate-fade-in delay-500">
          <Link href="/search">
            <Button variant="outline" size="lg">
              {lang === 'ar' ? 'عرض جميع العقارات' : 'View All Properties'} →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Animated Stats Counter Section
   ───────────────────────────────────────────── */
function StatsSection() {
  const { lang } = useAuth();
  const stats = [
    { value: 5000, suffix: '+', labelAr: 'عقار مسجل', labelEn: 'Listed Properties', icon: '🏠' },
    { value: 2500, suffix: '+', labelAr: 'عميل سعيد', labelEn: 'Happy Clients', icon: '😊' },
    { value: 27, suffix: '+', labelAr: 'محافظة', labelEn: 'Governorates', icon: '📍' },
    { value: 98, suffix: '%', labelAr: 'رضا العملاء', labelEn: 'Satisfaction Rate', icon: '⭐' },
  ];

  return (
    <section className="py-16 bg-[var(--color-primary)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StatItem key={i} stat={stat} index={i} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({ stat, index, lang }: { stat: { value: number; suffix: string; labelAr: string; labelEn: string; icon: string }; index: number; lang: string }) {
  const { count, ref } = useAnimatedCounter(stat.value, 2000);
  return (
    <div ref={ref} className={`text-center animate-fade-in-up delay-${(index + 1) * 100}`}>
      <span className="text-3xl mb-3 block">{stat.icon}</span>
      <p className="text-3xl md:text-4xl font-bold text-[var(--color-accent)] mb-1">
        {count.toLocaleString()}{stat.suffix}
      </p>
      <p className="text-sm text-white/70">{lang === 'ar' ? stat.labelAr : stat.labelEn}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Property Categories Grid
   ───────────────────────────────────────────── */
function CategoriesSection() {
  const { lang } = useAuth();
  const categories = [
    { slug: 'apartment', icon: '🏢', nameAr: 'شقق', nameEn: 'Apartments', countAr: 'أكثر من 2000 عقار', countEn: '2000+ Properties', gradient: 'from-[#0C1B33] to-[#1a3a6b]' },
    { slug: 'villa', icon: '🏡', nameAr: 'فيلات', nameEn: 'Villas', countAr: 'أكثر من 800 عقار', countEn: '800+ Properties', gradient: 'from-[#1a3a6b] to-[#162D50]' },
    { slug: 'commercial', icon: '🏪', nameAr: 'تجاري', nameEn: 'Commercial', countAr: 'أكثر من 500 عقار', countEn: '500+ Properties', gradient: 'from-[#162D50] to-[#0C1B33]' },
    { slug: 'land', icon: '🌍', nameAr: 'أراضي', nameEn: 'Land', countAr: 'أكثر من 300 عقار', countEn: '300+ Properties', gradient: 'from-[#0C1B33] to-[#0a1628]' },
    { slug: 'duplex', icon: '🏘️', nameAr: 'دوبلكس', nameEn: 'Duplex', countAr: 'أكثر من 400 عقار', countEn: '400+ Properties', gradient: 'from-[#0a1628] to-[#162D50]' },
    { slug: 'studio', icon: '🛏️', nameAr: 'ستوديو', nameEn: 'Studio', countAr: 'أكثر من 600 عقار', countEn: '600+ Properties', gradient: 'from-[#162D50] to-[#1a3a6b]' },
  ];

  return (
    <section className="py-20 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-3 animate-fade-in">
            {lang === 'ar' ? 'تصفح حسب النوع' : 'Browse by Type'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] animate-fade-in delay-100">
            {lang === 'ar' ? 'استكشف أنواع العقارات' : 'Explore Property Types'}
          </h2>
          <div className="gold-divider w-24 mx-auto mt-5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} p-6 md:p-8 luxury-card animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="absolute top-0 end-0 w-32 h-32 rounded-full bg-[var(--color-accent)]/5 blur-2xl group-hover:bg-[var(--color-accent)]/15 transition-all duration-500" />
              <span className="text-4xl md:text-5xl block mb-4 group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </span>
              <h3 className="text-lg md:text-xl font-bold text-white mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                {lang === 'ar' ? cat.nameAr : cat.nameEn}
              </h3>
              <p className="text-xs md:text-sm text-white/50">
                {lang === 'ar' ? cat.countAr : cat.countEn}
              </p>
              <div className="absolute bottom-4 end-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-white rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   How It Works Section
   ───────────────────────────────────────────── */
function HowItWorksSection() {
  const { lang } = useAuth();
  const steps = [
    {
      step: '01',
      icon: '🔍',
      titleAr: 'ابحث عن عقارك',
      titleEn: 'Search Properties',
      descAr: 'استخدم محرك البحث المتقدم للعثور على العقار المثالي حسب الموقع والنوع والسعر',
      descEn: 'Use our advanced search engine to find the perfect property by location, type, and price range.',
    },
    {
      step: '02',
      icon: '📋',
      titleAr: 'قدّم طلبك',
      titleEn: 'Submit Your Request',
      descAr: 'أرسل طلب حجز أو استفسار وسيتواصل معك فريقنا المتخصص في أسرع وقت',
      descEn: 'Place an order or inquiry and our dedicated team will reach out to you promptly.',
    },
    {
      step: '03',
      icon: '🔐',
      titleAr: 'أتمم الصفقة',
      titleEn: 'Close the Deal',
      descAr: 'أكمل عملية الشراء أو الإيجار بأمان تام مع متابعة مستمرة حتى التسليم',
      descEn: 'Complete your purchase or rental securely with continuous follow-up until handover.',
    },
  ];

  return (
    <section className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-3 animate-fade-in">
            {lang === 'ar' ? 'كيف نعمل' : 'How It Works'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] animate-fade-in delay-100">
            {lang === 'ar' ? 'خطوات بسيطة لامتلاك عقارك' : 'Simple Steps to Own Your Property'}
          </h2>
          <div className="gold-divider w-24 mx-auto mt-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent" />

          {steps.map((s, i) => (
            <div key={i} className={`relative text-center group animate-fade-in-up delay-${(i + 1) * 200}`}>
              {/* Step number badge */}
              <div className="relative inline-block mb-8">
                <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] flex items-center justify-center mx-auto border-2 border-[var(--color-accent)]/30 group-hover:border-[var(--color-accent)] transition-colors duration-500 relative z-10">
                  <span className="text-3xl">{s.icon}</span>
                </div>
                <span className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-[var(--color-accent)] text-[var(--color-primary-dark)] text-xs font-bold flex items-center justify-center z-20">
                  {s.step}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                {lang === 'ar' ? s.titleAr : s.titleEn}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xs mx-auto">
                {lang === 'ar' ? s.descAr : s.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Testimonials Carousel
   ───────────────────────────────────────────── */
function TestimonialsSection() {
  const { lang } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = [
    {
      nameAr: 'أحمد محمد', nameEn: 'Ahmed Mohamed',
      roleAr: 'مشتري عقار', roleEn: 'Property Buyer',
      quoteAr: 'منصة رائعة ساعدتني في إيجاد شقة أحلامي في القاهرة الجديدة. العملية كانت سلسة وآمنة تماماً.',
      quoteEn: 'An amazing platform that helped me find my dream apartment in New Cairo. The process was smooth and completely secure.',
      avatar: '👨‍💼',
      rating: 5,
    },
    {
      nameAr: 'سارة أحمد', nameEn: 'Sara Ahmed',
      roleAr: 'وسيط عقاري', roleEn: 'Real Estate Broker',
      quoteAr: 'أفضل منصة للوسطاء العقاريين. زادت مبيعاتي بنسبة 40% منذ انضمامي. الدعم الفني ممتاز.',
      quoteEn: 'The best platform for real estate brokers. My sales increased by 40% since joining. The technical support is excellent.',
      avatar: '👩‍💼',
      rating: 5,
    },
    {
      nameAr: 'محمد علي', nameEn: 'Mohamed Ali',
      roleAr: 'مستثمر', roleEn: 'Investor',
      quoteAr: 'تحليلات السوق والبيانات المتاحة على المنصة ساعدتني في اتخاذ قرارات استثمارية ذكية.',
      quoteEn: 'Market analytics and data available on the platform helped me make smart investment decisions.',
      avatar: '🧑‍💼',
      rating: 5,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const t = testimonials[activeIndex];

  return (
    <section className="py-24 bg-[var(--color-surface)]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-3 animate-fade-in">
            {lang === 'ar' ? 'آراء عملائنا' : 'Client Testimonials'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] animate-fade-in delay-100">
            {lang === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}
          </h2>
          <div className="gold-divider w-24 mx-auto mt-5" />
        </div>

        <div className="relative bg-[var(--color-bg)] rounded-3xl p-8 md:p-12 border border-[var(--color-border)] luxury-card">
          {/* Large quote mark */}
          <div className="absolute top-6 start-8 text-6xl text-[var(--color-accent)]/20 font-serif leading-none">"</div>

          <div className="text-center transition-all duration-500">
            <span className="text-5xl block mb-6">{t.avatar}</span>
            <p className="text-lg md:text-xl text-[var(--color-text)] leading-relaxed mb-8 max-w-2xl mx-auto italic">
              &ldquo;{lang === 'ar' ? t.quoteAr : t.quoteEn}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <svg key={i} className="w-5 h-5 text-[var(--color-accent)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.075 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                </svg>
              ))}
            </div>
            <h4 className="font-bold text-[var(--color-text)]">{lang === 'ar' ? t.nameAr : t.nameEn}</h4>
            <p className="text-sm text-[var(--color-text-muted)]">{lang === 'ar' ? t.roleAr : t.roleEn}</p>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'bg-[var(--color-accent)] w-8'
                    : 'bg-[var(--color-border)] hover:bg-[var(--color-accent)]/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Trust Badges Section
   ───────────────────────────────────────────── */
function TrustBadgesSection() {
  const { lang } = useAuth();
  const badges = [
    { icon: '🏛️', labelAr: 'مرخص رسمياً', labelEn: 'Officially Licensed' },
    { icon: '🔒', labelAr: 'بيانات مشفرة', labelEn: 'Encrypted Data' },
    { icon: '✅', labelAr: 'عقارات موثقة', labelEn: 'Verified Properties' },
    { icon: '📞', labelAr: 'دعم على مدار الساعة', labelEn: '24/7 Support' },
    { icon: '💳', labelAr: 'دفع آمن', labelEn: 'Secure Payment' },
    { icon: '📄', labelAr: 'عقود قانونية', labelEn: 'Legal Contracts' },
  ];

  return (
    <section className="py-12 bg-[var(--color-bg-2)] border-t border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {badges.map((badge, i) => (
            <div key={i} className={`flex items-center gap-2 text-[var(--color-text-secondary)] animate-fade-in delay-${(i + 1) * 100}`}>
              <span className="text-xl">{badge.icon}</span>
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                {lang === 'ar' ? badge.labelAr : badge.labelEn}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main Landing Page
   ───────────────────────────────────────────── */
export function LandingContent() {
  const { lang } = useAuth();
  const tt = getT(lang);

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[var(--color-primary-dark)]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A96E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-dark)]/50 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 text-center z-10">
          {/* Tagline */}
          <p className="animate-fade-in text-sm md:text-base font-semibold text-[var(--color-accent)] uppercase tracking-[0.3em] mb-6">
            {lang === 'ar' ? '✦  منصة العقارات الأولى في مصر  ✦' : '✦  Egypt\'s Premier Real Estate  ✦'}
          </p>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight animate-fade-in-up delay-100">
            {tt('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 font-light">
            {tt('hero.subtitle')}
          </p>

          {/* ── Hero Search Bar ── */}
          <div className="max-w-3xl mx-auto mb-10 animate-fade-in-up delay-300">
            <div className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
              <select
                className="flex-1 px-4 py-3 rounded-xl bg-white/90 text-[var(--color-text)] text-sm border-0 focus:ring-2 focus:ring-[var(--color-accent)] outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>{lang === 'ar' ? 'نوع العقار' : 'Property Type'}</option>
                <option value="apartment">{lang === 'ar' ? 'شقة' : 'Apartment'}</option>
                <option value="villa">{lang === 'ar' ? 'فيلا' : 'Villa'}</option>
                <option value="commercial">{lang === 'ar' ? 'تجاري' : 'Commercial'}</option>
                <option value="land">{lang === 'ar' ? 'أرض' : 'Land'}</option>
              </select>
              <select
                className="flex-1 px-4 py-3 rounded-xl bg-white/90 text-[var(--color-text)] text-sm border-0 focus:ring-2 focus:ring-[var(--color-accent)] outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>{lang === 'ar' ? 'نوع الإعلان' : 'Listing Type'}</option>
                <option value="sale">{lang === 'ar' ? 'للبيع' : 'For Sale'}</option>
                <option value="rent">{lang === 'ar' ? 'للإيجار' : 'For Rent'}</option>
              </select>
              <Link href="/search" className="flex-shrink-0">
                <Button variant="accent" size="lg" className="w-full sm:w-auto px-8 py-3 text-sm font-semibold">
                  {lang === 'ar' ? 'ابحث الآن' : 'Search Now'} 🔍
                </Button>
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <Link href="/search?listing_type=sale">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 !border-white/30 !text-white hover:!bg-white hover:!text-[var(--color-primary-dark)]">
                {lang === 'ar' ? 'تصفح عقارات البيع' : 'Browse Sale Properties'}
              </Button>
            </Link>
            <Link href="/search?listing_type=rent">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 !border-white/30 !text-white hover:!bg-white hover:!text-[var(--color-primary-dark)]">
                {lang === 'ar' ? 'تصفح عقارات الإيجار' : 'Browse Rental Properties'}
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 animate-float">
            <svg className="w-6 h-6 mx-auto text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <TrustBadgesSection />

      {/* ── Why Choose Us ── */}
      <section className="py-24 bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-3 animate-fade-in">
              {lang === 'ar' ? 'مميزاتنا' : 'Our Advantages'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] animate-fade-in delay-100">
              {lang === 'ar' ? 'لماذا نحن الخيار الأمثل؟' : 'Why Choose Us?'}
            </h2>
            <div className="gold-divider w-24 mx-auto mt-5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '💎',
                titleAr: 'عقارات موثقة',
                titleEn: 'Verified Listings',
                descAr: 'جميع العقارات تخضع لمراجعة دقيقة واعتماد رسمي لضمان مصداقيتها',
                descEn: 'Every property undergoes thorough review and official verification for complete authenticity.',
              },
              {
                icon: '🛡️',
                titleAr: 'عملية آمنة',
                titleEn: 'Secure Process',
                descAr: 'معاملات آمنة ومحمية بأحدث تقنيات الأمان لحماية بياناتك',
                descEn: 'Fully secured transactions with cutting-edge technology protecting your data and investments.',
              },
              {
                icon: '🏛️',
                titleAr: 'مواقع مميزة',
                titleEn: 'Prime Locations',
                descAr: 'عقارات في أرقى المناطق والأحياء في جميع أنحاء مصر',
                descEn: 'Premium properties in the most prestigious neighborhoods across all of Egypt.',
              },
              {
                icon: '🤝',
                titleAr: 'وسطاء محترفون',
                titleEn: 'Elite Brokers',
                descAr: 'شبكة واسعة من الوسطاء المعتمدين والمتخصصين في العقارات الفاخرة',
                descEn: 'A curated network of certified professionals specializing in premium real estate.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`group p-8 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] luxury-card text-center animate-fade-in-up delay-${(i + 1) * 100}`}
              >
                <span className="text-5xl mb-6 block group-hover:scale-110 transition-transform duration-300 animate-float" style={{ animationDelay: `${i * 200}ms` }}>
                  {item.icon}
                </span>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                  {lang === 'ar' ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {lang === 'ar' ? item.descAr : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <StatsSection />

      {/* ── Property Categories ── */}
      <CategoriesSection />

      {/* ── How It Works ── */}
      <HowItWorksSection />

      {/* ── Featured Properties ── */}
      <FeaturedProperties />

      {/* ── Testimonials ── */}
      <TestimonialsSection />

      {/* ── CTA: Become a Broker ── */}
      <section className="py-24 bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-primary-light)] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 end-0 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-3xl" />
        <div className="absolute bottom-0 start-0 w-72 h-72 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-4 animate-fade-in">
            {lang === 'ar' ? 'انضم إلينا' : 'Join Us'}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up delay-100">
            {lang === 'ar' ? 'وسيط عقاري؟ أضف عقاراتك مجاناً' : 'Are You a Broker? List Properties Free'}
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {lang === 'ar'
              ? 'انضم لآلاف الوسطاء المحترفين واستفد من وصولنا الواسع إلى المشترين والمستأجرين'
              : 'Join our exclusive network of professional brokers and showcase your portfolio to thousands of high-intent buyers.'}
          </p>
          <div className="animate-fade-in-up delay-300">
            <Link href="/signup">
              <Button variant="accent" size="lg" className="px-12 py-4 text-lg">
                {lang === 'ar' ? 'سجّل كوسيط الآن' : 'Register as Broker'} →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
