import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { formatAmountDisplay, parseAmount } from '@/core/utils/amount';
import { inputStyles } from '@/shared/styles/input';

interface Props {
  label: string;
  value: number;
  onChangeValue: (amount: number) => void;
  suffix?: string;
  labelAlign?: 'right' | 'center';
  contentAlign?: 'right' | 'center';
}

export function CurrencyInput({
  label,
  value,
  onChangeValue,
  suffix = 'تومان',
  labelAlign = 'right',
  contentAlign = 'right',
}: Props) {
  const theme = useTheme();
  const display = value > 0 ? formatAmountDisplay(value) : '';

  return (
    <View style={styles.wrap}>
      <Text
        variant="labelLarge"
        style={[
          styles.label,
          { color: theme.colors.onSurfaceVariant },
          labelAlign === 'center' && styles.labelCenter,
        ]}
      >
        {label}
      </Text>
      <TextInput
        value={display}
        onChangeText={(text) => onChangeValue(parseAmount(text))}
        keyboardType="number-pad"
        mode="outlined"
        outlineStyle={inputStyles.outline}
        style={[inputStyles.base, styles.input]}
        contentStyle={[
          inputStyles.content,
          contentAlign === 'center' && styles.contentCenter,
        ]}
        right={suffix ? <TextInput.Affix text={suffix} /> : undefined}
        placeholder="۰"
        placeholderTextColor={theme.colors.onSurfaceVariant}
      />
      {value > 0 && labelAlign !== 'center' && (
        <Text variant="labelSmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          {formatAmountDisplay(value)} {suffix}
        </Text>
      )}
    </View>
  );
}

export function CurrencyInputControlled({
  label,
  value,
  onChangeText,
  suffix = 'تومان',
  labelAlign,
  contentAlign,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
  labelAlign?: 'right' | 'center';
  contentAlign?: 'right' | 'center';
}) {
  const num = parseAmount(value);
  return (
    <CurrencyInput
      label={label}
      value={num}
      onChangeValue={(n) => onChangeText(n > 0 ? String(n) : '')}
      suffix={suffix}
      labelAlign={labelAlign}
      contentAlign={contentAlign}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  label: { textAlign: 'right', marginBottom: 6, writingDirection: 'rtl', alignSelf: 'stretch' },
  labelCenter: { textAlign: 'center', alignSelf: 'center' },
  input: { width: '100%' },
  contentCenter: { textAlign: 'center' },
  hint: { textAlign: 'right', marginTop: 4, marginRight: 4, writingDirection: 'rtl' },
});
