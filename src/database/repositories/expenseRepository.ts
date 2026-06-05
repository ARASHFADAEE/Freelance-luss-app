import type { Expense } from '@/core/types';
import { generateId } from '@/core/utils/id';
import { todayISO } from '@/core/utils/persian';
import { BaseRepository } from './base';

export class ExpenseRepository extends BaseRepository {
  async getAll(): Promise<Expense[]> {
    const db = await this.getDb();
    return db.getAllAsync<Expense>('SELECT * FROM expenses ORDER BY date DESC');
  }

  async getById(id: string): Promise<Expense | null> {
    const db = await this.getDb();
    return db.getFirstAsync<Expense>('SELECT * FROM expenses WHERE id = ?', id);
  }

  async create(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const db = await this.getDb();
    const expense: Expense = { ...data, id: generateId(), createdAt: todayISO() };
    await db.runAsync(
      `INSERT INTO expenses (id, category, amount, description, date, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      expense.id, expense.category, expense.amount,
      expense.description, expense.date, expense.createdAt,
    );
    return expense;
  }

  async update(id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<void> {
    const db = await this.getDb();
    const existing = await this.getById(id);
    if (!existing) return;
    const updated = { ...existing, ...data };
    await db.runAsync(
      `UPDATE expenses SET category = ?, amount = ?, description = ?, date = ? WHERE id = ?`,
      updated.category, updated.amount, updated.description, updated.date, id,
    );
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
  }

  async getTotalByMonth(monthKey: string): Promise<number> {
    const expenses = await this.getAll();
    return expenses
      .filter((e) => e.date.substring(0, 7) === monthKey)
      .reduce((sum, e) => sum + e.amount, 0);
  }
}

export const expenseRepository = new ExpenseRepository();
