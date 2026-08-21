import { RawBookingRow } from '../models/BookingModel';
import { Booking } from '../../types';

export class BookingView {
  static render(row: RawBookingRow): Booking {
    const minSpend = Number(row.min_spend_cents || 0);
    return {
      id: String(row.id),
      club_id: String(row.club_id),
      table_id: String(row.table_id),
      user_id: String(row.user_id),
      booking_date: String(row.booking_date),
      arrival_time: String(row.arrival_time),
      guest_count: Number(row.guest_count || 1),
      min_spend_cents: minSpend,
      deposit_paid_cents: Number(row.deposit_paid_cents || 0),
      status: row.status || 'confirmed',
      special_requests: row.special_requests || '',
      created_at: String(row.created_at || new Date().toISOString()),
      qr_code: row.qr_code || `AH-${row.club_id}-${row.id}`,
      ambassador_promo_code: row.ambassador_promo_code || undefined,
      commission_cents: Number(row.commission_cents || Math.round(minSpend * 0.10)),
      customer_name: row.customer_name || 'VIP Guest',
      customer_email: row.customer_email || 'guest@afterhours.ph',
      customer_phone: row.customer_phone || '+63 900 000 0000',
      payment_method: row.payment_method || 'GCash',
      checked_in_at: row.checked_in_at || undefined,
    };
  }

  static renderList(rows: RawBookingRow[]): Booking[] {
    return rows.map(this.render);
  }
}
