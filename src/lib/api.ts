'use client';

import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  setUser,
  clearAuth,
  getLanguage,
} from './auth';
import type {
  User,
  Property,
  PropertyImage,
  Order,
  Invoice,
  Category,
  Amenity,
  Location,
  Notification,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

// In local dev, NEXT_PUBLIC_API_URL=http://localhost:5000 (set in .env.local)
// On Vercel (same domain deployment), leave unset → defaults to '' (same origin)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

interface FetchOptions extends Omit<RequestInit, 'body'> {
  skipAuth?: boolean;
  isFormData?: boolean;
  body?: Record<string, unknown> | FormData;
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': getLanguage() },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    const json = await res.json();
    if (json.success && json.data?.token) {
      setToken(json.data.token);
      if (json.data.refresh_token) setRefreshToken(json.data.refresh_token);
      if (json.data.user) setUser(json.data.user);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, isFormData = false, headers = {}, ...rest } = options;

  const h: Record<string, string> = {
    'Accept-Language': getLanguage(),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string>),
  };

  const token = getToken();
  if (!skipAuth && token) {
    h['Authorization'] = `Bearer ${token}`;
  }

  const fetchHeaders: Record<string, string> =
    isFormData && rest.body instanceof FormData
      ? { 'Accept-Language': getLanguage(), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      : h;

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers: fetchHeaders,
    body: isFormData ? (rest.body as FormData) : rest.body ? JSON.stringify(rest.body) : undefined,
  });

  if (res.status === 401 && !skipAuth && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = getToken();
      const newHeaders: Record<string, string> = {
        'Accept-Language': getLanguage(),
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(headers as Record<string, string>),
      };
      if (newToken) newHeaders['Authorization'] = `Bearer ${newToken}`;
      const retryHeaders =
        isFormData && rest.body instanceof FormData
          ? { 'Accept-Language': getLanguage(), Authorization: `Bearer ${newToken}` }
          : newHeaders;
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...rest,
        headers: retryHeaders,
        body: isFormData ? (rest.body as FormData) : rest.body ? JSON.stringify(rest.body) : undefined,
      });
    } else {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      }
      throw new Error('Session expired');
    }
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || 'Invalid response');
  }

  if (!res.ok) {
    const err = data as { message?: string; message_ar?: string; error?: string; error_ar?: string };
    throw new Error(err?.error || err?.message_ar || err?.message || `Request failed ${res.status}`);
  }

  return data as T;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<ApiResponse<{ user: User; token: string; refresh_token: string }>>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    }),
  signup: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    preferred_language?: string;
    role?: 'client' | 'broker';
  }) =>
    apiFetch<ApiResponse<{ user: User; token: string; refresh_token: string }>>('/api/auth/signup', {
      method: 'POST',
      body: data,
      skipAuth: true,
    }),
  logout: () => apiFetch<ApiResponse<unknown>>('/api/auth/logout', { method: 'POST' }),
  getProfile: () => apiFetch<ApiResponse<{ user: User }>>('/api/auth/profile'),
  updateProfile: (data: Partial<Pick<User, 'first_name' | 'last_name' | 'phone_number' | 'preferred_language'>>) =>
    apiFetch<ApiResponse<{ user: User }>>('/api/auth/profile', { method: 'PUT', body: data }),
  changePassword: (data: { current_password: string; new_password: string }) =>
    apiFetch<ApiResponse<unknown>>('/api/auth/change-password', { method: 'POST', body: data }),
  forgotPassword: (email: string) =>
    apiFetch<ApiResponse<unknown>>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
      skipAuth: true,
    }),
  resetPassword: (data: { token: string; new_password: string }) =>
    apiFetch<ApiResponse<unknown>>('/api/auth/reset-password', {
      method: 'POST',
      body: data,
      skipAuth: true,
    }),
  refreshToken: (refresh_token: string) =>
    apiFetch<ApiResponse<{ token: string; refresh_token: string; user: User }>>('/api/auth/refresh-token', {
      method: 'POST',
      body: { refresh_token },
      skipAuth: true,
    }),
};

