import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { toPersianDigits } from '@/core/utils/persian';

interface Props {
  progress: number;
  showLabel?: boolean;
}

export function ProgressBar({ progress, showLabel = true }: Props) {
  const theme = useAppTheme();
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: clamped >= 100 ? theme.custom.success : theme.colors.primary,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {toPersianDigits(Math.round(clamped))}٪
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
