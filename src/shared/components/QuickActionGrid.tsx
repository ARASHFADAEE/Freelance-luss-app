import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

export interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  color?: string;
}

interface Props {
  actions: QuickAction[];
  columns?: 3 | 4;
}

export function QuickActionGrid({ actions, columns = 3 }: Props) {
  const theme = useAppTheme();
  const widthPercent = columns === 4 ? '23%' : '31%';

  return (
    <View style={styles.grid}>
      {actions.map((action) => {
        const accent = action.color ?? theme.colors.primary;
        return (
          <Pressable
            key={action.id}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [
              styles.item,
              { width: widthPercent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: accent + '16' }]}>
              <MaterialCommunityIcons name={action.icon} size={22} color={accent} />
            </View>
            <AppText variant="caption" align="center" numberOfLines={2} style={styles.label}>
              {action.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
    justifyContent: 'flex-start',
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    minHeight: 32,
  },
});
