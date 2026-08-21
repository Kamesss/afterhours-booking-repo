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
  description?: string;
  address: string;
  min_age: number;
  dress_code?: string;
  is_active: number;
  created_at: string;
  // UI helper fields with graceful fallbacks
  area?: string;
  cover_fee_cents?: number;
  music_genres?: string[];
  vibe_tags?: string[];
  hero_image?: string;
  gallery?: string[];
  opening_hours?: string;
  peak_hours?: string;
  curator_rating?: number;
  ambassador_perks?: string[];
  featured?: boolean;
}

export interface TableType {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  min_spend_cents: number;
  deposit_cents: number;
  max_guests: number;
  is_active: number;
  // UI helper fields with graceful fallbacks
  perks?: string[];
  tier_badge?: 'Standard' | 'VIP' | 'Founder' | 'Ultra VIP' | string;
}

export interface ClubTable {
  id: string;
  club_id: string;
  table_type_id: string;
  table_number: string;
  location_description?: string;
  is_active: number;
  // Visual layout position helpers with automatic placement
  x?: number;
  y?: number;
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
  booking_date: string;
  arrival_time: string;
  guest_count: number;
  min_spend_cents: number;
  deposit_paid_cents: number;
  status: BookingStatus;
  special_requests?: string;
  created_at: string;
  qr_code?: string;
  ambassador_promo_code?: string;
  commission_cents?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  payment_method?: 'GCash' | 'Maya' | 'Card' | 'Club Pay at Door' | string;
  checked_in_at?: string;
}

export interface GuestListEntry {
  id: string;
  club_id: string;
  user_id: string;
  event_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  pax: number;
  arrival_time_estimate?: string;
  status: 'valid' | 'checked_in' | 'expired' | 'cancelled';
  qr_code: string;
  ambassador_perk?: string;
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

export const DEFAULT_PROMOS: AmbassadorPromo[] = [
  {
    code: 'CEBUVIP',
    discount_deposit_percent: 15,
    complimentary_item: 'Complimentary Round of Patron Silver Tequila Shots',
    description: '15% off upfront deposit + free tequila shots round',
  },
  {
    code: 'MANGOFRESH',
    discount_deposit_percent: 10,
    complimentary_item: 'VIP Welcome Cocktail Punch Bowl',
    description: '10% off table deposit + welcome punch bowl for table',
  },
  {
    code: 'AFTERHOURS10',
    discount_deposit_percent: 10,
    complimentary_item: 'Free Premium Bottle Sparkler Presentation',
    description: 'VIP Bottle Sparkler show + 10% off deposit',
  }
];

// Cloudflare Workers & D1 Database Environment Bindings
export interface D1Result<T = any> {
  results?: T[];
  success?: boolean;
  meta?: any;
  error?: string;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(colName?: string): Promise<T | null>;
  all<T = any>(): Promise<D1Result<T>>;
  run<T = any>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec<T = any>(query: string): Promise<D1Result<T>>;
}

export interface Env {
  DB: D1Database;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

