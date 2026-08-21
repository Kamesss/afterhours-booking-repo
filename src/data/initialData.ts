import { Club, TableType, ClubTable, Booking, GuestListEntry, User, AmbassadorPromo } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_guest1',
    name: 'Marco Villamor',
    email: 'marco.cebu@gmail.com',
    phone: '+63 917 555 1201',
    role: 'user',
    created_at: '2026-08-15 14:20:00',
  },
  {
    id: 'usr_admin_apex',
    name: 'Apex Club Management',
    email: 'admin@apexcebu.com',
    phone: '+63 917 888 9911',
    role: 'club_admin',
    created_at: '2026-08-01 10:00:00',
  },
  {
    id: 'usr_superadmin',
    name: 'AfterHours HQ SuperAdmin',
    email: 'admin@afterhours.ph',
    phone: '+63 918 999 0000',
    role: 'superadmin',
    created_at: '2026-08-01 08:00:00',
  }
];

export const INITIAL_CLUBS: Club[] = [
  {
    id: 'clb_apex',
    owner_id: 'usr_admin_apex',
    name: 'Club Apex Cebu',
    slug: 'club-apex-cebu',
    description: 'Cebu\'s mega-nightclub destination featuring world-class acoustic engineering, a 20-meter 4K LED kinetic chandelier, and heavyweight guest DJ sets.',
    address: 'City Time Square, Tipolo, Mandaue City / Cebu Reclamation Area',
    area: 'Mandaue / Reclamation',
    min_age: 18,
    dress_code: 'Smart Casual & Club Chic. No slippers, open-toed sandals for men, or athletic tank tops.',
    is_active: 1,
    cover_fee_cents: 50000, // ₱500
    music_genres: ['EDM', 'Commercial House', 'Tech House', 'Festival Anthems'],
    vibe_tags: ['High Energy', 'Mega Club', 'Lasers & CO2', 'Celebrity DJs'],
    hero_image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    ],
    opening_hours: 'Wed - Sun | 10:00 PM – 5:00 AM',
    peak_hours: '12:30 AM – 3:30 AM',
    curator_rating: 4.9,
    ambassador_perks: [
      '⚡ Express VIP Door Entry (Skip 45-min general queue)',
      '🍸 Free round of Tequila Shots for bookings of 4+ pax before 11:30 PM',
      '🥂 Complimentary Birthday Champagne Bucket for VIP Table reservations',
      '🎧 Backstage DJ deck viewing pass for Founder\'s Room guests'
    ],
    featured: true,
    created_at: '2026-08-01 10:00:00',
  },
  {
    id: 'clb_trademark',
    owner_id: 'usr_admin_apex',
    name: 'Trademark Cebu',
    slug: 'trademark-cebu',
    description: 'The definitive sanctuary for urban soundscapes in Cebu. Premium craft cocktails, elevated hip-hop culture, and an intimate high-fashion crowd.',
    address: '88th Avenue, Gov. M. Cuenco Ave, Banilad, Cebu City',
    area: 'Crossroads Banilad',
    min_age: 20,
    dress_code: 'Upscale Streetwear & Cocktail Attire. Fashion sneakers permitted, strictly no dirty gym wear.',
    is_active: 1,
    cover_fee_cents: 40000, // ₱400
    music_genres: ['Hip-Hop', 'RnB', 'Afrobeats', 'Baile Funk'],
    vibe_tags: ['Urban Luxe', 'Craft Cocktails', 'Celebrity Hangout', 'Intimate'],
    hero_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=800&q=80',
    ],
    opening_hours: 'Tue - Sat | 9:00 PM – 4:00 AM',
    peak_hours: '11:45 PM – 2:45 AM',
    curator_rating: 4.8,
    ambassador_perks: [
      '🥃 Welcome Signature Bourbon Shooter for Ambassador Guest List',
      '✨ Guaranteed Table Placement with zero table-bump guarantee',
      '🎉 15% discount on Hennessy and Grey Goose bottle packages'
    ],
    featured: true,
    created_at: '2026-08-02 11:30:00',
  },
  {
    id: 'clb_sentral',
    owner_id: 'usr_admin_apex',
    name: 'Sentral Bar & Lounge',
    slug: 'sentral-bar-lounge',
    description: 'Cebu\'s legendary hip-hop & R&B institution. Known for electric weekend energy, top local battle DJs, and unmatched nightlife hospitality.',
    address: 'Crossroads Mall, Banilad, Cebu City',
    area: 'Crossroads Banilad',
    min_age: 18,
    dress_code: 'Trendy Casual. Hats allowed with proper styling.',
    is_active: 1,
    cover_fee_cents: 30000, // ₱300
    music_genres: ['Throwback R&B', 'Modern Trap', 'Open Format'],
    vibe_tags: ['Iconic Vibe', 'Bottle Service', 'High Energy', 'Late Night Crowd'],
    hero_image: 'https://images.unsplash.com/photo-1578736641330-3155e606cd40?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578736641330-3155e606cd40?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80',
    ],
    opening_hours: 'Wed - Sun | 9:30 PM – 4:30 AM',
    peak_hours: '12:00 AM – 3:00 AM',
    curator_rating: 4.7,
    ambassador_perks: [
      '🍹 Free Entrance on Ambassador Guest List before 11:00 PM',
      '🍾 1 Free Tower of House Cocktail for tables of 6+ guests'
    ],
    featured: false,
    created_at: '2026-08-03 14:10:00',
  },
  {
    id: 'clb_verified',
    owner_id: 'usr_admin_apex',
    name: 'Verified Sky Lounge',
    slug: 'verified-sky-lounge-it-park',
    description: '360° open-air panoramic views of the Cebu IT Park skyline. Sunset cocktails transition seamlessly into deep melodic house and euphoric techno grooves.',
    address: '22nd Floor, Sky Tower, Cebu I.T. Park, Lahug, Cebu City',
    area: 'Cebu IT Park',
    min_age: 21,
    dress_code: 'Smart Elegant / Night Out. Collared shirts or sleek tees recommended.',
    is_active: 1,
    cover_fee_cents: 60000, // ₱600
    music_genres: ['Deep House', 'Melodic Techno', 'Afro House', 'Nu-Disco'],
    vibe_tags: ['Rooftop Skyline', 'Sunset to Sunrise', 'Chill & Sexy', 'Premium Spirits'],
    hero_image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    ],
    opening_hours: 'Daily | 6:00 PM – 3:00 AM',
    peak_hours: '10:00 PM – 1:30 AM',
    curator_rating: 4.9,
    ambassador_perks: [
      '🌅 Prime Skyline Window Table priority allocation',
      '🥂 Complimentary welcome Prosecco flute per guest upon arrival',
      '🍓 Custom Artisanal Tapas platter on reservations over ₱8,000'
    ],
    featured: true,
    created_at: '2026-08-04 16:00:00',
  },
  {
    id: 'clb_icon',
    owner_id: 'usr_admin_apex',
    name: 'Club Icon Mango',
    slug: 'club-icon-mango-square',
    description: 'The pulsing heart of Cebu’s historic Mango Square entertainment strip. Multi-tiered dance arenas, explosive CO2 cannons, and non-stop festival energy.',
    address: 'Lot 6, Block 3, Mango Square Complex, Gen. Maxilom Ave, Cebu City',
    area: 'Mango Square',
    min_age: 18,
    dress_code: 'Casual / Party Fit. Clean sneakers allowed.',
    is_active: 1,
    cover_fee_cents: 30000, // ₱300
    music_genres: ['EDM', 'Hardstyle', 'Pop Remixes', 'Budots Bounce'],
    vibe_tags: ['Wild Party', 'Mango Strip', 'Budget Friendly', 'Multi-Floor'],
    hero_image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=800&q=80',
    ],
    opening_hours: 'Daily | 10:00 PM – 6:00 AM',
    peak_hours: '1:00 AM – 4:30 AM',
    curator_rating: 4.6,
    ambassador_perks: [
      '🎟️ Zero Cover Door Pass with AfterHours app badge',
      '🍻 Buy 1 Take 1 San Miguel / Heineken bucket voucher on entrance'
    ],
    featured: false,
    created_at: '2026-08-05 18:20:00',
  }
];

