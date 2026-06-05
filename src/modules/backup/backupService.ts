import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import type { BackupData } from '@/core/types';
import {
  clientRepository,
  expenseRepository,
  invoiceRepository,
  paymentRepository,
  profileRepository,
  projectRepository,
  resetDatabase,
  serviceRepository,
  settingsRepository,
} from '@/database';

const BACKUP_VERSION = '1.0.0';

export async function exportBackup(): Promise<string> {
  const [profile, settings, clients, projects, payments, services, invoices, expenses] =
    await Promise.all([
      profileRepository.get(),
      settingsRepository.get(),
      clientRepository.getAll(),
      projectRepository.getAll(),
      paymentRepository.getAll(),
      serviceRepository.getAll(),
      invoiceRepository.getAll(),
      expenseRepository.getAll(),
    ]);

  const invoiceItems = [];
  for (const invoice of invoices) {
    const items = await invoiceRepository.getItems(invoice.id);
    invoiceItems.push(...items);
  }

  const backup: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    settings,
    clients,
    projects,
    payments,
    services,
    invoices,
    invoiceItems,
    expenses,
  };

  const json = JSON.stringify(backup, null, 2);
  const fileName = `freelancerpro-backup-${Date.now()}.json`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(filePath, json);

  return filePath;
}

export async function shareBackup(filePath: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'application/json',
      dialogTitle: 'اشتراک‌گذاری پشتیبان',
    });
  }
}

export async function importBackup(): Promise<void> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  if (result.canceled || !result.assets?.[0]) return;

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
  const backup: BackupData = JSON.parse(content);

  if (!backup.version || !backup.clients) {
    throw new Error('فایل پشتیبان نامعتبر است');
  }

  await resetDatabase();
  const db = await import('@/database/connection').then((m) => m.getDatabase());

  if (backup.profile) {
    const p = backup.profile;
    await db.runAsync(
      `INSERT OR REPLACE INTO profile (id, fullName, phone, email, logo, address, website, currency, taxRate,
        invoicePrimaryColor, invoiceAccentColor, invoiceFooterText, invoiceShowSignatures, invoiceTemplate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      p.id, p.fullName, p.phone, p.email, p.logo, p.address, p.website, p.currency, p.taxRate,
      p.invoicePrimaryColor ?? '#1e3a8a', p.invoiceAccentColor ?? '#10b981',
      p.invoiceFooterText ?? 'با تشکر از همکاری شما',
      p.invoiceShowSignatures !== false ? 1 : 0, p.invoiceTemplate ?? 'modern',
    );
  }

  if (backup.settings) {
    await db.runAsync(
      `INSERT OR REPLACE INTO app_settings (id, darkMode, subscriptionPlan, subscriptionExpiresAt, notificationsEnabled, onboardingCompleted)
       VALUES (?, ?, ?, ?, ?, ?)`,
      backup.settings.id,
      backup.settings.darkMode ? 1 : 0,
      backup.settings.subscriptionPlan,
      backup.settings.subscriptionExpiresAt,
      backup.settings.notificationsEnabled ? 1 : 0,
      backup.settings.onboardingCompleted ? 1 : 0,
    );
  }

  for (const client of backup.clients) {
    await db.runAsync(
      `INSERT INTO clients (id, fullName, phone, email, companyName, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      client.id, client.fullName, client.phone, client.email, client.companyName, client.notes, client.createdAt,
    );
  }

  for (const project of backup.projects) {
    await db.runAsync(
      `INSERT INTO projects (id, clientId, title, description, totalAmount, receivedAmount, remainingAmount, startDate, dueDate, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      project.id, project.clientId, project.title, project.description,
      project.totalAmount, project.receivedAmount, project.remainingAmount,
      project.startDate, project.dueDate, project.status, project.createdAt,
    );
  }

  for (const payment of backup.payments) {
    await db.runAsync(
      `INSERT INTO payments (id, projectId, amount, paymentDate, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      payment.id, payment.projectId, payment.amount, payment.paymentDate, payment.description, payment.createdAt,
    );
  }

  for (const service of backup.services) {
    await db.runAsync(
      `INSERT INTO services (id, title, category, defaultPrice, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      service.id, service.title, service.category, service.defaultPrice, service.description, service.createdAt,
    );
  }

  for (const invoice of backup.invoices) {
    await db.runAsync(
      `INSERT INTO invoices (id, invoiceNumber, clientId, projectId, issueDate, dueDate, subtotal, tax, discount, total, status, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      invoice.id, invoice.invoiceNumber, invoice.clientId, invoice.projectId,
      invoice.issueDate, invoice.dueDate, invoice.subtotal, invoice.tax,
      invoice.discount, invoice.total, invoice.status, invoice.notes, invoice.createdAt,
    );
  }

  for (const item of backup.invoiceItems) {
    await db.runAsync(
      `INSERT INTO invoice_items (id, invoiceId, serviceId, title, quantity, unitPrice, total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      item.id, item.invoiceId, item.serviceId, item.title, item.quantity, item.unitPrice, item.total,
    );
  }

  for (const expense of backup.expenses) {
    await db.runAsync(
      `INSERT INTO expenses (id, category, amount, description, date, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      expense.id, expense.category, expense.amount, expense.description, expense.date, expense.createdAt,
    );
  }
}
