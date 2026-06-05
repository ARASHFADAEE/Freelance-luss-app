import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import DateTimePicker from 'react-native-ui-datepicker';
import { formatJalaliDate, todayISO } from '@/core/utils/persian';
import { isoToLocalDate, pickerDateToISO } from '@/core/utils/date';
import { FONT_FAMILY } from '@/core/theme/fonts';

interface Props {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
}

export function JalaliDateField({ label, value, onChange }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(value || todayISO());
  const display = value ? formatJalaliDate(value) : 'انتخاب تاریخ';
  const primary = theme.colors.primary;

  const openPicker = () => {
    setPending(value || todayISO());
    setOpen(true);
  };

  const confirm = () => {
    onChange(pending);
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <Pressable
        onPress={openPicker}
        style={[styles.field, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}
      >
        <Text variant="bodyLarge" style={{ color: value ? theme.colors.onSurface : theme.colors.onSurfaceVariant, textAlign: 'right' }}>
          {display}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <Text variant="titleMedium" style={styles.sheetTitle}>{label}</Text>
            {pending ? (
              <Text variant="bodySmall" style={[styles.pendingHint, { color: theme.colors.onSurfaceVariant }]}>
                انتخاب شده: {formatJalaliDate(pending)}
              </Text>
            ) : null}
            <DateTimePicker
              mode="single"
              calendar="jalali"
              locale="fa"
              numerals="arabext"
              date={isoToLocalDate(pending)}
              onChange={({ date }) => {
                const iso = pickerDateToISO(date);
                if (iso) setPending(iso);
              }}
              styles={{
                day_label: { fontFamily: FONT_FAMILY },
                month_label: { fontFamily: FONT_FAMILY, fontWeight: '500' },
                year_label: { fontFamily: FONT_FAMILY, fontWeight: '500' },
                weekday_label: { fontFamily: FONT_FAMILY },
                selected: {
                  backgroundColor: primary,
                  borderRadius: 10,
                },
                selected_label: {
                  color: '#ffffff',
                  fontWeight: '700',
                  fontFamily: FONT_FAMILY,
                },
                today: {
                  borderWidth: 1,
                  borderColor: primary,
                  borderRadius: 10,
                },
                today_label: {
                  color: primary,
                  fontWeight: '600',
                },
                day_cell: {
                  borderRadius: 10,
                },
              }}
            />
            <View style={styles.actions}>
              <Button mode="text" onPress={() => { setPending(todayISO()); }}>امروز</Button>
              <Button mode="contained" onPress={confirm}>تأیید تاریخ</Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { textAlign: 'right', marginBottom: 6, writingDirection: 'rtl' },
  field: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: { borderRadius: 16, padding: 16 },
  sheetTitle: { textAlign: 'right', fontWeight: '600', marginBottom: 4, writingDirection: 'rtl' },
  pendingHint: { textAlign: 'right', marginBottom: 10, writingDirection: 'rtl' },
  actions: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 12, gap: 8 },
});
