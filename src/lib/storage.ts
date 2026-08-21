// ============================================================================
// AFTERHOURS CEBU - CLIENT-SIDE DATA STORE & D1 SYNC ADAPTER
// ============================================================================
import { 
  Venue, 
  TableItem, 
  TableBooking, 
  GuestlistEntry, 
  User, 
  LedgerTransaction, 
  LedgerPosting, 
  D1FullExport 
} from '../types';
import { 
  SEED_VENUES, 
  SEED_TABLES, 
  SEED_BOOKINGS, 
  SEED_GUESTLISTS, 
  SEED_USERS, 
  SEED_LEDGER_TRANSACTIONS, 
  SEED_LEDGER_POSTINGS 
} from './seedData';

const STORAGE_KEYS = {
  VENUES: 'afterhours_cebu_venues_v2',
  TABLES: 'afterhours_cebu_tables_v2',
  BOOKINGS: 'afterhours_cebu_bookings_v2',
  GUESTLIST: 'afterhours_cebu_guestlists_v2',
  USERS: 'afterhours_cebu_users_v2',
  LEDGER_TX: 'afterhours_cebu_ledger_tx_v2',
  LEDGER_POSTINGS: 'afterhours_cebu_ledger_postings_v2',
  CURRENT_USER_ID: 'afterhours_cebu_current_user_v2'
};

