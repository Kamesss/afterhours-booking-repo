import { RawTableTypeRow } from '../models/TableTypeModel';
import { RawClubTableRow } from '../models/ClubTableModel';
import { TableType, ClubTable } from '../../types';

function safeParse<T>(val: unknown, fallback: T): T {
  if (typeof val !== 'string') return (val as T) || fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export class TableView {
  static renderTableType(row: RawTableTypeRow): TableType {
    const minSpend = Number(row.min_spend_cents || 0);
    const fallbackTier = minSpend >= 1500000 ? 'Ultra VIP' : minSpend >= 800000 ? 'VIP' : 'Standard';

    return {
      id: String(row.id),
      club_id: String(row.club_id),
      name: String(row.name),
      description: row.description || '',
      min_spend_cents: minSpend,
      deposit_cents: Number(row.deposit_cents || 0),
      max_guests: Number(row.max_guests || 4),
      is_active: Number(row.is_active ?? 1),
      perks: safeParse(row.perks, ['VIP Service', 'Consumable on F&B']),
      tier_badge: row.tier_badge || fallbackTier,
    };
  }

  static renderTableTypeList(rows: RawTableTypeRow[]): TableType[] {
    return rows.map(this.renderTableType);
  }

  static renderClubTable(row: RawClubTableRow): ClubTable {
    return {
      id: String(row.id),
      club_id: String(row.club_id),
      table_type_id: String(row.table_type_id),
      table_number: String(row.table_number),
      location_description: row.location_description || '',
      is_active: Number(row.is_active ?? 1),
      x: Number(row.x || 50),
      y: Number(row.y || 50),
      width: row.width ? Number(row.width) : undefined,
      height: row.height ? Number(row.height) : undefined,
      shape: row.shape || 'booth',
    };
  }

  static renderClubTableList(rows: RawClubTableRow[]): ClubTable[] {
    return rows.map(this.renderClubTable);
  }
}
