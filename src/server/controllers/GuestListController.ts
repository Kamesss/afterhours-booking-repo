import { GuestListModel } from '../models/GuestListModel';
import { ApiResponseView } from '../views/ApiResponseView';
import { GuestlistEntry } from '../../types';

export class GuestListController {
  private guestListModel: GuestListModel;

  constructor(guestListModel: GuestListModel) {
    this.guestListModel = guestListModel;
  }

  async getGuestlist(venueId?: string, targetDate?: string, userId?: string): Promise<Response> {
    try {
      if (userId) {
        const list = await this.guestListModel.getByUser(userId);
        return ApiResponseView.json({ success: true, data: list });
      }
      if (venueId && targetDate) {
        const list = await this.guestListModel.getByVenueAndDate(venueId, targetDate);
        return ApiResponseView.json({ success: true, data: list });
      }
      const list = await this.guestListModel.getAll();
      return ApiResponseView.json({ success: true, data: list });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to fetch guest list: ${err.message}`, 500);
    }
  }

  async addGuestlistEntry(body: any): Promise<Response> {
    try {
      const { venue_id, user_id, target_date, guest_count, promoter_code, cutoff_time } = body;
      if (!venue_id || !user_id || !target_date) {
        return ApiResponseView.error('Missing required guest list fields', 400);
      }

      const id = `gl_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const randomRefNum = Math.floor(1000 + Math.random() * 9000);
      const passRef = `GL-${venue_id.replace('ven_', '').toUpperCase()}-${randomRefNum}`;

      const entry: GuestlistEntry = {
        id,
        pass_ref: passRef,
        venue_id,
        user_id,
        target_date,
        guest_count: Number(guest_count) || 1,
        promoter_code: promoter_code || null,
        status: 'ACTIVE',
        cutoff_time: cutoff_time || '23:30',
        checked_in_at: null
      };

      const ok = await this.guestListModel.insert(entry);
      if (!ok) return ApiResponseView.error('Failed to create guestlist pass', 500);

      return ApiResponseView.json({ success: true, data: entry }, 201);
    } catch (err: any) {
      return ApiResponseView.error(`Error creating guestlist entry: ${err.message}`, 500);
    }
  }
}
