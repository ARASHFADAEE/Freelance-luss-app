import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FREE_PLAN_LIMITS, PRO_PLAN_PRICE } from '@/core/constants';
import { formatPersianNumber } from '@/core/utils/persian';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const PRO_FEATURES = [
  'مشتری، پروژه و فاکتور نامحدود',
  'صدور PDF و PNG',
  'گزارش‌های حرفه‌ای و نمودار',
  'پشتیبان‌گیری و چند ارزی',
];

export function SubscriptionScreen() {
  const theme = useAppTheme();
  const { plan, upgradeToPro } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await upgradeToPro();
      setSnack('اشتراک Pro با موفقیت فعال شد!');
    } catch {
      setSnack('خطا در فعال‌سازی. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={[styles.planBox, { borderColor: theme.colors.outlineVariant }]}>
        <Text variant="titleMedium" style={styles.planTitle}>پلن رایگان</Text>
        {plan === 'free' && <Text variant="labelSmall" style={{ color: theme.colors.primary }}>فعلی</Text>}
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginTop: 8, lineHeight: 22 }}>
          حداکثر {formatPersianNumber(FREE_PLAN_LIMITS.clients)} مشتری · {formatPersianNumber(FREE_PLAN_LIMITS.projects)} پروژه · {formatPersianNumber(FREE_PLAN_LIMITS.invoices)} فاکتور
        </Text>
      </View>

      <View style={[styles.proBox, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary }]}>
        <View style={styles.proHeader}>
          <MaterialCommunityIcons name="crown" size={22} color={theme.colors.primary} />
          <Text variant="titleLarge" style={{ fontWeight: '700' }}>Pro</Text>
        </View>
        {plan === 'pro' && (
          <Text variant="labelMedium" style={{ color: theme.custom.success, textAlign: 'right' }}>✓ فعال</Text>
        )}
        <Text variant="headlineSmall" style={{ fontWeight: '700', marginVertical: 10, textAlign: 'right' }}>
          {formatPersianNumber(PRO_PLAN_PRICE)} تومان / سال
        </Text>
        {PRO_FEATURES.map((f) => (
          <Text key={f} variant="bodyMedium" style={{ textAlign: 'right', marginBottom: 6, color: theme.colors.onSurfaceVariant }}>
            · {f}
          </Text>
        ))}
        {plan === 'free' && (
          <Button mode="contained" onPress={handleUpgrade} loading={loading} style={{ marginTop: 16 }}>
            فعال‌سازی Pro (دمو)
          </Button>
        )}
      </View>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  planBox: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  planTitle: { fontWeight: '600', textAlign: 'right' },
  proBox: { borderWidth: 1.5, borderRadius: 12, padding: 16 },
  proHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end' },
});
