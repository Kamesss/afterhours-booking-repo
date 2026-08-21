import { BaseModel } from './BaseModel';
import { GuestListEntry } from '../../types';

export interface RawGuestListRow {
  id: string;
  club_id: string;
  user_id: string;
  event_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string | null;
  pax: number;
  arrival_time_estimate?: string | null;
  status: 'valid' | 'checked_in' | 'expired' | 'cancelled';
  qr_code: string;
  ambassador_perk?: string | null;
  created_at: string;
  checked_in_at?: string | null;
}

export class GuestListModel extends BaseModel {
  async find(filter: { clubId?: string | null; userId?: string | null }): Promise<RawGuestListRow[]> {
    const conditions: string[] = [];
    const params: string[] = [];

    if (filter.clubId) {
      conditions.push('club_id = ?');
      params.push(filter.clubId);
    }
    if (filter.userId) {
      conditions.push('user_id = ?');
      params.push(filter.userId);
    }

    let sql = 'SELECT * FROM guest_list';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const { results } = await this.db.prepare(sql).bind(...params).all<RawGuestListRow>();
    return results || [];
  }

  async findByIdOrQr(qrOrId: string): Promise<RawGuestListRow | null> {
    const res = await this.db
      .prepare('SELECT * FROM guest_list WHERE qr_code = ? OR id = ?')
      .bind(qrOrId, qrOrId)
      .first<RawGuestListRow>();
    return res || null;
  }

  async create(data: Partial<GuestListEntry>): Promise<RawGuestListRow | null> {
    const id = data.id || `gl_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = BaseModel.getCurrentTimestamp();
    const qrCode = data.qr_code || `AH-GL-${id}`;

    await this.db
      .prepare(`
        INSERT INTO guest_list (
          id, club_id, user_id, event_date, guest_name, guest_email, guest_phone,
          pax, arrival_time_estimate, status, qr_code, ambassador_perk, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        data.club_id,
        data.user_id,
        data.event_date,
        data.guest_name,
        data.guest_email,
        data.guest_phone || '',
        Number(data.pax || 1),
        data.arrival_time_estimate || '23:00',
        data.status || 'valid',
        qrCode,
        data.ambassador_perk || '⚡ Free Ambassador VIP Entry',
        createdAt
      )
      .run();

    return this.findByIdOrQr(id);
  }

  async markCheckedIn(id: string, checkedInAt: string): Promise<RawGuestListRow | null> {
    await this.db
      .prepare("UPDATE guest_list SET checked_in_at = ?, status = 'checked_in' WHERE id = ?")
      .bind(checkedInAt, id)
      .run();

    return this.findByIdOrQr(id);
  }
}
