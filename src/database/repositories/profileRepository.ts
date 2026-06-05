import type { Currency, Profile } from '@/core/types';
import { BaseRepository } from './base';

const DEFAULT_PROFILE_ID = 'default-profile';

const DEFAULTS: Omit<Profile, 'id'> = {
  fullName: '',
  phone: '',
  email: '',
  logo: null,
  address: '',
  website: '',
  currency: 'TOMAN',
  taxRate: 9,
  invoicePrimaryColor: '#1e3a8a',
  invoiceAccentColor: '#10b981',
  invoiceFooterText: 'با تشکر از همکاری شما',
  invoiceShowSignatures: true,
  invoiceTemplate: 'modern',
};

export class ProfileRepository extends BaseRepository {
  async get(): Promise<Profile> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<Record<string, unknown>>('SELECT * FROM profile LIMIT 1');
    if (row) return this.mapRow(row);

    const profile: Profile = { id: DEFAULT_PROFILE_ID, ...DEFAULTS };
    await this.insertProfile(profile);
    return profile;
  }

  private mapRow(row: Record<string, unknown>): Profile {
    return {
      id: row.id as string,
      fullName: (row.fullName as string) ?? '',
      phone: (row.phone as string) ?? '',
      email: (row.email as string) ?? '',
      logo: (row.logo as string | null) ?? null,
      address: (row.address as string) ?? '',
      website: (row.website as string) ?? '',
      currency: (row.currency as Currency) ?? 'TOMAN',
      taxRate: (row.taxRate as number) ?? 9,
      invoicePrimaryColor: (row.invoicePrimaryColor as string) ?? DEFAULTS.invoicePrimaryColor,
      invoiceAccentColor: (row.invoiceAccentColor as string) ?? DEFAULTS.invoiceAccentColor,
      invoiceFooterText: (row.invoiceFooterText as string) ?? DEFAULTS.invoiceFooterText,
      invoiceShowSignatures: (row.invoiceShowSignatures as number) !== 0,
      invoiceTemplate: (row.invoiceTemplate as Profile['invoiceTemplate']) ?? 'modern',
    };
  }

  private async insertProfile(profile: Profile): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT INTO profile (id, fullName, phone, email, logo, address, website, currency, taxRate,
        invoicePrimaryColor, invoiceAccentColor, invoiceFooterText, invoiceShowSignatures, invoiceTemplate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      profile.id, profile.fullName, profile.phone, profile.email, profile.logo,
      profile.address, profile.website, profile.currency, profile.taxRate,
      profile.invoicePrimaryColor, profile.invoiceAccentColor, profile.invoiceFooterText,
      profile.invoiceShowSignatures ? 1 : 0, profile.invoiceTemplate,
    );
  }

  async update(data: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
    const db = await this.getDb();
    const existing = await this.get();
    const updated = { ...existing, ...data };
    await db.runAsync(
      `UPDATE profile SET fullName = ?, phone = ?, email = ?, logo = ?, address = ?,
        website = ?, currency = ?, taxRate = ?, invoicePrimaryColor = ?, invoiceAccentColor = ?,
        invoiceFooterText = ?, invoiceShowSignatures = ?, invoiceTemplate = ? WHERE id = ?`,
      updated.fullName, updated.phone, updated.email, updated.logo,
      updated.address, updated.website, updated.currency as Currency, updated.taxRate,
      updated.invoicePrimaryColor, updated.invoiceAccentColor, updated.invoiceFooterText,
      updated.invoiceShowSignatures ? 1 : 0, updated.invoiceTemplate, updated.id,
    );
    return updated;
  }
}

export const profileRepository = new ProfileRepository();
