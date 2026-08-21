import { BookingModel } from '../models/BookingModel';
import { GuestListModel } from '../models/GuestListModel';
import { BookingView } from '../views/BookingView';
import { GuestListView } from '../views/GuestListView';
import { ApiResponseView } from '../views/ApiResponseView';
import { D1Database } from '../../types';

export class PassVerificationController {
  private bookingModel: BookingModel;
  private guestListModel: GuestListModel;

  constructor(db: D1Database) {
    this.bookingModel = new BookingModel(db);
    this.guestListModel = new GuestListModel(db);
  }

  async verify(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as { qr_code?: string };
      const rawCode = (body.qr_code || '').trim();

      if (!rawCode) {
        return ApiResponseView.badRequest('QR code is required');
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // 1. Search Table Bookings by ID or QR string
      const cleanBookingId = rawCode.replace(/^AH-[^-]+-/, '').replace(/^AH-/, '');
      const booking =
        (await this.bookingModel.findById(rawCode)) || (await this.bookingModel.findById(cleanBookingId));

      if (booking) {
        const parsed = BookingView.render(booking);

        if (parsed.status === 'completed') {
          return ApiResponseView.json({
            success: false,
            type: 'booking',
            data: parsed,
            message: `VIP Table pass already used/checked-in at ${parsed.checked_in_at || 'earlier tonight'}.`,
          });
        }

        await this.bookingModel.updateStatus(parsed.id, 'completed', now);
        parsed.status = 'completed';
        parsed.checked_in_at = now;

        return ApiResponseView.success({
          success: true,
          type: 'booking',
          data: parsed,
          message: `VALID VIP TABLE PASS! Checked in table ${parsed.table_id} for ${parsed.guest_count} guests.`,
        });
      }

      // 2. Search Guest List Passes
      const gl = await this.guestListModel.findByIdOrQr(rawCode);
      if (gl) {
        const parsed = GuestListView.render(gl);

        if (parsed.status === 'checked_in') {
          return ApiResponseView.json({
            success: false,
            type: 'guestlist',
            data: parsed,
            message: `Guest pass was already scanned at ${parsed.checked_in_at || 'earlier tonight'}.`,
          });
        }

        await this.guestListModel.markCheckedIn(parsed.id, now);
        parsed.status = 'checked_in';
        parsed.checked_in_at = now;

        return ApiResponseView.success({
          success: true,
          type: 'guestlist',
          data: parsed,
          message: `VALID GUEST LIST PASS! Admitted ${parsed.guest_name} (${parsed.pax} guests).`,
        });
      }

      return ApiResponseView.json(
        {
          success: false,
          type: 'unknown',
          message: 'Invalid pass code. Pass record not found in D1 database.',
        },
        404
      );
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to verify QR pass in D1', err.message);
    }
  }
}
