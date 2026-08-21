import { BaseModel } from './BaseModel';
import { Venue } from '../../types';

export class VenueModel extends BaseModel {
  async getAllActive(): Promise<Venue[]> {
    const res = await this.db
      .prepare('SELECT * FROM venues WHERE is_active = 1 ORDER BY name ASC')
      .all<Venue>();
    return res.results || [];
  }

  async getById(id: string): Promise<Venue | null> {
    const res = await this.db
      .prepare('SELECT * FROM venues WHERE id = ?')
      .bind(id)
      .first<Venue>();
    return res;
  }

  async getBySlug(slug: string): Promise<Venue | null> {
    const res = await this.db
      .prepare('SELECT * FROM venues WHERE slug = ?')
      .bind(slug)
      .first<Venue>();
    return res;
  }

  async updateOccupancy(venueId: string, delta: number): Promise<boolean> {
    const res = await this.db
      .prepare('UPDATE venues SET current_occupancy = MAX(0, current_occupancy + ?) WHERE id = ?')
      .bind(delta, venueId)
      .run();
    return res.success;
  }

  async insert(venue: Venue): Promise<boolean> {
    const res = await this.db
      .prepare(`
        INSERT INTO venues (
          id, slug, name, tagline, address, open_time, close_time,
          guestlist_cutoff_time, max_capacity, current_occupancy, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        venue.id,
        venue.slug,
        venue.name,
        venue.tagline || null,
        venue.address,
        venue.open_time,
        venue.close_time,
        venue.guestlist_cutoff_time,
        venue.max_capacity,
        venue.current_occupancy || 0,
        venue.is_active ?? 1
      )
      .run();
    return res.success;
  }
}
