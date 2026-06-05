import type { Client } from '@/core/types';
import { generateId } from '@/core/utils/id';
import { todayISO, toLatinDigits } from '@/core/utils/persian';
import { BaseRepository } from './base';

function normalizeSearchQuery(query: string): string {
  return toLatinDigits(query).trim().replace(/\s+/g, ' ');
}

export class ClientRepository extends BaseRepository {
  async getAll(): Promise<Client[]> {
    const db = await this.getDb();
    return db.getAllAsync<Client>('SELECT * FROM clients ORDER BY createdAt DESC');
  }

  async getById(id: string): Promise<Client | null> {
    const db = await this.getDb();
    return db.getFirstAsync<Client>('SELECT * FROM clients WHERE id = ?', id);
  }

  async search(query: string): Promise<Client[]> {
    const db = await this.getDb();
    const normalized = normalizeSearchQuery(query);
    if (!normalized) return this.getAll();

    const term = `%${normalized}%`;
    const exact = normalized;
    const startsWith = `${normalized}%`;

    return db.getAllAsync<Client>(
      `SELECT * FROM clients
       WHERE fullName LIKE ? OR phone LIKE ? OR email LIKE ? OR companyName LIKE ? OR notes LIKE ?
       ORDER BY
         CASE
           WHEN fullName = ? OR phone = ? THEN 0
           WHEN fullName LIKE ? OR phone LIKE ? OR companyName LIKE ? THEN 1
           ELSE 2
         END,
         createdAt DESC`,
      term, term, term, term, term,
      exact, exact,
      startsWith, startsWith, startsWith,
    );
  }

  async create(data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    const db = await this.getDb();
    const client: Client = { ...data, id: generateId(), createdAt: todayISO() };
    await db.runAsync(
      `INSERT INTO clients (id, fullName, phone, email, companyName, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      client.id, client.fullName, client.phone, client.email,
      client.companyName, client.notes, client.createdAt,
    );
    return client;
  }

  async update(id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<void> {
    const db = await this.getDb();
    const existing = await this.getById(id);
    if (!existing) return;

    const updated = { ...existing, ...data };
    await db.runAsync(
      `UPDATE clients SET fullName = ?, phone = ?, email = ?, companyName = ?, notes = ?
       WHERE id = ?`,
      updated.fullName, updated.phone, updated.email,
      updated.companyName, updated.notes, id,
    );
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM clients WHERE id = ?', id);
  }

  async count(): Promise<number> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM clients');
    return row?.count ?? 0;
  }
}

export const clientRepository = new ClientRepository();
