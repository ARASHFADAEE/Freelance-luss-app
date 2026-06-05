import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, SCHEMA_VERSION } from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_TABLES_SQL);

  const versionRow = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1',
  );

  if (!versionRow) {
    await db.runAsync('INSERT INTO schema_version (version) VALUES (?)', SCHEMA_VERSION);
  }

  const migrations = [
    'ALTER TABLE app_settings ADD COLUMN onboardingCompleted INTEGER DEFAULT 0',
    "ALTER TABLE profile ADD COLUMN invoicePrimaryColor TEXT DEFAULT '#1e3a8a'",
    "ALTER TABLE profile ADD COLUMN invoiceAccentColor TEXT DEFAULT '#10b981'",
    "ALTER TABLE profile ADD COLUMN invoiceFooterText TEXT DEFAULT ''",
    'ALTER TABLE profile ADD COLUMN invoiceShowSignatures INTEGER DEFAULT 1',
    "ALTER TABLE profile ADD COLUMN invoiceTemplate TEXT DEFAULT 'modern'",
  ];
  for (const sql of migrations) {
    try { await db.execAsync(sql); } catch { /* exists */ }
  }
}

async function openFreshDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('freelancerpro.db');
  await migrate(db);
  return db;
}

async function openWithWebRecovery(): Promise<SQLite.SQLiteDatabase> {
  try {
    return await openFreshDatabase();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const isAccessHandleError =
      message.includes('Access Handle') ||
      message.includes('createSyncAccessHandle') ||
      message.includes('NoModificationAllowedError');

    if (Platform.OS === 'web' && isAccessHandleError) {
      if (dbInstance) {
        try { await dbInstance.closeAsync(); } catch { /* ignore */ }
        dbInstance = null;
      }
      try { await SQLite.deleteDatabaseAsync('freelancerpro.db'); } catch { /* ignore */ }
      return openFreshDatabase();
    }
    throw e;
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (dbPromise) return dbPromise;

  dbPromise = openWithWebRecovery()
    .then((db) => {
      dbInstance = db;
      return db;
    })
    .catch((e) => {
      dbPromise = null;
      throw e;
    });

  return dbPromise;
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM invoice_items;
    DELETE FROM invoices;
    DELETE FROM payments;
    DELETE FROM projects;
    DELETE FROM clients;
    DELETE FROM services;
    DELETE FROM expenses;
    DELETE FROM profile;
    DELETE FROM app_settings;
  `);
}