export const INITIAL_TABLE_TYPES: TableType[] = [
  // CLUB APEX TABLE TYPES
  {
    id: 'tt_apex_founder',
    club_id: 'clb_apex',
    name: "Founder's Enclave (Ultra VIP)",
    description: 'Directly elevated beside the Mainstage & DJ Booth with private security officer, dedicated mixologist, private restroom access, and unlimited premium mixers.',
    min_spend_cents: 2500000, // ₱25,000 min spend
    deposit_cents: 500000,    // ₱5,000 deposit
    max_guests: 12,
    is_active: 1,
    perks: ['Dedicated VIP Bouncer', 'Private Mixologist', 'Backstage Access', 'Top-Shelf Bottle Sparklers'],
    tier_badge: 'Ultra VIP',
  },
  {
    id: 'tt_apex_vip_mezzanine',
    club_id: 'clb_apex',
    name: 'VIP Mezzanine Booth',
    description: 'Plush velvet wrap-around sofa booth with panoramic view over the main dancefloor and laser shows.',
    min_spend_cents: 1200000, // ₱12,000 min spend
    deposit_cents: 300000,    // ₱3,000 deposit
    max_guests: 8,
    is_active: 1,
    perks: ['Elevated Dance Floor View', 'Dedicated Server', 'VIP Line Skip for all 8 pax'],
    tier_badge: 'VIP',
  },
  {
    id: 'tt_apex_cocktail_high',
    club_id: 'clb_apex',
    name: 'Dance Floor Cocktail High Table',
    description: 'High-top cocktail table right on the perimeter of the primary dancefloor. High energy and quick bar access.',
    min_spend_cents: 450000,  // ₱4,500 min spend
    deposit_cents: 100000,    // ₱1,000 deposit
    max_guests: 4,
    is_active: 1,
    perks: ['Front-row dancefloor energy', 'Consumable for all food & drinks'],
    tier_badge: 'Standard',
  },

  // TRADEMARK TABLE TYPES
  {
    id: 'tt_trade_sofa',
    club_id: 'clb_trademark',
    name: 'Urban Luxe Lounge Sofa',
    description: 'Center-stage luxury banquette with premium leather seating and customized bottle service rituals.',
    min_spend_cents: 800000,  // ₱8,000 min spend
    deposit_cents: 200000,    // ₱2,000 deposit
    max_guests: 6,
    is_active: 1,
    perks: ['Priority Bottle Presentation', 'Express Coat/Bag Check', '6 Free Entry Wristbands'],
    tier_badge: 'VIP',
  },
  {
    id: 'tt_trade_high',
    club_id: 'clb_trademark',
    name: 'High Top Table',
    description: 'Cozy cocktail spot adjacent to the DJ console.',
    min_spend_cents: 350000,  // ₱3,500 min spend
    deposit_cents: 100000,    // ₱1,000 deposit
    max_guests: 4,
    is_active: 1,
    perks: ['4 VIP passes', '100% consumable on craft cocktail menu'],
    tier_badge: 'Standard',
  },

  // VERIFIED TABLE TYPES
  {
    id: 'tt_ver_skyline_cabana',
    club_id: 'clb_verified',
    name: 'Skyline Panorama Cabana',
    description: 'Open-air glass-edge corner booth overlooking IT Park lights with customized lounge ambient lighting.',
    min_spend_cents: 1500000, // ₱15,000 min spend
    deposit_cents: 350000,    // ₱3,500 deposit
    max_guests: 10,
    is_active: 1,
    perks: ['Best IT Park Skyline View', 'Bottle of Moët & Chandon included in min spend', 'Personal Waiter'],
    tier_badge: 'Ultra VIP',
  },
  {
    id: 'tt_ver_breeze_table',
    club_id: 'clb_verified',
    name: 'Deck Cocktail High Table',
    description: 'High table located on the open-air wooden deck.',
    min_spend_cents: 500000,  // ₱5,000 min spend
    deposit_cents: 150000,    // ₱1,500 deposit
    max_guests: 4,
    is_active: 1,
    perks: ['Rooftop access', '4 Free Door Passes'],
    tier_badge: 'Standard',
  },

  // SENTRAL & ICON TABLE TYPES
  {
    id: 'tt_sentral_vip',
    club_id: 'clb_sentral',
    name: 'Center Stage VIP Couch',
    description: 'Right in the middle of Sentral’s legendary weekend madness.',
    min_spend_cents: 600000,  // ₱6,000 min spend
    deposit_cents: 150000,    // ₱1,500 deposit
    max_guests: 8,
    is_active: 1,
    perks: ['8 Entry Passes', 'Free Cocktail Pitcher'],
    tier_badge: 'VIP',
  },
  {
    id: 'tt_icon_booth',
    club_id: 'clb_icon',
    name: 'Mango Stage Booth',
    description: 'Spacious booth right in front of the massive subwoofers and laser arrays.',
    min_spend_cents: 400000,  // ₱4,000 min spend
    deposit_cents: 100000,    // ₱1,000 deposit
    max_guests: 6,
    is_active: 1,
    perks: ['Free entrance for 6', 'Beer bucket included in min spend'],
    tier_badge: 'Standard',
  }
];

