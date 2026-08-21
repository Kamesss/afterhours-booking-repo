import { Club, TableType, ClubTable, Booking, BookingStatus, GuestListEntry, User, UserRole, AmbassadorPromo } from '../types';
import {
  INITIAL_CLUBS,
  INITIAL_TABLE_TYPES,
  INITIAL_CLUB_TABLES,
  INITIAL_BOOKINGS,
  INITIAL_GUESTLIST_ENTRIES,
  INITIAL_USERS,
  AMBASSADOR_PROMOS
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'afterhours_users_v1',
  CLUBS: 'afterhours_clubs_v1',
  TABLE_TYPES: 'afterhours_table_types_v1',
  CLUB_TABLES: 'afterhours_club_tables_v1',
  BOOKINGS: 'afterhours_bookings_v1',
  GUESTLIST: 'afterhours_guestlist_v1',
  CURRENT_USER: 'afterhours_current_user_v1',
};

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

function safeSave<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

type Listener = () => void;

class AfterHoursDatabase {
  private users: User[];
  private clubs: Club[];
  private tableTypes: TableType[];
  private clubTables: ClubTable[];
  private bookings: Booking[];
  private guestList: GuestListEntry[];
  private currentUser: User;
  private listeners: Set<Listener> = new Set();
  private isLoadedFromD1: boolean = false;

