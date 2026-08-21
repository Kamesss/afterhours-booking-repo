// ============================================================================
// AFTERHOURS CEBU - CLOUDFLARE D1 SEED DATA DEFINITIONS (Derived from seed.sql)
// ============================================================================
import { User, Venue, TableItem, TableBooking, GuestlistEntry, LedgerTransaction, LedgerPosting } from '../types';

export const SEED_USERS: User[] = [
  // Clubgoers
  {
    id: 'usr_c01',
    email: 'paolo.mendoza@gmail.com',
    hashed_password: '$2b$12$eX4mP1eH4sH3dPWdF0rT3sT1nGCebU01',
    full_name: 'Paolo Mendoza',
    phone_number: '+63 917 849 2011',
    role: 'CUSTOMER',
    promoter_code: null,
    is_active: 1,
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-08-20T10:00:00Z'
  },
  {
    id: 'usr_c02',
    email: 'bea.villanueva@yahoo.com',
    hashed_password: '$2b$12$eX4mP1eH4sH3dPWdF0rT3sT1nGCebU02',
    full_name: 'Bea Villanueva',
    phone_number: '+63 918 331 4092',
    role: 'CUSTOMER',
    promoter_code: null,
    is_active: 1,
    created_at: '2026-08-20T11:00:00Z',
    updated_at: '2026-08-20T11:00:00Z'
  },
  {
    id: 'usr_c03',
    email: 'miguel.tan@gmail.com',
    hashed_password: '$2b$12$eX4mP1eH4sH3dPWdF0rT3sT1nGCebU03',
    full_name: 'Miguel Tan',
    phone_number: '+63 920 554 9912',
    role: 'CUSTOMER',
    promoter_code: null,
    is_active: 1,
    created_at: '2026-08-20T12:00:00Z',
    updated_at: '2026-08-20T12:00:00Z'
  },

  // Promoters with attribution referral codes
  {
    id: 'usr_p01',
    email: 'carlo.vip@afterhours.ph',
    hashed_password: '$2b$12$eX4mP1eH4sH3dPWdF0rT3sT1nGCebU04',
    full_name: 'Carlo De Leon',
    phone_number: '+63 917 552 1199',
    role: 'PROMOTER',
    promoter_code: 'CEBU_VIP_CARLO',
    is_active: 1,
    created_at: '2026-08-15T08:00:00Z',
    updated_at: '2026-08-15T08:00:00Z'
  },
  {
    id: 'usr_p02',
    email: 'nikki.nights@afterhours.ph',
    hashed_password: '$2b$12$eX4mP1eH4sH3dPWdF0rT3sT1nGCebU05',
    full_name: 'Nikki Alcantara',
    phone_number: '+63 922 884 1002',
    role: 'PROMOTER',
    promoter_code: 'NIKKI_NIGHTS',
    is_active: 1,
    created_at: '2026-08-15T09:00:00Z',
    updated_at: '2026-08-15T09:00:00Z'
  },

  // Venue Staff & Management
  {
    id: 'usr_s01',
    email: 'door.kazmik@kazmik.ph',
    hashed_password: '$2b$12$eX4mP1eH4sH3dPWdF0rT3sT1nGCebU06',
    full_name: 'Kazmik Door Bouncer 1',
    phone_number: '+63 917 000 1122',
    role: 'VENUE_STAFF',
    promoter_code: null,
    is_active: 1,
    created_at: '2026-08-10T08:00:00Z',
    updated_at: '2026-08-10T08:00:00Z'
  },
  {
    id: 'usr_m01',
    email: 'manager@trademark.ph',
    hashed_password: '$2b$12$eX4mP1eH4sH3dPWdF0rT3sT1nGCebU07',
    full_name: 'Anton Delgado',
    phone_number: '+63 917 999 8877',
    role: 'VENUE_MANAGER',
    promoter_code: null,
    is_active: 1,
    created_at: '2026-08-10T08:00:00Z',
    updated_at: '2026-08-10T08:00:00Z'
  },
  {
    id: 'usr_adm',
    email: 'ops@afterhours.ph',
    hashed_password: '$2b$12$eX4mP1eH4sH3dPWdF0rT3sT1nGCebU08',
    full_name: 'Platform Superadmin',
    phone_number: '+63 917 111 0000',
    role: 'ADMIN',
    promoter_code: null,
    is_active: 1,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  }
];