export const INITIAL_CLUB_TABLES: ClubTable[] = [
  // CLUB APEX (Floor Plan)
  // Founder's Rooms (F1, F2)
  {
    id: 'tbl_apex_f1',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_founder',
    table_number: 'F-01 (Main Stage Left)',
    location_description: 'Adjacent to Main DJ Booth (Stage Left)',
    is_active: 1,
    x: 18,
    y: 22,
    width: 14,
    height: 14,
    shape: 'booth',
  },
  {
    id: 'tbl_apex_f2',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_founder',
    table_number: 'F-02 (Main Stage Right)',
    location_description: 'Adjacent to Main DJ Booth (Stage Right)',
    is_active: 1,
    x: 68,
    y: 22,
    width: 14,
    height: 14,
    shape: 'booth',
  },
  // VIP Mezzanine Booths (V1, V2, V3, V4)
  {
    id: 'tbl_apex_v1',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_vip_mezzanine',
    table_number: 'V-01',
    location_description: 'Mezzanine Balcony Tier 1 - North',
    is_active: 1,
    x: 12,
    y: 50,
    width: 12,
    height: 10,
    shape: 'booth',
  },
  {
    id: 'tbl_apex_v2',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_vip_mezzanine',
    table_number: 'V-02',
    location_description: 'Mezzanine Balcony Tier 1 - South',
    is_active: 1,
    x: 12,
    y: 68,
    width: 12,
    height: 10,
    shape: 'booth',
  },
  {
    id: 'tbl_apex_v3',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_vip_mezzanine',
    table_number: 'V-03',
    location_description: 'Mezzanine Balcony Tier 2 - North',
    is_active: 1,
    x: 76,
    y: 50,
    width: 12,
    height: 10,
    shape: 'booth',
  },
  {
    id: 'tbl_apex_v4',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_vip_mezzanine',
    table_number: 'V-04',
    location_description: 'Mezzanine Balcony Tier 2 - South',
    is_active: 1,
    x: 76,
    y: 68,
    width: 12,
    height: 10,
    shape: 'booth',
  },
  // High Cocktail Tables (H1 to H6)
  {
    id: 'tbl_apex_h1',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_cocktail_high',
    table_number: 'H-01',
    location_description: 'Dance Floor Perimeter Ring - West',
    is_active: 1,
    x: 32,
    y: 48,
    width: 7,
    height: 7,
    shape: 'circle',
  },
  {
    id: 'tbl_apex_h2',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_cocktail_high',
    table_number: 'H-02',
    location_description: 'Dance Floor Perimeter Ring - West Mid',
    is_active: 1,
    x: 32,
    y: 62,
    width: 7,
    height: 7,
    shape: 'circle',
  },
  {
    id: 'tbl_apex_h3',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_cocktail_high',
    table_number: 'H-03',
    location_description: 'Dance Floor Center Ring - Front',
    is_active: 1,
    x: 46,
    y: 40,
    width: 7,
    height: 7,
    shape: 'circle',
  },
  {
    id: 'tbl_apex_h4',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_cocktail_high',
    table_number: 'H-04',
    location_description: 'Dance Floor Center Ring - Back',
    is_active: 1,
    x: 46,
    y: 74,
    width: 7,
    height: 7,
    shape: 'circle',
  },
  {
    id: 'tbl_apex_h5',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_cocktail_high',
    table_number: 'H-05',
    location_description: 'Dance Floor Perimeter Ring - East',
    is_active: 1,
    x: 60,
    y: 48,
    width: 7,
    height: 7,
    shape: 'circle',
  },
  {
    id: 'tbl_apex_h6',
    club_id: 'clb_apex',
    table_type_id: 'tt_apex_cocktail_high',
    table_number: 'H-06',
    location_description: 'Dance Floor Perimeter Ring - East Mid',
    is_active: 1,
    x: 60,
    y: 62,
    width: 7,
    height: 7,
    shape: 'circle',
  },

  // TRADEMARK CEBU TABLES
  {
    id: 'tbl_trade_s1',
    club_id: 'clb_trademark',
    table_type_id: 'tt_trade_sofa',
    table_number: 'L-01 (VIP Sofa)',
    location_description: 'Prime Center Lounge Banquette',
    is_active: 1,
    x: 20,
    y: 35,
    width: 15,
    height: 12,
    shape: 'booth',
  },
  {
    id: 'tbl_trade_s2',
    club_id: 'clb_trademark',
    table_type_id: 'tt_trade_sofa',
    table_number: 'L-02 (VIP Sofa)',
    location_description: 'East Lounge Banquette',
    is_active: 1,
    x: 65,
    y: 35,
    width: 15,
    height: 12,
    shape: 'booth',
  },
  {
    id: 'tbl_trade_h1',
    club_id: 'clb_trademark',
    table_type_id: 'tt_trade_high',
    table_number: 'T-01',
    location_description: 'Cocktail Bar High Table 1',
    is_active: 1,
    x: 35,
    y: 65,
    width: 8,
    height: 8,
    shape: 'circle',
  },
  {
    id: 'tbl_trade_h2',
    club_id: 'clb_trademark',
    table_type_id: 'tt_trade_high',
    table_number: 'T-02',
    location_description: 'Cocktail Bar High Table 2',
    is_active: 1,
    x: 55,
    y: 65,
    width: 8,
    height: 8,
    shape: 'circle',
  },

  // VERIFIED CEBU IT PARK TABLES
  {
    id: 'tbl_ver_c1',
    club_id: 'clb_verified',
    table_type_id: 'tt_ver_skyline_cabana',
    table_number: 'Sky-01',
    location_description: 'Glass-Edge Skyline Cabana (South Panorama)',
    is_active: 1,
    x: 18,
    y: 30,
    width: 16,
    height: 14,
    shape: 'booth',
  },
  {
    id: 'tbl_ver_c2',
    club_id: 'clb_verified',
    table_type_id: 'tt_ver_skyline_cabana',
    table_number: 'Sky-02',
    location_description: 'Glass-Edge Skyline Cabana (East Sunrise View)',
    is_active: 1,
    x: 66,
    y: 30,
    width: 16,
    height: 14,
    shape: 'booth',
  },
  {
    id: 'tbl_ver_h1',
    club_id: 'clb_verified',
    table_type_id: 'tt_ver_breeze_table',
    table_number: 'Deck-01',
    location_description: 'Open Sky Terrace Table 1',
    is_active: 1,
    x: 35,
    y: 60,
    width: 9,
    height: 9,
    shape: 'circle',
  },
  {
    id: 'tbl_ver_h2',
    club_id: 'clb_verified',
    table_type_id: 'tt_ver_breeze_table',
    table_number: 'Deck-02',
    location_description: 'Open Sky Terrace Table 2',
    is_active: 1,
    x: 55,
    y: 60,
    width: 9,
    height: 9,
    shape: 'circle',
  },

  // SENTRAL & ICON
  {
    id: 'tbl_sentral_1',
    club_id: 'clb_sentral',
    table_type_id: 'tt_sentral_vip',
    table_number: 'S-VIP 1',
    location_description: 'Front of DJ Stage',
    is_active: 1,
    x: 35,
    y: 40,
    width: 14,
    height: 12,
    shape: 'booth',
  },
  {
    id: 'tbl_icon_1',
    club_id: 'clb_icon',
    table_type_id: 'tt_icon_booth',
    table_number: 'M-01',
    location_description: 'Main Dancefloor Right',
    is_active: 1,
    x: 40,
    y: 45,
    width: 14,
    height: 12,
    shape: 'booth',
  }
];

