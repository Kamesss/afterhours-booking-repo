import { BaseModel } from './BaseModel';
import { Booking, BookingStatus } from '../../types';

export interface RawBookingRow {
  id: string;
  club_id: string;
  table_id: string;
  user_id: string;
  booking_date: string;
  arrival_time: string;
  guest_count: number;
  min_spend_cents: number;
  deposit_paid_cents: number;
  status: BookingStatus;
  special_requests?: string | null;
  created_at: string;
  qr_code?: string;
  ambassador_promo_code?: string;
  commission_cents?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  payment_method?: string;
  checked_in_at?: string;
}

export class BookingModel extends BaseModel {
  async find(filter: { clubId?: string | null; date?: string | null; userId?: string | null }): Promise<RawBookingRow[]> {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filter.clubId) {
      conditions.push('club_id = ?');
      params.push(filter.clubId);
    }
    if (filter.date) {
      conditions.push('booking_date = ?');
      params.push(filter.date);
    }
    if (filter.userId) {
      conditions.push('user_id = ?');
      params.push(filter.userId);
    }

    let sql = 'SELECT * FROM bookings';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql).bind(...params);
    const { results } = await stmt.all<RawBookingRow>();
    return results || [];
  }

  async findById(id: string): Promise<RawBookingRow | null> {
    const res = await this.db.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<RawBookingRow>();
    return res || null;
  }

  async checkDoubleBookingConflict(tableId: string, bookingDate: string): Promise<boolean> {
    const existing = await this.db
      .prepare(`
        SELECT id FROM bookings 
        WHERE table_id = ? AND booking_date = ? AND status IN ('confirmed', 'pending')
      `)
      .bind(tableId, bookingDate)
      .first<{ id: string }>();

    return Boolean(existing);
  }

  async create(data: Partial<Booking>): Promise<RawBookingRow | null> {
    const id = data.id || `bkg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = BaseModel.getCurrentTimestamp();

    await this.db
      .prepare(`
        INSERT INTO bookings (
          id, club_id, table_id, user_id, booking_date, arrival_time, guest_count,
          min_spend_cents, deposit_paid_cents, status, special_requests, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        data.club_id,
        data.table_id,
        data.user_id,
        data.booking_date,
        data.arrival_time || '23:00',
        Number(data.guest_count || 1),
        Number(data.min_spend_cents || 0),
        Number(data.deposit_paid_cents || 0),
        data.status || 'confirmed',
        data.special_requests || '',
        createdAt
      )
      .run();

    return this.findById(id);
  }

  async updateStatus(id: string, status: BookingStatus, checkedInAt?: string): Promise<RawBookingRow | null> {
    if (checkedInAt) {
      await this.db
        .prepare('UPDATE bookings SET status = ? WHERE id = ?')
        .bind(status, id)
        .run();
    } else {
      await this.db
        .prepare('UPDATE bookings SET status = ? WHERE id = ?')
        .bind(status, id)
        .run();
    }

    return this.findById(id);
  }
}
