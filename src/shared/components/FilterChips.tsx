import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { spacing, radius } from '@/core/theme/tokens';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityGroupLabel?: string;
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  accessibilityGroupLabel = 'فیلتر',
}: Props<T>) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityGroupLabel}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                borderColor: active ? theme.colors.primary : theme.colors.outlineVariant,
                minHeight: 44,
              },
            ]}
          >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
});
