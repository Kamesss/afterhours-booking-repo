import { BaseModel } from './BaseModel';
import { TableType } from '../../types';

export interface RawTableTypeRow {
  id: string;
  club_id: string;
  name: string;
  description?: string | null;
  min_spend_cents: number;
  deposit_cents: number;
  max_guests: number;
  is_active: number;
  perks?: string;
  tier_badge?: string;
}

export class TableTypeModel extends BaseModel {
  async findByClubId(clubId?: string | null): Promise<RawTableTypeRow[]> {
    let query = 'SELECT * FROM table_types';
    let stmt = this.db.prepare(query);

    if (clubId) {
      query += ' WHERE club_id = ?';
      stmt = this.db.prepare(query).bind(clubId);
    }

    const { results } = await stmt.all<RawTableTypeRow>();
    return results || [];
  }

  async findById(id: string): Promise<RawTableTypeRow | null> {
    const res = await this.db.prepare('SELECT * FROM table_types WHERE id = ?').bind(id).first<RawTableTypeRow>();
    return res || null;
  }

  async create(data: Partial<TableType>): Promise<RawTableTypeRow | null> {
    const id = data.id || `tt_${Date.now().toString(36)}`;

    await this.db
      .prepare(`
        INSERT INTO table_types (
          id, club_id, name, description, min_spend_cents, deposit_cents, max_guests, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        data.club_id,
        data.name || 'Standard Table',
        data.description || '',
        Number(data.min_spend_cents || 0),
        Number(data.deposit_cents || 0),
        Number(data.max_guests || 4),
        Number(data.is_active ?? 1)
      )
      .run();

    return this.findById(id);
  }

  async update(id: string, updates: Partial<TableType>): Promise<RawTableTypeRow | null> {
    await this.db
      .prepare(`
        UPDATE table_types SET
          min_spend_cents = COALESCE(?, min_spend_cents),
          deposit_cents = COALESCE(?, deposit_cents),
          max_guests = COALESCE(?, max_guests),
          is_active = COALESCE(?, is_active),
          name = COALESCE(?, name),
          description = COALESCE(?, description)
        WHERE id = ?
      `)
      .bind(
        updates.min_spend_cents ?? null,
        updates.deposit_cents ?? null,
        updates.max_guests ?? null,
        updates.is_active ?? null,
        updates.name ?? null,
        updates.description ?? null,
        id
      )
      .run();

    return this.findById(id);
  }
}
