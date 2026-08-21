import { Club, TableType, ClubTable, Booking, GuestListEntry, User } from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'usr_guest1',
    name: 'Marco Villamor',
    email: 'marco.cebu@gmail.com',
    phone: '+63 917 555 1201',
    role: 'user',
    created_at: '2026-01-10 18:00:00',
  },
  {
    id: 'usr_owner_sentral',
    name: 'Gianluca Rossi (Sentral GM)',
    email: 'gm@sentralcebu.ph',
    phone: '+63 918 888 2020',
    role: 'club_admin',
    created_at: '2026-01-01 10:00:00',
  },
  {
    id: 'usr_superadmin',
    name: 'AfterHours Cebu Admin',
    email: 'curator@afterhours.ph',
    phone: '+63 917 000 9999',
    role: 'superadmin',
    created_at: '2026-01-01 00:00:00',
  },
];

export const SEED_CLUBS: Club[] = [
  {
    id: 'clb_sentral',
    owner_id: 'usr_owner_sentral',
    name: 'Sentral Bar & Lounge',
    slug: 'sentral-bar-lounge',
    description: 'Cebu’s longest-standing iconic high-energy nightlife venue. Featuring international guest DJs, world-class Funktion-One acoustics, VIP mezzanine booths, and Cebu’s top festival crowds.',
    address: 'Nivel Hills, Lahug, Cebu City',
    min_age: 18,
    dress_code: 'Smart Casual (No slippers or jerseys)',
    is_active: 1,
    created_at: '2026-01-01 00:00:00',
    area: 'Lahug / Nivel Hills',
    cover_fee_cents: 50000,
    curator_rating: 4.9,
    featured: true,
    music_genres: ['EDM', 'Commercial', 'Festival Anthems', 'Tech House'],
    vibe_tags: ['High-Energy', 'Main Room', 'VIP Bottle Service', 'Celebrity Crowd'],
    hero_image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=800&q=80',
    ],
    opening_hours: 'Wed - Sun | 10:00 PM – 5:00 AM',
    peak_hours: '12:30 AM – 3:30 AM',
    ambassador_perks: [
      '⚡ Express VIP Skip-the-Line Door Access',
      '🍸 Complimentary Round of Tequila Shots for Table Bookings',
      '🎉 Sparkler Presentation with Bottle Orders'
    ],
  },
  {
    id: 'clb_trademark',
    owner_id: 'usr_owner_sentral',
    name: 'Trademark Cebu',
    slug: 'trademark-cebu',
    description: 'The underground epicenter for Hip-Hop, Afrobeats, and R&B enthusiasts. Renowned for curated craft mixology, intimate booth layouts, and after-hours baseline sets.',
    address: '88th Avenue, Gov. M. Cuenco Ave, Banilad, Cebu City',
    min_age: 18,
    dress_code: 'Fashion Forward / Smart Casual',
    is_active: 1,
    created_at: '2026-01-02 00:00:00',
    area: 'Banilad / 88th Ave',
    cover_fee_cents: 40000,
    curator_rating: 4.8,
    featured: true,
    music_genres: ['Hip-Hop', 'RnB', 'Afrobeats', 'Throwback Hits'],
    vibe_tags: ['Intimate', 'Craft Cocktails', 'Urban Chic', 'Late Night'],
    hero_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
    ],
    opening_hours: 'Thu - Sat | 9:30 PM – 4:30 AM',
    peak_hours: '12:00 AM – 3:00 AM',
    ambassador_perks: [
      '⚡ Free Ambassador Door Entry (Before 11:30 PM)',
      '🍹 15% Off VIP Table Upfront Deposit',
      '🥃 Welcome Cocktail Punch Bowl for Table Guests'
    ],
  },
  {
    id: 'clb_loft',
    owner_id: 'usr_owner_sentral',
    name: 'Loft Sky Bar & Nightclub',
    slug: 'loft-sky-bar',
    description: 'Open-air panoramic rooftop sky club perched high above IT Park. Features sunset warmups, deep house sessions, and VIP cabanas under the Cebu city stars.',
    address: 'IT Park Sky Tower, Lahug, Cebu City',
    min_age: 20,
    dress_code: 'Upscale / Cocktail Attire',
    is_active: 1,
    created_at: '2026-01-03 00:00:00',
    area: 'Cebu IT Park',
    cover_fee_cents: 60000,
    curator_rating: 4.9,
    featured: true,
    music_genres: ['Deep House', 'Melodic Techno', 'Nu-Disco', 'Afro House'],
    vibe_tags: ['Rooftop Skyline', 'Sunset Cocktails', 'Open Air', 'Luxury'],
    hero_image: 'https://images.unsplash.com/photo-1570872626485-d8ffea69f463?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80'
    ],
    opening_hours: 'Tue - Sun | 8:00 PM – 4:00 AM',
    peak_hours: '11:00 PM – 2:30 AM',
    ambassador_perks: [
      '⚡ Reserved VIP Skyline Cabana Priority',
      '🥂 Complimentary Welcome Prosecco Flutes for Ladies',
      '✨ Dedicated Host & Butler Service'
    ],
  },
  {
    id: 'clb_verified',
    owner_id: 'usr_owner_sentral',
    name: 'Verified Lounge & Club',
    slug: 'verified-lounge-club',
    description: 'Ultra-modern boutique lounge featuring immersive 360-degree LED ceilings, premium Japanese whiskey collections, and curated VIP cocktail service.',
    address: 'Bonifacio District, F. Cabahug St, Kasambagan, Cebu City',
    min_age: 18,
    dress_code: 'Smart Casual (Collared shirts / Stylish dress)',
    is_active: 1,
    created_at: '2026-01-04 00:00:00',
    area: 'Bonifacio District',
    cover_fee_cents: 35000,
    curator_rating: 4.7,
    featured: false,
    music_genres: ['Tech House', 'Nu-Disco', 'Open Format'],
    vibe_tags: ['LED Visuals', 'Boutique Lounge', 'Craft Spirits'],
    hero_image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    opening_hours: 'Wed - Sun | 9:00 PM – 4:00 AM',
    peak_hours: '11:30 PM – 2:30 AM',
    ambassador_perks: [
      '⚡ Express Door Bypass Pass',
      '🍸 10% Discount on Bottle Service'
    ],
  }
];

