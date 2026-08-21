import { BookingModel } from '../models/BookingModel';
import { GuestListModel } from '../models/GuestListModel';
import { VenueModel } from '../models/VenueModel';
import { UserModel } from '../models/UserModel';
import { TableModel } from '../models/TableModel';
import { ApiResponseView } from '../views/ApiResponseView';

export class PassVerificationController {
  private bookingModel: BookingModel;
  private guestListModel: GuestListModel;
  private venueModel: VenueModel;
  private userModel: UserModel;
  private tableModel: TableModel;

  constructor(
    bookingModel: BookingModel,
    guestListModel: GuestListModel,
    venueModel: VenueModel,
    userModel: UserModel,
    tableModel: TableModel
  ) {
    this.bookingModel = bookingModel;
    this.guestListModel = guestListModel;
    this.venueModel = venueModel;
    this.userModel = userModel;
    this.tableModel = tableModel;
  }

  async verifyPass(refCode: string, action?: 'verify' | 'check_in'): Promise<Response> {
    try {
      const code = refCode.trim().toUpperCase();

      // Check Table Booking Ref (e.g. 'AH-CEB-8921')
      const booking = await this.bookingModel.getByRef(code);
      if (booking) {
        const venue = await this.venueModel.getById(booking.venue_id);
        const user = await this.userModel.getById(booking.user_id);
        const table = await this.tableModel.getById(booking.table_id);

        if (action === 'check_in' && booking.status === 'CONFIRMED') {
          await this.bookingModel.checkIn(booking.booking_ref);
          booking.status = 'CHECKED_IN';
          booking.checked_in_at = new Date().toISOString();
          if (venue) {
            await this.venueModel.updateOccupancy(venue.id, booking.guest_count);
          }
        }

        return ApiResponseView.json({
          success: true,
          type: 'TABLE_BOOKING',
          valid: booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN',
          data: {
            ...booking,
            venue,
            user,
            table
          }
        });
      }

      // Check Guestlist Pass Ref (e.g. 'GL-KAZ-4109')
      const guestlist = await this.guestListModel.getByPassRef(code);
      if (guestlist) {
        const venue = await this.venueModel.getById(guestlist.venue_id);
        const user = await this.userModel.getById(guestlist.user_id);

        if (action === 'check_in' && guestlist.status === 'ACTIVE') {
          await this.guestListModel.checkIn(guestlist.pass_ref);
          guestlist.status = 'CHECKED_IN';
          guestlist.checked_in_at = new Date().toISOString();
          if (venue) {
            await this.venueModel.updateOccupancy(venue.id, guestlist.guest_count);
          }
        }

        return ApiResponseView.json({
          success: true,
          type: 'GUESTLIST_PASS',
          valid: guestlist.status === 'ACTIVE' || guestlist.status === 'CHECKED_IN',
          data: {
            ...guestlist,
            venue,
            user
          }
        });
      }

      return ApiResponseView.error('Invalid pass or booking reference code', 404);
    } catch (err: any) {
      return ApiResponseView.error(`Verification error: ${err.message}`, 500);
    }
  }
}
