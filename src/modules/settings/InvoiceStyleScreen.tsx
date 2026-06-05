import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Snackbar, Switch, Text } from 'react-native-paper';
import { FormTextInput } from '@/shared/components/FormTextInput';
import type { InvoiceTemplate } from '@/core/types';
import { useProfileStore } from '@/stores/profileStore';
import { InvoiceDocument } from '@/modules/invoices/InvoiceDocument';

const COLOR_PRESETS = ['#1e3a8a', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#111827'];
const ACCENT_PRESETS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

const TEMPLATE_LABELS: Record<InvoiceTemplate, string> = {
  modern: 'مدرن',
  classic: 'کلاسیک',
  minimal: 'مینیمال',
};

export function InvoiceStyleScreen() {
  const profile = useProfileStore((s) => s.profile);
  const update = useProfileStore((s) => s.update);
  const [primaryColor, setPrimaryColor] = useState(profile?.invoicePrimaryColor ?? '#1e3a8a');
  const [accentColor, setAccentColor] = useState(profile?.invoiceAccentColor ?? '#10b981');
  const [footerText, setFooterText] = useState(profile?.invoiceFooterText ?? '');
  const [showSignatures, setShowSignatures] = useState(profile?.invoiceShowSignatures ?? true);
  const [template, setTemplate] = useState<InvoiceTemplate>(profile?.invoiceTemplate ?? 'modern');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const previewProfile = useMemo(() => {
    if (!profile) return null;
    return {
      ...profile,
      invoicePrimaryColor: primaryColor,
      invoiceAccentColor: accentColor,
      invoiceFooterText: footerText,
      invoiceShowSignatures: showSignatures,
      invoiceTemplate: template,
    };
  }, [profile, primaryColor, accentColor, footerText, showSignatures, template]);

  const previewData = useMemo(() => {
    if (!previewProfile) return null;
    const now = new Date().toISOString();
    return {
      invoice: {
        id: 'preview',
        invoiceNumber: 'INV-۱۴۰۴-۰۰۱',
        clientId: 'preview-client',
        projectId: null,
        issueDate: now,
        dueDate: now,
        subtotal: 15_000_000,
        tax: 1_350_000,
        discount: 500_000,
        total: 15_850_000,
        status: 'sent' as const,
        notes: '',
        createdAt: now,
      },
      items: [
        { id: '1', invoiceId: 'preview', serviceId: null, title: 'طراحی رابط کاربری', quantity: 1, unitPrice: 10_000_000, total: 10_000_000 },
        { id: '2', invoiceId: 'preview', serviceId: null, title: 'توسعه اپلیکیشن', quantity: 1, unitPrice: 5_000_000, total: 5_000_000 },
      ],
      client: {
        id: 'preview-client',
        fullName: 'علی محمدی',
        phone: '۰۹۱۲۱۲۳۴۵۶۷',
        email: 'client@example.com',
        companyName: 'شرکت نمونه',
        notes: '',
        createdAt: now,
      },
      profile: previewProfile,
      project: null,
    };
  }, [previewProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await update({
        invoicePrimaryColor: primaryColor,
        invoiceAccentColor: accentColor,
        invoiceFooterText: footerText,
        invoiceShowSignatures: showSignatures,
        invoiceTemplate: template,
      });
      setSnack('استایل فاکتور ذخیره شد');
    } catch {
      setSnack('خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  if (!profile || !previewData) return null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <Text variant="bodyMedium" style={styles.hint}>
        رنگ‌ها، قالب و متن پاورقی فاکتور را تنظیم کنید. تغییرات در PDF و تصویر خروجی اعمال می‌شود.
      </Text>

      <Text variant="labelLarge" style={styles.section}>قالب فاکتور</Text>
      <SegmentedButtons
        value={template}
        onValueChange={(v) => setTemplate(v as InvoiceTemplate)}
        buttons={(['modern', 'classic', 'minimal'] as InvoiceTemplate[]).map((t) => ({
          value: t,
          label: TEMPLATE_LABELS[t],
        }))}
        style={{ marginBottom: 16 }}
      />

      <Text variant="labelLarge" style={styles.section}>رنگ اصلی</Text>
      <View style={styles.colorRow}>
        {COLOR_PRESETS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setPrimaryColor(c)}
            style={[styles.swatch, { backgroundColor: c }, primaryColor === c && styles.swatchActive]}
          />
        ))}
      </View>

      <Text variant="labelLarge" style={styles.section}>رنگ تأکیدی</Text>
      <View style={styles.colorRow}>
        {ACCENT_PRESETS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setAccentColor(c)}
            style={[styles.swatch, { backgroundColor: c }, accentColor === c && styles.swatchActive]}
          />
        ))}
      </View>

      <FormTextInput
        label="متن پاورقی"
        value={footerText}
        onChangeText={setFooterText}
        style={styles.input}
        multiline
      />

      <View style={styles.switchRow}>
        <Switch value={showSignatures} onValueChange={setShowSignatures} />
        <Text variant="bodyLarge">نمایش محل امضا</Text>
      </View>

      <Text variant="labelLarge" style={styles.section}>پیش‌نمایش</Text>
      <InvoiceDocument {...previewData} />

      <Button mode="contained" onPress={handleSave} loading={saving} style={{ marginTop: 20 }}>
        ذخیره استایل فاکتور
      </Button>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')}>{snack}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  hint: { color: '#6b7280', textAlign: 'right', marginBottom: 16 },
  section: { textAlign: 'right', marginBottom: 8, marginTop: 8 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  swatchActive: { borderWidth: 3, borderColor: '#111827' },
  input: { backgroundColor: 'transparent', marginBottom: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginBottom: 16 },
});