export const SEED_TABLE_TYPES: TableType[] = [
  // Sentral Table Types
  {
    id: 'tt_sentral_std',
    club_id: 'clb_sentral',
    name: 'Cocktail High Table',
    description: 'Standing high table with bar stools on main floor with direct line of sight to the DJ booth.',
    min_spend_cents: 400000, // ₱4,000
    deposit_cents: 100000,   // ₱1,000
    max_guests: 4,
    is_active: 1,
    perks: ['100% Consumable on Drinks & Bottles', 'Direct DJ View', 'Express Entry for 4'],
    tier_badge: 'Standard',
  },
  {
    id: 'tt_sentral_vip',
    club_id: 'clb_sentral',
    name: 'VIP Dancefloor Sofa Booth',
    description: 'Plush leather booth directly adjacent to the main dancefloor with dedicated server.',
    min_spend_cents: 800000, // ₱8,000
    deposit_cents: 200000,   // ₱2,000
    max_guests: 8,
    is_active: 1,
    perks: ['100% Consumable F&B', 'Dedicated VIP Host & Waiter', 'VIP Queue Bypass for 8', 'Complimentary Mixers'],
    tier_badge: 'VIP',
  },
  {
    id: 'tt_sentral_ultra',
    club_id: 'clb_sentral',
    name: 'Stage Master VIP Booth',
    description: 'Elevated luxury booth right behind the DJ stage with panoramic room views.',
    min_spend_cents: 1500000, // ₱15,000
    deposit_cents: 300000,    // ₱3,000
    max_guests: 12,
    is_active: 1,
    perks: ['100% Consumable on Premium Spirits & Champagne', 'DJ Stage Access', 'Bottle Sparkler Show', 'VIP Security Escort'],
    tier_badge: 'Ultra VIP',
  },

  // Trademark Table Types
  {
    id: 'tt_tm_couch',
    club_id: 'clb_trademark',
    name: 'Main Room Booth',
    description: 'Comfortable booth seating in the central lounge area.',
    min_spend_cents: 500000,
    deposit_cents: 150000,
    max_guests: 6,
    is_active: 1,
    perks: ['100% Consumable', 'Express Entry for 6', 'Dedicated Service'],
    tier_badge: 'VIP',
  },
  {
    id: 'tt_tm_owners',
    club_id: 'clb_trademark',
    name: 'Owner’s Corner Booth',
    description: 'Secluded corner VIP booth with prime visibility across the entire club.',
    min_spend_cents: 1000000,
    deposit_cents: 250000,
    max_guests: 10,
    is_active: 1,
    perks: ['100% Consumable', 'Champagne Bucket & Ice Setup', 'Sparkler Presentation'],
    tier_badge: 'Ultra VIP',
  },

  // Loft Sky Bar Table Types
  {
    id: 'tt_loft_cabana',
    club_id: 'clb_loft',
    name: 'Skyline Skyline Cabana',
    description: 'Private open-air glass railing cabana overlooking Cebu IT Park skyline.',
    min_spend_cents: 1200000,
    deposit_cents: 300000,
    max_guests: 8,
    is_active: 1,
    perks: ['100% Consumable', 'Private Skyline View', 'Butler Bottle Service', 'Complimentary Welcome Prosecco'],
    tier_badge: 'Ultra VIP',
  },
  {
    id: 'tt_loft_deck',
    club_id: 'clb_loft',
    name: 'Rooftop Lounge Table',
    description: 'Central deck seating under festoon fairy lights and open stars.',
    min_spend_cents: 600000,
    deposit_cents: 150000,
    max_guests: 5,
    is_active: 1,
    perks: ['100% Consumable', 'Express Sky-Elevator Access'],
    tier_badge: 'VIP',
  },

  // Verified Table Types
  {
    id: 'tt_ver_booth',
    club_id: 'clb_verified',
    name: 'Boutique LED Booth',
    description: 'Intimate leather seating beneath illuminated kinetic LED ceiling.',
    min_spend_cents: 500000,
    deposit_cents: 100000,
    max_guests: 6,
    is_active: 1,
    perks: ['100% Consumable', 'VIP Host Entry'],
    tier_badge: 'VIP',
  }
];

