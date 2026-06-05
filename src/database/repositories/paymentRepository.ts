import type { Payment } from '@/core/types';
import { generateId } from '@/core/utils/id';
import { todayISO } from '@/core/utils/persian';
import { projectRepository } from './projectRepository';
import { BaseRepository } from './base';

export class PaymentRepository extends BaseRepository {
  async getByProjectId(projectId: string): Promise<Payment[]> {
    const db = await this.getDb();
    return db.getAllAsync<Payment>(
      'SELECT * FROM payments WHERE projectId = ? ORDER BY paymentDate DESC',
      projectId,
    );
  }

  async getAll(): Promise<Payment[]> {
    const db = await this.getDb();
    return db.getAllAsync<Payment>('SELECT * FROM payments ORDER BY paymentDate DESC');
  }

  async create(data: {
    projectId: string;
    amount: number;
    paymentDate: string;
    description?: string;
  }): Promise<{ payment: Payment; settled: boolean; remainingAmount: number }> {
    const db = await this.getDb();
    const payment: Payment = {
      id: generateId(),
      projectId: data.projectId,
      amount: data.amount,
      paymentDate: data.paymentDate,
      description: data.description ?? '',
      createdAt: todayISO(),
    };
    await db.runAsync(
      `INSERT INTO payments (id, projectId, amount, paymentDate, description, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      payment.id, payment.projectId, payment.amount,
      payment.paymentDate, payment.description, payment.createdAt,
    );

    const payments = await this.getByProjectId(data.projectId);
    const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    const project = await projectRepository.getById(data.projectId);
    const remainingAmount = Math.max(0, (project?.totalAmount ?? 0) - totalReceived);
    const settled = !!project && project.totalAmount > 0 && remainingAmount <= 0;

    await projectRepository.updatePaymentTotals(data.projectId, totalReceived);

    if (settled) {
      await projectRepository.update(data.projectId, { status: 'completed' });
    }

    return { payment, settled, remainingAmount };
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    const payment = await db.getFirstAsync<Payment>('SELECT * FROM payments WHERE id = ?', id);
    if (!payment) return;

    await db.runAsync('DELETE FROM payments WHERE id = ?', id);

    const payments = await this.getByProjectId(payment.projectId);
    const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    await projectRepository.updatePaymentTotals(payment.projectId, totalReceived);
  }
}

export const paymentRepository = new PaymentRepository();