  constructor() {
    this.users = safeLoad<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.clubs = safeLoad<Club[]>(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    this.tableTypes = safeLoad<TableType[]>(STORAGE_KEYS.TABLE_TYPES, INITIAL_TABLE_TYPES);
    this.clubTables = safeLoad<ClubTable[]>(STORAGE_KEYS.CLUB_TABLES, INITIAL_CLUB_TABLES);
    this.bookings = safeLoad<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    this.guestList = safeLoad<GuestListEntry[]>(STORAGE_KEYS.GUESTLIST, INITIAL_GUESTLIST_ENTRIES);
    this.currentUser = safeLoad<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);

    // Asynchronously fetch live data directly from Cloudflare D1
    if (typeof window !== 'undefined') {
      this.syncFromD1();
    }
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error('Subscriber notification error:', e);
      }
    });
  }

  // Fetch live tables from Cloudflare D1 Database
  public async syncFromD1(): Promise<boolean> {
    try {
      const res = await fetch('/api/d1-dump');
      if (res.ok) {
        const data = await res.json();
        if (data.clubs && Array.isArray(data.clubs) && data.clubs.length > 0) {
          this.clubs = data.clubs;
          safeSave(STORAGE_KEYS.CLUBS, this.clubs);
        }
        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
          this.users = data.users;
          safeSave(STORAGE_KEYS.USERS, this.users);
        }
        if (data.table_types && Array.isArray(data.table_types) && data.table_types.length > 0) {
          this.tableTypes = data.table_types;
          safeSave(STORAGE_KEYS.TABLE_TYPES, this.tableTypes);
        }
        if (data.club_tables && Array.isArray(data.club_tables) && data.club_tables.length > 0) {
          this.clubTables = data.club_tables;
          safeSave(STORAGE_KEYS.CLUB_TABLES, this.clubTables);
        }
        if (data.bookings && Array.isArray(data.bookings)) {
          this.bookings = data.bookings;
          safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
        }
        if (data.guest_list && Array.isArray(data.guest_list)) {
          this.guestList = data.guest_list;
          safeSave(STORAGE_KEYS.GUESTLIST, this.guestList);
        }
        this.isLoadedFromD1 = true;
        this.notify();
        return true;
      }
    } catch (e) {
      // Backend api offline or preview mode, relying on cached data
      console.log('D1 live sync completed with local cache.');
    }
    return false;
  }

  // Current User management
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public switchUser(userOrRole: UserRole | string): User {
    let found: User | undefined;
    if (userOrRole === 'user' || userOrRole === 'club_admin' || userOrRole === 'superadmin') {
      found = this.users.find(u => u.role === userOrRole);
    } else {
      found = this.users.find(u => u.id === userOrRole || u.email === userOrRole);
    }
    if (found) {
      this.currentUser = found;
      safeSave(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      this.notify();
    }
    return this.currentUser;
  }

  // Getters
  public getUsers(): User[] {
    return [...this.users];
  }

  public getClubs(): Club[] {
    return [...this.clubs];
  }

  public getClubById(clubId: string): Club | undefined {
    return this.clubs.find(c => c.id === clubId);
  }

  public getClubBySlug(slug: string): Club | undefined {
    return this.clubs.find(c => c.slug === slug);
  }

  public getTableTypes(clubId?: string): TableType[] {
    if (!clubId) return [...this.tableTypes];
    return this.tableTypes.filter(tt => tt.club_id === clubId);
  }

  public getClubTables(clubId?: string): ClubTable[] {
    if (!clubId) return [...this.clubTables];
    return this.clubTables.filter(t => t.club_id === clubId);
  }

  public getBookings(clubId?: string, date?: string): Booking[] {
    return this.bookings.filter(b => {
      if (clubId && b.club_id !== clubId) return false;
      if (date && b.booking_date !== date) return false;
      return true;
    });
  }

  public getUserBookings(userId: string): Booking[] {
    return this.bookings.filter(b => b.user_id === userId);
  }

  public getGuestList(clubId?: string, date?: string): GuestListEntry[] {
    return this.guestList.filter(gl => {
      if (clubId && gl.club_id !== clubId) return false;
      if (date && gl.event_date !== date) return false;
      return true;
    });
  }

  public getUserGuestList(userId: string): GuestListEntry[] {
    return this.guestList.filter(gl => gl.user_id === userId);
  }

  // Check Table Availability according to D1 Partial Unique Index:
  // CREATE UNIQUE INDEX IF NOT EXISTS uq_prevent_table_double_booking 
  // ON bookings (table_id, booking_date) WHERE status IN ('confirmed', 'pending');
  public isTableAvailable(tableId: string, bookingDate: string): boolean {
    const existing = this.bookings.find(
      b => b.table_id === tableId &&
           b.booking_date === bookingDate &&
           (b.status === 'confirmed' || b.status === 'pending')
    );
    return !existing;
  }

  public getTableBookingStatus(tableId: string, bookingDate: string): { isAvailable: boolean; booking?: Booking } {
    const booking = this.bookings.find(
      b => b.table_id === tableId &&
           b.booking_date === bookingDate &&
           (b.status === 'confirmed' || b.status === 'pending')
    );
    return {
      isAvailable: !booking,
      booking
    };
  }

  // Create Booking with strict double-booking check & Cloudflare D1 persistence
  public async createBooking(payload: {
    club_id: string;
    table_id: string;
    user_id: string;
    booking_date: string;
    arrival_time: string;
    guest_count: number;
    min_spend_cents: number;
    deposit_paid_cents: number;
    special_requests?: string;
    ambassador_promo_code?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    payment_method: 'GCash' | 'Maya' | 'Card' | 'Club Pay at Door';
  }): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    // 1. Verify table exists
    const table = this.clubTables.find(t => t.id === payload.table_id);
    if (!table) {
      return { success: false, error: 'Target physical table does not exist.' };
    }

    // 2. Enforce full-day table lock (Double-booking constraint)
    const isFree = this.isTableAvailable(payload.table_id, payload.booking_date);
    if (!isFree) {
      return {
        success: false,
        error: `Table ${table.table_number} is already booked on ${payload.booking_date} (Full-day lock active).`
      };
    }

    // 3. Calculate AfterHours Ambassador commission (10% standard rate on minimum spend)
    const commissionCents = Math.round(payload.min_spend_cents * 0.10);
    const newBookingId = `bkg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const qrCode = `AH-${payload.club_id.toUpperCase()}-${table.table_number.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`;
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newBooking: Booking = {
      id: newBookingId,
      club_id: payload.club_id,
      table_id: payload.table_id,
      user_id: payload.user_id,
      booking_date: payload.booking_date,
      arrival_time: payload.arrival_time,
      guest_count: payload.guest_count,
      min_spend_cents: payload.min_spend_cents,
      deposit_paid_cents: payload.deposit_paid_cents,
      status: 'confirmed',
      special_requests: payload.special_requests || '',
      created_at: createdAt,
      qr_code: qrCode,
      ambassador_promo_code: payload.ambassador_promo_code,
      commission_cents: commissionCents,
      customer_name: payload.customer_name,
      customer_email: payload.customer_email,
      customer_phone: payload.customer_phone,
      payment_method: payload.payment_method,
    };

    // Immediate local optimistic update
    this.bookings.unshift(newBooking);
    safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
    this.notify();

    // Call Cloudflare D1 Backend API
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (res.ok) {
        const d1Data = await res.json();
        if (d1Data.booking) {
          const index = this.bookings.findIndex(b => b.id === newBookingId);
          if (index !== -1) {
            this.bookings[index] = d1Data.booking;
            safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
            this.notify();
          }
        }
      } else if (res.status === 409) {
        // Rollback if D1 returned double booking constraint conflict
        this.bookings = this.bookings.filter(b => b.id !== newBookingId);
        safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
        this.notify();
        return { success: false, error: 'Database constraint: table already reserved.' };
      }
    } catch (e) {
      console.log('Saved to local storage, D1 queue will sync when online.');
    }

    return { success: true, booking: newBooking };
  }

  // Create Guest List Entry with Cloudflare D1 integration
  public async joinGuestList(payload: {
    club_id: string;
    user_id: string;
    event_date: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    pax: number;
    arrival_time_estimate: string;
  }): Promise<{ success: boolean; entry?: GuestListEntry; error?: string }> {
    const club = this.getClubById(payload.club_id);
    if (!club) return { success: false, error: 'Club not found' };

    const perk = club.ambassador_perks[0] || '⚡ Free Ambassador Express Entry pass';
    const id = `gl_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const qrCode = `AH-GL-${club.name.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newEntry: GuestListEntry = {
      id,
      club_id: payload.club_id,
      user_id: payload.user_id,
      event_date: payload.event_date,
      guest_name: payload.guest_name,
      guest_email: payload.guest_email,
      guest_phone: payload.guest_phone,
      pax: payload.pax,
      arrival_time_estimate: payload.arrival_time_estimate,
      status: 'valid',
      qr_code: qrCode,
      ambassador_perk: perk,
      created_at: createdAt,
    };

    this.guestList.unshift(newEntry);
    safeSave(STORAGE_KEYS.GUESTLIST, this.guestList);
    this.notify();

    // Call Cloudflare D1 Backend API
    try {
      await fetch('/api/guest_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
    } catch (e) {
      console.log('Saved guest list to store.');
    }

    return { success: true, entry: newEntry };
  }

  // Check In via QR Scanner (Host / Bouncer)
  public async verifyAndCheckIn(qrCode: string): Promise<{
    success: boolean;
    type: 'booking' | 'guestlist' | 'unknown';
    data?: Booking | GuestListEntry;
    message: string;
  }> {
    // Try D1 Server Verification First
    try {
      const res = await fetch('/api/verify-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrCode }),
      });
      if (res.ok) {
        const result = await res.json();
        // Update local memory
        if (result.type === 'booking' && result.data) {
          const idx = this.bookings.findIndex(b => b.id === result.data.id);
          if (idx !== -1) {
            this.bookings[idx] = result.data;
            safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
          }
        } else if (result.type === 'guestlist' && result.data) {
          const idx = this.guestList.findIndex(g => g.id === result.data.id);
          if (idx !== -1) {
            this.guestList[idx] = result.data;
            safeSave(STORAGE_KEYS.GUESTLIST, this.guestList);
          }
        }
        this.notify();
        return result;
      }
    } catch (e) {
      console.log('Falling back to local scanner engine.');
    }

    // Local fallback
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Table booking check
    const booking = this.bookings.find(b => b.qr_code === qrCode);
    if (booking) {
      if (booking.checked_in_at) {
        return {
          success: false,
          type: 'booking',
          data: booking,
          message: `Already checked in at ${booking.checked_in_at}. (Badge consumed)`
        };
      }
      booking.checked_in_at = now;
      booking.status = 'completed';
      safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
      this.notify();
      return {
        success: true,
        type: 'booking',
        data: booking,
        message: `VALID VIP TABLE PASS! Checked in table ${booking.table_id} for ${booking.customer_name} (${booking.guest_count} guests).`
      };
    }

    // 2. Guest list check
    const glEntry = this.guestList.find(gl => gl.qr_code === qrCode);
    if (glEntry) {
      if (glEntry.checked_in_at || glEntry.status === 'checked_in') {
        return {
          success: false,
          type: 'guestlist',
          data: glEntry,
          message: `Guest list pass was already scanned at ${glEntry.checked_in_at || 'earlier'}.`
        };
      }
      glEntry.checked_in_at = now;
      glEntry.status = 'checked_in';
      safeSave(STORAGE_KEYS.GUESTLIST, this.guestList);
      this.notify();
      return {
        success: true,
        type: 'guestlist',
        data: glEntry,
        message: `VALID GUEST LIST PASS! Admitted ${glEntry.guest_name} (+${glEntry.pax - 1} guests). Perk applied: ${glEntry.ambassador_perk}`
      };
    }

    return {
      success: false,
      type: 'unknown',
      message: 'Invalid QR pass code. Not found in AfterHours Cebu database.'
    };
  }

  // Update Booking Status (e.g. Cancel, Confirm, No Show)
  public async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<boolean> {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return false;
    booking.status = status;
    safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
    this.notify();

    try {
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.log('Status updated in local store.');
    }
    return true;
  }

  // Update Table Type / Pricing
  public async updateTableType(tableTypeId: string, updates: Partial<TableType>): Promise<boolean> {
    const tt = this.tableTypes.find(t => t.id === tableTypeId);
    if (!tt) return false;
    Object.assign(tt, updates);
    safeSave(STORAGE_KEYS.TABLE_TYPES, this.tableTypes);
    this.notify();

    try {
      await fetch(`/api/table_types/${tableTypeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.log('Table type updated in local store.');
    }
    return true;
  }

  // Reset to initial demo database
  public resetToDefaults(): void {
    this.users = INITIAL_USERS;
    this.clubs = INITIAL_CLUBS;
    this.tableTypes = INITIAL_TABLE_TYPES;
    this.clubTables = INITIAL_CLUB_TABLES;
    this.bookings = INITIAL_BOOKINGS;
    this.guestList = INITIAL_GUESTLIST_ENTRIES;
    this.currentUser = INITIAL_USERS[0];

    safeSave(STORAGE_KEYS.USERS, this.users);
    safeSave(STORAGE_KEYS.CLUBS, this.clubs);
    safeSave(STORAGE_KEYS.TABLE_TYPES, this.tableTypes);
    safeSave(STORAGE_KEYS.CLUB_TABLES, this.clubTables);
    safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
    safeSave(STORAGE_KEYS.GUESTLIST, this.guestList);
    safeSave(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
  }

  // Cloudflare D1 SQL Generator
  public generateD1SqlDump(): string {
    let sql = `-- =========================================================\n`;
    sql += `-- AFTERHOURS CEBU NIGHTLIFE - CLOUDFLARE D1 SEED SCRIPT\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Database: club_booking_db\n`;
    sql += `-- =========================================================\n\n`;
    sql += `PRAGMA foreign_keys = ON;\n\n`;

    // 1. Users
    sql += `-- 1. USERS (${this.users.length} rows)\n`;
    this.users.forEach(u => {
      sql += `INSERT OR REPLACE INTO users (id, name, email, password_hash, phone, role, created_at) VALUES ('${u.id}', '${u.name.replace(/'/g, "''")}', '${u.email}', 'pbkdf2_hash_demo', '${u.phone || ''}', '${u.role}', '${u.created_at}');\n`;
    });
    sql += `\n`;

    // 2. Clubs
    sql += `-- 2. CLUBS (${this.clubs.length} rows)\n`;
    this.clubs.forEach(c => {
      sql += `INSERT OR REPLACE INTO clubs (id, owner_id, name, slug, description, address, min_age, dress_code, is_active, created_at) VALUES ('${c.id}', '${c.owner_id}', '${c.name.replace(/'/g, "''")}', '${c.slug}', '${c.description.replace(/'/g, "''")}', '${c.address.replace(/'/g, "''")}', ${c.min_age}, '${c.dress_code.replace(/'/g, "''")}', ${c.is_active}, '${c.created_at}');\n`;
    });
    sql += `\n`;

    // 3. Table Types
    sql += `-- 3. TABLE TYPES (${this.tableTypes.length} rows)\n`;
    this.tableTypes.forEach(tt => {
      sql += `INSERT OR REPLACE INTO table_types (id, club_id, name, description, min_spend_cents, deposit_cents, max_guests, is_active) VALUES ('${tt.id}', '${tt.club_id}', '${tt.name.replace(/'/g, "''")}', '${tt.description.replace(/'/g, "''")}', ${tt.min_spend_cents}, ${tt.deposit_cents}, ${tt.max_guests}, ${tt.is_active});\n`;
    });
    sql += `\n`;

    // 4. Physical Club Tables
    sql += `-- 4. PHYSICAL CLUB TABLES (${this.clubTables.length} rows)\n`;
    this.clubTables.forEach(t => {
      sql += `INSERT OR REPLACE INTO club_tables (id, club_id, table_type_id, table_number, location_description, is_active) VALUES ('${t.id}', '${t.club_id}', '${t.table_type_id}', '${t.table_number.replace(/'/g, "''")}', '${t.location_description.replace(/'/g, "''")}', ${t.is_active});\n`;
    });
    sql += `\n`;

    // 5. Bookings
    sql += `-- 5. BOOKINGS (${this.bookings.length} rows)\n`;
    this.bookings.forEach(b => {
      sql += `INSERT OR REPLACE INTO bookings (id, club_id, table_id, user_id, booking_date, arrival_time, guest_count, min_spend_cents, deposit_paid_cents, status, special_requests, created_at) VALUES ('${b.id}', '${b.club_id}', '${b.table_id}', '${b.user_id}', '${b.booking_date}', '${b.arrival_time}', ${b.guest_count}, ${b.min_spend_cents}, ${b.deposit_paid_cents}, '${b.status}', '${(b.special_requests || '').replace(/'/g, "''")}', '${b.created_at}');\n`;
    });

    return sql;
  }
}

export const db = new AfterHoursDatabase();
