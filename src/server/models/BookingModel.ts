import { BaseModel } from './BaseModel';
import { TableBooking } from '../../types';

export class BookingModel extends BaseModel {
  async getByVenueAndDate(venueId: string, targetDate: string): Promise<TableBooking[]> {
    const res = await this.db
      .prepare(`
        SELECT * FROM table_bookings 
        WHERE venue_id = ? AND target_date = ?
        ORDER BY created_at DESC
      `)
      .bind(venueId, targetDate)
      .all<TableBooking>();
    return res.results || [];
  }

  async getByUser(userId: string): Promise<TableBooking[]> {
    const res = await this.db
      .prepare(`
        SELECT * FROM table_bookings 
        WHERE user_id = ?
        ORDER BY target_date DESC, created_at DESC
      `)
      .bind(userId)
      .all<TableBooking>();
    return res.results || [];
  }

  async getAll(): Promise<TableBooking[]> {
    const res = await this.db
      .prepare('SELECT * FROM table_bookings ORDER BY created_at DESC')
      .all<TableBooking>();
    return res.results || [];
  }

  async getByRef(bookingRef: string): Promise<TableBooking | null> {
    const res = await this.db
      .prepare('SELECT * FROM table_bookings WHERE booking_ref = ?')
      .bind(bookingRef)
      .first<TableBooking>();
    return res;
  }

  async getById(id: string): Promise<TableBooking | null> {
    const res = await this.db
      .prepare('SELECT * FROM table_bookings WHERE id = ?')
      .bind(id)
      .first<TableBooking>();
    return res;
  }

  async isTableBooked(tableId: string, targetDate: string): Promise<boolean> {
    const res = await this.db
      .prepare(`
        SELECT id FROM table_bookings 
        WHERE table_id = ? 
          AND target_date = ? 
          AND status IN ('CONFIRMED', 'CHECKED_IN')
      `)
      .bind(tableId, targetDate)
      .first<{ id: string }>();
    return !!res;
  }

  async insert(booking: TableBooking): Promise<boolean> {
    const res = await this.db
      .prepare(`
        INSERT INTO table_bookings (
          id, booking_ref, venue_id, table_id, user_id,
          target_date, guest_count, deposit_amount_php, min_spend_php,
          status, idempotency_key, hold_expires_at, promoter_code,
          payment_method, payment_reference, checked_in_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        booking.id,
        booking.booking_ref,
        booking.venue_id,
        booking.table_id,
        booking.user_id,
        booking.target_date,
        booking.guest_count,
        booking.deposit_amount_php,
        booking.min_spend_php,
        booking.status || 'PENDING_PAYMENT',
        booking.idempotency_key,
        booking.hold_expires_at || null,
        booking.promoter_code || null,
        booking.payment_method || null,
        booking.payment_reference || null,
        booking.checked_in_at || null
      )
      .run();
    return res.success;
  }

  async checkIn(bookingRef: string): Promise<boolean> {
    const res = await this.db
      .prepare(`
        UPDATE table_bookings 
        SET status = 'CHECKED_IN', checked_in_at = datetime('now') 
        WHERE booking_ref = ? AND status = 'CONFIRMED'
      `)
      .bind(bookingRef)
      .run();
    return res.success;
  }
}
