import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
}

export function StatCard({ title, value, icon, color }: Props) {
  const theme = useTheme();
  const iconColor = color ?? theme.colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <View style={styles.top}>
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1, textAlign: 'right' }}>
          {title}
        </Text>
      </View>
      <Text variant="titleMedium" style={{ fontWeight: '700', textAlign: 'right', marginTop: 6 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
