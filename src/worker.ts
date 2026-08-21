import {
  INITIAL_CLUBS,
  INITIAL_TABLE_TYPES,
  INITIAL_CLUB_TABLES,
  INITIAL_BOOKINGS,
  INITIAL_GUESTLIST_ENTRIES,
  INITIAL_USERS
} from './data/initialData';
import { Club, TableType, ClubTable, Booking, GuestListEntry, User } from './types';

// Cloudflare Worker & D1 Types
export interface D1Result<T = any> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: any;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = Record<string, any>>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = Record<string, any>>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<D1Result>;
}

export interface Fetcher {
  fetch(request: Request | string, init?: RequestInit): Promise<Response>;
}

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

// Helper to parse JSON fields safely
function parseClubRow(row: any): Club {
  return {
    ...row,
    min_age: Number(row.min_age || 18),
    is_active: Number(row.is_active ?? 1),
    cover_fee_cents: Number(row.cover_fee_cents || 0),
    curator_rating: Number(row.curator_rating || 4.8),
    featured: Boolean(row.featured),
    music_genres: typeof row.music_genres === 'string' ? safeJsonParse(row.music_genres, ['EDM', 'Hip-Hop']) : (row.music_genres || ['EDM', 'Hip-Hop']),
    vibe_tags: typeof row.vibe_tags === 'string' ? safeJsonParse(row.vibe_tags, ['High-Energy']) : (row.vibe_tags || ['High-Energy']),
    gallery: typeof row.gallery === 'string' ? safeJsonParse(row.gallery, []) : (row.gallery || []),
    ambassador_perks: typeof row.ambassador_perks === 'string' ? safeJsonParse(row.ambassador_perks, ['⚡ Free VIP Entry']) : (row.ambassador_perks || ['⚡ Free VIP Entry']),
  };
}

function parseTableTypeRow(row: any): TableType {
  return {
    ...row,
    min_spend_cents: Number(row.min_spend_cents || 0),
    deposit_cents: Number(row.deposit_cents || 0),
    max_guests: Number(row.max_guests || 6),
    is_active: Number(row.is_active ?? 1),
    perks: typeof row.perks === 'string' ? safeJsonParse(row.perks, []) : (row.perks || []),
  };
}

function parseClubTableRow(row: any): ClubTable {
  return {
    ...row,
    is_active: Number(row.is_active ?? 1),
    x: Number(row.x || 50),
    y: Number(row.y || 50),
    width: row.width ? Number(row.width) : undefined,
    height: row.height ? Number(row.height) : undefined,
  };
}

function parseBookingRow(row: any): Booking {
  return {
    ...row,
    guest_count: Number(row.guest_count || 1),
    min_spend_cents: Number(row.min_spend_cents || 0),
    deposit_paid_cents: Number(row.deposit_paid_cents || 0),
    commission_cents: Number(row.commission_cents || 0),
  };
}

function parseGuestListRow(row: any): GuestListEntry {
  return {
    ...row,
    pax: Number(row.pax || 1),
  };
}

