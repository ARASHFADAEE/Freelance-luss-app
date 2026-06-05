import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput, type TextInputProps, useTheme } from 'react-native-paper';
import { inputStyles } from '@/shared/styles/input';

export function FormTextInput({ style, contentStyle, mode = 'outlined', label, placeholder, ...props }: TextInputProps) {
  const theme = useTheme();
  const placeholderText = placeholder ?? (typeof label === 'string' ? label : undefined);

  return (
    <View style={styles.wrap}>
      {typeof label === 'string' ? (
        <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      ) : null}
      <TextInput
        mode={mode}
        outlineStyle={inputStyles.outline}
        style={[inputStyles.base, style]}
        contentStyle={[inputStyles.content, contentStyle]}
        placeholder={placeholderText}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  label: { textAlign: 'right', marginBottom: 6, writingDirection: 'rtl', alignSelf: 'stretch' },
});