export const SEED_CLUB_TABLES: ClubTable[] = [
  // Sentral Tables
  { id: 'tbl_s_01', club_id: 'clb_sentral', table_type_id: 'tt_sentral_ultra', table_number: 'VIP-01 (Stage Left)', location_description: 'Elevated Stage Left', is_active: 1, x: 22, y: 22, width: 65, height: 42, shape: 'booth' },
  { id: 'tbl_s_02', club_id: 'clb_sentral', table_type_id: 'tt_sentral_ultra', table_number: 'VIP-02 (Stage Right)', location_description: 'Elevated Stage Right', is_active: 1, x: 78, y: 22, width: 65, height: 42, shape: 'booth' },
  { id: 'tbl_s_03', club_id: 'clb_sentral', table_type_id: 'tt_sentral_vip', table_number: 'DF-01', location_description: 'Dancefloor Front Center', is_active: 1, x: 30, y: 48, width: 55, height: 38, shape: 'booth' },
  { id: 'tbl_s_04', club_id: 'clb_sentral', table_type_id: 'tt_sentral_vip', table_number: 'DF-02', location_description: 'Dancefloor Front Right', is_active: 1, x: 70, y: 48, width: 55, height: 38, shape: 'booth' },
  { id: 'tbl_s_05', club_id: 'clb_sentral', table_type_id: 'tt_sentral_vip', table_number: 'MZ-01', location_description: 'Mezzanine Raised Tier', is_active: 1, x: 18, y: 70, width: 52, height: 36, shape: 'booth' },
  { id: 'tbl_s_06', club_id: 'clb_sentral', table_type_id: 'tt_sentral_std', table_number: 'HT-01', location_description: 'Main Bar High Table', is_active: 1, x: 42, y: 74, width: 34, height: 34, shape: 'circle' },
  { id: 'tbl_s_07', club_id: 'clb_sentral', table_type_id: 'tt_sentral_std', table_number: 'HT-02', location_description: 'Main Bar High Table', is_active: 1, x: 58, y: 74, width: 34, height: 34, shape: 'circle' },
  { id: 'tbl_s_08', club_id: 'clb_sentral', table_type_id: 'tt_sentral_std', table_number: 'HT-03', location_description: 'Main Bar High Table', is_active: 1, x: 82, y: 70, width: 34, height: 34, shape: 'circle' },

  // Trademark Tables
  { id: 'tbl_tm_01', club_id: 'clb_trademark', table_type_id: 'tt_tm_owners', table_number: 'TM-OWNER-01', location_description: 'VIP Corner', is_active: 1, x: 25, y: 25, width: 65, height: 40, shape: 'booth' },
  { id: 'tbl_tm_02', club_id: 'clb_trademark', table_type_id: 'tt_tm_couch', table_number: 'TM-BTH-01', location_description: 'Central Lounge', is_active: 1, x: 75, y: 30, width: 55, height: 38, shape: 'booth' },
  { id: 'tbl_tm_03', club_id: 'clb_trademark', table_type_id: 'tt_tm_couch', table_number: 'TM-BTH-02', location_description: 'Bar Side', is_active: 1, x: 50, y: 65, width: 55, height: 38, shape: 'booth' },

  // Loft Sky Bar Tables
  { id: 'tbl_lft_01', club_id: 'clb_loft', table_type_id: 'tt_loft_cabana', table_number: 'CABANA-01', location_description: 'North Skyline View', is_active: 1, x: 25, y: 25, width: 68, height: 45, shape: 'booth' },
  { id: 'tbl_lft_02', club_id: 'clb_loft', table_type_id: 'tt_loft_cabana', table_number: 'CABANA-02', location_description: 'South Skyline View', is_active: 1, x: 75, y: 25, width: 68, height: 45, shape: 'booth' },
  { id: 'tbl_lft_03', club_id: 'clb_loft', table_type_id: 'tt_loft_deck', table_number: 'DECK-01', location_description: 'Center Deck', is_active: 1, x: 50, y: 65, width: 50, height: 36, shape: 'booth' },

  // Verified Tables
  { id: 'tbl_ver_01', club_id: 'clb_verified', table_type_id: 'tt_ver_booth', table_number: 'V-01', location_description: 'LED Main Room', is_active: 1, x: 35, y: 35, width: 55, height: 40, shape: 'booth' },
  { id: 'tbl_ver_02', club_id: 'clb_verified', table_type_id: 'tt_ver_booth', table_number: 'V-02', location_description: 'LED Main Room', is_active: 1, x: 65, y: 35, width: 55, height: 40, shape: 'booth' },
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'bkg_sentral_101',
    club_id: 'clb_sentral',
    table_id: 'tbl_s_01',
    user_id: 'usr_guest1',
    booking_date: new Date().toISOString().split('T')[0],
    arrival_time: '23:30',
    guest_count: 8,
    min_spend_cents: 1500000, // ₱15,000
    deposit_paid_cents: 300000, // ₱3,000
    status: 'confirmed',
    special_requests: 'Birthday celebration with bottle sparkler show',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    qr_code: 'AH-CLB_SENTRAL-101',
    ambassador_promo_code: 'CEBUVIP',
    commission_cents: 150000,
    customer_name: 'Marco Villamor',
    customer_email: 'marco.cebu@gmail.com',
    customer_phone: '+63 917 555 1201',
    payment_method: 'GCash',
  },
  {
    id: 'bkg_sentral_102',
    club_id: 'clb_sentral',
    table_id: 'tbl_s_04',
    user_id: 'usr_guest1',
    booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    arrival_time: '00:00',
    guest_count: 6,
    min_spend_cents: 800000,
    deposit_paid_cents: 200000,
    status: 'confirmed',
    special_requests: 'VIP bottle queue bypass',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    qr_code: 'AH-CLB_SENTRAL-102',
    ambassador_promo_code: 'MANGOFRESH',
    commission_cents: 80000,
    customer_name: 'Marco Villamor',
    customer_email: 'marco.cebu@gmail.com',
    customer_phone: '+63 917 555 1201',
    payment_method: 'Maya',
  }
];

export const SEED_GUESTLIST: GuestListEntry[] = [
  {
    id: 'gl_trademark_201',
    club_id: 'clb_trademark',
    user_id: 'usr_guest1',
    event_date: new Date().toISOString().split('T')[0],
    guest_name: 'Marco Villamor',
    guest_email: 'marco.cebu@gmail.com',
    guest_phone: '+63 917 555 1201',
    pax: 2,
    arrival_time_estimate: '23:00',
    status: 'valid',
    qr_code: 'AH-GL-201',
    ambassador_perk: '⚡ Free Ambassador VIP Entry + Express Queue',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
];
