import { D1Database } from '../../types';

export class BaseModel {
  protected db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  protected static safeJsonParse<T>(val: unknown, fallback: T): T {
    if (typeof val !== 'string') return (val as T) || fallback;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }

  protected static getCurrentTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
}
