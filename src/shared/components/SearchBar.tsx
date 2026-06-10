import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';
import { a11y } from '@/core/accessibility/labels';
import { radius, spacing } from '@/core/theme/tokens';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  loading?: boolean;
  accessibilityLabel?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'جستجو...',
  onClear,
  loading,
  accessibilityLabel = a11y.action.search,
}: Props) {
  const theme = useTheme();

  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      loading={loading}
      icon="magnify"
      clearIcon={value ? 'close-circle' : undefined}
      onClearIconPress={() => {
        onChangeText('');
        onClear?.();
      }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.bar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
      inputStyle={styles.input}
      placeholderTextColor={theme.colors.onSurfaceVariant}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    marginBottom: spacing.md,
    elevation: 0,
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 48,
  },
  input: {
    textAlign: 'right',
    writingDirection: 'rtl',
    minHeight: 0,
  },
});
