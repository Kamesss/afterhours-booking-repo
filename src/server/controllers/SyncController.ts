import { ClubModel } from '../models/ClubModel';
import { TableTypeModel } from '../models/TableTypeModel';
import { ClubTableModel } from '../models/ClubTableModel';
import { BookingModel } from '../models/BookingModel';
import { GuestListModel } from '../models/GuestListModel';
import { UserModel } from '../models/UserModel';
import { ClubView } from '../views/ClubView';
import { TableView } from '../views/TableView';
import { BookingView } from '../views/BookingView';
import { GuestListView } from '../views/GuestListView';
import { ApiResponseView } from '../views/ApiResponseView';
import { D1Database } from '../../types';

export class SyncController {
  private clubModel: ClubModel;
  private tableTypeModel: TableTypeModel;
  private clubTableModel: ClubTableModel;
  private bookingModel: BookingModel;
  private guestListModel: GuestListModel;
  private userModel: UserModel;

  constructor(db: D1Database) {
    this.clubModel = new ClubModel(db);
    this.tableTypeModel = new TableTypeModel(db);
    this.clubTableModel = new ClubTableModel(db);
    this.bookingModel = new BookingModel(db);
    this.guestListModel = new GuestListModel(db);
    this.userModel = new UserModel(db);
  }

  async dumpAll(): Promise<Response> {
    try {
      const [clubs, tableTypes, clubTables, bookings, guestList, users] = await Promise.all([
        this.clubModel.findAll(false),
        this.tableTypeModel.findByClubId(null),
        this.clubTableModel.findByClubId(null),
        this.bookingModel.find({}),
        this.guestListModel.find({}),
        this.userModel.findAll(),
      ]);

      return ApiResponseView.success({
        users,
        clubs: ClubView.renderList(clubs),
        table_types: TableView.renderTableTypeList(tableTypes),
        club_tables: TableView.renderClubTableList(clubTables),
        bookings: BookingView.renderList(bookings),
        guest_list: GuestListView.renderList(guestList),
      });
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to synchronize D1 dataset', err.message);
    }
  }
}
