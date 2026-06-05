import type { Project, ProjectStatus } from '@/core/types';
import { generateId } from '@/core/utils/id';
import { todayISO } from '@/core/utils/persian';
import { BaseRepository } from './base';

export class ProjectRepository extends BaseRepository {
  async getAll(): Promise<Project[]> {
    const db = await this.getDb();
    return db.getAllAsync<Project>('SELECT * FROM projects ORDER BY createdAt DESC');
  }

  async getById(id: string): Promise<Project | null> {
    const db = await this.getDb();
    return db.getFirstAsync<Project>('SELECT * FROM projects WHERE id = ?', id);
  }

  async getByClientId(clientId: string): Promise<Project[]> {
    const db = await this.getDb();
    return db.getAllAsync<Project>(
      'SELECT * FROM projects WHERE clientId = ? ORDER BY createdAt DESC',
      clientId,
    );
  }

  async getActive(): Promise<Project[]> {
    const db = await this.getDb();
    return db.getAllAsync<Project>(
      `SELECT * FROM projects WHERE status IN ('negotiating', 'active', 'delivered') ORDER BY createdAt DESC`,
    );
  }

  async create(data: {
    clientId: string;
    title: string;
    description?: string;
    totalAmount: number;
    startDate: string;
    dueDate: string;
    status?: ProjectStatus;
  }): Promise<Project> {
    const db = await this.getDb();
    const project: Project = {
      id: generateId(),
      clientId: data.clientId,
      title: data.title,
      description: data.description ?? '',
      totalAmount: data.totalAmount,
      receivedAmount: 0,
      remainingAmount: data.totalAmount,
      startDate: data.startDate,
      dueDate: data.dueDate,
      status: data.status ?? 'negotiating',
      createdAt: todayISO(),
    };
    await db.runAsync(
      `INSERT INTO projects (id, clientId, title, description, totalAmount, receivedAmount,
        remainingAmount, startDate, dueDate, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      project.id, project.clientId, project.title, project.description,
      project.totalAmount, project.receivedAmount, project.remainingAmount,
      project.startDate, project.dueDate, project.status, project.createdAt,
    );
    return project;
  }

  async update(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    const db = await this.getDb();
    const existing = await this.getById(id);
    if (!existing) return;

    const updated = { ...existing, ...data };
    if (data.totalAmount !== undefined || data.receivedAmount !== undefined) {
      updated.remainingAmount = updated.totalAmount - updated.receivedAmount;
    }
    await db.runAsync(
      `UPDATE projects SET clientId = ?, title = ?, description = ?, totalAmount = ?,
        receivedAmount = ?, remainingAmount = ?, startDate = ?, dueDate = ?, status = ?
       WHERE id = ?`,
      updated.clientId, updated.title, updated.description, updated.totalAmount,
      updated.receivedAmount, updated.remainingAmount, updated.startDate,
      updated.dueDate, updated.status, id,
    );
  }

  async updatePaymentTotals(projectId: string, receivedAmount: number): Promise<void> {
    const project = await this.getById(projectId);
    if (!project) return;
    await this.update(projectId, {
      receivedAmount,
      remainingAmount: project.totalAmount - receivedAmount,
    });
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM projects WHERE id = ?', id);
  }

  async count(): Promise<number> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM projects');
    return row?.count ?? 0;
  }

  async countActive(): Promise<number> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM projects WHERE status IN ('negotiating', 'active', 'delivered')`,
    );
    return row?.count ?? 0;
  }
}

export const projectRepository = new ProjectRepository();
