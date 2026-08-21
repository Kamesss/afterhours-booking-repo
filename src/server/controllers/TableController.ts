import { TableTypeModel } from '../models/TableTypeModel';
import { ClubTableModel } from '../models/ClubTableModel';
import { TableView } from '../views/TableView';
import { ApiResponseView } from '../views/ApiResponseView';
import { D1Database, TableType, ClubTable } from '../../types';

export class TableController {
  private tableTypeModel: TableTypeModel;
  private clubTableModel: ClubTableModel;

  constructor(db: D1Database) {
    this.tableTypeModel = new TableTypeModel(db);
    this.clubTableModel = new ClubTableModel(db);
  }

  // --- Table Types ---
  async indexTableTypes(url: URL): Promise<Response> {
    try {
      const clubId = url.searchParams.get('club_id');
      const rawRows = await this.tableTypeModel.findByClubId(clubId);
      return ApiResponseView.success(TableView.renderTableTypeList(rawRows));
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to fetch table types', err.message);
    }
  }

  async createTableType(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as Partial<TableType>;
      if (!body.club_id || !body.name) {
        return ApiResponseView.badRequest('club_id and name are required for table type');
      }

      const created = await this.tableTypeModel.create(body);
      if (!created) {
        return ApiResponseView.serverError('Failed to create table type');
      }

      return ApiResponseView.created(TableView.renderTableType(created));
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to create table type', err.message);
    }
  }

  async updateTableType(id: string, request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as Partial<TableType>;
      const updated = await this.tableTypeModel.update(id, body);
      if (!updated) {
        return ApiResponseView.notFound(`Table type ${id} not found`);
      }

      return ApiResponseView.success(TableView.renderTableType(updated));
    } catch (err: any) {
      return ApiResponseView.serverError(`Failed to update table type ${id}`, err.message);
    }
  }

  // --- Club Tables ---
  async indexClubTables(url: URL): Promise<Response> {
    try {
      const clubId = url.searchParams.get('club_id');
      const rawRows = await this.clubTableModel.findByClubId(clubId);
      return ApiResponseView.success(TableView.renderClubTableList(rawRows));
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to fetch club tables', err.message);
    }
  }

  async createClubTable(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as Partial<ClubTable>;
      if (!body.club_id || !body.table_type_id || !body.table_number) {
        return ApiResponseView.badRequest('club_id, table_type_id, and table_number are required');
      }

      const created = await this.clubTableModel.create(body);
      if (!created) {
        return ApiResponseView.serverError('Failed to create club table');
      }

      return ApiResponseView.created(TableView.renderClubTable(created));
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to insert table record', err.message);
    }
  }
}
