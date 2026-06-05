import jalaali from 'jalaali-js';
import type { ClientReport, DashboardStats, MonthlyDataPoint, ServiceReport } from '@/core/types';
import { formatJalaliMonth, getJalaliYear, toPersianDigits } from '@/core/utils/persian';
import { BaseRepository } from './base';

export class AnalyticsRepository extends BaseRepository {
  async getDashboardStats(): Promise<DashboardStats> {
    const db = await this.getDb();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYear = String(now.getFullYear());

    const payments = await db.getAllAsync<{ amount: number; paymentDate: string }>(
      'SELECT amount, paymentDate FROM payments',
    );
    const expenses = await db.getAllAsync<{ amount: number; date: string }>(
      'SELECT amount, date FROM expenses',
    );
    const projects = await db.getAllAsync<{ remainingAmount: number; status: string }>(
      'SELECT remainingAmount, status FROM projects',
    );
    const invoices = await db.getAllAsync<{ status: string }>('SELECT status FROM invoices');

    const monthlyRevenue = payments
      .filter((p) => p.paymentDate.startsWith(currentMonth))
      .reduce((sum, p) => sum + p.amount, 0);

    const yearlyRevenue = payments
      .filter((p) => p.paymentDate.startsWith(currentYear))
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyExpenses = expenses
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0);

    const outstandingReceivables = projects
      .filter((p) => ['active', 'delivered'].includes(p.status))
      .reduce((sum, p) => sum + p.remainingAmount, 0);

    const activeProjects = projects.filter((p) =>
      ['negotiating', 'active', 'delivered'].includes(p.status),
    ).length;

    const unpaidInvoices = invoices.filter((i) =>
      ['draft', 'sent', 'overdue'].includes(i.status),
    ).length;

    return {
      monthlyRevenue,
      yearlyRevenue,
      monthlyExpenses,
      monthlyProfit: monthlyRevenue - monthlyExpenses,
      outstandingReceivables,
      activeProjects,
      unpaidInvoices,
    };
  }

  async getMonthlyData(months = 6): Promise<MonthlyDataPoint[]> {
    const db = await this.getDb();
    const payments = await db.getAllAsync<{ amount: number; paymentDate: string }>(
      'SELECT amount, paymentDate FROM payments',
    );
    const expenses = await db.getAllAsync<{ amount: number; date: string }>(
      'SELECT amount, date FROM expenses',
    );

    const monthMap = new Map<string, MonthlyDataPoint>();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const sampleDate = `${key}-01`;
      monthMap.set(key, {
        month: key,
        label: formatJalaliMonth(sampleDate),
        revenue: 0,
        expenses: 0,
      });
    }

    for (const p of payments) {
      const key = p.paymentDate.substring(0, 7);
      if (monthMap.has(key)) {
        monthMap.get(key)!.revenue += p.amount;
      }
    }

    for (const e of expenses) {
      const key = e.date.substring(0, 7);
      if (monthMap.has(key)) {
        monthMap.get(key)!.expenses += e.amount;
      }
    }

    return Array.from(monthMap.values());
  }

  async getYearlyData(years = 5): Promise<MonthlyDataPoint[]> {
    const db = await this.getDb();
    const payments = await db.getAllAsync<{ amount: number; paymentDate: string }>(
      'SELECT amount, paymentDate FROM payments',
    );
    const expenses = await db.getAllAsync<{ amount: number; date: string }>(
      'SELECT amount, date FROM expenses',
    );

    const now = new Date();
    const { jy: currentJy } = jalaali.toJalaali(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    );

    const yearMap = new Map<string, MonthlyDataPoint>();
    for (let i = years - 1; i >= 0; i--) {
      const jy = currentJy - i;
      const key = String(jy);
      yearMap.set(key, {
        month: key,
        label: toPersianDigits(String(jy)),
        revenue: 0,
        expenses: 0,
      });
    }

    for (const p of payments) {
      const jy = getJalaliYear(p.paymentDate);
      const key = String(jy);
      if (yearMap.has(key)) yearMap.get(key)!.revenue += p.amount;
    }

    for (const e of expenses) {
      const jy = getJalaliYear(e.date);
      const key = String(jy);
      if (yearMap.has(key)) yearMap.get(key)!.expenses += e.amount;
    }

    return Array.from(yearMap.values());
  }

  async getClientReports(): Promise<ClientReport[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<{
      clientId: string;
      clientName: string;
      totalRevenue: number;
      projectCount: number;
      invoiceCount: number;
    }>(`
      SELECT c.id as clientId, c.fullName as clientName,
        COALESCE(SUM(pay.amount), 0) as totalRevenue,
        (SELECT COUNT(*) FROM projects WHERE clientId = c.id) as projectCount,
        (SELECT COUNT(*) FROM invoices WHERE clientId = c.id) as invoiceCount
      FROM clients c
      LEFT JOIN projects pr ON pr.clientId = c.id
      LEFT JOIN payments pay ON pay.projectId = pr.id
      GROUP BY c.id
      ORDER BY totalRevenue DESC
    `);
    return rows;
  }

  async getServiceReports(): Promise<ServiceReport[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<{
      serviceId: string;
      serviceTitle: string;
      totalRevenue: number;
      usageCount: number;
    }>(`
      SELECT COALESCE(ii.serviceId, ii.title) as serviceId,
        ii.title as serviceTitle,
        SUM(ii.total) as totalRevenue,
        COUNT(*) as usageCount
      FROM invoice_items ii
      GROUP BY ii.title
      ORDER BY totalRevenue DESC
    `);
    return rows;
  }

  async getExpenseBreakdown(): Promise<{ category: string; amount: number }[]> {
    const db = await this.getDb();
    return db.getAllAsync<{ category: string; amount: number }>(`
      SELECT category, SUM(amount) as amount
      FROM expenses
      GROUP BY category
      ORDER BY amount DESC
    `);
  }
}

export const analyticsRepository = new AnalyticsRepository();
