import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { InvoiceRenderData } from './invoiceTemplate';
import { formatCurrency } from '@/core/utils/currency';
import { formatJalaliDate, formatPersianNumber } from '@/core/utils/persian';
import { FONT_FAMILY } from '@/core/theme/fonts';

interface Props extends InvoiceRenderData {
  forExport?: boolean;
}

export function InvoiceDocument({ invoice, items, client, profile, project, forExport = false }: Props) {
  const primary = profile.invoicePrimaryColor || '#1e3a8a';
  const accent = profile.invoiceAccentColor || '#10b981';
  const template = profile.invoiceTemplate || 'modern';
  const isClassic = template === 'classic';
  const isMinimal = template === 'minimal';
  const currency = profile.currency;
  const paidPercent = project && project.totalAmount > 0
    ? Math.round((project.receivedAmount / project.totalAmount) * 100)
    : 0;

  return (
    <View style={[
      styles.page,
      forExport && styles.exportPage,
      isMinimal && styles.minimalPage,
      { backgroundColor: '#fff', borderColor: isMinimal ? '#d1d5db' : '#e5e7eb' },
    ]}>
      <View style={[styles.header, { borderBottomColor: primary, borderBottomWidth: isMinimal ? 1 : isClassic ? 3 : 2 }]}>
        <View style={styles.brandCol}>
          <Text style={[styles.brandName, { color: primary }]}>{profile.fullName || 'فریلنسر'}</Text>
          <View style={styles.contactLines}>
            {profile.phone ? <Text style={styles.metaText}>تلفن: {profile.phone}</Text> : null}
            {profile.email ? <Text style={styles.metaText}>ایمیل: {profile.email}</Text> : null}
            {profile.address ? <Text style={styles.metaText}>{profile.address}</Text> : null}
            {profile.website ? <Text style={styles.metaText}>{profile.website}</Text> : null}
          </View>
        </View>

        <View style={styles.badgeCol}>
          {profile.logo ? (
            <Image source={{ uri: profile.logo }} style={styles.logo} />
          ) : (
            <View style={[styles.badge, { backgroundColor: primary, borderRadius: isClassic ? 4 : 16 }]}>
              <Text style={styles.badgeText}>فاکتور رسمی</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={[styles.metaBox, isMinimal && styles.minimalMetaBox]}>
          <Text style={[styles.metaTitle, { color: primary }]}>اطلاعات فاکتور</Text>
          <Text style={styles.metaText}>شماره: {invoice.invoiceNumber}</Text>
          <Text style={styles.metaText}>صدور: {formatJalaliDate(invoice.issueDate)}</Text>
          <Text style={styles.metaText}>سررسید: {formatJalaliDate(invoice.dueDate)}</Text>
        </View>
        <View style={[styles.metaBox, isMinimal && styles.minimalMetaBox]}>
          <Text style={[styles.metaTitle, { color: primary }]}>خریدار</Text>
          <Text style={[styles.metaText, styles.buyerName]}>{client.fullName}</Text>
          {client.companyName ? <Text style={styles.metaText}>{client.companyName}</Text> : null}
          {client.phone ? <Text style={styles.metaText}>{client.phone}</Text> : null}
        </View>
      </View>

      <View style={[styles.tableHead, { backgroundColor: primary }]}>
        <Text style={[styles.th, { width: 30 }]}>#</Text>
        <Text style={[styles.th, { flex: 1 }]}>شرح</Text>
        <Text style={[styles.th, { width: 40 }]}>تعداد</Text>
        <Text style={[styles.th, { width: 80 }]}>قیمت</Text>
        <Text style={[styles.th, { width: 80 }]}>جمع</Text>
      </View>

      {items.map((item, i) => (
        <View key={item.id} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
          <Text style={[styles.td, { width: 30 }]}>{formatPersianNumber(i + 1)}</Text>
          <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>{item.title}</Text>
          <Text style={[styles.td, { width: 40 }]}>{formatPersianNumber(item.quantity)}</Text>
          <Text style={[styles.td, { width: 80 }]}>{formatCurrency(item.unitPrice, currency)}</Text>
          <Text style={[styles.td, { width: 80 }]}>{formatCurrency(item.total, currency)}</Text>
        </View>
      ))}

      <View style={styles.totals}>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>جمع</Text><Text>{formatCurrency(invoice.subtotal, currency)}</Text></View>
        {invoice.discount > 0 && (
          <View style={styles.totalRow}><Text style={styles.totalLabel}>تخفیف</Text><Text>{formatCurrency(invoice.discount, currency)}</Text></View>
        )}
        <View style={styles.totalRow}><Text style={styles.totalLabel}>مالیات</Text><Text>{formatCurrency(invoice.tax, currency)}</Text></View>
        <View style={[styles.totalRow, styles.grandRow, { borderTopColor: primary }]}>
          <Text style={[styles.grandLabel, { color: primary }]}>قابل پرداخت</Text>
          <Text style={[styles.grandLabel, { color: primary }]}>{formatCurrency(invoice.total, currency)}</Text>
        </View>
      </View>

      {project && (
        <View style={[styles.paymentBox, { backgroundColor: accent + '18', borderColor: accent + '50' }]}>
          <Text style={styles.metaText}>
            پرداخت شده {formatPersianNumber(paidPercent)}٪ — مانده {formatCurrency(project.remainingAmount, currency)}
          </Text>
        </View>
      )}

      {profile.invoiceFooterText ? (
        <Text style={styles.footer}>{profile.invoiceFooterText}</Text>
      ) : null}

      {profile.invoiceShowSignatures && (
        <View style={styles.signatures}>
          <View style={styles.sigBox}><Text style={styles.sigText}>امضای مشتری</Text></View>
          <View style={styles.sigBox}><Text style={styles.sigText}>مهر و امضای فروشنده</Text></View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  exportPage: { width: 360, borderRadius: 0, borderWidth: 0, padding: 24 },
  minimalPage: { padding: 24 },
  minimalMetaBox: { backgroundColor: '#fff' },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    paddingBottom: 18,
    marginBottom: 18,
  },
  brandCol: { flex: 1, alignItems: 'flex-end', minWidth: 0 },
  badgeCol: { alignItems: 'flex-start', flexShrink: 0, marginTop: 4 },
  brandName: { fontSize: 20, fontWeight: '700', fontFamily: FONT_FAMILY, textAlign: 'right', marginBottom: 8 },
  contactLines: { gap: 3, alignItems: 'flex-end' },
  metaText: { fontSize: 11, color: '#6b7280', textAlign: 'right', lineHeight: 18 },
  buyerName: { fontWeight: '600', color: '#374151' },
  logo: { width: 64, height: 64, borderRadius: 10 },
  badge: { paddingHorizontal: 16, paddingVertical: 10 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  metaRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 16 },
  metaBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  metaTitle: { fontSize: 11, fontWeight: '700', marginBottom: 8, textAlign: 'right' },
  tableHead: { flexDirection: 'row-reverse', paddingVertical: 9, paddingHorizontal: 8, borderRadius: 8 },
  th: { color: '#fff', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  tableRow: { flexDirection: 'row-reverse', paddingVertical: 9, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f3f4f6' },
  tableRowAlt: { backgroundColor: '#f9fafb' },
  td: { fontSize: 10, textAlign: 'center', color: '#374151' },
  totals: { marginTop: 14, alignSelf: 'stretch', maxWidth: 260, marginRight: 'auto', marginLeft: 0 },
  totalRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 5 },
  totalLabel: { color: '#6b7280', fontSize: 11 },
  grandRow: { borderTopWidth: 2, marginTop: 8, paddingTop: 10 },
  grandLabel: { fontSize: 14, fontWeight: '700' },
  paymentBox: { marginTop: 14, padding: 12, borderRadius: 10, borderWidth: 1 },
  footer: { marginTop: 18, textAlign: 'center', color: '#9ca3af', fontSize: 10 },
  signatures: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 36, gap: 28 },
  sigBox: { flex: 1, borderTopWidth: 1, borderTopColor: '#9ca3af', paddingTop: 8 },
  sigText: { textAlign: 'center', fontSize: 10, color: '#6b7280' },
});
