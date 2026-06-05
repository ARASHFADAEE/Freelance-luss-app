import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DataStorageMode } from '@/core/types';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { storageModeService } from '@/services/cloud/storageModeService';
import { STORAGE_MODE_LABELS, useStorageModeStore } from '@/stores/storageModeStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const MODES: DataStorageMode[] = ['local', 'cloud'];

export function StorageModeSettingsSection() {
  const theme = useAppTheme();
  const mode = useStorageModeStore((s) => s.mode);
  const [selected, setSelected] = useState<DataStorageMode>(mode);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');

  const hasChange = selected !== mode;

  const handleSave = async () => {
    if (!hasChange) return;

    const message =
      selected === 'cloud'
        ? 'با فعال‌سازی فضای ابری، داده‌های شما روی سرور فریلنس پلاس ذخیره می‌شود. ادامه می‌دهید؟'
        : 'با بازگشت به ذخیره محلی، داده‌های جدید فقط روی این دستگاه ذخیره می‌شوند. داده‌های قبلی روی سرور باقی می‌مانند.';

    const confirmed =
      Platform.OS === 'web'
        ? window.confirm(message)
        : await new Promise<boolean>((resolve) => {
            Alert.alert('تغییر محل ذخیره', message, [
              { text: 'انصراف', style: 'cancel', onPress: () => resolve(false) },
              { text: 'تأیید', onPress: () => resolve(true) },
            ]);
          });

    if (!confirmed) {
      setSelected(mode);
      return;
    }

    setLoading(true);
    try {
      await storageModeService.applyMode(selected);
      setSnack(selected === 'cloud' ? 'فضای ابری فعال شد' : 'ذخیره محلی فعال شد');
    } catch (e) {
      setSnack(e instanceof Error ? e.message : 'خطا');
      setSelected(mode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text variant="titleMedium" style={{ fontWeight: '700', textAlign: 'right', marginBottom: 4 }}>
        محل ذخیره داده‌ها
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginBottom: 12, lineHeight: 20 }}>
        مشتریان، پروژه‌ها، فاکتورها و گزارش‌ها
      </Text>

      {MODES.map((m) => {
        const meta = STORAGE_MODE_LABELS[m];
        const active = selected === m;
        return (
          <Pressable
            key={m}
            onPress={() => setSelected(m)}
            style={[
              styles.card,
              {
                borderColor: active ? theme.colors.primary : theme.colors.outlineVariant,
                backgroundColor: active ? theme.colors.primary + '06' : 'transparent',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={meta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={22}
              color={active ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <View style={{ flex: 1 }}>
              <Text variant="bodyLarge" style={{ fontWeight: '600', textAlign: 'right' }}>{meta.title}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
                {meta.subtitle}
              </Text>
            </View>
            {active ? <MaterialCommunityIcons name="radiobox-marked" size={20} color={theme.colors.primary} /> : (
              <MaterialCommunityIcons name="radiobox-blank" size={20} color={theme.colors.outline} />
            )}
          </Pressable>
        );
      })}

      {mode === 'cloud' ? (
        <Text variant="labelSmall" style={{ color: theme.custom.secondary, textAlign: 'right', marginTop: 4 }}>
          همگام‌سازی ابری: پس از پیاده‌سازی API، داده‌ها بین دستگاه‌ها یکسان می‌شوند.
        </Text>
      ) : null}

      {hasChange ? (
        <Button mode="contained" onPress={handleSave} loading={loading} style={{ marginTop: 12 }}>
          ذخیره تغییرات
        </Button>
      ) : null}

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
});
