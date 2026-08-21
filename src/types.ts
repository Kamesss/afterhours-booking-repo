// ============================================================================
// AFTERHOURS CEBU NIGHTLIFE AUTOMATION - TYPES & D1 SCHEMA DEFINITION
// ============================================================================

export type UserRole = 'CUSTOMER' | 'PROMOTER' | 'VENUE_STAFF' | 'VENUE_MANAGER' | 'ADMIN';

export interface User {
  id: string;                               // UUIDv4 or string e.g. 'usr_c01'
  email: string;
  hashed_password?: string;
  full_name: string;
  phone_number: string;                    // e.g. '+63 917 849 2011'
  role: UserRole;
  promoter_code?: string | null;           // e.g. 'CEBU_VIP_CARLO'
  is_active: number;                       // 1 = true, 0 = false
  created_at?: string;
  updated_at?: string;
}

export interface Venue {
  id: string;                               // 'ven_kazmik', 'ven_trademark'
  slug: string;                             // 'kazmik-cebu'
  name: string;                             // 'Kazmik Club'
  tagline?: string | null;
  address: string;                          // 'Skyrise 4B Ground Floor, IT Park, Lahug, Cebu City'
  open_time: string;                        // '21:00' (9:00 PM)
  close_time: string;                       // '05:00' (5:00 AM cross-midnight)
  guestlist_cutoff_time: string;            // '23:30' (11:30 PM)
  max_capacity: number;                     // e.g. 750
  current_occupancy: number;                // Live gate headcount
  is_active: number;
  created_at?: string;
  image_url?: string;                       // Visual asset helper
  music_genres?: string[];                  // Visual badge helper
}

export type TableCategory = 'VIP_COUCH' | 'DANCEFLOOR_HIGH' | 'COCKTAIL' | 'OWNER_BOOTH';

export interface TableItem {
  id: string;                               // 'tbl_kaz_v01'
  venue_id: string;
  table_number: string;                     // 'VIP-01', 'B-14'
  category: TableCategory;
  capacity: number;                         // Max guests (e.g. 10)
  min_spend_php: number;                    // Consumable minimum spend (e.g. 25000.00)
  deposit_required_php: number;             // Upfront lock deposit (e.g. 10000.00)
  coord_x: number;                          // 2D Floor plan X % (0-100)
  coord_y: number;                          // 2D Floor plan Y % (0-100)
  is_active: number;
}

export type BookingStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'EXPIRED';
export type PaymentMethod = 'GCASH' | 'MAYA' | 'CARD';

export interface TableBooking {
  id: string;
  booking_ref: string;                      // 'AH-CEB-8921'
  venue_id: string;
  table_id: string;
  user_id: string;
  target_date: string;                      // 'YYYY-MM-DD'
  guest_count: number;
  deposit_amount_php: number;
  min_spend_php: number;
  status: BookingStatus;
  idempotency_key: string;
  hold_expires_at?: string | null;          // ISO string (10m countdown)
  promoter_code?: string | null;
  payment_method?: PaymentMethod | string | null;
  payment_reference?: string | null;
  checked_in_at?: string | null;
  created_at?: string;
  
  // Joined/client display helpers
  venue?: Venue;
  table?: TableItem;
  user?: User;
}

export type GuestlistStatus = 'ACTIVE' | 'CHECKED_IN' | 'EXPIRED_CUTOFF' | 'REVOKED';

export interface GuestlistEntry {
  id: string;
  pass_ref: string;                         // 'GL-KAZ-4109'
  venue_id: string;
  user_id: string;
  target_date: string;                      // 'YYYY-MM-DD'
  guest_count: number;
  promoter_code?: string | null;
  status: GuestlistStatus;
  cutoff_time: string;                      // '23:30'
  checked_in_at?: string | null;
  created_at?: string;

  // Joined/client display helpers
  venue?: Venue;
  user?: User;
}

export type LedgerReferenceType = 'TABLE_DEPOSIT' | 'PROMOTER_BOUNTY' | 'REFUND' | 'DOOR_COVER';

export interface LedgerTransaction {
  id: string;
  transaction_ref: string;                  // 'TXN-20260821-0001'
  reference_type: LedgerReferenceType;
  reference_id: string;                     // booking_id or guestlist_id
  idempotency_key: string;
  description: string;
  previous_hash: string;                    // SHA-256 block chaining
  block_hash: string;                       // Cryptographic seal
  timestamp?: string;
  postings?: LedgerPosting[];
}

export type LedgerAccount = 
  | 'CASH_GATEWAY_RECEIVABLE'
  | 'USER_DEPOSIT_HOLDING'
  | 'VENUE_PAYOUT_PAYABLE'
  | 'PROMOTER_COMMISSION_PAYABLE'
  | 'PLATFORM_REVENUE';

export type PostingType = 'DEBIT' | 'CREDIT';

export interface LedgerPosting {
  id: string;
  transaction_id: string;
  account: LedgerAccount;
  posting_type: PostingType;
  amount_php: number;
}

// ----------------------------------------------------------------------------
// CLOUDFLARE D1 BINDING INTERFACES
// ----------------------------------------------------------------------------

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run<T = unknown>(): Promise<D1Response>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta?: any;
  error?: string;
}

export interface D1Response {
  success: boolean;
  meta?: any;
  error?: string;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec<T = unknown>(query: string): Promise<D1Response>;
}

export interface Env {
  DB: D1Database;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export interface D1FullExport {
  users: User[];
  venues: Venue[];
  tables: TableItem[];
  table_bookings: TableBooking[];
  guestlists: GuestlistEntry[];
  ledger_transactions: LedgerTransaction[];
  ledger_postings: LedgerPosting[];
  timestamp: string;
  version: string;
}
