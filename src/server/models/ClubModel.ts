import { BaseModel } from './BaseModel';
import { Club } from '../../types';

export interface RawClubRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  min_age?: number;
  dress_code?: string | null;
  is_active?: number;
  created_at?: string;
  area?: string;
  cover_fee_cents?: number;
  curator_rating?: number;
  featured?: number | boolean;
  music_genres?: string;
  vibe_tags?: string;
  hero_image?: string;
  gallery?: string;
  opening_hours?: string;
  peak_hours?: string;
  ambassador_perks?: string;
}

export class ClubModel extends BaseModel {
  async findAll(activeOnly = true): Promise<RawClubRow[]> {
    const query = activeOnly
      ? 'SELECT * FROM clubs WHERE is_active = 1 ORDER BY name ASC'
      : 'SELECT * FROM clubs ORDER BY name ASC';
    const { results } = await this.db.prepare(query).all<RawClubRow>();
    return results || [];
  }

  async findByIdOrSlug(idOrSlug: string): Promise<RawClubRow | null> {
    const club = await this.db
      .prepare('SELECT * FROM clubs WHERE id = ? OR slug = ?')
      .bind(idOrSlug, idOrSlug)
      .first<RawClubRow>();
    return club || null;
  }

  async create(data: Partial<Club>): Promise<RawClubRow | null> {
    const id = data.id || `clb_${Date.now().toString(36)}`;
    const createdAt = BaseModel.getCurrentTimestamp();
    const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : id);

    await this.db
      .prepare(`
        INSERT INTO clubs (
          id, owner_id, name, slug, description, address, min_age, dress_code, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        data.owner_id || 'usr_superadmin',
        data.name || 'Untitled Venue',
        slug,
        data.description || '',
        data.address || 'Cebu City, Philippines',
        Number(data.min_age ?? 18),
        data.dress_code || 'Smart Casual',
        Number(data.is_active ?? 1),
        createdAt
      )
      .run();

    return this.findByIdOrSlug(id);
  }
}
