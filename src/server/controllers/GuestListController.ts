import { GuestListModel } from '../models/GuestListModel';
import { GuestListView } from '../views/GuestListView';
import { ApiResponseView } from '../views/ApiResponseView';
import { D1Database, GuestListEntry } from '../../types';

export class GuestListController {
  private guestListModel: GuestListModel;

  constructor(db: D1Database) {
    this.guestListModel = new GuestListModel(db);
  }

  async index(url: URL): Promise<Response> {
    try {
      const clubId = url.searchParams.get('club_id');
      const userId = url.searchParams.get('user_id');

      const rawRows = await this.guestListModel.find({ clubId, userId });
      return ApiResponseView.success(GuestListView.renderList(rawRows));
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to fetch guest list from D1', err.message);
    }
  }

  async create(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as Partial<GuestListEntry>;

      if (!body.club_id || !body.user_id || !body.event_date || !body.guest_name || !body.guest_email) {
        return ApiResponseView.badRequest('Missing required fields for guest list entry');
      }

      const created = await this.guestListModel.create(body);
      if (!created) {
        return ApiResponseView.serverError('Failed to create guest list pass in D1');
      }

      return ApiResponseView.created({
        success: true,
        entry: GuestListView.render(created),
      });
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to save guest list entry', err.message);
    }
  }
}
