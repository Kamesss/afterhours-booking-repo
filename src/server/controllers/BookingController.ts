import { BookingModel } from '../models/BookingModel';
import { TableModel } from '../models/TableModel';
import { LedgerModel } from '../models/LedgerModel';
import { ApiResponseView } from '../views/ApiResponseView';
import { TableBooking, LedgerTransaction, LedgerPosting } from '../../types';

export class BookingController {
  private bookingModel: BookingModel;
  private tableModel: TableModel;
  private ledgerModel: LedgerModel;

  constructor(bookingModel: BookingModel, tableModel: TableModel, ledgerModel: LedgerModel) {
    this.bookingModel = bookingModel;
    this.tableModel = tableModel;
    this.ledgerModel = ledgerModel;
  }

  async getBookings(venueId?: string, targetDate?: string, userId?: string): Promise<Response> {
    try {
      if (userId) {
        const bookings = await this.bookingModel.getByUser(userId);
        return ApiResponseView.json({ success: true, data: bookings });
      }
      if (venueId && targetDate) {
        const bookings = await this.bookingModel.getByVenueAndDate(venueId, targetDate);
        return ApiResponseView.json({ success: true, data: bookings });
      }
      const bookings = await this.bookingModel.getAll();
      return ApiResponseView.json({ success: true, data: bookings });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to fetch bookings: ${err.message}`, 500);
    }
  }

  async createBooking(body: any): Promise<Response> {
    try {
      const {
        venue_id,
        table_id,
        user_id,
        target_date,
        guest_count,
        deposit_amount_php,
        min_spend_php,
        promoter_code,
        payment_method,
        payment_reference
      } = body;

      if (!venue_id || !table_id || !user_id || !target_date) {
        return ApiResponseView.error('Missing required booking fields', 400);
      }

      // Check atomic double-booking lock
      const isBooked = await this.bookingModel.isTableBooked(table_id, target_date);
      if (isBooked) {
        return ApiResponseView.error('Table is already reserved for this target date', 409);
      }

      const bookingId = `bk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const randomRefNum = Math.floor(1000 + Math.random() * 9000);
      const bookingRef = `AH-CEB-${randomRefNum}`;
      const idempotencyKey = `idemp_bk_${randomRefNum}_${Math.random().toString(36).substring(2, 8)}`;

      const newBooking: TableBooking = {
        id: bookingId,
        booking_ref: bookingRef,
        venue_id,
        table_id,
        user_id,
        target_date,
        guest_count: Number(guest_count) || 2,
        deposit_amount_php: Number(deposit_amount_php) || 0,
        min_spend_php: Number(min_spend_php) || 0,
        status: 'CONFIRMED',
        idempotency_key: idempotencyKey,
        hold_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        promoter_code: promoter_code || null,
        payment_method: payment_method || 'GCASH',
        payment_reference: payment_reference || `PAYMONGO_${Date.now()}`,
        checked_in_at: null
      };

      const success = await this.bookingModel.insert(newBooking);
      if (!success) {
        return ApiResponseView.error('Failed to create booking', 500);
      }

      // Automatically create balanced double-entry ledger journal transaction
      if (newBooking.deposit_amount_php > 0) {
        const txId = `tx_${Date.now().toString(36)}`;
        const txRef = `TXN-${target_date.replace(/-/g, '')}-${randomRefNum}`;
        const grossDeposit = newBooking.deposit_amount_php;
        const promoterCommission = promoter_code ? Math.round(grossDeposit * 0.10) : 0;
        const platformFee = Math.round(grossDeposit * 0.035 + 15);
        const venuePayout = grossDeposit - promoterCommission - platformFee;

        const ledgerTx: LedgerTransaction = {
          id: txId,
          transaction_ref: txRef,
          reference_type: 'TABLE_DEPOSIT',
          reference_id: newBooking.id,
          idempotency_key: idempotencyKey,
          description: `Table deposit hold for booking ${bookingRef}${promoter_code ? ` (Promoter: ${promoter_code})` : ''}`,
          previous_hash: '0000000000000000000000000000000000000000000000000000000000000000',
          block_hash: `blk_${Math.random().toString(36).substring(2, 12)}`
        };

        const postings: LedgerPosting[] = [
          { id: `post_${Date.now()}_1`, transaction_id: txId, account: 'CASH_GATEWAY_RECEIVABLE', posting_type: 'DEBIT', amount_php: grossDeposit },
          { id: `post_${Date.now()}_2`, transaction_id: txId, account: 'VENUE_PAYOUT_PAYABLE', posting_type: 'CREDIT', amount_php: venuePayout }
        ];

        if (promoterCommission > 0) {
          postings.push({ id: `post_${Date.now()}_3`, transaction_id: txId, account: 'PROMOTER_COMMISSION_PAYABLE', posting_type: 'CREDIT', amount_php: promoterCommission });
        }
        if (platformFee > 0) {
          postings.push({ id: `post_${Date.now()}_4`, transaction_id: txId, account: 'PLATFORM_REVENUE', posting_type: 'CREDIT', amount_php: platformFee });
        }

        await this.ledgerModel.insertTransaction(ledgerTx, postings);
      }

      return ApiResponseView.json({ success: true, data: newBooking }, 201);
    } catch (err: any) {
      return ApiResponseView.error(`Error booking table: ${err.message}`, 500);
    }
  }
}
