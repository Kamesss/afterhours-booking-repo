import { TableModel } from '../models/TableModel';
import { ApiResponseView } from '../views/ApiResponseView';

export class TableController {
  private tableModel: TableModel;

  constructor(tableModel: TableModel) {
    this.tableModel = tableModel;
  }

  async getAllTables(): Promise<Response> {
    try {
      const tables = await this.tableModel.getAll();
      return ApiResponseView.json({ success: true, data: tables });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to fetch tables: ${err.message}`, 500);
    }
  }

  async getTableById(id: string): Promise<Response> {
    try {
      const table = await this.tableModel.getById(id);
      if (!table) return ApiResponseView.error('Table not found', 404);
      return ApiResponseView.json({ success: true, data: table });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to fetch table: ${err.message}`, 500);
    }
  }
}
