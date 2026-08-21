import { BaseModel } from './BaseModel';
import { TableItem } from '../../types';

export class TableModel extends BaseModel {
  async getByVenue(venueId: string): Promise<TableItem[]> {
    const res = await this.db
      .prepare('SELECT * FROM tables WHERE venue_id = ? AND is_active = 1 ORDER BY table_number ASC')
      .bind(venueId)
      .all<TableItem>();
    return res.results || [];
  }

  async getAll(): Promise<TableItem[]> {
    const res = await this.db
      .prepare('SELECT * FROM tables WHERE is_active = 1 ORDER BY venue_id, table_number ASC')
      .all<TableItem>();
    return res.results || [];
  }

  async getById(id: string): Promise<TableItem | null> {
    const res = await this.db
      .prepare('SELECT * FROM tables WHERE id = ?')
      .bind(id)
      .first<TableItem>();
    return res;
  }

  async insert(table: TableItem): Promise<boolean> {
    const res = await this.db
      .prepare(`
        INSERT INTO tables (
          id, venue_id, table_number, category, capacity,
          min_spend_php, deposit_required_php, coord_x, coord_y, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        table.id,
        table.venue_id,
        table.table_number,
        table.category,
        table.capacity,
        table.min_spend_php,
        table.deposit_required_php,
        table.coord_x,
        table.coord_y,
        table.is_active ?? 1
      )
      .run();
    return res.success;
  }
}
