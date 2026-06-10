import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Switch, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setupAllReminders, sendTestNotification } from './notificationService';
import { settingsRepository } from '@/database';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export function NotificationsScreen() {
  const theme = useTheme();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [snack, setSnack] = useState('');

  const handleToggle = async (value: boolean) => {
    setEnabled(value);
    await settingsRepository.update({ notificationsEnabled: value });
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const result = await setupAllReminders();
      setSnack(result.message);
    } catch {
      setSnack('خطا در تنظیم یادآوری‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await sendTestNotification();
      setSnack(result.message);
    } catch {
      setSnack('خطا در ارسال اعلان تست');
    } finally {
      setTesting(false);
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

      <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary + '25' }]}>
        <MaterialCommunityIcons name="bell-ring-outline" size={22} color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ flex: 1, textAlign: 'right', lineHeight: 22 }}>
          یادآوری‌های محلی:{'\n'}
          • سررسید فاکتور (۱ روز قبل){'\n'}
          • اقساط پروژه (۳ روز قبل){'\n'}
          • تمدید اشتراک
        </Text>
      </View>

      {Platform.OS === 'web' && (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginBottom: 12 }}>
          روی وب از اعلان مرورگر استفاده می‌شود. برای تست، مجوز اعلان را بپذیرید.
        </Text>
      )}

      <Button mode="contained" onPress={handleSetup} loading={loading} disabled={!enabled} style={styles.btn}>
        تنظیم یادآوری‌ها
      </Button>

      <Button
        mode="outlined"
        icon="bell-check"
        onPress={handleTest}
        loading={testing}
        disabled={!enabled}
        style={styles.btn}
      >
        ارسال اعلان تست
      </Button>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  infoBox: { flexDirection: 'row-reverse', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 },
  btn: { marginBottom: 10 },
});
