import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';

interface Props {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  value: string;
  accentColor?: string;
  rank?: number;
}

export function ReportListCard({ icon, title, subtitle, value, accentColor, rank }: Props) {
  const theme = useAppTheme();
  const color = accentColor ?? theme.colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      {rank != null && (
        <View style={[styles.rank, { backgroundColor: color + '18' }]}>
          <Text variant="labelSmall" style={{ color, fontWeight: '700' }}>{rank}</Text>
        </View>
      )}
      <View style={[styles.iconWrap, { backgroundColor: color + '14' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.content}>
        <Text variant="bodyLarge" style={{ fontWeight: '600', textAlign: 'right' }} numberOfLines={1}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
          {subtitle}
        </Text>
      </View>
      <Text variant="titleSmall" style={{ color, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  rank: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, gap: 2 },
});
