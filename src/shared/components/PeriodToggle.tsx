import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    <View style={[styles.wrap, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.btn,
              active && { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
            ]}
          >
            <MaterialCommunityIcons
              name={opt.icon}
              size={18}
              color={active ? '#fff' : theme.colors.onSurfaceVariant}
            />
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row-reverse',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  btn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
});
