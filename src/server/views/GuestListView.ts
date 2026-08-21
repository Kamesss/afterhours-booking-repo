import { RawGuestListRow } from '../models/GuestListModel';
import { GuestListEntry } from '../../types';

export class GuestListView {
  static render(row: RawGuestListRow): GuestListEntry {
    return {
      id: String(row.id),
      club_id: String(row.club_id),
      user_id: String(row.user_id),
      event_date: String(row.event_date),
      guest_name: String(row.guest_name),
      guest_email: String(row.guest_email),
      guest_phone: row.guest_phone || '',
      pax: Number(row.pax || 1),
      arrival_time_estimate: row.arrival_time_estimate || '23:00',
      status: row.status || 'valid',
      qr_code: row.qr_code || `AH-GL-${row.id}`,
      ambassador_perk: row.ambassador_perk || '⚡ Free Ambassador VIP Entry',
      created_at: String(row.created_at || new Date().toISOString()),
      checked_in_at: row.checked_in_at || undefined,
    };
  }

  static renderList(rows: RawGuestListRow[]): GuestListEntry[] {
    return rows.map(this.render);
  }
}