class ClientDataStore {
  private venues: Venue[] = [];
  private tables: TableItem[] = [];
  private bookings: TableBooking[] = [];
  private guestlists: GuestlistEntry[] = [];
  private users: User[] = [];
  private ledgerTransactions: LedgerTransaction[] = [];
  private ledgerPostings: LedgerPosting[] = [];
  private currentUserId: string = 'usr_c01';
  private initialized: boolean = false;

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.VENUES);
      const t = localStorage.getItem(STORAGE_KEYS.TABLES);
      const b = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const g = localStorage.getItem(STORAGE_KEYS.GUESTLIST);
      const u = localStorage.getItem(STORAGE_KEYS.USERS);
      const tx = localStorage.getItem(STORAGE_KEYS.LEDGER_TX);
      const post = localStorage.getItem(STORAGE_KEYS.LEDGER_POSTINGS);
      const cu = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

      this.venues = v ? JSON.parse(v) : SEED_VENUES;
      this.tables = t ? JSON.parse(t) : SEED_TABLES;
      this.bookings = b ? JSON.parse(b) : SEED_BOOKINGS;
      this.guestlists = g ? JSON.parse(g) : SEED_GUESTLISTS;
      this.users = u ? JSON.parse(u) : SEED_USERS;
      this.ledgerTransactions = tx ? JSON.parse(tx) : SEED_LEDGER_TRANSACTIONS;
      this.ledgerPostings = post ? JSON.parse(post) : SEED_LEDGER_POSTINGS;
      this.currentUserId = cu || 'usr_c01';
    } catch (e) {
      console.warn('Fallback to seed definitions', e);
      this.venues = SEED_VENUES;
      this.tables = SEED_TABLES;
      this.bookings = SEED_BOOKINGS;
      this.guestlists = SEED_GUESTLISTS;
      this.users = SEED_USERS;
      this.ledgerTransactions = SEED_LEDGER_TRANSACTIONS;
      this.ledgerPostings = SEED_LEDGER_POSTINGS;
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(this.venues));
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(this.tables));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
      localStorage.setItem(STORAGE_KEYS.GUESTLIST, JSON.stringify(this.guestlists));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.LEDGER_TX, JSON.stringify(this.ledgerTransactions));
      localStorage.setItem(STORAGE_KEYS.LEDGER_POSTINGS, JSON.stringify(this.ledgerPostings));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  public async syncWithServer(): Promise<boolean> {
    try {
      const res = await fetch('/api/d1-dump');
      if (res.ok) {
        const data: D1FullExport = await res.json();
        if (data && data.venues && data.venues.length > 0) {
          this.venues = data.venues;
          this.tables = data.tables || [];
          this.bookings = data.table_bookings || [];
          this.guestlists = data.guestlists || [];
          this.users = data.users || [];
          this.ledgerTransactions = data.ledger_transactions || [];
          this.ledgerPostings = data.ledger_postings || [];
          this.saveToLocalStorage();
          return true;
        }
      }
    } catch (err) {
      // Offline fallback
    }
    return false;
  }

  // --- GETTERS ---
  public getVenues(): Venue[] {
    return this.venues;
  }

  public getVenueById(id: string): Venue | undefined {
    return this.venues.find(v => v.id === id);
  }

  public getTablesByVenue(venueId: string): TableItem[] {
    return this.tables.filter(t => t.venue_id === venueId && t.is_active === 1);
  }

  public getTableById(id: string): TableItem | undefined {
    return this.tables.find(t => t.id === id);
  }

  public getBookings(venueId?: string, targetDate?: string): TableBooking[] {
    let result = this.bookings;
    if (venueId) result = result.filter(b => b.venue_id === venueId);
    if (targetDate) result = result.filter(b => b.target_date === targetDate);
    return result;
  }

  public getGuestlists(venueId?: string, targetDate?: string): GuestlistEntry[] {
    let result = this.guestlists;
    if (venueId) result = result.filter(g => g.venue_id === venueId);
    if (targetDate) result = result.filter(g => g.target_date === targetDate);
    return result;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getCurrentUser(): User {
    const user = this.users.find(u => u.id === this.currentUserId);
    return user || this.users[0] || SEED_USERS[0];
  }

  public setCurrentUserId(id: string): void {
    this.currentUserId = id;
    this.saveToLocalStorage();
  }

  public getLedgerTransactions(): LedgerTransaction[] {
    return this.ledgerTransactions;
  }

  public getLedgerPostings(): LedgerPosting[] {
    return this.ledgerPostings;
  }

  public isTableBooked(tableId: string, targetDate: string): boolean {
    return this.bookings.some(
      b => b.table_id === tableId && 
           b.target_date === targetDate && 
           (b.status === 'CONFIRMED' || b.status === 'CHECKED_IN')
    );
  }

  // --- ACTIONS ---
  public async createBooking(params: {
    venue_id: string;
    table_id: string;
    target_date: string;
    guest_count: number;
    deposit_amount_php: number;
    min_spend_php: number;
    promoter_code?: string | null;
    payment_method?: string;
  }): Promise<TableBooking> {
    const randomRefNum = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `AH-CEB-${randomRefNum}`;
    const id = `bk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const idempotencyKey = `idemp_bk_${randomRefNum}_${Math.random().toString(36).substring(2, 8)}`;

    const newBooking: TableBooking = {
      id,
      booking_ref: bookingRef,
      venue_id: params.venue_id,
      table_id: params.table_id,
      user_id: this.currentUserId,
      target_date: params.target_date,
      guest_count: params.guest_count,
      deposit_amount_php: params.deposit_amount_php,
      min_spend_php: params.min_spend_php,
      status: 'CONFIRMED',
      idempotency_key: idempotencyKey,
      hold_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      promoter_code: params.promoter_code || null,
      payment_method: params.payment_method || 'GCASH',
      payment_reference: `PAYMONGO_${Date.now()}`,
      checked_in_at: null,
      created_at: new Date().toISOString()
    };

    // Try server call first
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.bookings.unshift(json.data);
          this.saveToLocalStorage();
          return json.data;
        }
      }
    } catch (e) {
      // Local fallback
    }

    // Local ledger entry
    if (newBooking.deposit_amount_php > 0) {
      const txId = `tx_${Date.now().toString(36)}`;
      const txRef = `TXN-${params.target_date.replace(/-/g, '')}-${randomRefNum}`;
      const gross = newBooking.deposit_amount_php;
      const commission = params.promoter_code ? Math.round(gross * 0.10) : 0;
      const platformFee = Math.round(gross * 0.035 + 15);
      const venueNet = gross - commission - platformFee;

      const tx: LedgerTransaction = {
        id: txId,
        transaction_ref: txRef,
        reference_type: 'TABLE_DEPOSIT',
        reference_id: newBooking.id,
        idempotency_key: idempotencyKey,
        description: `Table deposit hold for ${bookingRef}${params.promoter_code ? ` (Promoter: ${params.promoter_code})` : ''}`,
        previous_hash: '0000000000000000000000000000000000000000000000000000000000000000',
        block_hash: `blk_${Math.random().toString(36).substring(2, 12)}`,
        timestamp: new Date().toISOString()
      };

      const p1: LedgerPosting = { id: `post_${Date.now()}_1`, transaction_id: txId, account: 'CASH_GATEWAY_RECEIVABLE', posting_type: 'DEBIT', amount_php: gross };
      const p2: LedgerPosting = { id: `post_${Date.now()}_2`, transaction_id: txId, account: 'VENUE_PAYOUT_PAYABLE', posting_type: 'CREDIT', amount_php: venueNet };

      this.ledgerTransactions.unshift(tx);
      this.ledgerPostings.push(p1, p2);

      if (commission > 0) {
        this.ledgerPostings.push({ id: `post_${Date.now()}_3`, transaction_id: txId, account: 'PROMOTER_COMMISSION_PAYABLE', posting_type: 'CREDIT', amount_php: commission });
      }
      if (platformFee > 0) {
        this.ledgerPostings.push({ id: `post_${Date.now()}_4`, transaction_id: txId, account: 'PLATFORM_REVENUE', posting_type: 'CREDIT', amount_php: platformFee });
      }
    }

    this.bookings.unshift(newBooking);
    this.saveToLocalStorage();
    return newBooking;
  }

  public async createGuestlistPass(params: {
    venue_id: string;
    target_date: string;
    guest_count: number;
    promoter_code?: string | null;
    cutoff_time: string;
  }): Promise<GuestlistEntry> {
    const randomRefNum = Math.floor(1000 + Math.random() * 9000);
    const passRef = `GL-${params.venue_id.replace('ven_', '').toUpperCase()}-${randomRefNum}`;
    const id = `gl_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const newPass: GuestlistEntry = {
      id,
      pass_ref: passRef,
      venue_id: params.venue_id,
      user_id: this.currentUserId,
      target_date: params.target_date,
      guest_count: params.guest_count || 1,
      promoter_code: params.promoter_code || null,
      status: 'ACTIVE',
      cutoff_time: params.cutoff_time,
      checked_in_at: null,
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/guestlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPass)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.guestlists.unshift(json.data);
          this.saveToLocalStorage();
          return json.data;
        }
      }
    } catch (e) {
      // Local fallback
    }

    this.guestlists.unshift(newPass);
    this.saveToLocalStorage();
    return newPass;
  }

  public async verifyAndCheckIn(refCode: string): Promise<{ success: boolean; message: string; passType?: string; data?: any }> {
    const code = refCode.trim().toUpperCase();

    // Check table booking
    const booking = this.bookings.find(b => b.booking_ref === code);
    if (booking) {
      booking.status = 'CHECKED_IN';
      booking.checked_in_at = new Date().toISOString();
      const venue = this.getVenueById(booking.venue_id);
      if (venue) venue.current_occupancy = Math.min(venue.max_capacity, venue.current_occupancy + booking.guest_count);
      this.saveToLocalStorage();
      return { success: true, message: `VIP Table ${booking.booking_ref} checked in successfully!`, passType: 'TABLE_BOOKING', data: booking };
    }

    // Check guestlist
    const guestlist = this.guestlists.find(g => g.pass_ref === code);
    if (guestlist) {
      guestlist.status = 'CHECKED_IN';
      guestlist.checked_in_at = new Date().toISOString();
      const venue = this.getVenueById(guestlist.venue_id);
      if (venue) venue.current_occupancy = Math.min(venue.max_capacity, venue.current_occupancy + guestlist.guest_count);
      this.saveToLocalStorage();
      return { success: true, message: `Guestlist Pass ${guestlist.pass_ref} checked in successfully!`, passType: 'GUESTLIST_PASS', data: guestlist };
    }

    return { success: false, message: 'Invalid or unknown reference code' };
  }

  public resetToSeed(): void {
    this.venues = SEED_VENUES;
    this.tables = SEED_TABLES;
    this.bookings = SEED_BOOKINGS;
    this.guestlists = SEED_GUESTLISTS;
    this.users = SEED_USERS;
    this.ledgerTransactions = SEED_LEDGER_TRANSACTIONS;
    this.ledgerPostings = SEED_LEDGER_POSTINGS;
    this.currentUserId = 'usr_c01';
    this.saveToLocalStorage();
  }
}

export const clientStore = new ClientDataStore();
