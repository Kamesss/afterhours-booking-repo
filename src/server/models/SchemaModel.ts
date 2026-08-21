// ============================================================================
// D1 SQLITE SCHEMA DEFINITIONS & MIGRATION CONTROLLER
// ============================================================================
import { D1Database } from '../../types';

export class SchemaModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  public static getDDLStatements(): string[] {
    return [
      // 1. USERS & ROLES
      `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          hashed_password TEXT NOT NULL,
          full_name TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'CUSTOMER' 
              CHECK (role IN ('CUSTOMER', 'PROMOTER', 'VENUE_STAFF', 'VENUE_MANAGER', 'ADMIN')),
          promoter_code TEXT UNIQUE,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
      `CREATE INDEX IF NOT EXISTS idx_users_promoter_code ON users(promoter_code);`,

      // 2. VENUES
      `CREATE TABLE IF NOT EXISTS venues (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          tagline TEXT,
          address TEXT NOT NULL,
          open_time TEXT NOT NULL,
          close_time TEXT NOT NULL,
          guestlist_cutoff_time TEXT NOT NULL,
          max_capacity INTEGER NOT NULL,
          current_occupancy INTEGER NOT NULL DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,
      `CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);`,
      `CREATE INDEX IF NOT EXISTS idx_venues_address ON venues(address);`,

      // 3. TABLES
      `CREATE TABLE IF NOT EXISTS tables (
          id TEXT PRIMARY KEY,
          venue_id TEXT NOT NULL,
          table_number TEXT NOT NULL,
          category TEXT NOT NULL 
              CHECK (category IN ('VIP_COUCH', 'DANCEFLOOR_HIGH', 'COCKTAIL', 'OWNER_BOOTH')),
          capacity INTEGER NOT NULL,
          min_spend_php REAL NOT NULL,
          deposit_required_php REAL NOT NULL,
          coord_x INTEGER NOT NULL,
          coord_y INTEGER NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_tables_venue ON tables(venue_id);`,

      // 4. TABLE BOOKINGS
      `CREATE TABLE IF NOT EXISTS table_bookings (
          id TEXT PRIMARY KEY,
          booking_ref TEXT UNIQUE NOT NULL,
          venue_id TEXT NOT NULL,
          table_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          target_date TEXT NOT NULL,
          guest_count INTEGER NOT NULL,
          deposit_amount_php REAL NOT NULL,
          min_spend_php REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT'
              CHECK (status IN ('DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'EXPIRED')),
          idempotency_key TEXT UNIQUE NOT NULL,
          hold_expires_at TEXT,
          promoter_code TEXT,
          payment_method TEXT,
          payment_reference TEXT,
          checked_in_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (venue_id) REFERENCES venues(id),
          FOREIGN KEY (table_id) REFERENCES tables(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (promoter_code) REFERENCES users(promoter_code)
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS uq_table_date_confirmed 
       ON table_bookings(table_id, target_date) 
       WHERE status IN ('CONFIRMED', 'CHECKED_IN');`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_user ON table_bookings(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_venue_date ON table_bookings(venue_id, target_date);`,

      // 5. GUESTLISTS
      `CREATE TABLE IF NOT EXISTS guestlists (
          id TEXT PRIMARY KEY,
          pass_ref TEXT UNIQUE NOT NULL,
          venue_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          target_date TEXT NOT NULL,
          guest_count INTEGER NOT NULL DEFAULT 1,
          promoter_code TEXT,
          status TEXT NOT NULL DEFAULT 'ACTIVE'
              CHECK (status IN ('ACTIVE', 'CHECKED_IN', 'EXPIRED_CUTOFF', 'REVOKED')),
          cutoff_time TEXT NOT NULL,
          checked_in_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (venue_id) REFERENCES venues(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
      );`,
      `CREATE INDEX IF NOT EXISTS idx_guestlists_venue_date ON guestlists(venue_id, target_date);`,
      `CREATE INDEX IF NOT EXISTS idx_guestlists_pass_ref ON guestlists(pass_ref);`,

      // 6. LEDGER TRANSACTIONS & POSTINGS
      `CREATE TABLE IF NOT EXISTS ledger_transactions (
          id TEXT PRIMARY KEY,
          transaction_ref TEXT UNIQUE NOT NULL,
          reference_type TEXT NOT NULL,
          reference_id TEXT NOT NULL,
          idempotency_key TEXT UNIQUE NOT NULL,
          description TEXT NOT NULL,
          previous_hash TEXT NOT NULL,
          block_hash TEXT NOT NULL,
          timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      );`,
      `CREATE TABLE IF NOT EXISTS ledger_postings (
          id TEXT PRIMARY KEY,
          transaction_id TEXT NOT NULL,
          account TEXT NOT NULL 
              CHECK (account IN (
                  'CASH_GATEWAY_RECEIVABLE',
                  'USER_DEPOSIT_HOLDING',
                  'VENUE_PAYOUT_PAYABLE',
                  'PROMOTER_COMMISSION_PAYABLE',
                  'PLATFORM_REVENUE'
              )),
          posting_type TEXT NOT NULL 
              CHECK (posting_type IN ('DEBIT', 'CREDIT')),
          amount_php REAL NOT NULL CHECK (amount_php > 0),
          FOREIGN KEY (transaction_id) REFERENCES ledger_transactions(id) ON DELETE RESTRICT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_postings_tx ON ledger_postings(transaction_id);`,
      `CREATE INDEX IF NOT EXISTS idx_postings_account ON ledger_postings(account);`
    ];
  }

  public async initializeDatabase(): Promise<boolean> {
    const statements = SchemaModel.getDDLStatements();
    for (const sql of statements) {
      try {
        await this.db.prepare(sql).run();
      } catch (err) {
        console.error('Schema initialization error for SQL:', sql, err);
      }
    }
    return true;
  }
}
