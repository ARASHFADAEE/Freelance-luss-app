import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterChips<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                borderColor: active ? theme.colors.primary : theme.colors.outlineVariant,
              },
            ]}
          >
            <Text
              variant="labelLarge"
              style={{
                color: active ? '#fff' : theme.colors.onSurface,
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
  row: { flexDirection: 'row-reverse', gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
});