// Helper to get today's date formatted as YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg_apex_sample1',
    club_id: 'clb_apex',
    table_id: 'tbl_apex_f1',
    user_id: 'usr_guest1',
    booking_date: today,
    arrival_time: '23:00',
    guest_count: 10,
    min_spend_cents: 2500000, // ₱25,000
    deposit_paid_cents: 500000, // ₱5,000
    status: 'confirmed',
    special_requests: 'Celebrating 25th birthday, please prepare sparkler bottle presentation for Hennessy XO',
    created_at: '2026-08-20 18:30:00',
    qr_code: 'AH-APEX-F1-CONFIRMED-82910',
    ambassador_promo_code: 'CEBUVIP',
    commission_cents: 250000, // ₱2,500 commission for AfterHours
    customer_name: 'Marco Villamor',
    customer_email: 'marco.cebu@gmail.com',
    customer_phone: '+63 917 555 1201',
    payment_method: 'GCash',
  },
  {
    id: 'bkg_apex_sample2',
    club_id: 'clb_apex',
    table_id: 'tbl_apex_v1',
    user_id: 'usr_guest1',
    booking_date: today,
    arrival_time: '22:30',
    guest_count: 6,
    min_spend_cents: 1200000, // ₱12,000
    deposit_paid_cents: 300000, // ₱3,000
    status: 'confirmed',
    special_requests: 'Corporate group celebration, express door pass for all members',
    created_at: '2026-08-20 16:15:00',
    qr_code: 'AH-APEX-V1-CONFIRMED-44192',
    ambassador_promo_code: 'AFTERHOURS10',
    commission_cents: 120000, // ₱1,200
    customer_name: 'Beatriz Tan',
    customer_email: 'beatriz.t@techcebu.io',
    customer_phone: '+63 918 444 8833',
    payment_method: 'Maya',
  }
];

