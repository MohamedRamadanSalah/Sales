'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const { lang } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[var(--color-surface)] rounded-xl shadow-lg p-8 border border-[var(--color-border)] text-center">
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-4">
            {lang === 'ar' ? 'تم إرسال رابط إعادة التعيين' : 'Reset link sent'}
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            {lang === 'ar'
              ? 'إذا كان البريد مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور.'
              : 'If this email is registered, you will receive a password reset link.'}
          </p>
          <Link href="/login">
            <Button>{lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-surface)] rounded-xl shadow-lg p-8 border border-[var(--color-border)]">
          <h1 className="text-2xl font-bold text-[var(--color-text)] text-center mb-6">
            {lang === 'ar' ? 'نسيت كلمة المرور' : 'Forgot Password'}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}
            <Input
              label={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" fullWidth isLoading={isLoading}>
              {lang === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
            <Link href="/login" className="text-[var(--color-primary)] hover:underline">
              {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
