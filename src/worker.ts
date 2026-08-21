import {
  Club,
  TableType,
  ClubTable,
  Booking,
  GuestListEntry,
  User,
  D1Database,
  Env
} from './types';

// Helper to parse JSON fields safely
function safeJsonParse(str: any, fallback: any) {
  if (typeof str !== 'string') return str || fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// Convert D1 database row strictly matching schema to application entity
function parseClubRow(row: any): Club {
  return {
    id: String(row.id),
    owner_id: String(row.owner_id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description || '',
    address: String(row.address),
    min_age: Number(row.min_age ?? 18),
    dress_code: row.dress_code || 'Smart Casual',
    is_active: Number(row.is_active ?? 1),
    created_at: String(row.created_at || new Date().toISOString()),
    // UI enhancements with graceful defaults
    area: row.area || 'Cebu City',
    cover_fee_cents: Number(row.cover_fee_cents || 0),
    curator_rating: Number(row.curator_rating || 4.8),
    featured: Boolean(row.featured),
    music_genres: safeJsonParse(row.music_genres, ['EDM', 'Hip-Hop', 'House']),
    vibe_tags: safeJsonParse(row.vibe_tags, ['High-Energy', 'VIP Tables']),
    hero_image: row.hero_image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80',
    gallery: safeJsonParse(row.gallery, []),
    opening_hours: row.opening_hours || 'Wed - Sun | 10:00 PM – 5:00 AM',
    peak_hours: row.peak_hours || '12:30 AM – 3:30 AM',
    ambassador_perks: safeJsonParse(row.ambassador_perks, [
      '⚡ Express VIP Door Entry',
      '🍸 Complimentary Round of Tequila Shots for Table Bookings'
    ]),
  };
}

function parseTableTypeRow(row: any): TableType {
  return {
    id: String(row.id),
    club_id: String(row.club_id),
    name: String(row.name),
    description: row.description || '',
    min_spend_cents: Number(row.min_spend_cents || 0),
    deposit_cents: Number(row.deposit_cents || 0),
    max_guests: Number(row.max_guests || 4),
    is_active: Number(row.is_active ?? 1),
    perks: safeJsonParse(row.perks, ['VIP Service', 'Consumable on F&B']),
    tier_badge: row.tier_badge || (Number(row.min_spend_cents) >= 1500000 ? 'Ultra VIP' : Number(row.min_spend_cents) >= 800000 ? 'VIP' : 'Standard'),
  };
}

function parseClubTableRow(row: any): ClubTable {
  return {
    id: String(row.id),
    club_id: String(row.club_id),
    table_type_id: String(row.table_type_id),
    table_number: String(row.table_number),
    location_description: row.location_description || '',
    is_active: Number(row.is_active ?? 1),
    x: Number(row.x || 50),
    y: Number(row.y || 50),
    width: row.width ? Number(row.width) : undefined,
    height: row.height ? Number(row.height) : undefined,
    shape: row.shape || 'booth',
  };
}

function parseBookingRow(row: any): Booking {
  return {
    id: String(row.id),
    club_id: String(row.club_id),
    table_id: String(row.table_id),
    user_id: String(row.user_id),
    booking_date: String(row.booking_date),
    arrival_time: String(row.arrival_time),
    guest_count: Number(row.guest_count || 1),
    min_spend_cents: Number(row.min_spend_cents || 0),
    deposit_paid_cents: Number(row.deposit_paid_cents || 0),
    status: row.status || 'confirmed',
    special_requests: row.special_requests || '',
    created_at: String(row.created_at || new Date().toISOString()),
    qr_code: row.qr_code || `AH-${row.club_id}-${row.id}`,
    ambassador_promo_code: row.ambassador_promo_code || undefined,
    commission_cents: Number(row.commission_cents || Math.round(Number(row.min_spend_cents || 0) * 0.10)),
    customer_name: row.customer_name || 'VIP Guest',
    customer_email: row.customer_email || 'guest@afterhours.ph',
    customer_phone: row.customer_phone || '+63 900 000 0000',
    payment_method: row.payment_method || 'GCash',
    checked_in_at: row.checked_in_at || undefined,
  };
}

function parseGuestListRow(row: any): GuestListEntry {
  return {
    id: String(row.id),
    club_id: String(row.club_id),
    user_id: String(row.user_id),
    event_date: String(row.event_date),
    guest_name: String(row.guest_name),
    guest_email: String(row.guest_email),
    guest_phone: row.guest_phone || '',
    pax: Number(row.pax || 1),
    arrival_time_estimate: row.arrival_time_estimate || '23:00',
    status: row.status || 'valid',
    qr_code: row.qr_code || `AH-GL-${row.id}`,
    ambassador_perk: row.ambassador_perk || '⚡ Free Ambassador Door Entry',
    created_at: String(row.created_at || new Date().toISOString()),
    checked_in_at: row.checked_in_at || undefined,
  };
}

// Ensure all Cloudflare D1 tables exist strictly following the provided schema
async function initD1Schema(db: D1Database) {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS clubs (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        address TEXT NOT NULL,
        min_age INTEGER NOT NULL DEFAULT 18,
        dress_code TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS table_types (
        id TEXT PRIMARY KEY,
        club_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        min_spend_cents INTEGER NOT NULL DEFAULT 0,
        deposit_cents INTEGER NOT NULL DEFAULT 0,
        max_guests INTEGER NOT NULL DEFAULT 4,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS club_tables (
        id TEXT PRIMARY KEY,
        club_id TEXT NOT NULL,
        table_type_id TEXT NOT NULL,
        table_number TEXT NOT NULL,
        location_description TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
        FOREIGN KEY (table_type_id) REFERENCES table_types(id) ON DELETE RESTRICT,
        UNIQUE(club_id, table_number)
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        club_id TEXT NOT NULL,
        table_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        booking_date TEXT NOT NULL,
        arrival_time TEXT NOT NULL,
        guest_count INTEGER NOT NULL DEFAULT 1,
        min_spend_cents INTEGER NOT NULL,
        deposit_paid_cents INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'confirmed',
        special_requests TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE RESTRICT,
        FOREIGN KEY (table_id) REFERENCES club_tables(id) ON DELETE RESTRICT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS guest_list (
        id TEXT PRIMARY KEY,
        club_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        event_date TEXT NOT NULL,
        guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        guest_phone TEXT,
        pax INTEGER NOT NULL DEFAULT 1,
        arrival_time_estimate TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'valid',
        qr_code TEXT UNIQUE,
        ambassador_perk TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        checked_in_at TEXT,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE RESTRICT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
      );

      CREATE UNIQUE INDEX IF NOT EXISTS uq_prevent_table_double_booking 
      ON bookings (table_id, booking_date) 
      WHERE status IN ('confirmed', 'pending');
    `);
  } catch (err) {
    console.error("D1 schema check error:", err);
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

    // Process API Endpoints backed directly by Cloudflare D1
    if (url.pathname.startsWith("/api/")) {
      try {
        if (env.DB) {
          await initD1Schema(env.DB);
        }

        const path = url.pathname.replace(/^\/api/, "");

        // 1. CLUBS API
        if (path === "/clubs" || path === "/clubs/") {
          if (request.method === "GET") {
            const { results } = await env.DB.prepare("SELECT * FROM clubs ORDER BY name ASC").all();
            const clubs = (results || []).map(parseClubRow);
            return Response.json(clubs, { headers: corsHeaders });
          }
          if (request.method === "POST") {
            const body: any = await request.json();
            const id = body.id || `clb_${Date.now().toString(36)}`;
            const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
            await env.DB.prepare(`
              INSERT INTO clubs (id, owner_id, name, slug, description, address, min_age, dress_code, is_active, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id, body.owner_id, body.name, body.slug, body.description || '', body.address,
              Number(body.min_age || 18), body.dress_code || 'Smart Casual', Number(body.is_active ?? 1), createdAt
            ).run();
            const created = await env.DB.prepare("SELECT * FROM clubs WHERE id = ?").bind(id).first();
            return Response.json(created ? parseClubRow(created) : null, { status: 201, headers: corsHeaders });
          }
        }

        const clubMatch = path.match(/^\/clubs\/([a-zA-Z0-9_-]+)$/);
        if (clubMatch && request.method === "GET") {
          const clubId = clubMatch[1];
          const result = await env.DB.prepare("SELECT * FROM clubs WHERE id = ? OR slug = ?").bind(clubId, clubId).first();
          if (!result) {
            return Response.json({ error: "Club not found in D1 database" }, { status: 404, headers: corsHeaders });
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
          if (request.method === "POST") {
            const body: any = await request.json();
            const id = body.id || `tt_${Date.now().toString(36)}`;
            await env.DB.prepare(`
              INSERT INTO table_types (id, club_id, name, description, min_spend_cents, deposit_cents, max_guests, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id, body.club_id, body.name, body.description || '',
              Number(body.min_spend_cents || 0), Number(body.deposit_cents || 0),
              Number(body.max_guests || 4), Number(body.is_active ?? 1)
            ).run();
            const created = await env.DB.prepare("SELECT * FROM table_types WHERE id = ?").bind(id).first();
            return Response.json(created ? parseTableTypeRow(created) : null, { status: 201, headers: corsHeaders });
          }
        }

        const tableTypeMatch = path.match(/^\/table_types\/([a-zA-Z0-9_-]+)$/);
        if (tableTypeMatch && request.method === "PATCH") {
          const tableTypeId = tableTypeMatch[1];
          const body: any = await request.json();
          const { min_spend_cents, deposit_cents, max_guests, is_active, name, description } = body;
          await env.DB.prepare(`
            UPDATE table_types SET
              min_spend_cents = COALESCE(?, min_spend_cents),
              deposit_cents = COALESCE(?, deposit_cents),
              max_guests = COALESCE(?, max_guests),
              is_active = COALESCE(?, is_active),
              name = COALESCE(?, name),
              description = COALESCE(?, description)
            WHERE id = ?
          `).bind(
            min_spend_cents ?? null,
            deposit_cents ?? null,
            max_guests ?? null,
            is_active ?? null,
            name ?? null,
            description ?? null,
            tableTypeId
          ).run();

          const updated = await env.DB.prepare("SELECT * FROM table_types WHERE id = ?").bind(tableTypeId).first();
          return Response.json(updated ? parseTableTypeRow(updated) : { success: true }, { headers: corsHeaders });
        }

        // 3. CLUB TABLES API
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
          if (request.method === "POST") {
            const body: any = await request.json();
            const id = body.id || `tbl_${Date.now().toString(36)}`;
            await env.DB.prepare(`
              INSERT INTO club_tables (id, club_id, table_type_id, table_number, location_description, is_active)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(
              id, body.club_id, body.table_type_id, body.table_number, body.location_description || '', Number(body.is_active ?? 1)
            ).run();
            const created = await env.DB.prepare("SELECT * FROM club_tables WHERE id = ?").bind(id).first();
            return Response.json(created ? parseClubTableRow(created) : null, { status: 201, headers: corsHeaders });
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
            const id = body.id || `usr_${Date.now().toString(36)}`;
            const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
            await env.DB.prepare(`
              INSERT INTO users (id, name, email, password_hash, phone, role, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id, body.name, body.email, body.password_hash || 'hash_secret', body.phone || '', body.role || 'user', createdAt
            ).run();
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

            // Enforce D1 partial unique index double-booking constraint:
            // uq_prevent_table_double_booking ON bookings (table_id, booking_date) WHERE status IN ('confirmed', 'pending')
            const existing = await env.DB.prepare(
              "SELECT id, status FROM bookings WHERE table_id = ? AND booking_date = ? AND status IN ('confirmed', 'pending')"
            ).bind(body.table_id, body.booking_date).first();

            if (existing) {
              return Response.json(
                { success: false, error: `Table is already booked on ${body.booking_date} (Full-day lock active).` },
                { status: 409, headers: corsHeaders }
              );
            }

            const id = body.id || `bkg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
            const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

            await env.DB.prepare(`
              INSERT INTO bookings (
                id, club_id, table_id, user_id, booking_date, arrival_time, guest_count,
                min_spend_cents, deposit_paid_cents, status, special_requests, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id, body.club_id, body.table_id, body.user_id, body.booking_date, body.arrival_time,
              Number(body.guest_count || 1), Number(body.min_spend_cents || 0), Number(body.deposit_paid_cents || 0),
              body.status || 'confirmed', body.special_requests || '', createdAt
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

        // Bouncer & Host Verification API
        if (path === "/verify-pass" && request.method === "POST") {
          const body: any = await request.json();
          const qr_code = body?.qr_code;
          const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

          // 1. Search Table Bookings
          const booking = await env.DB.prepare("SELECT * FROM bookings WHERE id = ? OR id = ?").bind(qr_code, qr_code.replace('AH-', '')).first();
          if (booking) {
            const parsed = parseBookingRow(booking);
            await env.DB.prepare("UPDATE bookings SET status = 'completed' WHERE id = ?").bind(parsed.id).run();
            parsed.status = 'completed';
            parsed.checked_in_at = now;

            return Response.json({
              success: true,
              type: 'booking',
              data: parsed,
              message: `VALID VIP TABLE PASS! Checked in table ${parsed.table_id} for ${parsed.guest_count} guests.`
            }, { headers: corsHeaders });
          }

          // 2. Search Guest List
          const gl = await env.DB.prepare("SELECT * FROM guest_list WHERE qr_code = ? OR id = ?").bind(qr_code, qr_code).first();
          if (gl) {
            const parsed = parseGuestListRow(gl);
            if (parsed.status === 'checked_in') {
              return Response.json({
                success: false,
                type: 'guestlist',
                data: parsed,
                message: `Guest pass was already scanned at ${parsed.checked_in_at || 'earlier'}.`
              }, { headers: corsHeaders });
            }

            await env.DB.prepare("UPDATE guest_list SET checked_in_at = ?, status = 'checked_in' WHERE id = ?").bind(now, parsed.id).run();
            parsed.checked_in_at = now;
            parsed.status = 'checked_in';

            return Response.json({
              success: true,
              type: 'guestlist',
              data: parsed,
              message: `VALID GUEST LIST PASS! Admitted ${parsed.guest_name} (${parsed.pax} guests).`
            }, { headers: corsHeaders });
          }

          return Response.json({
            success: false,
            type: 'unknown',
            message: 'Invalid pass code. Pass record not found in D1 database.'
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
            const qrCode = body.qr_code || `AH-GL-${id}`;

            await env.DB.prepare(`
              INSERT INTO guest_list (
                id, club_id, user_id, event_date, guest_name, guest_email, guest_phone,
                pax, arrival_time_estimate, status, qr_code, ambassador_perk, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id, body.club_id, body.user_id, body.event_date, body.guest_name,
              body.guest_email, body.guest_phone || '', Number(body.pax || 1),
              body.arrival_time_estimate || '23:00', body.status || 'valid',
              qrCode, body.ambassador_perk || '⚡ Free Ambassador VIP Entry', createdAt
            ).run();

            const created = await env.DB.prepare("SELECT * FROM guest_list WHERE id = ?").bind(id).first();
            return Response.json({ success: true, entry: created ? parseGuestListRow(created) : null }, { status: 201, headers: corsHeaders });
          }
        }

        // 7. D1 DATABASE RAW DUMP FOR FRONTEND SYNC
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

        return Response.json({ error: "Endpoint not found" }, { status: 404, headers: corsHeaders });

      } catch (err: any) {
        console.error("D1 API Error in Worker:", err);
        return Response.json(
          { error: err.message || "Internal D1 database error" },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
