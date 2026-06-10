import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
}

export function SelectPickerField({
  label,
  value,
  options,
  onChange,
  placeholder = 'برای انتخاب لمس کنید',
  required,
  errorMessage,
}: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const hasValue = !!value;

  return (
    <View style={styles.wrap}>
      <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label}{required ? ' *' : ''}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={hasValue ? `${label}، ${value}` : `${label}، انتخاب کنید`}
        style={[
          styles.trigger,
          {
            borderColor: errorMessage
              ? theme.colors.error
              : hasValue
                ? theme.colors.primary
                : theme.colors.outlineVariant,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <MaterialCommunityIcons name="chevron-down" size={22} color={theme.colors.onSurfaceVariant} />
        <View style={styles.body}>
          <Text
            variant="bodyLarge"
            style={{
              fontWeight: hasValue ? '600' : '500',
              textAlign: 'right',
              color: hasValue ? theme.colors.onSurface : theme.colors.primary,
            }}
          >
            {hasValue ? value : 'انتخاب کنید'}
          </Text>
          {!hasValue && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
              {placeholder}
            </Text>
          )}
        </View>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '14' }]}>
          <MaterialCommunityIcons name="format-list-bulleted" size={22} color={theme.colors.primary} />
        </View>
      </Pressable>
      {errorMessage ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error, textAlign: 'right', marginTop: 4 }}>
          {errorMessage}
        </Text>
      ) : null}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setOpen(false)}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </Pressable>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>{label}</Text>
          </View>
          <ScrollView>
            {options.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => { onChange(opt); setOpen(false); }}
                style={[
                  styles.option,
                  {
                    borderColor: theme.colors.outlineVariant,
                    backgroundColor: opt === value ? theme.colors.primary + '12' : theme.colors.surface,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={opt === value ? 'check-circle' : 'circle-outline'}
                  size={20}
                  color={opt === value ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text variant="bodyLarge" style={{ flex: 1, textAlign: 'right', fontWeight: opt === value ? '600' : '400' }}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { textAlign: 'right', marginBottom: 6, writingDirection: 'rtl' },
  trigger: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    borderStyle: 'dashed',
  },
  body: { flex: 1, gap: 2 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, padding: 16, paddingTop: 48 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  option: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
});
