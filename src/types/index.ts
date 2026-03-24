// Shared types matching backend API responses

export type UserRole = 'admin' | 'broker' | 'client';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  profile_picture_url?: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export type ListingType = 'sale' | 'rent';
export type PropertyOrigin = 'primary' | 'resale';
export type FinishingType = 'core_and_shell' | 'semi_finished' | 'fully_finished' | 'furnished';
export type LegalStatus = 'registered' | 'primary_contract' | 'unregistered';
export type PropertyStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'sold'
  | 'rented'
  | 'inactive';

export interface Category {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  slug: string;
}

export interface Amenity {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
}

export interface Location {
  id: number;
  name_ar: string;
  name_en: string;
  name?: string;
  parent_id: number | null;
  location_type: string;
  children?: Location[];
}

export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Property {
  id: number;
  user_id: number;
  category_id: number;
  location_id: number;
  project_id?: number | null;
  developer_id?: number | null;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en?: string;
  listing_type: ListingType;
  property_origin: PropertyOrigin;
  finishing_type: FinishingType;
  legal_status: LegalStatus;
  price: number;
  currency?: string;
  down_payment?: number | null;
  installment_years?: number;
  delivery_date?: string | null;
  maintenance_deposit?: number | null;
  commission_percentage?: number;
  area_sqm: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_level?: number | null;
  status: PropertyStatus;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined fields
  category_name_ar?: string;
  category_name_en?: string;
  location_name_ar?: string;
  location_name_en?: string;
  developer_name_ar?: string;
  developer_name_en?: string;
  project_name_ar?: string;
  project_name_en?: string;
  primary_image?: string | null;
  images?: PropertyImage[];
  amenities?: Amenity[];
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  client_id: number;
  property_id: number;
  total_amount: number;
  status: OrderStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  is_seller?: boolean;
  buyer_first_name?: string;
  buyer_last_name?: string;
  property?: Property;
  client?: User;
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: number;
  order_id: number;
  amount: number;
  due_date: string;
  status: InvoiceStatus;
  payment_method?: string | null;
  created_at: string;
  order?: Order;
}

export interface Notification {
  id: number;
  user_id: number;
  event_type: string;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  reference_type?: string | null;
  reference_id?: number | null;
  is_read: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
