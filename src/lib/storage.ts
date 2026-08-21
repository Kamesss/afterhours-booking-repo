import {
  Club,
  TableType,
  ClubTable,
  Booking,
  BookingStatus,
  GuestListEntry,
  User,
  UserRole
} from '../types';
import {
  SEED_USERS,
  SEED_CLUBS,
  SEED_TABLE_TYPES,
  SEED_CLUB_TABLES,
  SEED_BOOKINGS,
  SEED_GUESTLIST
} from './seedData';

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

const DEFAULT_USER: User = {
  id: 'usr_guest1',
  name: 'Marco Villamor',
  email: 'marco.cebu@gmail.com',
  phone: '+63 917 555 1201',
  role: 'user',
  created_at: new Date().toISOString(),
};

type Listener = () => void;

class AfterHoursDatabase {
  private users: User[] = [];
  private clubs: Club[] = [];
  private tableTypes: TableType[] = [];
  private clubTables: ClubTable[] = [];
  private bookings: Booking[] = [];
  private guestList: GuestListEntry[] = [];
  private currentUser: User = DEFAULT_USER;
  private listeners: Set<Listener> = new Set();
  public isLoadedFromD1: boolean = false;

  constructor() {
    this.users = safeLoad<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    this.clubs = safeLoad<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
    this.tableTypes = safeLoad<TableType[]>(STORAGE_KEYS.TABLE_TYPES, SEED_TABLE_TYPES);
    this.clubTables = safeLoad<ClubTable[]>(STORAGE_KEYS.CLUB_TABLES, SEED_CLUB_TABLES);
    this.bookings = safeLoad<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS);
    this.guestList = safeLoad<GuestListEntry[]>(STORAGE_KEYS.GUESTLIST, SEED_GUESTLIST);
    this.currentUser = safeLoad<User>(STORAGE_KEYS.CURRENT_USER, DEFAULT_USER);

    // Fetch live tables directly from Cloudflare D1
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

