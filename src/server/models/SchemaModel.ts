import { BaseModel } from './BaseModel';

export class SchemaModel extends BaseModel {
  async ensureSchema(): Promise<void> {
    try {
      await this.db.batch([
        this.db.prepare(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            phone TEXT,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `),
        this.db.prepare(`
          CREATE TABLE IF NOT EXISTS clubs (
            id TEXT PRIMARY KEY,
            owner_id TEXT NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            address TEXT NOT NULL,
            min_age INTEGER NOT NULL DEFAULT 18,
            dress_code TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `),
        this.db.prepare(`
          CREATE TABLE IF NOT EXISTS table_types (
            id TEXT PRIMARY KEY,
            club_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            min_spend_cents INTEGER NOT NULL DEFAULT 0,
            deposit_cents INTEGER NOT NULL DEFAULT 0,
            max_guests INTEGER NOT NULL DEFAULT 4,
            is_active INTEGER NOT NULL DEFAULT 1
          )
        `),
        this.db.prepare(`
          CREATE TABLE IF NOT EXISTS club_tables (
            id TEXT PRIMARY KEY,
            club_id TEXT NOT NULL,
            table_type_id TEXT NOT NULL,
            table_number TEXT NOT NULL,
            location_description TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            UNIQUE(club_id, table_number)
          )
        `),
        this.db.prepare(`
          CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            club_id TEXT NOT NULL,
            table_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            booking_date TEXT NOT NULL,
            arrival_time TEXT NOT NULL,
            guest_count INTEGER NOT NULL DEFAULT 1,
            min_spend_cents INTEGER NOT NULL,
            deposit_paid_cents INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'confirmed',
            special_requests TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `),
        this.db.prepare(`
          CREATE TABLE IF NOT EXISTS guest_list (
            id TEXT PRIMARY KEY,
            club_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            event_date TEXT NOT NULL,
            guest_name TEXT NOT NULL,
            guest_email TEXT NOT NULL,
            guest_phone TEXT,
            pax INTEGER NOT NULL DEFAULT 1,
            arrival_time_estimate TEXT,
            status TEXT NOT NULL DEFAULT 'valid',
            qr_code TEXT NOT NULL UNIQUE,
            ambassador_perk TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            checked_in_at TEXT
          )
        `)
      ]);
    } catch (e) {
      console.warn('Schema initialization notice:', e);
    }
  }
}
