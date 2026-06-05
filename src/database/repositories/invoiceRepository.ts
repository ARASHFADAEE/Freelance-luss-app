import type { Invoice, InvoiceItem } from '@/core/types';
import { generateId } from '@/core/utils/id';
import { todayISO } from '@/core/utils/persian';
import { BaseRepository } from './base';

export class InvoiceRepository extends BaseRepository {
  async getAll(): Promise<Invoice[]> {
    const db = await this.getDb();
    return db.getAllAsync<Invoice>('SELECT * FROM invoices ORDER BY createdAt DESC');
  }

  async getById(id: string): Promise<Invoice | null> {
    const db = await this.getDb();
    return db.getFirstAsync<Invoice>('SELECT * FROM invoices WHERE id = ?', id);
  }

  async getItems(invoiceId: string): Promise<InvoiceItem[]> {
    const db = await this.getDb();
    return db.getAllAsync<InvoiceItem>(
      'SELECT * FROM invoice_items WHERE invoiceId = ?',
      invoiceId,
    );
  }

  async getNextInvoiceNumber(): Promise<string> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM invoices');
    const num = (row?.count ?? 0) + 1;
    const year = new Date().getFullYear();
    return `INV-${year}-${String(num).padStart(4, '0')}`;
  }

  async create(
    invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'> & { invoiceNumber?: string },
    items: Omit<InvoiceItem, 'id' | 'invoiceId'>[],
  ): Promise<Invoice> {
    const db = await this.getDb();
    const invoiceNumber = invoice.invoiceNumber ?? (await this.getNextInvoiceNumber());
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      invoiceNumber,
      createdAt: todayISO(),
    };

    await db.runAsync(
      `INSERT INTO invoices (id, invoiceNumber, clientId, projectId, issueDate, dueDate,
        subtotal, tax, discount, total, status, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      newInvoice.id, newInvoice.invoiceNumber, newInvoice.clientId, newInvoice.projectId,
      newInvoice.issueDate, newInvoice.dueDate, newInvoice.subtotal, newInvoice.tax,
      newInvoice.discount, newInvoice.total, newInvoice.status, newInvoice.notes,
      newInvoice.createdAt,
    );

    for (const item of items) {
      const invoiceItem: InvoiceItem = {
        ...item,
        id: generateId(),
        invoiceId: newInvoice.id,
      };
      await db.runAsync(
        `INSERT INTO invoice_items (id, invoiceId, serviceId, title, quantity, unitPrice, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        invoiceItem.id, invoiceItem.invoiceId, invoiceItem.serviceId,
        invoiceItem.title, invoiceItem.quantity, invoiceItem.unitPrice, invoiceItem.total,
      );
    }

    return newInvoice;
  }

  async update(id: string, data: Partial<Omit<Invoice, 'id' | 'createdAt'>>): Promise<void> {
    const db = await this.getDb();
    const existing = await this.getById(id);
    if (!existing) return;
    const updated = { ...existing, ...data };
    await db.runAsync(
      `UPDATE invoices SET clientId = ?, projectId = ?, issueDate = ?, dueDate = ?,
        subtotal = ?, tax = ?, discount = ?, total = ?, status = ?, notes = ? WHERE id = ?`,
      updated.clientId, updated.projectId, updated.issueDate, updated.dueDate,
      updated.subtotal, updated.tax, updated.discount, updated.total,
      updated.status, updated.notes, id,
    );
  }

  async updateItems(invoiceId: string, items: Omit<InvoiceItem, 'id' | 'invoiceId'>[]): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM invoice_items WHERE invoiceId = ?', invoiceId);
    for (const item of items) {
      await db.runAsync(
        `INSERT INTO invoice_items (id, invoiceId, serviceId, title, quantity, unitPrice, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        generateId(), invoiceId, item.serviceId, item.title,
        item.quantity, item.unitPrice, item.total,
      );
    }
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM invoice_items WHERE invoiceId = ?', id);
    await db.runAsync('DELETE FROM invoices WHERE id = ?', id);
  }

  async count(): Promise<number> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM invoices');
    return row?.count ?? 0;
  }

  async countUnpaid(): Promise<number> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM invoices WHERE status IN ('draft', 'sent', 'overdue')`,
    );
    return row?.count ?? 0;
  }
}

export const invoiceRepository = new InvoiceRepository();