  // Fetch live tables directly from Cloudflare D1 API
  public async syncFromD1(): Promise<boolean> {
    try {
      const res = await fetch('/api/d1-dump');
      if (res.ok) {
        const data = await res.json();
        if (data.clubs && Array.isArray(data.clubs)) {
          this.clubs = data.clubs;
          safeSave(STORAGE_KEYS.CLUBS, this.clubs);
        }
        if (data.users && Array.isArray(data.users)) {
          this.users = data.users;
          safeSave(STORAGE_KEYS.USERS, this.users);
          if (this.users.length > 0 && !this.users.some(u => u.id === this.currentUser.id)) {
            this.currentUser = this.users[0];
            safeSave(STORAGE_KEYS.CURRENT_USER, this.currentUser);
          }
        }
        if (data.table_types && Array.isArray(data.table_types)) {
          this.tableTypes = data.table_types;
          safeSave(STORAGE_KEYS.TABLE_TYPES, this.tableTypes);
        }
        if (data.club_tables && Array.isArray(data.club_tables)) {
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
      console.log('D1 live sync error:', e);
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

  // Create Booking strictly matching D1 schema
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
    payment_method: 'GCash' | 'Maya' | 'Card' | 'Club Pay at Door' | string;
  }): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const isFree = this.isTableAvailable(payload.table_id, payload.booking_date);
    if (!isFree) {
      return {
        success: false,
        error: `Table is already booked on ${payload.booking_date} (Full-day table lock active).`
      };
    }

    const bookingId = `bkg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const qrCode = `AH-${payload.club_id.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const commissionCents = Math.round(payload.min_spend_cents * 0.10);

    const newBooking: Booking = {
      id: bookingId,
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

    // Optimistically update local state
    this.bookings.unshift(newBooking);
    safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
    this.notify();

    // Persist to Cloudflare D1
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to persist booking in D1');
      }
      const data = await res.json();
      if (data.booking) {
        const idx = this.bookings.findIndex(b => b.id === newBooking.id);
        if (idx !== -1) {
          this.bookings[idx] = data.booking;
          safeSave(STORAGE_KEYS.BOOKINGS, this.bookings);
          this.notify();
        }
      }
    } catch (e: any) {
      console.error('D1 Booking creation error:', e);
      return { success: false, error: e.message || 'Error writing to D1 database' };
    }

    return {
      success: true,
      booking: newBooking
    };
  }

  // Join Guest List with D1 synchronization
  public async joinGuestList(payload: {
    club_id: string;
    user_id: string;
    event_date: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    pax: number;
    arrival_time_estimate: string;
    ambassador_perk?: string;
  }): Promise<{ success: boolean; entry?: GuestListEntry; error?: string }> {
    const entryId = `gl_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const qrCode = `AH-GL-${entryId}`;

    const newEntry: GuestListEntry = {
      id: entryId,
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
      ambassador_perk: payload.ambassador_perk || '⚡ Free Ambassador VIP Entry',
      created_at: createdAt,
    };

    this.guestList.unshift(newEntry);
    safeSave(STORAGE_KEYS.GUESTLIST, this.guestList);
    this.notify();

    try {
      const res = await fetch('/api/guest_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.entry) {
          const idx = this.guestList.findIndex(g => g.id === newEntry.id);
          if (idx !== -1) {
            this.guestList[idx] = data.entry;
            safeSave(STORAGE_KEYS.GUESTLIST, this.guestList);
            this.notify();
          }
        }
      }
    } catch (e) {
      console.log('Guest list entry saved to store.');
    }

    return {
      success: true,
      entry: newEntry
    };
  }

  // Verify and check-in pass
  public async verifyAndCheckIn(qrOrId: string): Promise<{
    success: boolean;
    type: 'booking' | 'guestlist' | 'unknown';
    data?: Booking | GuestListEntry;
    message: string;
  }> {
    try {
      const res = await fetch('/api/verify-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrOrId }),
      });
      if (res.ok) {
        const data = await res.json();
        await this.syncFromD1();
        return data;
      }
    } catch (e) {
      console.log('Using local verification fallback:', e);
    }

    const cleanCode = qrOrId.trim();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const booking = this.bookings.find(
      b => b.qr_code === cleanCode || b.id === cleanCode
    );

    if (booking) {
      if (booking.checked_in_at) {
        return {
          success: false,
          type: 'booking',
          data: booking,
          message: `Already checked in at ${booking.checked_in_at}.`
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
        message: `VALID VIP TABLE PASS! Checked in table ${booking.table_id} for ${booking.guest_count} guests.`
      };
    }

    const glEntry = this.guestList.find(
      g => g.qr_code === cleanCode || g.id === cleanCode
    );

    if (glEntry) {
      if (glEntry.checked_in_at || glEntry.status === 'checked_in') {
        return {
          success: false,
          type: 'guestlist',
          data: glEntry,
          message: `Guest pass was already scanned at ${glEntry.checked_in_at || 'earlier'}.`
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
        message: `VALID GUEST LIST PASS! Admitted ${glEntry.guest_name} (+${glEntry.pax - 1} guests).`
      };
    }

    return {
      success: false,
      type: 'unknown',
      message: 'Invalid pass code. Record not found in database.'
    };
  }

  // Update Booking Status
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

  // Clear local caches
  public clearLocalCache(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CLUBS);
    localStorage.removeItem(STORAGE_KEYS.TABLE_TYPES);
    localStorage.removeItem(STORAGE_KEYS.CLUB_TABLES);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.GUESTLIST);
    this.syncFromD1();
  }

  // Cloudflare D1 SQL Generator
  public generateD1SqlDump(): string {
    let sql = `-- =========================================================\n`;
    sql += `-- CLOUDFLARE D1 SCHEMA & DUMP: club_booking_db\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- =========================================================\n\n`;
    sql += `PRAGMA foreign_keys = ON;\n\n`;

    // 1. Users
    sql += `-- 1. USERS (${this.users.length} rows)\n`;
    this.users.forEach(u => {
      sql += `INSERT OR REPLACE INTO users (id, name, email, password_hash, phone, role, created_at) VALUES ('${u.id}', '${(u.name || '').replace(/'/g, "''")}', '${(u.email || '').replace(/'/g, "''")}', '${u.password_hash || 'hash_secret'}', '${u.phone || ''}', '${u.role}', '${u.created_at}');\n`;
    });
    sql += `\n`;

    // 2. Clubs
    sql += `-- 2. CLUBS (${this.clubs.length} rows)\n`;
    this.clubs.forEach(c => {
      sql += `INSERT OR REPLACE INTO clubs (id, owner_id, name, slug, description, address, min_age, dress_code, is_active, created_at) VALUES ('${c.id}', '${c.owner_id}', '${(c.name || '').replace(/'/g, "''")}', '${(c.slug || '').replace(/'/g, "''")}', '${(c.description || '').replace(/'/g, "''")}', '${(c.address || '').replace(/'/g, "''")}', ${c.min_age || 18}, '${(c.dress_code || '').replace(/'/g, "''")}', ${c.is_active ?? 1}, '${c.created_at}');\n`;
    });
    sql += `\n`;

    // 3. Table Types
    sql += `-- 3. TABLE TYPES (${this.tableTypes.length} rows)\n`;
    this.tableTypes.forEach(tt => {
      sql += `INSERT OR REPLACE INTO table_types (id, club_id, name, description, min_spend_cents, deposit_cents, max_guests, is_active) VALUES ('${tt.id}', '${tt.club_id}', '${(tt.name || '').replace(/'/g, "''")}', '${(tt.description || '').replace(/'/g, "''")}', ${tt.min_spend_cents || 0}, ${tt.deposit_cents || 0}, ${tt.max_guests || 4}, ${tt.is_active ?? 1});\n`;
    });
    sql += `\n`;

    // 4. Physical Club Tables
    sql += `-- 4. PHYSICAL CLUB TABLES (${this.clubTables.length} rows)\n`;
    this.clubTables.forEach(t => {
      sql += `INSERT OR REPLACE INTO club_tables (id, club_id, table_type_id, table_number, location_description, is_active) VALUES ('${t.id}', '${t.club_id}', '${t.table_type_id}', '${(t.table_number || '').replace(/'/g, "''")}', '${(t.location_description || '').replace(/'/g, "''")}', ${t.is_active ?? 1});\n`;
    });
    sql += `\n`;

    // 5. Bookings
    sql += `-- 5. BOOKINGS (${this.bookings.length} rows)\n`;
    this.bookings.forEach(b => {
      sql += `INSERT OR REPLACE INTO bookings (id, club_id, table_id, user_id, booking_date, arrival_time, guest_count, min_spend_cents, deposit_paid_cents, status, special_requests, created_at) VALUES ('${b.id}', '${b.club_id}', '${b.table_id}', '${b.user_id}', '${b.booking_date}', '${b.arrival_time}', ${b.guest_count || 1}, ${b.min_spend_cents || 0}, ${b.deposit_paid_cents || 0}, '${b.status}', '${(b.special_requests || '').replace(/'/g, "''")}', '${b.created_at}');\n`;
    });

    return sql;
  }
}

export const db = new AfterHoursDatabase();
