import { VenueModel } from '../models/VenueModel';
import { TableModel } from '../models/TableModel';
import { BookingModel } from '../models/BookingModel';
import { GuestListModel } from '../models/GuestListModel';
import { UserModel } from '../models/UserModel';
import { LedgerModel } from '../models/LedgerModel';
import { ApiResponseView } from '../views/ApiResponseView';
import { D1FullExport } from '../../types';

export class SyncController {
  private venueModel: VenueModel;
  private tableModel: TableModel;
  private bookingModel: BookingModel;
  private guestListModel: GuestListModel;
  private userModel: UserModel;
  private ledgerModel: LedgerModel;

  constructor(
    venueModel: VenueModel,
    tableModel: TableModel,
    bookingModel: BookingModel,
    guestListModel: GuestListModel,
    userModel: UserModel,
    ledgerModel: LedgerModel
  ) {
    this.venueModel = venueModel;
    this.tableModel = tableModel;
    this.bookingModel = bookingModel;
    this.guestListModel = guestListModel;
    this.userModel = userModel;
    this.ledgerModel = ledgerModel;
  }

  async getFullDump(): Promise<Response> {
    try {
      const [users, venues, tables, bookings, guestlists, ledgerTx, ledgerPostings] = await Promise.all([
        this.userModel.getAll(),
        this.venueModel.getAllActive(),
        this.tableModel.getAll(),
        this.bookingModel.getAll(),
        this.guestListModel.getAll(),
        this.ledgerModel.getAllTransactions(),
        this.ledgerModel.getAllPostings()
      ]);

      const dump: D1FullExport = {
        users,
        venues,
        tables,
        table_bookings: bookings,
        guestlists,
        ledger_transactions: ledgerTx,
        ledger_postings: ledgerPostings,
        timestamp: new Date().toISOString(),
        version: '2026.08-cebu-schema'
      };

      return ApiResponseView.json(dump);
    } catch (err: any) {
      return ApiResponseView.error(`Failed to export D1 state: ${err.message}`, 500);
    }
  }
}
