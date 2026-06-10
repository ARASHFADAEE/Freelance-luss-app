import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, type TextInputProps, useTheme } from 'react-native-paper';
import { spacing } from '@/core/theme/tokens';
import { inputStyles } from '@/shared/styles/input';
import { AppText } from './AppText';

interface Props extends TextInputProps {
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
}

export function FormTextInput({
  style,
  contentStyle,
  mode = 'outlined',
  label,
  placeholder,
  errorMessage,
  helperText,
  required,
  ...props
}: Props) {
  const theme = useTheme();
  const placeholderText = placeholder ?? (typeof label === 'string' ? label : undefined);
  const hasError = Boolean(errorMessage);
  const labelText = typeof label === 'string' ? (required ? `${label} *` : label) : undefined;

  return (
    <View style={styles.wrap}>
      {typeof label === 'string' ? (
        <AppText variant="bodyMedium" color="muted" style={styles.label}>
          {labelText}
        </AppText>
      ) : null}
      <TextInput
        mode={mode}
        outlineStyle={inputStyles.outline}
        style={[inputStyles.base, style]}
        contentStyle={[inputStyles.content, contentStyle]}
        placeholder={placeholderText}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        error={hasError}
        outlineColor={hasError ? theme.colors.error : undefined}
        activeOutlineColor={hasError ? theme.colors.error : undefined}
        accessibilityLabel={labelText}
        {...props}
      />
      {hasError ? (
        <AppText variant="caption" color="danger" style={styles.helper}>
          {errorMessage}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color="muted" style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: { marginBottom: spacing.xs + 2, alignSelf: 'stretch' },
  helper: { marginTop: spacing.xs, alignSelf: 'stretch' },
});
