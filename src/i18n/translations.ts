export const t = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.search': 'البحث',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.logout': 'تسجيل الخروج',
    'nav.profile': 'الملف الشخصي',
    'nav.favorites': 'المفضلة',
    'nav.orders': 'طلباتي',
    'nav.myListings': 'عقاراتي',
    'nav.postProperty': 'أضف عقار',
    'nav.admin': 'لوحة التحكم',
    'footer.copyright': 'جميع الحقوق محفوظة',
    'hero.title': 'اعثر على منزل أحلامك في مصر',
    'hero.subtitle': 'آلاف العقارات المعتمدة في جميع أنحاء مصر',
    'search.placeholder': 'ابحث عن عقار...',
  },
  en: {
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    'nav.favorites': 'Favorites',
    'nav.orders': 'My Orders',
    'nav.myListings': 'My Listings',
    'nav.postProperty': 'Post Property',
    'nav.admin': 'Admin',
    'footer.copyright': 'All rights reserved',
    'hero.title': 'Find Your Dream Home in Egypt',
    'hero.subtitle': 'Thousands of verified listings across Egypt',
    'search.placeholder': 'Search for a property...',
  },
} as const;

export function getT(lang: 'ar' | 'en') {
  return (key: keyof (typeof t)['ar']): string => {
    return t[lang][key] ?? key;
  };
}
