import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  loading?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'جستجو...',
  onClear,
  loading,
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
      style={[styles.bar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
      inputStyle={styles.input}
      placeholderTextColor={theme.colors.onSurfaceVariant}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    marginBottom: 12,
    elevation: 0,
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
  },
  input: {
    textAlign: 'right',
    writingDirection: 'rtl',
    minHeight: 0,
  },
});
