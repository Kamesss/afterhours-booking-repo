import { BaseModel } from './BaseModel';
import { ClubTable } from '../../types';

export interface RawClubTableRow {
  id: string;
  club_id: string;
  table_type_id: string;
  table_number: string;
  location_description?: string | null;
  is_active: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  shape?: 'rect' | 'circle' | 'booth';
}

export class ClubTableModel extends BaseModel {
  async findByClubId(clubId?: string | null): Promise<RawClubTableRow[]> {
    let query = 'SELECT * FROM club_tables WHERE is_active = 1';
    let stmt = this.db.prepare(query);

    if (clubId) {
      query = 'SELECT * FROM club_tables WHERE club_id = ? AND is_active = 1';
      stmt = this.db.prepare(query).bind(clubId);
    }

    const { results } = await stmt.all<RawClubTableRow>();
    return results || [];
  }

  async findById(id: string): Promise<RawClubTableRow | null> {
    const res = await this.db.prepare('SELECT * FROM club_tables WHERE id = ?').bind(id).first<RawClubTableRow>();
    return res || null;
  }

  async create(data: Partial<ClubTable>): Promise<RawClubTableRow | null> {
    const id = data.id || `tbl_${Date.now().toString(36)}`;

    await this.db
      .prepare(`
        INSERT INTO club_tables (
          id, club_id, table_type_id, table_number, location_description, is_active
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        data.club_id,
        data.table_type_id,
        data.table_number || 'T-01',
        data.location_description || '',
        Number(data.is_active ?? 1)
      )
      .run();

    return this.findById(id);
  }
}
