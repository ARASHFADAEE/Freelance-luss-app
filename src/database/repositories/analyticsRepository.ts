import jalaali from 'jalaali-js';
import type {
  ClientReport,
  DashboardInsight,
  DashboardStats,
  MonthlyDataPoint,
  ServiceReport,
} from '@/core/types';
import { formatJalaliMonth, getJalaliYear, toLatinDigits, toPersianDigits } from '@/core/utils/persian';
import { BaseRepository } from './base';

function monthKeyFromDate(dateStr: string): string {
  return toLatinDigits(dateStr).slice(0, 7);
}

function previousMonthKey(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function trendPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

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
    const prevMonth = previousMonthKey();

    const monthlyRevenue = payments
      .filter((p) => monthKeyFromDate(p.paymentDate) === currentMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const previousMonthlyRevenue = payments
      .filter((p) => monthKeyFromDate(p.paymentDate) === prevMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const yearlyRevenue = payments
      .filter((p) => monthKeyFromDate(p.paymentDate).startsWith(currentYear))
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyExpenses = expenses
      .filter((e) => monthKeyFromDate(e.date) === currentMonth)
      .reduce((sum, e) => sum + e.amount, 0);

    const previousMonthlyExpenses = expenses
      .filter((e) => monthKeyFromDate(e.date) === prevMonth)
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

    const overdueInvoices = invoices.filter((i) => i.status === 'overdue').length;
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const previousMonthlyProfit = previousMonthlyRevenue - previousMonthlyExpenses;

    return {
      monthlyRevenue,
      yearlyRevenue,
      monthlyExpenses,
      monthlyProfit,
      outstandingReceivables,
      activeProjects,
      unpaidInvoices,
      overdueInvoices,
      revenueTrendPercent: trendPercent(monthlyRevenue, previousMonthlyRevenue),
      expenseTrendPercent: trendPercent(monthlyExpenses, previousMonthlyExpenses),
      profitTrendPercent: trendPercent(monthlyProfit, previousMonthlyProfit),
    };
  }

  async getDashboardInsights(): Promise<DashboardInsight[]> {
    const db = await this.getDb();
    const insights: DashboardInsight[] = [];

    const topClient = await db.getFirstAsync<{
      clientName: string;
      totalRevenue: number;
    }>(`
      SELECT c.fullName as clientName, COALESCE(SUM(pay.amount), 0) as totalRevenue
      FROM clients c
      LEFT JOIN projects pr ON pr.clientId = c.id
      LEFT JOIN payments pay ON pay.projectId = pr.id
      GROUP BY c.id
      ORDER BY totalRevenue DESC
      LIMIT 1
    `);

    if (topClient && topClient.totalRevenue > 0) {
      insights.push({
        id: 'best-client',
        icon: 'account-star',
        title: `بهترین مشتری: ${topClient.clientName}`,
        subtitle: 'بیشترین درآمد از پرداخت‌های ثبت‌شده',
        tone: 'success',
      });
    }

    const topProject = await db.getFirstAsync<{
      title: string;
      receivedAmount: number;
    }>(`
      SELECT title, receivedAmount
      FROM projects
      WHERE receivedAmount > 0
      ORDER BY receivedAmount DESC
      LIMIT 1
    `);

    if (topProject) {
      insights.push({
        id: 'top-project',
        icon: 'briefcase-check',
        title: `پرسودترین پروژه: ${topProject.title}`,
        subtitle: 'بر اساس مجموع دریافتی',
        tone: 'info',
      });
    }

    const monthly = await this.getMonthlyData(2);
    if (monthly.length >= 2) {
      const current = monthly[monthly.length - 1];
      const prev = monthly[monthly.length - 2];
      const expenseDelta = trendPercent(current.expenses, prev.expenses);
      if (current.expenses > 0 || prev.expenses > 0) {
        insights.push({
          id: 'expense-trend',
          icon: expenseDelta > 0 ? 'trending-up' : 'trending-down',
          title:
            expenseDelta === 0
              ? 'هزینه‌ها نسبت به ماه قبل ثابت است'
              : expenseDelta > 0
                ? `هزینه‌ها ${toPersianDigits(String(Math.abs(expenseDelta)))}٪ بیشتر از ماه قبل`
                : `هزینه‌ها ${toPersianDigits(String(Math.abs(expenseDelta)))}٪ کمتر از ماه قبل`,
          subtitle: 'مقایسه دو ماه اخیر',
          tone: expenseDelta > 10 ? 'danger' : expenseDelta > 0 ? 'warning' : 'success',
        });
      }
    }

    const overdueCount = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM invoices WHERE status = 'overdue'`,
    );
    if (overdueCount && overdueCount.count > 0) {
      insights.push({
        id: 'overdue-invoices',
        icon: 'alert-circle-outline',
        title: `${toPersianDigits(String(overdueCount.count))} فاکتور سررسید گذشته`,
        subtitle: 'پیگیری مطالبات را فراموش نکنید',
        tone: 'warning',
      });
    }

    return insights;
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
      const key = monthKeyFromDate(p.paymentDate);
      if (monthMap.has(key)) {
        monthMap.get(key)!.revenue += p.amount;
      }
    }

    for (const e of expenses) {
      const key = monthKeyFromDate(e.date);
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

  async getRangeData(startDate: string, endDate: string): Promise<{
    revenue: number;
    expenses: number;
    profit: number;
    chart: MonthlyDataPoint[];
  }> {
    const db = await this.getDb();
    const payments = await db.getAllAsync<{ amount: number; paymentDate: string }>(
      'SELECT amount, paymentDate FROM payments WHERE paymentDate >= ? AND paymentDate <= ?',
      startDate,
      endDate,
    );
    const expenses = await db.getAllAsync<{ amount: number; date: string }>(
      'SELECT amount, date FROM expenses WHERE date >= ? AND date <= ?',
      startDate,
      endDate,
    );

    const revenue = payments.reduce((s, p) => s + p.amount, 0);
    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

    const monthMap = new Map<string, MonthlyDataPoint>();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, {
        month: key,
        label: formatJalaliMonth(`${key}-01`),
        revenue: 0,
        expenses: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    for (const p of payments) {
      const key = monthKeyFromDate(p.paymentDate);
      if (monthMap.has(key)) monthMap.get(key)!.revenue += p.amount;
    }

    for (const e of expenses) {
      const key = monthKeyFromDate(e.date);
      if (monthMap.has(key)) monthMap.get(key)!.expenses += e.amount;
    }

    return {
      revenue,
      expenses: expenseTotal,
      profit: revenue - expenseTotal,
      chart: Array.from(monthMap.values()),
    };
  }

  async getExpenseBreakdownInRange(startDate: string, endDate: string): Promise<{ category: string; amount: number }[]> {
    const db = await this.getDb();
    return db.getAllAsync<{ category: string; amount: number }>(`
      SELECT category, SUM(amount) as amount
      FROM expenses
      WHERE date >= ? AND date <= ?
      GROUP BY category
      ORDER BY amount DESC
    `, startDate, endDate);
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
