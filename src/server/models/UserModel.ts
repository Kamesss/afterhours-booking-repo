import { BaseModel } from './BaseModel';
import { User } from '../../types';

export class UserModel extends BaseModel {
  async getAll(): Promise<User[]> {
    const res = await this.db
      .prepare('SELECT id, email, full_name, phone_number, role, promoter_code, is_active, created_at, updated_at FROM users WHERE is_active = 1 ORDER BY full_name ASC')
      .all<User>();
    return res.results || [];
  }

  async getById(id: string): Promise<User | null> {
    const res = await this.db
      .prepare('SELECT id, email, full_name, phone_number, role, promoter_code, is_active, created_at, updated_at FROM users WHERE id = ?')
      .bind(id)
      .first<User>();
    return res;
  }

  async getByPromoterCode(code: string): Promise<User | null> {
    const res = await this.db
      .prepare('SELECT id, email, full_name, phone_number, role, promoter_code, is_active, created_at, updated_at FROM users WHERE promoter_code = ? AND is_active = 1')
      .bind(code)
      .first<User>();
    return res;
  }

  async insert(user: User): Promise<boolean> {
    const res = await this.db
      .prepare(`
        INSERT INTO users (
          id, email, hashed_password, full_name, phone_number,
          role, promoter_code, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        user.id,
        user.email,
        user.hashed_password || '$2b$12$defaultHashedPwPlaceholder',
        user.full_name,
        user.phone_number,
        user.role,
        user.promoter_code || null,
        user.is_active ?? 1
      )
      .run();
    return res.success;
  }
}
