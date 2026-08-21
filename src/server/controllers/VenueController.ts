import { VenueModel } from '../models/VenueModel';
import { TableModel } from '../models/TableModel';
import { ApiResponseView } from '../views/ApiResponseView';
import { Venue } from '../../types';

export class VenueController {
  private venueModel: VenueModel;
  private tableModel: TableModel;

  constructor(venueModel: VenueModel, tableModel: TableModel) {
    this.venueModel = venueModel;
    this.tableModel = tableModel;
  }

  async getAllVenues(): Promise<Response> {
    try {
      const venues = await this.venueModel.getAllActive();
      return ApiResponseView.json({ success: true, data: venues });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to fetch venues: ${err.message}`, 500);
    }
  }

  async getVenueById(id: string): Promise<Response> {
    try {
      const venue = await this.venueModel.getById(id);
      if (!venue) {
        return ApiResponseView.error('Venue not found', 404);
      }
      return ApiResponseView.json({ success: true, data: venue });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to fetch venue: ${err.message}`, 500);
    }
  }

  async getTablesByVenue(venueId: string): Promise<Response> {
    try {
      const tables = await this.tableModel.getByVenue(venueId);
      return ApiResponseView.json({ success: true, data: tables });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to fetch tables: ${err.message}`, 500);
    }
  }

  async updateOccupancy(venueId: string, delta: number): Promise<Response> {
    try {
      const ok = await this.venueModel.updateOccupancy(venueId, delta);
      return ApiResponseView.json({ success: ok });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to update occupancy: ${err.message}`, 500);
    }
  }
}
