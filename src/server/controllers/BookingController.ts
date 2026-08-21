import { BookingModel } from '../models/BookingModel';
import { BookingView } from '../views/BookingView';
import { ApiResponseView } from '../views/ApiResponseView';
import { D1Database, Booking, BookingStatus } from '../../types';

export class BookingController {
  private bookingModel: BookingModel;

  constructor(db: D1Database) {
    this.bookingModel = new BookingModel(db);
  }

  async index(url: URL): Promise<Response> {
    try {
      const clubId = url.searchParams.get('club_id');
      const date = url.searchParams.get('date');
      const userId = url.searchParams.get('user_id');

      const rawRows = await this.bookingModel.find({ clubId, date, userId });
      return ApiResponseView.success(BookingView.renderList(rawRows));
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to fetch bookings', err.message);
    }
  }

  async create(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as Partial<Booking>;

      if (!body.club_id || !body.table_id || !body.booking_date || !body.user_id) {
        return ApiResponseView.badRequest('Missing required booking fields (club_id, table_id, user_id, booking_date)');
      }

      // Check double-booking constraint (Full-day table lock)
      const isConflict = await this.bookingModel.checkDoubleBookingConflict(body.table_id, body.booking_date);
      if (isConflict) {
        return ApiResponseView.conflict(`Table is already booked on ${body.booking_date}. Full-day lock active.`);
      }

      const created = await this.bookingModel.create(body);
      if (!created) {
        return ApiResponseView.serverError('Failed to save booking to D1');
      }

      return ApiResponseView.created({
        success: true,
        booking: BookingView.render(created),
      });
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to process booking', err.message);
    }
  }

  async updateStatus(id: string, request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as { status: BookingStatus };
      if (!body.status) {
        return ApiResponseView.badRequest('Status parameter is required');
      }

      const updated = await this.bookingModel.updateStatus(id, body.status);
      if (!updated) {
        return ApiResponseView.notFound(`Booking ${id} not found`);
      }

      return ApiResponseView.success({
        success: true,
        booking: BookingView.render(updated),
      });
    } catch (err: any) {
      return ApiResponseView.serverError(`Failed to update booking status ${id}`, err.message);
    }
  }
}
