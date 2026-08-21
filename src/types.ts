export type UserRole = 'user' | 'club_admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface Club {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  area: 'Mango Square' | 'Cebu IT Park' | 'Crossroads Banilad' | 'Baseline Mango' | 'Mandaue / Reclamation';
  min_age: number;
  dress_code: string;
  is_active: number;
  created_at: string;
  // Enhanced metadata for Ambassador platform
  cover_fee_cents: number;
  music_genres: string[];
  vibe_tags: string[];
  hero_image: string;
  gallery: string[];
  opening_hours: string;
  peak_hours: string;
  curator_rating: number;
  ambassador_perks: string[];
  featured?: boolean;
}

export interface TableType {
  id: string;
  club_id: string;
  name: string;
  description: string;
  min_spend_cents: number; // in Philippine centavos (e.g. 500000 = ₱5,000.00)
  deposit_cents: number;   // in Philippine centavos (e.g. 150000 = ₱1,500.00)
  max_guests: number;
  is_active: number;
  perks: string[];
  tier_badge: 'Standard' | 'VIP' | 'Founder' | 'Ultra VIP';
}

export interface ClubTable {
  id: string;
  club_id: string;
  table_type_id: string;
  table_number: string;
  location_description: string;
  is_active: number;
  // Visual floor map coordinates (0-100 percentage)
  x: number;
  y: number;
  width?: number;
  height?: number;
  shape?: 'rect' | 'circle' | 'booth';
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';

export interface Booking {
  id: string;
  club_id: string;
  table_id: string;
  user_id: string;
  booking_date: string; // YYYY-MM-DD
  arrival_time: string; // HH:MM (e.g., '22:30')
  guest_count: number;
  min_spend_cents: number;
  deposit_paid_cents: number;
  status: BookingStatus;
  special_requests?: string;
  created_at: string;
  // Ambassador platform fields
  qr_code: string;
  ambassador_promo_code?: string;
  commission_cents: number; // AfterHours 10% commission on min spend or deposit
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: 'GCash' | 'Maya' | 'Card' | 'Club Pay at Door';
  checked_in_at?: string;
}

export interface GuestListEntry {
  id: string;
  club_id: string;
  user_id: string;
  event_date: string; // YYYY-MM-DD
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  pax: number;
  arrival_time_estimate: string;
  status: 'valid' | 'checked_in' | 'expired' | 'cancelled';
  qr_code: string;
  ambassador_perk: string;
  created_at: string;
  checked_in_at?: string;
}

export interface AmbassadorPromo {
  code: string;
  discount_deposit_percent: number;
  complimentary_item: string;
  club_id?: string;
  description: string;
}
