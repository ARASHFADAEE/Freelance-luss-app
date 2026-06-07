import React, { useState } from 'react';
import { List, Snackbar, Text } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'react-native-paper';
import { confirmResetData } from '@/core/utils/confirm';
import { IS_API_CONFIGURED } from '@/core/config/env';
import { resetAllBusinessData } from '@/services/data/dataResetService';
import { useStorageModeStore } from '@/stores/storageModeStore';

const listTitleStyle = { textAlign: 'right' as const, writingDirection: 'rtl' as const };
const listDescStyle = { textAlign: 'right' as const, writingDirection: 'rtl' as const };

export function DataResetSettingsSection() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const storageMode = useStorageModeStore((s) => s.mode);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const cloudHint =
    IS_API_CONFIGURED && storageMode === 'cloud'
      ? ' داده ابری هم (در صورت پشتیبانی سرور) پاک می‌شود.'
      : '';

  const handleReset = () => {
    confirmResetData(async () => {
      setLoading(true);
      setError('');
      try {
        await resetAllBusinessData(queryClient);
        setMessage('همه داده‌ها پاک شد. اکنون می‌توانید از نو شروع کنید.');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'خطا در پاک‌سازی داده‌ها');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <>
      <Text variant="labelLarge" style={{ textAlign: 'right', marginBottom: 4, marginTop: 8, color: theme.colors.error }}>
        منطقه خطر
      </Text>
      <List.Item
        title="پاک‌سازی همه داده‌ها"
        description={`حذف مشتریان، پروژه‌ها، فاکتورها، پرداخت‌ها، هزینه‌ها و خدمات.${cloudHint}`}
        titleStyle={[listTitleStyle, { color: theme.colors.error }]}
        descriptionStyle={listDescStyle}
        right={() => <List.Icon icon="delete-sweep" color={theme.colors.error} />}
        onPress={loading ? undefined : handleReset}
        disabled={loading}
      />
      <Snackbar visible={!!message} onDismiss={() => setMessage('')} duration={4000}>
        {message}
      </Snackbar>
      <Snackbar visible={!!error} onDismiss={() => setError('')}>
        {error}
      </Snackbar>
    </>
  );
}
