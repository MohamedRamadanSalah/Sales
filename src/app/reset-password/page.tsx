'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { lang } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[var(--color-surface)] rounded-xl shadow-lg p-8 border border-[var(--color-border)] text-center">
          <h1 className="text-xl font-bold text-[var(--color-error)] mb-4">
            {lang === 'ar' ? 'رابط غير صالح' : 'Invalid link'}
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            {lang === 'ar' ? 'لم يتم العثور على رمز إعادة التعيين.' : 'Reset token not found.'}
          </p>
          <Link href="/forgot-password">
            <Button>{lang === 'ar' ? 'طلب رابط جديد' : 'Request new link'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: password });
      router.push('/login');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-surface)] rounded-xl shadow-lg p-8 border border-[var(--color-border)]">
          <h1 className="text-2xl font-bold text-[var(--color-text)] text-center mb-6">
            {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}
            <Input
              label={lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Input
              label={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" fullWidth isLoading={isLoading}>
              {lang === 'ar' ? 'إعادة التعيين' : 'Reset Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
