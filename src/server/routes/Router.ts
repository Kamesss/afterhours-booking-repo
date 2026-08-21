import { D1Database } from '../../types';
import { SchemaModel } from '../models/SchemaModel';
import { VenueModel } from '../models/VenueModel';
import { TableModel } from '../models/TableModel';
import { BookingModel } from '../models/BookingModel';
import { GuestListModel } from '../models/GuestListModel';
import { UserModel } from '../models/UserModel';
import { LedgerModel } from '../models/LedgerModel';

import { VenueController } from '../controllers/VenueController';
import { TableController } from '../controllers/TableController';
import { BookingController } from '../controllers/BookingController';
import { GuestListController } from '../controllers/GuestListController';
import { PassVerificationController } from '../controllers/PassVerificationController';
import { SyncController } from '../controllers/SyncController';
import { UserController } from '../controllers/UserController';
import { ApiResponseView } from '../views/ApiResponseView';

export class AppRouter {
  private db: D1Database;
  private schemaModel: SchemaModel;
  private venueModel: VenueModel;
  private tableModel: TableModel;
  private bookingModel: BookingModel;
  private guestListModel: GuestListModel;
  private userModel: UserModel;
  private ledgerModel: LedgerModel;

  private venueController: VenueController;
  private tableController: TableController;
  private bookingController: BookingController;
  private guestListController: GuestListController;
  private passVerificationController: PassVerificationController;
  private syncController: SyncController;
  private userController: UserController;

  constructor(db: D1Database) {
    this.db = db;
    this.schemaModel = new SchemaModel(db);
    this.venueModel = new VenueModel(db);
    this.tableModel = new TableModel(db);
    this.bookingModel = new BookingModel(db);
    this.guestListModel = new GuestListModel(db);
    this.userModel = new UserModel(db);
    this.ledgerModel = new LedgerModel(db);

    this.venueController = new VenueController(this.venueModel, this.tableModel);
    this.tableController = new TableController(this.tableModel);
    this.bookingController = new BookingController(this.bookingModel, this.tableModel, this.ledgerModel);
    this.guestListController = new GuestListController(this.guestListModel);
    this.passVerificationController = new PassVerificationController(
      this.bookingModel,
      this.guestListModel,
      this.venueModel,
      this.userModel,
      this.tableModel
    );
    this.syncController = new SyncController(
      this.venueModel,
      this.tableModel,
      this.bookingModel,
      this.guestListModel,
      this.userModel,
      this.ledgerModel
    );
    this.userController = new UserController(this.userModel);
  }

  async initSchema(): Promise<boolean> {
    return this.schemaModel.initializeDatabase();
  }

  async dispatch(request: Request): Promise<Response> {
    return this.handle(request);
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    // Root info
    if (path === '/' || path === '/api') {
      return ApiResponseView.json({
        status: 'online',
        database: 'club_booking_db',
        dialect: 'sqlite3',
        schema: ['users', 'venues', 'tables', 'table_bookings', 'guestlists', 'ledger_transactions', 'ledger_postings']
      });
    }

    // 1. Venues & Clubs
    if ((path === '/api/venues' || path === '/api/clubs') && method === 'GET') {
      return this.venueController.getAllVenues();
    }
    if (path.startsWith('/api/venues/') && path.endsWith('/tables') && method === 'GET') {
      const parts = path.split('/');
      const venueId = parts[3];
      return this.venueController.getTablesByVenue(venueId);
    }
    if (path.startsWith('/api/venues/') && method === 'GET') {
      const venueId = path.split('/')[3];
      return this.venueController.getVenueById(venueId);
    }

    // 2. Tables
    if (path === '/api/tables' && method === 'GET') {
      return this.tableController.getAllTables();
    }

    // 3. Bookings
    if (path === '/api/bookings' && method === 'GET') {
      const venueId = url.searchParams.get('venue_id') || undefined;
      const targetDate = url.searchParams.get('target_date') || undefined;
      const userId = url.searchParams.get('user_id') || undefined;
      return this.bookingController.getBookings(venueId, targetDate, userId);
    }
    if (path === '/api/bookings' && method === 'POST') {
      const body = await request.json();
      return this.bookingController.createBooking(body);
    }

    // 4. Guestlist
    if (path === '/api/guestlist' && method === 'GET') {
      const venueId = url.searchParams.get('venue_id') || undefined;
      const targetDate = url.searchParams.get('target_date') || undefined;
      const userId = url.searchParams.get('user_id') || undefined;
      return this.guestListController.getGuestlist(venueId, targetDate, userId);
    }
    if (path === '/api/guestlist' && method === 'POST') {
      const body = await request.json();
      return this.guestListController.addGuestlistEntry(body);
    }

    // 5. Verification & Door Scanner
    if (path === '/api/verify-pass' && (method === 'GET' || method === 'POST')) {
      const ref = url.searchParams.get('ref') || (method === 'POST' ? (await request.json()).ref : '');
      const action = (url.searchParams.get('action') as any) || 'verify';
      return this.passVerificationController.verifyPass(ref, action);
    }

    // 6. Users & Promoters
    if (path === '/api/users' && method === 'GET') {
      return this.userController.getAllUsers();
    }
    if (path.startsWith('/api/promoters/') && method === 'GET') {
      const code = path.split('/')[3];
      return this.userController.getUserByPromoterCode(code);
    }

    // 7. Ledger Transactions & Postings
    if (path === '/api/ledger' && method === 'GET') {
      try {
        const transactions = await this.ledgerModel.getAllTransactions();
        const balances = await this.ledgerModel.getAccountBalances();
        return ApiResponseView.json({ success: true, data: { transactions, balances } });
      } catch (err: any) {
        return ApiResponseView.error(`Failed to fetch ledger: ${err.message}`, 500);
      }
    }

    // 8. Full D1 Dump Sync
    if (path === '/api/d1-dump' && method === 'GET') {
      return this.syncController.getFullDump();
    }

    // 9. Raw D1 DDL & SQL Exec (for testing/schema inspection)
    if (path === '/api/d1-init' && method === 'POST') {
      await this.initSchema();
      return ApiResponseView.json({ success: true, message: 'D1 Schema initialized successfully' });
    }

    return ApiResponseView.error('Endpoint not found', 404);
  }
}
