import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { formatCurrency } from '@/core/utils/currency';
import { formatAmountDisplay } from '@/core/utils/amount';
import { useProfileStore } from '@/stores/profileStore';
import { useAppTheme } from '@/core/theme/useAppTheme';

export function CalculatorScreen() {
  const theme = useAppTheme();
  const currency = useProfileStore((s) => s.profile?.currency ?? 'TOMAN');

  const [designHours, setDesignHours] = useState(0);
  const [frontendHours, setFrontendHours] = useState(0);
  const [backendHours, setBackendHours] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(500_000);
  const [expensePercent, setExpensePercent] = useState(20);

  const totalHours = designHours + frontendHours + backendHours;
  const suggestedPrice = totalHours * hourlyRate;
  const estimatedProfit = Math.round(suggestedPrice * (1 - expensePercent / 100));

  const rows = useMemo(() => [
    { label: 'طراحی', value: designHours, set: setDesignHours },
    { label: 'فرانت‌اند', value: frontendHours, set: setFrontendHours },
    { label: 'بک‌اند', value: backendHours, set: setBackendHours },
  ], [designHours, frontendHours, backendHours]);

  return (
    <ScreenContainer>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginBottom: 20 }}>
        ساعات کاری را وارد کنید تا قیمت پیشنهادی محاسبه شود.
      </Text>

      {rows.map((row) => (
        <View key={row.label} style={[styles.hourRow, { borderColor: theme.colors.outlineVariant }]}>
          <TextInput
            value={row.value > 0 ? String(row.value) : ''}
            onChangeText={(t) => row.set(parseInt(t.replace(/\D/g, ''), 10) || 0)}
            keyboardType="numeric"
            mode="outlined"
            style={styles.hourInput}
            placeholder="۰"
          />
          <Text variant="bodyLarge" style={{ flex: 1, textAlign: 'right' }}>{row.label}</Text>
        </View>
      ))}

      <CurrencyInput label="نرخ ساعتی" value={hourlyRate} onChangeValue={setHourlyRate} />

      <View style={[styles.hourRow, { borderColor: theme.colors.outlineVariant }]}>
        <TextInput
          value={String(expensePercent)}
          onChangeText={(t) => setExpensePercent(Math.min(100, parseInt(t.replace(/\D/g, ''), 10) || 0))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.hourInput}
          left={<TextInput.Affix text="٪" />}
        />
        <Text variant="bodyLarge" style={{ flex: 1, textAlign: 'right' }}>درصد هزینه</Text>
      </View>

      <View style={[styles.result, { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary + '30' }]}>
        <View style={styles.resultRow}>
          <Text variant="bodyMedium">{formatAmountDisplay(totalHours)} ساعت</Text>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>مجموع ساعات</Text>
        </View>
        <View style={styles.resultRow}>
          <Text variant="titleLarge" style={{ fontWeight: '700', color: theme.colors.primary }}>
            {formatCurrency(suggestedPrice, currency)}
          </Text>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>قیمت پیشنهادی</Text>
        </View>
        <View style={styles.resultRow}>
          <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.custom.success }}>
            {formatCurrency(estimatedProfit, currency)}
          </Text>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>سود تخمینی</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hourRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 10 },
  hourInput: { width: 100, backgroundColor: 'transparent', textAlign: 'center' },
  result: { borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 16, gap: 14 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
