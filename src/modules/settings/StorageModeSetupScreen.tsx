import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DataStorageMode } from '@/core/types';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { storageModeService } from '@/services/cloud/storageModeService';
import { STORAGE_MODE_LABELS } from '@/stores/storageModeStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const MODES: DataStorageMode[] = ['local', 'cloud'];

interface Props {
  /** false = کاربر می‌تواند بعداً از تنظیمات عوض کند */
  allowSkip?: boolean;
  onComplete: () => void;
}

export function StorageModeSetupScreen({ allowSkip = false, onComplete }: Props) {
  const theme = useAppTheme();
  const [selected, setSelected] = useState<DataStorageMode>('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await storageModeService.applyMode(selected);
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ذخیره تنظیمات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <MaterialCommunityIcons name="database-cog-outline" size={48} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={styles.title}>محل ذخیره داده‌ها</Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {Platform.OS === 'web'
            ? 'داده‌های حسابداری شما کجا ذخیره شوند؟'
            : 'داده‌های حسابداری شما کجا ذخیره شوند؟'}
        </Text>
      </View>

      {MODES.map((mode) => {
        const meta = STORAGE_MODE_LABELS[mode];
        const active = selected === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => setSelected(mode)}
            style={[
              styles.card,
              {
                borderColor: active ? theme.colors.primary : theme.colors.outlineVariant,
                backgroundColor: active ? theme.colors.primary + '08' : theme.colors.surface,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={meta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={28}
              color={active ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <View style={styles.cardBody}>
              <Text variant="titleMedium" style={{ fontWeight: '700', textAlign: 'right' }}>{meta.title}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', lineHeight: 20, marginTop: 4 }}>
                {meta.subtitle}
              </Text>
              {mode === 'cloud' ? (
                <Text variant="labelSmall" style={{ color: theme.custom.secondary, textAlign: 'right', marginTop: 6 }}>
                  ✓ همگام‌سازی بین موبایل، وب و تبلت
                </Text>
              ) : null}
            </View>
            {active ? (
              <MaterialCommunityIcons name="check-circle" size={22} color={theme.colors.primary} />
            ) : null}
          </Pressable>
        );
      })}

      {error ? <Text variant="bodySmall" style={styles.error}>{error}</Text> : null}

      <Button mode="contained" onPress={handleConfirm} loading={loading} style={{ marginTop: 8 }}>
        ادامه
      </Button>

      {allowSkip ? (
        <Button mode="text" onPress={onComplete} disabled={loading} style={{ marginTop: 4 }}>
          بعداً در تنظیمات
        </Button>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 8, marginBottom: 20 },
  title: { fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardBody: { flex: 1 },
  error: { color: '#ef4444', textAlign: 'right', marginBottom: 8 },
});