export const SEED_VENUES: Venue[] = [
  {
    id: 'ven_kazmik',
    slug: 'kazmik-cebu',
    name: 'Kazmik Club',
    tagline: 'Cebu’s Premiere High-Energy Multi-Level Megaclub',
    address: 'Skyrise 4B Ground Floor, IT Park, Lahug, Cebu City',
    open_time: '21:00',
    close_time: '05:00',
    guestlist_cutoff_time: '23:30',
    max_capacity: 750,
    current_occupancy: 342,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80',
    music_genres: ['EDM', 'Hard Dance', 'Commercial House', 'Tech Trance']
  },
  {
    id: 'ven_trademark',
    slug: 'trademark-cebu',
    name: 'Trademark Cebu',
    tagline: 'Cebu’s Iconic Hip-Hop, R&B & Urban Lifestyle Lounge',
    address: '88th Avenue, Gov. M. Cuenco Ave, Banilad, Cebu City',
    open_time: '21:30',
    close_time: '04:30',
    guestlist_cutoff_time: '23:45',
    max_capacity: 400,
    current_occupancy: 188,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1200&q=80',
    music_genres: ['Hip-Hop', 'Trap', 'Afrobeats', 'RnB Classics']
  },
  {
    id: 'ven_morals',
    slug: 'morals-and-malice',
    name: 'Morals & Malice',
    tagline: 'Artisanal Cocktail Lounge & Botanical Speakeasy',
    address: '2/F BTC Gourmet Court, Gov. M. Cuenco Ave, Banilad, Cebu City',
    open_time: '18:00',
    close_time: '03:00',
    guestlist_cutoff_time: '22:30',
    max_capacity: 160,
    current_occupancy: 89,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80',
    music_genres: ['Deep House', 'Indie Dance', 'Nu Disco', 'Vinyl Lounge']
  },
  {
    id: 'ven_verified',
    slug: 'verified-lounge-cebu',
    name: 'Verified Lounge',
    tagline: 'Cebu Business Park’s Premier Open-Air Roofdeck Lounge',
    address: 'Roofdeck Tower 2, Cebu Business Park, Cebu City',
    open_time: '17:00',
    close_time: '03:30',
    guestlist_cutoff_time: '22:00',
    max_capacity: 300,
    current_occupancy: 124,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    music_genres: ['Sunset House', 'Afro House', 'Melodic Techno', 'Pop Remix']
  },
  {
    id: 'ven_club_icon',
    slug: 'club-icon-cebu',
    name: 'Club ICON',
    tagline: 'The Legendary Mango Square Nightlife Epicenter',
    address: 'Mango Square Mall, Gen. Maxilom Ave, Cebu City',
    open_time: '22:00',
    close_time: '06:00',
    guestlist_cutoff_time: '23:30',
    max_capacity: 800,
    current_occupancy: 510,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    music_genres: ['Big Room', 'Festival Trap', 'Bounce', 'K-Pop Club']
  }
];

