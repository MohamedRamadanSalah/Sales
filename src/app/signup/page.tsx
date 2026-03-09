'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const { lang, login } = useAuth();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authApi.signup({
        ...form,
        preferred_language: lang,
      });
      const { user, token, refresh_token } = res.data;
      login(
        {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
        },
        token,
        refresh_token
      );
      router.push('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg-2)]">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl p-10 border border-[var(--color-border)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-accent-dark)] to-[var(--color-accent)] flex items-center justify-center shadow-lg">
              <span className="text-2xl">✨</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Your Account'}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              {lang === 'ar' ? 'انضم إلينا واكتشف أفضل العقارات' : 'Join us and discover premium properties'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={lang === 'ar' ? 'الاسم الأول' : 'First Name'}
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                placeholder={lang === 'ar' ? 'محمد' : 'John'}
              />
              <Input
                label={lang === 'ar' ? 'الاسم الأخير' : 'Last Name'}
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                placeholder={lang === 'ar' ? 'أحمد' : 'Doe'}
              />
            </div>
            <Input
              label={lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
            />
            <Input
              label={lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              name="phone_number"
              type="tel"
              value={form.phone_number}
              onChange={handleChange}
              required
              placeholder="+20 XXX XXX XXXX"
            />
            <Input
              label={lang === 'ar' ? 'كلمة المرور' : 'Password'}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="••••••••"
            />
            <Button type="submit" fullWidth isLoading={isLoading} className="!py-3.5">
              {lang === 'ar' ? 'إنشاء حساب' : 'Create Account'} →
            </Button>
          </form>
          <div className="gold-divider my-6" />
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            {lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link href="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors font-semibold">
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
