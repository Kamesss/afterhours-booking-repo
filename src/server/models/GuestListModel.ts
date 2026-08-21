import { BaseModel } from './BaseModel';
import { GuestlistEntry } from '../../types';

export class GuestListModel extends BaseModel {
  async getByVenueAndDate(venueId: string, targetDate: string): Promise<GuestlistEntry[]> {
    const res = await this.db
      .prepare(`
        SELECT * FROM guestlists 
        WHERE venue_id = ? AND target_date = ?
        ORDER BY created_at DESC
      `)
      .bind(venueId, targetDate)
      .all<GuestlistEntry>();
    return res.results || [];
  }

  async getByUser(userId: string): Promise<GuestlistEntry[]> {
    const res = await this.db
      .prepare(`
        SELECT * FROM guestlists 
        WHERE user_id = ?
        ORDER BY target_date DESC, created_at DESC
      `)
      .bind(userId)
      .all<GuestlistEntry>();
    return res.results || [];
  }

  async getAll(): Promise<GuestlistEntry[]> {
    const res = await this.db
      .prepare('SELECT * FROM guestlists ORDER BY created_at DESC')
      .all<GuestlistEntry>();
    return res.results || [];
  }

  async getByPassRef(passRef: string): Promise<GuestlistEntry | null> {
    const res = await this.db
      .prepare('SELECT * FROM guestlists WHERE pass_ref = ?')
      .bind(passRef)
      .first<GuestlistEntry>();
    return res;
  }

  async insert(entry: GuestlistEntry): Promise<boolean> {
    const res = await this.db
      .prepare(`
        INSERT INTO guestlists (
          id, pass_ref, venue_id, user_id, target_date,
          guest_count, promoter_code, status, cutoff_time, checked_in_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        entry.id,
        entry.pass_ref,
        entry.venue_id,
        entry.user_id,
        entry.target_date,
        entry.guest_count || 1,
        entry.promoter_code || null,
        entry.status || 'ACTIVE',
        entry.cutoff_time,
        entry.checked_in_at || null
      )
      .run();
    return res.success;
  }

  async checkIn(passRef: string): Promise<boolean> {
    const res = await this.db
      .prepare(`
        UPDATE guestlists 
        SET status = 'CHECKED_IN', checked_in_at = datetime('now') 
        WHERE pass_ref = ? AND status = 'ACTIVE'
      `)
      .bind(passRef)
      .run();
    return res.success;
  }
}