export const SEED_TABLES: TableItem[] = [
  // Kazmik Club (IT Park)
  { id: 'tbl_kaz_v01', venue_id: 'ven_kazmik', table_number: 'VIP-01', category: 'VIP_COUCH', capacity: 12, min_spend_php: 35000.00, deposit_required_php: 15000.00, coord_x: 18, coord_y: 25, is_active: 1 },
  { id: 'tbl_kaz_v02', venue_id: 'ven_kazmik', table_number: 'VIP-02', category: 'VIP_COUCH', capacity: 12, min_spend_php: 35000.00, deposit_required_php: 15000.00, coord_x: 82, coord_y: 25, is_active: 1 },
  { id: 'tbl_kaz_f01', venue_id: 'ven_kazmik', table_number: 'FLR-01', category: 'DANCEFLOOR_HIGH', capacity: 8, min_spend_php: 20000.00, deposit_required_php: 8000.00, coord_x: 32, coord_y: 55, is_active: 1 },
  { id: 'tbl_kaz_f02', venue_id: 'ven_kazmik', table_number: 'FLR-02', category: 'DANCEFLOOR_HIGH', capacity: 8, min_spend_php: 20000.00, deposit_required_php: 8000.00, coord_x: 68, coord_y: 55, is_active: 1 },
  { id: 'tbl_kaz_c01', venue_id: 'ven_kazmik', table_number: 'COCKTAIL-1', category: 'COCKTAIL', capacity: 5, min_spend_php: 10000.00, deposit_required_php: 4000.00, coord_x: 50, coord_y: 78, is_active: 1 },
  { id: 'tbl_kaz_own', venue_id: 'ven_kazmik', table_number: 'OWNER-01', category: 'OWNER_BOOTH', capacity: 10, min_spend_php: 50000.00, deposit_required_php: 20000.00, coord_x: 50, coord_y: 12, is_active: 1 },

  // Trademark Cebu (Banilad)
  { id: 'tbl_tm_v01', venue_id: 'ven_trademark', table_number: 'VIP-BOOTH-1', category: 'VIP_COUCH', capacity: 10, min_spend_php: 25000.00, deposit_required_php: 10000.00, coord_x: 22, coord_y: 30, is_active: 1 },
  { id: 'tbl_tm_v02', venue_id: 'ven_trademark', table_number: 'VIP-BOOTH-2', category: 'VIP_COUCH', capacity: 10, min_spend_php: 25000.00, deposit_required_php: 10000.00, coord_x: 78, coord_y: 30, is_active: 1 },
  { id: 'tbl_tm_h01', venue_id: 'ven_trademark', table_number: 'HIGH-01', category: 'DANCEFLOOR_HIGH', capacity: 4, min_spend_php: 12000.00, deposit_required_php: 5000.00, coord_x: 40, coord_y: 65, is_active: 1 },
  { id: 'tbl_tm_h02', venue_id: 'ven_trademark', table_number: 'HIGH-02', category: 'DANCEFLOOR_HIGH', capacity: 4, min_spend_php: 12000.00, deposit_required_php: 5000.00, coord_x: 60, coord_y: 65, is_active: 1 },

  // Morals & Malice (BTC)
  { id: 'tbl_mm_l01', venue_id: 'ven_morals', table_number: 'LOUNGE-A', category: 'VIP_COUCH', capacity: 8, min_spend_php: 18000.00, deposit_required_php: 6000.00, coord_x: 28, coord_y: 40, is_active: 1 },
  { id: 'tbl_mm_l02', venue_id: 'ven_morals', table_number: 'LOUNGE-B', category: 'VIP_COUCH', capacity: 8, min_spend_php: 18000.00, deposit_required_php: 6000.00, coord_x: 72, coord_y: 40, is_active: 1 },
  { id: 'tbl_mm_b01', venue_id: 'ven_morals', table_number: 'BAR-TABLE', category: 'COCKTAIL', capacity: 4, min_spend_php: 8000.00, deposit_required_php: 3000.00, coord_x: 50, coord_y: 70, is_active: 1 },

  // Verified Lounge (Cebu Business Park)
  { id: 'tbl_ver_cab1', venue_id: 'ven_verified', table_number: 'CABANA-1', category: 'VIP_COUCH', capacity: 8, min_spend_php: 22000.00, deposit_required_php: 8000.00, coord_x: 20, coord_y: 35, is_active: 1 },
  { id: 'tbl_ver_cab2', venue_id: 'ven_verified', table_number: 'CABANA-2', category: 'VIP_COUCH', capacity: 8, min_spend_php: 22000.00, deposit_required_php: 8000.00, coord_x: 80, coord_y: 35, is_active: 1 },
  { id: 'tbl_ver_ter1', venue_id: 'ven_verified', table_number: 'TERRACE-1', category: 'COCKTAIL', capacity: 6, min_spend_php: 12000.00, deposit_required_php: 5000.00, coord_x: 50, coord_y: 60, is_active: 1 },

  // Club ICON (Mango Square)
  { id: 'tbl_icon_v01', venue_id: 'ven_club_icon', table_number: 'VIP-CENTER-1', category: 'VIP_COUCH', capacity: 12, min_spend_php: 30000.00, deposit_required_php: 12000.00, coord_x: 30, coord_y: 25, is_active: 1 },
  { id: 'tbl_icon_v02', venue_id: 'ven_club_icon', table_number: 'VIP-CENTER-2', category: 'VIP_COUCH', capacity: 12, min_spend_php: 30000.00, deposit_required_php: 12000.00, coord_x: 70, coord_y: 25, is_active: 1 },
  { id: 'tbl_icon_h01', venue_id: 'ven_club_icon', table_number: 'RING-HIGH-1', category: 'DANCEFLOOR_HIGH', capacity: 5, min_spend_php: 10000.00, deposit_required_php: 4000.00, coord_x: 50, coord_y: 60, is_active: 1 }
];

