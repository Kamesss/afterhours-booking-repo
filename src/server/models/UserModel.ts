import { BaseModel } from './BaseModel';
import { User, UserRole } from '../../types';

export interface RawUserRow {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  phone?: string | null;
  role: UserRole;
  created_at: string;
}

export class UserModel extends BaseModel {
  async findAll(): Promise<RawUserRow[]> {
    const { results } = await this.db
      .prepare('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC')
      .all<RawUserRow>();
    return results || [];
  }

  async findById(id: string): Promise<RawUserRow | null> {
    const user = await this.db
      .prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?')
      .bind(id)
      .first<RawUserRow>();
    return user || null;
  }

  async create(data: Partial<User>): Promise<RawUserRow | null> {
    const id = data.id || `usr_${Date.now().toString(36)}`;
    const createdAt = BaseModel.getCurrentTimestamp();

    await this.db
      .prepare(`
        INSERT INTO users (id, name, email, password_hash, phone, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        data.name || 'Anonymous User',
        data.email,
        data.password_hash || 'hash_secret',
        data.phone || '',
        data.role || 'user',
        createdAt
      )
      .run();

    return this.findById(id);
  }
}
