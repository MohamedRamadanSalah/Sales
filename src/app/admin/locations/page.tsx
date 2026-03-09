'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { locationsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';

interface LocationNode {
  id: number;
  name_ar: string;
  name_en?: string;
  parent_id: number | null;
  location_type?: string;
  children?: LocationNode[];
}

export default function AdminLocationsPage() {
  const { lang } = useAuth();
  const [editModal, setEditModal] = useState<LocationNode | null>(null);
  const [addModal, setAddModal] = useState<{ parentId: number | null } | null>(null);
  const [form, setForm] = useState({ name_ar: '', name_en: '', type: 'city' as string });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, error, mutate } = useSWR('admin-locations', () =>
    locationsApi.list({ limit: 500 })
  );

  const rawLocations = (data?.data ?? []) as LocationNode[];
  const buildTree = (items: LocationNode[], parentId: number | null = null): LocationNode[] =>
    items
      .filter((l) => l.parent_id === parentId)
      .map((l) => ({
        ...l,
        children: buildTree(items, l.id),
      }));
  const locations = buildTree(rawLocations);

  const handleEdit = (loc: LocationNode) => {
    setEditModal(loc);
    setForm({ name_ar: loc.name_ar, name_en: loc.name_en ?? '', type: (loc as { type?: string }).type ?? 'city' });
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setIsSubmitting(true);
    try {
      await locationsApi.update(editModal.id, {
        name_ar: form.name_ar,
        name_en: form.name_en || form.name_ar,
        type: form.type,
        parent_id: editModal.parent_id,
      });
      setEditModal(null);
      mutate();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdd = (parentId: number | null) => {
    setAddModal({ parentId });
    setForm({ name_ar: '', name_en: '', type: 'city' });
  };

  const handleSaveAdd = async () => {
    if (!addModal || !form.name_ar) return;
    setIsSubmitting(true);
    try {
      await locationsApi.create({
        name_ar: form.name_ar,
        name_en: form.name_en || form.name_ar,
        parent_id: addModal.parentId,
        type: form.type,
      });
      setAddModal(null);
      mutate();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(lang === 'ar' ? 'حذف هذا الموقع؟' : 'Delete this location?')) return;
    try {
      await locationsApi.delete(id);
      mutate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const getName = (l: LocationNode) => (lang === 'en' && l.name_en ? l.name_en : l.name_ar);

  const renderTree = (items: LocationNode[], level = 0) =>
    items.map((loc) => (
      <div key={loc.id} className="ms-4" style={{ marginLeft: level * 24 }}>
        <div className="flex items-center gap-2 py-2">
          <span className="font-medium">{getName(loc)}</span>
          <Button size="sm" variant="ghost" onClick={() => handleEdit(loc)}>
            {t('تعديل', 'Edit')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleAdd(loc.id)}>
            +
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(loc.id)}>
            {t('حذف', 'Delete')}
          </Button>
        </div>
        {loc.children?.length ? renderTree(loc.children, level + 1) : null}
      </div>
    ));

  if (error) return <div className="text-[var(--color-error)]">{error.message}</div>;
  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t('إدارة المواقع', 'Manage Locations')}
        </h1>
        <Button variant="accent" onClick={() => handleAdd(null)}>
          {t('إضافة موقع', 'Add Location')}
        </Button>
      </div>

      <div className="space-y-1">{renderTree(locations)}</div>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={t('تعديل الموقع', 'Edit Location')}>
        <div className="space-y-4">
          <Input label={t('الاسم (عربي)', 'Name (Arabic)')} value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} required />
          <Input label={t('الاسم (إنجليزي)', 'Name (English)')} value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium mb-2">{t('النوع', 'Type')}</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2 rounded-lg border">
              <option value="governorate">{t('محافظة', 'Governorate')}</option>
              <option value="city">{t('مدينة', 'City')}</option>
              <option value="neighborhood">{t('حي', 'Neighborhood')}</option>
            </select>
          </div>
          <Button onClick={handleSaveEdit} isLoading={isSubmitting}>
            {t('حفظ', 'Save')}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!addModal} onClose={() => setAddModal(null)} title={t('إضافة موقع', 'Add Location')}>
        <div className="space-y-4">
          <Input label={t('الاسم (عربي)', 'Name (Arabic)')} value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} required />
          <Input label={t('الاسم (إنجليزي)', 'Name (English)')} value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium mb-2">{t('النوع', 'Type')}</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2 rounded-lg border">
              <option value="governorate">{t('محافظة', 'Governorate')}</option>
              <option value="city">{t('مدينة', 'City')}</option>
              <option value="neighborhood">{t('حي', 'Neighborhood')}</option>
            </select>
          </div>
          <Button onClick={handleSaveAdd} isLoading={isSubmitting}>
            {t('إضافة', 'Add')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
