import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Switch, Text, useTheme } from 'react-native-paper';
import { setupAllReminders } from './notificationService';
import { settingsRepository } from '@/database';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export function NotificationsScreen() {
  const theme = useTheme();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (value: boolean) => {
    setEnabled(value);
    await settingsRepository.update({ notificationsEnabled: value });
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      await setupAllReminders();
      Alert.alert('موفق', 'یادآوری‌ها تنظیم شدند');
    } catch {
      Alert.alert('خطا', 'خطا در تنظیم یادآوری‌ها');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Switch value={enabled} onValueChange={handleToggle} />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text variant="titleMedium">یادآوری‌ها</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                سررسید فاکتور و اقساط پروژه
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16, textAlign: 'right' }}>
        یادآوری‌های محلی برای:{'\n'}
        • سررسید فاکتور (۱ روز قبل){'\n'}
        • اقساط پروژه (۳ روز قبل){'\n'}
        • تمدید اشتراک
      </Text>

      <Button mode="contained" onPress={handleSetup} loading={loading} disabled={!enabled}>
        تنظیم یادآوری‌ها
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