export const INITIAL_GUESTLIST_ENTRIES: GuestListEntry[] = [
  {
    id: 'gl_entry_1',
    club_id: 'clb_apex',
    user_id: 'usr_guest1',
    event_date: today,
    guest_name: 'Marco Villamor',
    guest_email: 'marco.cebu@gmail.com',
    guest_phone: '+63 917 555 1201',
    pax: 3,
    arrival_time_estimate: '22:45',
    status: 'valid',
    qr_code: 'AH-GL-APEX-MARCO-902',
    ambassador_perk: '⚡ Free Express Entry before 11:30 PM + 1 Free Tequila Shot',
    created_at: '2026-08-20 19:10:00',
  },
  {
    id: 'gl_entry_2',
    club_id: 'clb_trademark',
    user_id: 'usr_guest1',
    event_date: today,
    guest_name: 'Sam Delgado',
    guest_email: 'sam.d@gmail.com',
    guest_phone: '+63 915 222 3456',
    pax: 2,
    arrival_time_estimate: '23:15',
    status: 'valid',
    qr_code: 'AH-GL-TM-SAM-551',
    ambassador_perk: '🥃 1 Free Signature Bourbon Shooter at Entrance',
    created_at: '2026-08-20 20:00:00',
  }
];

export const AMBASSADOR_PROMOS: AmbassadorPromo[] = [
  {
    code: 'CEBUVIP',
    discount_deposit_percent: 15,
    complimentary_item: 'Complimentary Round of Patron Silver Tequila Shots',
    description: '15% off upfront deposit + free tequila shots round',
  },
  {
    code: 'AFTERHOURS10',
    discount_deposit_percent: 10,
    complimentary_item: 'VIP Welcome Cocktail Punch Bowl',
    description: '10% off table deposit + welcome punch bowl for table',
  },
  {
    code: 'MANGOFRESH',
    discount_deposit_percent: 10,
    complimentary_item: 'Free Premium Bottle Sparkler Presentation',
    club_id: 'clb_icon',
    description: 'VIP Bottle Sparkler show + 10% off deposit',
  }
];