// Properties
export interface PropertiesParams {
  page?: number;
  limit?: number;
  category_id?: number;
  location_id?: number;
  listing_type?: string;
  property_origin?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const propertiesApi = {
  list: (params?: PropertiesParams) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') q.set(k, String(v));
      });
    }
    return apiFetch<PaginatedResponse<Property>>(`/api/properties?${q}`);
  },
  get: (id: number) => apiFetch<ApiResponse<Property>>(`/api/properties/${id}`),
  getCategories: () => apiFetch<ApiResponse<Category[]>>('/api/properties/categories'),
  getAmenities: () => apiFetch<ApiResponse<Amenity[]>>('/api/properties/amenities'),
  create: (data: Record<string, unknown>) =>
    apiFetch<ApiResponse<Property>>('/api/properties', { method: 'POST', body: data }),
  update: (id: number, data: Record<string, unknown>) =>
    apiFetch<ApiResponse<Property>>(`/api/properties/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) => apiFetch<ApiResponse<unknown>>(`/api/properties/${id}`, { method: 'DELETE' }),
  deactivate: (id: number) =>
    apiFetch<ApiResponse<Property>>(`/api/properties/${id}/deactivate`, { method: 'PATCH' }),
  updateStatus: (id: number, status: string, reason?: string) =>
    apiFetch<ApiResponse<Property>>(`/api/properties/${id}/status`, {
      method: 'PATCH',
      body: { status, reason },
    }),
  my: (params?: { page?: number; limit?: number }) => {
    const q = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        )
      : '';
    return apiFetch<PaginatedResponse<Property>>(`/api/properties/my?${q}`);
  },
  adminAll: (params?: Record<string, string | number>) => {
    const q = params ? new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])) : '';
    return apiFetch<PaginatedResponse<Property>>(`/api/properties/admin/all?${q}`);
  },
};

// Images
export const imagesApi = {
  list: (propertyId: number) =>
    apiFetch<ApiResponse<PropertyImage[]>>(`/api/properties/${propertyId}/images`),
  upload: (propertyId: number, formData: FormData) =>
    apiFetch<ApiResponse<{ images: PropertyImage[] }>>(`/api/properties/${propertyId}/images`, {
      method: 'POST',
      body: formData,
      isFormData: true,
    }),
  delete: (imageId: number) =>
    apiFetch<ApiResponse<unknown>>(`/api/properties/images/${imageId}`, { method: 'DELETE' }),
};

// Locations
export const locationsApi = {
  list: (params?: { limit?: number; page?: number }) => {
    const q = params ? new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])) : '';
    return apiFetch<PaginatedResponse<Location>>(`/api/locations${q ? `?${q}` : ''}`);
  },
  get: (id: number) => apiFetch<ApiResponse<Location>>(`/api/locations/${id}`),
  create: (data: Record<string, unknown>) =>
    apiFetch<ApiResponse<Location>>('/api/locations', { method: 'POST', body: data }),
  update: (id: number, data: Record<string, unknown>) =>
    apiFetch<ApiResponse<Location>>(`/api/locations/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) => apiFetch<ApiResponse<unknown>>(`/api/locations/${id}`, { method: 'DELETE' }),
};

// Orders
export const ordersApi = {
  create: (data: { property_id: number; notes?: string }) =>
    apiFetch<ApiResponse<Order>>('/api/orders', { method: 'POST', body: data }),
  my: (params?: { page?: number; limit?: number }) => {
    const q = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        )
      : '';
    return apiFetch<PaginatedResponse<Order>>(`/api/orders/my?${q}`);
  },
  adminAll: (params?: Record<string, string | number>) => {
    const q = params ? new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])) : '';
    return apiFetch<PaginatedResponse<Order>>(`/api/orders/all?${q}`);
  },
  updateStatus: (id: number, status: string) =>
    apiFetch<ApiResponse<Order>>(`/api/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  createInvoice: (data: { order_id: number; amount: number; due_date: string; payment_method?: string }) =>
    apiFetch<ApiResponse<Invoice>>('/api/orders/invoices', { method: 'POST', body: data }),
  getInvoices: (params?: Record<string, string | number>) => {
    const q = params ? new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])) : '';
    return apiFetch<PaginatedResponse<Invoice>>(`/api/orders/invoices?${q}`);
  },
  updateInvoiceStatus: (id: number, status: string) =>
    apiFetch<ApiResponse<Invoice>>(`/api/orders/invoices/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
};

// Favorites
export const favoritesApi = {
  list: () => apiFetch<ApiResponse<Property[]>>('/api/favorites'),
  add: (propertyId: number) =>
    apiFetch<ApiResponse<unknown>>('/api/favorites', {
      method: 'POST',
      body: { property_id: propertyId },
    }),
  remove: (propertyId: number) =>
    apiFetch<ApiResponse<unknown>>(`/api/favorites/${propertyId}`, { method: 'DELETE' }),
};

// Notifications
export const notificationsApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const q = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        )
      : '';
    return apiFetch<PaginatedResponse<Notification>>(`/api/notifications?${q}`);
  },
  count: () => apiFetch<ApiResponse<{ count: number }>>('/api/notifications/count'),
  markRead: (id: number) =>
    apiFetch<ApiResponse<unknown>>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    apiFetch<ApiResponse<unknown>>('/api/notifications/read-all', { method: 'PATCH' }),
};

// Analytics (admin)
export const analyticsApi = {
  overview: () => apiFetch<ApiResponse<Record<string, unknown>>>('/api/admin/analytics/overview'),
  revenue: () => apiFetch<ApiResponse<Record<string, unknown>>>('/api/admin/analytics/revenue'),
  properties: () => apiFetch<ApiResponse<Record<string, unknown>>>('/api/admin/analytics/properties'),
  users: () => apiFetch<ApiResponse<Record<string, unknown>>>('/api/admin/analytics/users'),
  orders: () => apiFetch<ApiResponse<Record<string, unknown>>>('/api/admin/analytics/orders'),
  locations: () => apiFetch<ApiResponse<Record<string, unknown>>>('/api/admin/analytics/locations'),
  recentActivity: (limit = 50) =>
    apiFetch<ApiResponse<unknown[]>>(`/api/admin/analytics/recent-activity?limit=${limit}`),
};