export const SEED_BOOKINGS: TableBooking[] = [
  {
    id: 'bk_001',
    booking_ref: 'AH-KAZ-9182',
    venue_id: 'ven_kazmik',
    table_id: 'tbl_kaz_v01',
    user_id: 'usr_c01',
    target_date: '2026-08-21',
    guest_count: 10,
    deposit_amount_php: 15000.00,
    min_spend_php: 35000.00,
    status: 'CONFIRMED',
    idempotency_key: 'idemp_bk_9182_a8f9c1',
    hold_expires_at: '2026-08-21T21:10:00Z',
    promoter_code: 'CEBU_VIP_CARLO',
    payment_method: 'GCASH',
    payment_reference: 'PAYMONGO_CH_994102910',
    checked_in_at: null,
    created_at: '2026-08-21T11:00:00Z'
  },
  {
    id: 'bk_002',
    booking_ref: 'AH-TM-4412',
    venue_id: 'ven_trademark',
    table_id: 'tbl_tm_v01',
    user_id: 'usr_c02',
    target_date: '2026-08-21',
    guest_count: 8,
    deposit_amount_php: 10000.00,
    min_spend_php: 25000.00,
    status: 'CHECKED_IN',
    idempotency_key: 'idemp_bk_4412_d7b3e2',
    hold_expires_at: '2026-08-21T21:40:00Z',
    promoter_code: 'NIKKI_NIGHTS',
    payment_method: 'MAYA',
    payment_reference: 'MAYA_REF_881920311',
    checked_in_at: '2026-08-21T22:45:10Z',
    created_at: '2026-08-21T11:30:00Z'
  }
];

export const SEED_GUESTLISTS: GuestlistEntry[] = [
  {
    id: 'gl_001',
    pass_ref: 'GL-KAZ-1049',
    venue_id: 'ven_kazmik',
    user_id: 'usr_c02',
    target_date: '2026-08-21',
    guest_count: 2,
    promoter_code: 'CEBU_VIP_CARLO',
    status: 'ACTIVE',
    cutoff_time: '23:30',
    checked_in_at: null,
    created_at: '2026-08-21T14:00:00Z'
  },
  {
    id: 'gl_002',
    pass_ref: 'GL-TM-7714',
    venue_id: 'ven_trademark',
    user_id: 'usr_c03',
    target_date: '2026-08-21',
    guest_count: 1,
    promoter_code: 'NIKKI_NIGHTS',
    status: 'CHECKED_IN',
    cutoff_time: '23:45',
    checked_in_at: '2026-08-21T23:12:44Z',
    created_at: '2026-08-21T15:20:00Z'
  },
  {
    id: 'gl_003',
    pass_ref: 'GL-ICON-9011',
    venue_id: 'ven_club_icon',
    user_id: 'usr_c01',
    target_date: '2026-08-21',
    guest_count: 1,
    promoter_code: null,
    status: 'EXPIRED_CUTOFF',
    cutoff_time: '23:30',
    checked_in_at: null,
    created_at: '2026-08-21T09:00:00Z'
  }
];

export const SEED_LEDGER_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'tx_001',
    transaction_ref: 'TXN-20260821-0001',
    reference_type: 'TABLE_DEPOSIT',
    reference_id: 'bk_001',
    idempotency_key: 'idemp_bk_9182_a8f9c1',
    description: 'Table deposit hold for Kazmik VIP-01 (Promoter: CEBU_VIP_CARLO)',
    previous_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    block_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    timestamp: '2026-08-21T11:00:00Z'
  }
];

export const SEED_LEDGER_POSTINGS: LedgerPosting[] = [
  {
    id: 'post_001',
    transaction_id: 'tx_001',
    account: 'CASH_GATEWAY_RECEIVABLE',
    posting_type: 'DEBIT',
    amount_php: 15000.00
  },
  {
    id: 'post_002',
    transaction_id: 'tx_001',
    account: 'VENUE_PAYOUT_PAYABLE',
    posting_type: 'CREDIT',
    amount_php: 12960.00
  },
  {
    id: 'post_003',
    transaction_id: 'tx_001',
    account: 'PROMOTER_COMMISSION_PAYABLE',
    posting_type: 'CREDIT',
    amount_php: 1500.00
  },
  {
    id: 'post_004',
    transaction_id: 'tx_001',
    account: 'PLATFORM_REVENUE',
    posting_type: 'CREDIT',
    amount_php: 540.00
  }
];
