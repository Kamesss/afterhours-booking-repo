import { ClubController } from '../controllers/ClubController';
import { TableController } from '../controllers/TableController';
import { BookingController } from '../controllers/BookingController';
import { GuestListController } from '../controllers/GuestListController';
import { UserController } from '../controllers/UserController';
import { PassVerificationController } from '../controllers/PassVerificationController';
import { SyncController } from '../controllers/SyncController';
import { SchemaModel } from '../models/SchemaModel';
import { ApiResponseView } from '../views/ApiResponseView';
import { D1Database } from '../../types';

export class AppRouter {
  private clubController: ClubController;
  private tableController: TableController;
  private bookingController: BookingController;
  private guestListController: GuestListController;
  private userController: UserController;
  private passVerificationController: PassVerificationController;
  private syncController: SyncController;
  private schemaModel: SchemaModel;

  constructor(db: D1Database) {
    this.clubController = new ClubController(db);
    this.tableController = new TableController(db);
    this.bookingController = new BookingController(db);
    this.guestListController = new GuestListController(db);
    this.userController = new UserController(db);
    this.passVerificationController = new PassVerificationController(db);
    this.syncController = new SyncController(db);
    this.schemaModel = new SchemaModel(db);
  }

  async initSchema(): Promise<void> {
    await this.schemaModel.ensureSchema();
  }

  async dispatch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    // 1. Handle CORS Preflight
    if (method === 'OPTIONS') {
      return ApiResponseView.preflight();
    }

    // Strip leading /api prefix if present
    const path = url.pathname.startsWith('/api') ? url.pathname.replace(/^\/api/, '') : url.pathname;

    // 2. Route Definitions

    // --- CLUBS ROUTES ---
    if (path === '/clubs' || path === '/clubs/') {
      if (method === 'GET') return this.clubController.index();
      if (method === 'POST') return this.clubController.create(request);
    }

    const clubDetailMatch = path.match(/^\/clubs\/([a-zA-Z0-9_-]+)$/);
    if (clubDetailMatch && method === 'GET') {
      return this.clubController.show(clubDetailMatch[1]);
    }

    // --- TABLE TYPES ROUTES ---
    if (path === '/table_types' || path === '/table_types/') {
      if (method === 'GET') return this.tableController.indexTableTypes(url);
      if (method === 'POST') return this.tableController.createTableType(request);
    }

    const tableTypeUpdateMatch = path.match(/^\/table_types\/([a-zA-Z0-9_-]+)$/);
    if (tableTypeUpdateMatch && method === 'PATCH') {
      return this.tableController.updateTableType(tableTypeUpdateMatch[1], request);
    }

    // --- CLUB TABLES ROUTES ---
    if (path === '/club_tables' || path === '/club_tables/') {
      if (method === 'GET') return this.tableController.indexClubTables(url);
      if (method === 'POST') return this.tableController.createClubTable(request);
    }

    // --- USERS ROUTES ---
    if (path === '/users' || path === '/users/') {
      if (method === 'GET') return this.userController.index();
      if (method === 'POST') return this.userController.create(request);
    }

    // --- BOOKINGS ROUTES ---
    if (path === '/bookings' || path === '/bookings/') {
      if (method === 'GET') return this.bookingController.index(url);
      if (method === 'POST') return this.bookingController.create(request);
    }

    const bookingStatusMatch = path.match(/^\/bookings\/([a-zA-Z0-9_-]+)\/status$/);
    if (bookingStatusMatch && method === 'PATCH') {
      return this.bookingController.updateStatus(bookingStatusMatch[1], request);
    }

    // --- GUEST LIST ROUTES ---
    if (path === '/guest_list' || path === '/guest_list/') {
      if (method === 'GET') return this.guestListController.index(url);
      if (method === 'POST') return this.guestListController.create(request);
    }

    // --- QR PASS VERIFICATION ---
    if (path === '/verify-pass' && method === 'POST') {
      return this.passVerificationController.verify(request);
    }

    // --- FULL D1 DATA DUMP (Live frontend auto-sync) ---
    if (path === '/d1-dump' && method === 'GET') {
      return this.syncController.dumpAll();
    }

    // --- API ROOT INFO / HEALTH ---
    if (path === '' || path === '/') {
      return ApiResponseView.success({
        status: 'online',
        architecture: 'MVC (Model-View-Controller)',
        service: 'AfterHours Cebu Club D1 API',
        endpoints: [
          '/api/d1-dump',
          '/api/clubs',
          '/api/table_types',
          '/api/club_tables',
          '/api/users',
          '/api/bookings',
          '/api/guest_list',
          '/api/verify-pass',
        ],
      });
    }

    return ApiResponseView.notFound(`Route '${method} ${url.pathname}' not found`);
  }
}
