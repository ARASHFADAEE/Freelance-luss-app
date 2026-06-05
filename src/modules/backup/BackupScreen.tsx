import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import { exportBackup, importBackup, shareBackup } from './backupService';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export function BackupScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const canUseBackup = useSubscriptionStore((s) => s.canUseBackup);
  const [loading, setLoading] = useState(false);

  if (!canUseBackup()) {
    return (
      <View style={styles.locked}>
        <Text variant="titleMedium">پشتیبان‌گیری فقط در پلن Pro</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>
          برای خروجی و بازیابی اطلاعات، اشتراک Pro فعال کنید
        </Text>
      </View>
    );
  }

  const handleExport = async () => {
    setLoading(true);
    try {
      const path = await exportBackup();
      await shareBackup(path);
      Alert.alert('موفق', 'فایل پشتیبان ایجاد شد');
    } catch {
      Alert.alert('خطا', 'خطا در ایجاد پشتیبان');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      'بازیابی اطلاعات',
      'تمام اطلاعات فعلی جایگزین می‌شود. ادامه می‌دهید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'بازیابی',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await importBackup();
              queryClient.invalidateQueries();
              Alert.alert('موفق', 'اطلاعات بازیابی شد');
            } catch (e) {
              Alert.alert('خطا', e instanceof Error ? e.message : 'خطا در بازیابی');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '600', textAlign: 'right' }}>خروجی JSON</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginBottom: 12 }}>
            تمام اطلاعات شامل مشتریان، پروژه‌ها، فاکتورها و هزینه‌ها
          </Text>
          <Button mode="contained" icon="export" onPress={handleExport} loading={loading}>
            خروجی و اشتراک‌گذاری
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '600', textAlign: 'right' }}>بازیابی</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginBottom: 12 }}>
            وارد کردن فایل JSON پشتیبان
          </Text>
          <Button mode="outlined" icon="import" onPress={handleImport} loading={loading}>
            انتخاب فایل و بازیابی
          </Button>
        </Card.Content>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
