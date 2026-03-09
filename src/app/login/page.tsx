'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { lang, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { user, token, refresh_token } = res.data;
      login(
        { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, phone_number: user.phone_number, role: user.role },
        token,
        refresh_token
      );
      router.push(returnUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg-2)]">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl p-10 border border-[var(--color-border)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-lg">
              <span className="text-2xl">🔑</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              {lang === 'ar' ? 'سجّل دخولك للمتابعة' : 'Sign in to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            <Input
              label={lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
            />
            <Input
              label={lang === 'ar' ? 'كلمة المرور' : 'Password'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <Button type="submit" fullWidth isLoading={isLoading} className="!py-3.5">
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'} →
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">
            <Link href="/forgot-password" className="text-[var(--color-accent-dark)] hover:text-[var(--color-accent)] transition-colors font-medium">
              {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </Link>
          </p>
          <div className="gold-divider my-6" />
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            {lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
            <Link href="/signup" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors font-semibold">
              {lang === 'ar' ? 'إنشاء حساب' : 'Create Account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center"><div className="w-10 h-10 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
