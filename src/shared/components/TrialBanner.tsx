import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TRIAL_DAYS } from '@/core/constants';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { formatPersianNumber } from '@/core/utils/persian';

interface Props {
  daysRemaining: number;
  onPress?: () => void;
}

export function TrialBanner({ daysRemaining, onPress }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.box, { backgroundColor: theme.custom.secondary + '14', borderColor: theme.custom.secondary }]}
    >
      <MaterialCommunityIcons name="gift-outline" size={24} color={theme.custom.secondary} />
      <View style={{ flex: 1, alignItems: 'flex-end', gap: 2 }}>
        <Text variant="bodyLarge" style={{ fontWeight: '700' }}>
          دوره آزمایشی Pro — {formatPersianNumber(daysRemaining)} روز باقی‌مانده
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
          گزارش‌ها، PDF و نمودار فعال است · محدودیت تعداد مشتری/پروژه/فاکتور ({formatPersianNumber(TRIAL_DAYS)} روز)
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
});
