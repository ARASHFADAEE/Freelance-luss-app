import type { Service } from '@/core/types';
import { generateId } from '@/core/utils/id';
import { todayISO } from '@/core/utils/persian';
import { BaseRepository } from './base';

export class ServiceRepository extends BaseRepository {
  async getAll(): Promise<Service[]> {
    const db = await this.getDb();
    return db.getAllAsync<Service>('SELECT * FROM services ORDER BY createdAt DESC');
  }

  async getById(id: string): Promise<Service | null> {
    const db = await this.getDb();
    return db.getFirstAsync<Service>('SELECT * FROM services WHERE id = ?', id);
  }

  async create(data: Omit<Service, 'id' | 'createdAt'>): Promise<Service> {
    const db = await this.getDb();
    const service: Service = { ...data, id: generateId(), createdAt: todayISO() };
    await db.runAsync(
      `INSERT INTO services (id, title, category, defaultPrice, description, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      service.id, service.title, service.category,
      service.defaultPrice, service.description, service.createdAt,
    );
    return service;
  }

  async update(id: string, data: Partial<Omit<Service, 'id' | 'createdAt'>>): Promise<void> {
    const db = await this.getDb();
    const existing = await this.getById(id);
    if (!existing) return;
    const updated = { ...existing, ...data };
    await db.runAsync(
      `UPDATE services SET title = ?, category = ?, defaultPrice = ?, description = ? WHERE id = ?`,
      updated.title, updated.category, updated.defaultPrice, updated.description, id,
    );
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM services WHERE id = ?', id);
  }
}

export const serviceRepository = new ServiceRepository();
