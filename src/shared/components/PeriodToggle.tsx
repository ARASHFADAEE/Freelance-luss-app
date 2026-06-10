import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { radius, spacing } from '@/core/theme/tokens';

export interface PeriodOption<T extends string> {
  value: T;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface Props<T extends string> {
  options: PeriodOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function PeriodToggle<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();

  return (
    <View
      style={[styles.wrap, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
      accessibilityRole="radiogroup"
      accessibilityLabel="انتخاب بازه زمانی"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
            style={[styles.btn, active && { backgroundColor: theme.colors.primary }, { minHeight: 44 }]}
          >
            <MaterialCommunityIcons
              name={opt.icon}
              size={18}
              color={active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="labelLarge"
              style={{
                color: active ? theme.colors.onPrimary : theme.colors.onSurface,
                fontWeight: active ? '700' : '500',
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row-reverse',
    borderRadius: radius.lg - 2,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xs,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  btn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md - 2,
  },
});
