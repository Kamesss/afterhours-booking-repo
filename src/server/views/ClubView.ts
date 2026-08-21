import { RawClubRow } from '../models/ClubModel';
import { Club } from '../../types';

function safeParse<T>(val: unknown, fallback: T): T {
  if (typeof val !== 'string') return (val as T) || fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export class ClubView {
  static render(row: RawClubRow): Club {
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
      area: row.area || 'Cebu City',
      cover_fee_cents: Number(row.cover_fee_cents || 0),
      curator_rating: Number(row.curator_rating || 4.8),
      featured: Boolean(row.featured),
      music_genres: safeParse(row.music_genres, ['EDM', 'Hip-Hop', 'House']),
      vibe_tags: safeParse(row.vibe_tags, ['High-Energy', 'VIP Tables']),
      hero_image: row.hero_image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80',
      gallery: safeParse(row.gallery, []),
      opening_hours: row.opening_hours || 'Wed - Sun | 10:00 PM – 5:00 AM',
      peak_hours: row.peak_hours || '12:30 AM – 3:30 AM',
      ambassador_perks: safeParse(row.ambassador_perks, [
        '⚡ Express VIP Door Entry',
        '🍸 Complimentary Round of Tequila Shots for Table Bookings'
      ]),
    };
  }

  static renderList(rows: RawClubRow[]): Club[] {
    return rows.map(this.render);
  }
}