function safeJsonParse(str: string, fallback: any) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// Ensure all Cloudflare D1 tables exist
async function initD1Schema(db: D1Database) {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clubs (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        address TEXT NOT NULL,
        area TEXT NOT NULL DEFAULT 'Mango Square',
        min_age INTEGER NOT NULL DEFAULT 18,
        dress_code TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        cover_fee_cents INTEGER DEFAULT 0,
        music_genres TEXT,
        vibe_tags TEXT,
        hero_image TEXT,
        gallery TEXT,
        opening_hours TEXT,
        peak_hours TEXT,
        curator_rating REAL DEFAULT 4.8,
        ambassador_perks TEXT,
        featured INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS table_types (
        id TEXT PRIMARY KEY,
        club_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        min_spend_cents INTEGER NOT NULL,
        deposit_cents INTEGER NOT NULL,
        max_guests INTEGER NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        perks TEXT,
        tier_badge TEXT DEFAULT 'VIP',
        FOREIGN KEY (club_id) REFERENCES clubs(id)
      );

      CREATE TABLE IF NOT EXISTS club_tables (
        id TEXT PRIMARY KEY,
        club_id TEXT NOT NULL,
        table_type_id TEXT NOT NULL,
        table_number TEXT NOT NULL,
        location_description TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        x REAL DEFAULT 50,
        y REAL DEFAULT 50,
        width REAL DEFAULT 40,
        height REAL DEFAULT 40,
        shape TEXT DEFAULT 'rect',
        FOREIGN KEY (club_id) REFERENCES clubs(id),
        FOREIGN KEY (table_type_id) REFERENCES table_types(id)
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        club_id TEXT NOT NULL,
        table_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        booking_date TEXT NOT NULL,
        arrival_time TEXT NOT NULL,
        guest_count INTEGER NOT NULL,
        min_spend_cents INTEGER NOT NULL,
        deposit_paid_cents INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        special_requests TEXT,
        created_at TEXT NOT NULL,
        qr_code TEXT UNIQUE,
        ambassador_promo_code TEXT,
        commission_cents INTEGER DEFAULT 0,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        payment_method TEXT DEFAULT 'GCash',
        checked_in_at TEXT,
        FOREIGN KEY (club_id) REFERENCES clubs(id),
        FOREIGN KEY (table_id) REFERENCES club_tables(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS guest_list (
        id TEXT PRIMARY KEY,
        club_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        event_date TEXT NOT NULL,
        guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        guest_phone TEXT NOT NULL,
        pax INTEGER NOT NULL DEFAULT 1,
        arrival_time_estimate TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'valid',
        qr_code TEXT UNIQUE,
        ambassador_perk TEXT,
        created_at TEXT NOT NULL,
        checked_in_at TEXT,
        FOREIGN KEY (club_id) REFERENCES clubs(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS uq_prevent_table_double_booking 
      ON bookings (table_id, booking_date) 
      WHERE status IN ('confirmed', 'pending');
    `);

    // Check if initial seeding is needed
    const countCheck = await db.prepare("SELECT count(*) as count FROM clubs").first<{ count: number }>();
    if (!countCheck || countCheck.count === 0) {
      await seedDatabase(db);
    }
  } catch (err) {
    console.error("Failed to initialize or migrate D1 schema:", err);
  }
}

// Auto-seed helper for freshly created D1 databases
async function seedDatabase(db: D1Database) {
  for (const u of INITIAL_USERS) {
    await db.prepare(
      "INSERT OR IGNORE INTO users (id, name, email, password_hash, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(u.id, u.name, u.email, u.password_hash || '', u.phone || '', u.role, u.created_at).run();
  }

  for (const c of INITIAL_CLUBS) {
    await db.prepare(
      `INSERT OR IGNORE INTO clubs (
        id, owner_id, name, slug, description, address, area, min_age, dress_code, is_active,
        cover_fee_cents, music_genres, vibe_tags, hero_image, gallery, opening_hours, peak_hours,
        curator_rating, ambassador_perks, featured, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      c.id, c.owner_id, c.name, c.slug, c.description, c.address, c.area, c.min_age, c.dress_code, c.is_active,
      c.cover_fee_cents, JSON.stringify(c.music_genres), JSON.stringify(c.vibe_tags), c.hero_image, JSON.stringify(c.gallery),
      c.opening_hours, c.peak_hours, c.curator_rating, JSON.stringify(c.ambassador_perks), c.featured ? 1 : 0, c.created_at
    ).run();
  }

  for (const tt of INITIAL_TABLE_TYPES) {
    await db.prepare(
      "INSERT OR IGNORE INTO table_types (id, club_id, name, description, min_spend_cents, deposit_cents, max_guests, is_active, perks, tier_badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(tt.id, tt.club_id, tt.name, tt.description, tt.min_spend_cents, tt.deposit_cents, tt.max_guests, tt.is_active, JSON.stringify(tt.perks), tt.tier_badge).run();
  }

  for (const ct of INITIAL_CLUB_TABLES) {
    await db.prepare(
      "INSERT OR IGNORE INTO club_tables (id, club_id, table_type_id, table_number, location_description, is_active, x, y, width, height, shape) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(ct.id, ct.club_id, ct.table_type_id, ct.table_number, ct.location_description, ct.is_active, ct.x, ct.y, ct.width || 40, ct.height || 40, ct.shape || 'rect').run();
  }

  for (const b of INITIAL_BOOKINGS) {
    await db.prepare(
      `INSERT OR IGNORE INTO bookings (
        id, club_id, table_id, user_id, booking_date, arrival_time, guest_count,
        min_spend_cents, deposit_paid_cents, status, special_requests, created_at,
        qr_code, ambassador_promo_code, commission_cents, customer_name,
        customer_email, customer_phone, payment_method, checked_in_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      b.id, b.club_id, b.table_id, b.user_id, b.booking_date, b.arrival_time, b.guest_count,
      b.min_spend_cents, b.deposit_paid_cents, b.status, b.special_requests || '', b.created_at,
      b.qr_code, b.ambassador_promo_code || null, b.commission_cents, b.customer_name,
      b.customer_email, b.customer_phone, b.payment_method, b.checked_in_at || null
    ).run();
  }

  for (const gl of INITIAL_GUESTLIST_ENTRIES) {
    await db.prepare(
      `INSERT OR IGNORE INTO guest_list (
        id, club_id, user_id, event_date, guest_name, guest_email, guest_phone,
        pax, arrival_time_estimate, status, qr_code, ambassador_perk, created_at, checked_in_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      gl.id, gl.club_id, gl.user_id, gl.event_date, gl.guest_name, gl.guest_email, gl.guest_phone,
      gl.pax, gl.arrival_time_estimate, gl.status, gl.qr_code, gl.ambassador_perk, gl.created_at, gl.checked_in_at || null
    ).run();
  }
}

// CORS Headers helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle OPTIONS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Process API Endpoints backed by Cloudflare D1
    if (url.pathname.startsWith("/api/")) {
      try {
        // Ensure schema is prepared
        if (env.DB) {
          await initD1Schema(env.DB);
        }

        const path = url.pathname.replace(/^\/api/, "");

        // 1. CLUBS API
        if (path === "/clubs" || path === "/clubs/") {
          if (request.method === "GET") {
            const { results } = await env.DB.prepare("SELECT * FROM clubs ORDER BY featured DESC, name ASC").all();
            const clubs = (results || []).map(parseClubRow);
            return Response.json(clubs, { headers: corsHeaders });
          }
        }

        const clubMatch = path.match(/^\/clubs\/([a-zA-Z0-9_-]+)$/);
        if (clubMatch && request.method === "GET") {
          const clubId = clubMatch[1];
          const result = await env.DB.prepare("SELECT * FROM clubs WHERE id = ? OR slug = ?").bind(clubId, clubId).first();
          if (!result) {
            return Response.json({ error: "Club not found" }, { status: 404, headers: corsHeaders });
          }
          return Response.json(parseClubRow(result), { headers: corsHeaders });
        }

        // 2. TABLE TYPES API
        if (path === "/table_types" || path === "/table_types/") {
          if (request.method === "GET") {
            const clubId = url.searchParams.get("club_id");
            let query = "SELECT * FROM table_types";
            let stmt = env.DB.prepare(query);
            if (clubId) {
              query += " WHERE club_id = ?";
              stmt = env.DB.prepare(query).bind(clubId);
            }
            const { results } = await stmt.all();
            const tableTypes = (results || []).map(parseTableTypeRow);
            return Response.json(tableTypes, { headers: corsHeaders });
          }
        }

        const tableTypeMatch = path.match(/^\/table_types\/([a-zA-Z0-9_-]+)$/);
        if (tableTypeMatch && request.method === "PATCH") {
          const tableTypeId = tableTypeMatch[1];
          const body: any = await request.json();
          const { min_spend_cents, deposit_cents, max_guests, is_active } = body;
          await env.DB.prepare(
            "UPDATE table_types SET min_spend_cents = COALESCE(?, min_spend_cents), deposit_cents = COALESCE(?, deposit_cents), max_guests = COALESCE(?, max_guests), is_active = COALESCE(?, is_active) WHERE id = ?"
          ).bind(min_spend_cents ?? null, deposit_cents ?? null, max_guests ?? null, is_active ?? null, tableTypeId).run();

          const updated = await env.DB.prepare("SELECT * FROM table_types WHERE id = ?").bind(tableTypeId).first();
          return Response.json(updated ? parseTableTypeRow(updated) : { success: true }, { headers: corsHeaders });
        }

        // 3. PHYSICAL CLUB TABLES API
        if (path === "/club_tables" || path === "/club_tables/") {
          if (request.method === "GET") {
            const clubId = url.searchParams.get("club_id");
            let query = "SELECT * FROM club_tables";
            let stmt = env.DB.prepare(query);
            if (clubId) {
              query += " WHERE club_id = ?";
              stmt = env.DB.prepare(query).bind(clubId);
            }
            const { results } = await stmt.all();
            const tables = (results || []).map(parseClubTableRow);
            return Response.json(tables, { headers: corsHeaders });
          }
        }

        // 4. USERS API
        if (path === "/users" || path === "/users/") {
          if (request.method === "GET") {
            const { results } = await env.DB.prepare("SELECT id, name, email, phone, role, created_at FROM users").all();
            return Response.json(results || [], { headers: corsHeaders });
          }
          if (request.method === "POST") {
            const body: any = await request.json();
            const id = body.id || `usr_${Date.now()}`;
            const createdAt = new Date().toISOString();
            await env.DB.prepare(
              "INSERT INTO users (id, name, email, password_hash, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(id, body.name, body.email, body.password_hash || '', body.phone || '', body.role || 'user', createdAt).run();
            const created = await env.DB.prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?").bind(id).first();
            return Response.json(created, { status: 201, headers: corsHeaders });
          }
        }

        // 5. BOOKINGS API
        if (path === "/bookings" || path === "/bookings/") {
          if (request.method === "GET") {
            const clubId = url.searchParams.get("club_id");
            const date = url.searchParams.get("date");
            const userId = url.searchParams.get("user_id");

            let conditions: string[] = [];
            let params: any[] = [];

            if (clubId) {
              conditions.push("club_id = ?");
              params.push(clubId);
            }
            if (date) {
              conditions.push("booking_date = ?");
              params.push(date);
            }
            if (userId) {
              conditions.push("user_id = ?");
              params.push(userId);
            }

            let sql = "SELECT * FROM bookings";
            if (conditions.length > 0) {
              sql += " WHERE " + conditions.join(" AND ");
            }
            sql += " ORDER BY created_at DESC";

            const stmt = env.DB.prepare(sql).bind(...params);
            const { results } = await stmt.all();
            const bookings = (results || []).map(parseBookingRow);
            return Response.json(bookings, { headers: corsHeaders });
          }

          if (request.method === "POST") {
            const body: any = await request.json();

            // Check availability according to D1 Partial Unique Index:
            // uq_prevent_table_double_booking ON bookings (table_id, booking_date) WHERE status IN ('confirmed', 'pending')
            const existing = await env.DB.prepare(
              "SELECT id, status FROM bookings WHERE table_id = ? AND booking_date = ? AND status IN ('confirmed', 'pending')"
            ).bind(body.table_id, body.booking_date).first();

            if (existing) {
              return Response.json(
                { success: false, error: `Table is already booked on ${body.booking_date} (Full-day table lock active).` },
                { status: 409, headers: corsHeaders }
              );
            }

            // Calculate Ambassador Commission
            const commissionCents = Math.round(Number(body.min_spend_cents || 0) * 0.10);
            const id = body.id || `bkg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
            const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const qrCode = body.qr_code || `AH-${body.club_id.toUpperCase()}-${Date.now().toString().slice(-6)}`;

            await env.DB.prepare(`
              INSERT INTO bookings (
                id, club_id, table_id, user_id, booking_date, arrival_time, guest_count,
                min_spend_cents, deposit_paid_cents, status, special_requests, created_at,
                qr_code, ambassador_promo_code, commission_cents, customer_name,
                customer_email, customer_phone, payment_method
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id, body.club_id, body.table_id, body.user_id, body.booking_date, body.arrival_time,
              Number(body.guest_count || 1), Number(body.min_spend_cents || 0), Number(body.deposit_paid_cents || 0),
              body.status || 'confirmed', body.special_requests || '', createdAt,
              qrCode, body.ambassador_promo_code || null, commissionCents,
              body.customer_name, body.customer_email, body.customer_phone, body.payment_method || 'GCash'
            ).run();

            const created = await env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first();
            return Response.json({ success: true, booking: created ? parseBookingRow(created) : null }, { status: 201, headers: corsHeaders });
          }
        }

        // Update booking status
        const bookingStatusMatch = path.match(/^\/bookings\/([a-zA-Z0-9_-]+)\/status$/);
        if (bookingStatusMatch && request.method === "PATCH") {
          const bookingId = bookingStatusMatch[1];
          const body: any = await request.json();
          await env.DB.prepare("UPDATE bookings SET status = ? WHERE id = ?").bind(body.status, bookingId).run();
          const updated = await env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(bookingId).first();
          return Response.json({ success: true, booking: updated ? parseBookingRow(updated) : null }, { headers: corsHeaders });
        }

        // Host / Bouncer Verification and Check-in Endpoint
        if (path === "/verify-pass" && request.method === "POST") {
          const body: any = await request.json();
          const qr_code = body?.qr_code;
          const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

          // 1. Check Table Booking
          const booking = await env.DB.prepare("SELECT * FROM bookings WHERE qr_code = ?").bind(qr_code).first();
          if (booking) {
            const parsed = parseBookingRow(booking);
            if (parsed.checked_in_at) {
              return Response.json({
                success: false,
                type: 'booking',
                data: parsed,
                message: `Already checked in at ${parsed.checked_in_at}. (Badge consumed)`
              }, { headers: corsHeaders });
            }

            await env.DB.prepare("UPDATE bookings SET checked_in_at = ?, status = 'completed' WHERE id = ?").bind(now, parsed.id).run();
            parsed.checked_in_at = now;
            parsed.status = 'completed';

            return Response.json({
              success: true,
              type: 'booking',
              data: parsed,
              message: `VALID VIP TABLE PASS! Checked in table ${parsed.table_id} for ${parsed.customer_name} (${parsed.guest_count} guests).`
            }, { headers: corsHeaders });
          }

          // 2. Check Guest List
          const gl = await env.DB.prepare("SELECT * FROM guest_list WHERE qr_code = ?").bind(qr_code).first();
          if (gl) {
            const parsed = parseGuestListRow(gl);
            if (parsed.checked_in_at || parsed.status === 'checked_in') {
              return Response.json({
                success: false,
                type: 'guestlist',
                data: parsed,
                message: `Guest list pass was already scanned at ${parsed.checked_in_at || 'earlier'}.`
              }, { headers: corsHeaders });
            }

            await env.DB.prepare("UPDATE guest_list SET checked_in_at = ?, status = 'checked_in' WHERE id = ?").bind(now, parsed.id).run();
            parsed.checked_in_at = now;
            parsed.status = 'checked_in';

            return Response.json({
              success: true,
              type: 'guestlist',
              data: parsed,
              message: `VALID GUEST LIST PASS! Admitted ${parsed.guest_name} (+${parsed.pax - 1} guests). Perk: ${parsed.ambassador_perk}`
            }, { headers: corsHeaders });
          }

          return Response.json({
            success: false,
            type: 'unknown',
            message: 'Invalid QR pass code. Not found in AfterHours D1 database.'
          }, { status: 404, headers: corsHeaders });
        }

        // 6. GUEST LIST API
        if (path === "/guest_list" || path === "/guest_list/") {
          if (request.method === "GET") {
            const clubId = url.searchParams.get("club_id");
            const userId = url.searchParams.get("user_id");
            let conditions: string[] = [];
            let params: any[] = [];
            if (clubId) { conditions.push("club_id = ?"); params.push(clubId); }
            if (userId) { conditions.push("user_id = ?"); params.push(userId); }

            let sql = "SELECT * FROM guest_list";
            if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
            sql += " ORDER BY created_at DESC";

            const { results } = await env.DB.prepare(sql).bind(...params).all();
            const entries = (results || []).map(parseGuestListRow);
            return Response.json(entries, { headers: corsHeaders });
          }

          if (request.method === "POST") {
            const body: any = await request.json();
            const id = body.id || `gl_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
            const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const qrCode = body.qr_code || `AH-GL-${Date.now().toString().slice(-6)}`;

            await env.DB.prepare(`
              INSERT INTO guest_list (
                id, club_id, user_id, event_date, guest_name, guest_email, guest_phone,
                pax, arrival_time_estimate, status, qr_code, ambassador_perk, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id, body.club_id, body.user_id, body.event_date, body.guest_name,
              body.guest_email, body.guest_phone, Number(body.pax || 1),
              body.arrival_time_estimate, body.status || 'valid',
              qrCode, body.ambassador_perk || '⚡ Free Ambassador VIP Entry', createdAt
            ).run();

            const created = await env.DB.prepare("SELECT * FROM guest_list WHERE id = ?").bind(id).first();
            return Response.json({ success: true, entry: created ? parseGuestListRow(created) : null }, { status: 201, headers: corsHeaders });
          }
        }

        // 7. D1 DATABASE RAW SCHEMA & SYNC DUMP
        if (path === "/d1-dump" && request.method === "GET") {
          const [uRes, cRes, ttRes, ctRes, bRes, glRes] = await Promise.all([
            env.DB.prepare("SELECT * FROM users").all(),
            env.DB.prepare("SELECT * FROM clubs").all(),
            env.DB.prepare("SELECT * FROM table_types").all(),
            env.DB.prepare("SELECT * FROM club_tables").all(),
            env.DB.prepare("SELECT * FROM bookings").all(),
            env.DB.prepare("SELECT * FROM guest_list").all(),
          ]);

          return Response.json({
            users: (uRes.results || []),
            clubs: (cRes.results || []).map(parseClubRow),
            table_types: (ttRes.results || []).map(parseTableTypeRow),
            club_tables: (ctRes.results || []).map(parseClubTableRow),
            bookings: (bRes.results || []).map(parseBookingRow),
            guest_list: (glRes.results || []).map(parseGuestListRow),
          }, { headers: corsHeaders });
        }

        // 8. DATABASE RE-SEED ENDPOINT
        if (path === "/seed" && request.method === "POST") {
          await seedDatabase(env.DB);
          return Response.json({ success: true, message: "Database seeded successfully" }, { headers: corsHeaders });
        }

        return Response.json({ error: "Endpoint not found" }, { status: 404, headers: corsHeaders });

      } catch (err: any) {
        console.error("API Error in Worker:", err);
        return Response.json(
          { error: err.message || "Internal server error on D1 database operation" },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Pass all other requests to frontend Vite assets
    return env.ASSETS.fetch(request);
  },
};
