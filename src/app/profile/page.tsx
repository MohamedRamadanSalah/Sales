'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function ProfileContent() {
  const { user, lang, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    phone_number: user?.phone_number ?? '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await authApi.updateProfile(form);
      setSuccess(lang === 'ar' ? 'تم تحديث الملف بنجاح' : 'Profile updated successfully');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setSuccess(lang === 'ar' ? 'تم تغيير كلمة المرور. سيتم تسجيل خروجك.' : 'Password changed. You will be logged out.');
      await logout();
      router.push('/login');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
      </h1>

      <div className="flex gap-4 mb-6 border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`pb-2 px-1 -mb-px font-medium ${
            activeTab === 'info'
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          {lang === 'ar' ? 'المعلومات' : 'Info'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`pb-2 px-1 -mb-px font-medium ${
            activeTab === 'password'
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
        </button>
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>
          )}
          <Input
            label={lang === 'ar' ? 'الاسم الأول' : 'First Name'}
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            required
          />
          <Input
            label={lang === 'ar' ? 'الاسم الأخير' : 'Last Name'}
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            required
          />
          <Input
            label={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            value={user.email}
            disabled
          />
          <Input
            label={lang === 'ar' ? 'رقم الهاتف' : 'Phone'}
            value={form.phone_number}
            onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
            required
          />
          <Button type="submit" isLoading={isLoading}>
            {lang === 'ar' ? 'حفظ' : 'Save'}
          </Button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>
          )}
          <Input
            label={lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
            type="password"
            value={passwordForm.current_password}
            onChange={(e) =>
              setPasswordForm((f) => ({ ...f, current_password: e.target.value }))
            }
            required
          />
          <Input
            label={lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
            type="password"
            value={passwordForm.new_password}
            onChange={(e) =>
              setPasswordForm((f) => ({ ...f, new_password: e.target.value }))
            }
            required
            minLength={6}
          />
          <Input
            label={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            type="password"
            value={passwordForm.confirm_password}
            onChange={(e) =>
              setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))
            }
            required
          />
          <Button type="submit" isLoading={isLoading}>
            {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
