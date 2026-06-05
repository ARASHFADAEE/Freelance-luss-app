import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from '../connection';

export abstract class BaseRepository {
  protected async getDb(): Promise<SQLiteDatabase> {
    return getDatabase();
  }
}
