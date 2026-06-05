import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import { clientRepository, invoiceRepository, projectRepository, profileRepository } from '@/database';
import type { InvoicesStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { generateInvoicePdf, generateInvoicePng, shareInvoiceFile } from './invoiceExport';
import { InvoiceDocument } from './InvoiceDocument';

export function InvoiceDetailScreen() {
  const route = useRoute<RouteProp<InvoicesStackParamList, 'InvoiceDetail'>>();
  const exportRef = useRef<React.ComponentRef<typeof ViewShot>>(null);
  const profile = useProfileStore((s) => s.profile);
  const canUsePdf = useSubscriptionStore((s) => s.canUsePdf());
  const [snack, setSnack] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const { data: invoice } = useQuery({ queryKey: ['invoice', route.params.invoiceId], queryFn: () => invoiceRepository.getById(route.params.invoiceId) });
  const { data: items = [] } = useQuery({ queryKey: ['invoice-items', route.params.invoiceId], queryFn: () => invoiceRepository.getItems(route.params.invoiceId) });
  const { data: client } = useQuery({ queryKey: ['client', invoice?.clientId], queryFn: () => clientRepository.getById(invoice!.clientId), enabled: !!invoice?.clientId });
  const { data: project } = useQuery({ queryKey: ['project', invoice?.projectId], queryFn: () => projectRepository.getById(invoice!.projectId!), enabled: !!invoice?.projectId });

  if (!invoice || !client) return null;

  const renderData = { invoice, items, client, profile: profile!, project };

  const handleExportPdf = async () => {
    if (!canUsePdf) { setSnack('نیاز به اشتراک Pro'); return; }
    setExporting(true);
    try {
      const prof = profile ?? await profileRepository.get();
      const uri = await generateInvoicePdf({ ...renderData, profile: prof });
      await shareInvoiceFile(uri, 'application/pdf', 'اشتراک فاکتور PDF');
    } catch (e) {
      setSnack(e instanceof Error ? e.message : 'خطا در تولید PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPng = async () => {
    if (!canUsePdf) { setSnack('نیاز به اشتراک Pro'); return; }
    setExporting(true);
    try {
      const prof = profile ?? await profileRepository.get();
      const data = { ...renderData, profile: prof };

      const captureNative = async () => {
        setShowExportModal(true);
        await new Promise((r) => setTimeout(r, 400));
        const uri = await exportRef.current?.capture?.();
        setShowExportModal(false);
        return uri;
      };

      const uri = await generateInvoicePng(data, captureNative);
      await shareInvoiceFile(uri, 'image/png', 'اشتراک تصویر فاکتور');
    } catch (e) {
      setSnack(e instanceof Error ? e.message : 'خطا در تولید تصویر');
      setShowExportModal(false);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenContainer>
      <Text variant="labelMedium" style={{ textAlign: 'right', marginBottom: 8, color: '#6b7280' }}>پیش‌نمایش فاکتور</Text>
      <InvoiceDocument {...renderData} profile={profile!} />

      <View style={styles.actions}>
        <Button mode="contained" icon="file-pdf-box" onPress={handleExportPdf} loading={exporting} style={{ flex: 1 }}>
          PDF
        </Button>
        <Button mode="outlined" icon="image" onPress={handleExportPng} loading={exporting} style={{ flex: 1 }}>
          تصویر
        </Button>
      </View>

      <Modal visible={showExportModal} transparent animationType="fade">
        <View style={styles.exportOverlay}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={{ marginTop: 12, color: '#fff' }}>در حال آماده‌سازی تصویر...</Text>
          <View style={styles.hiddenShot}>
            <ViewShot ref={exportRef} options={{ format: 'png', quality: 1, result: 'tmpfile' }}>
              <InvoiceDocument {...renderData} profile={profile!} forExport />
            </ViewShot>
          </View>
        </View>
      </Modal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')}>{snack}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  exportOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  hiddenShot: { position: 'absolute', left: -9999, top: 0 },
});
