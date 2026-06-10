import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Client } from '@/core/types';
import { SearchBar } from './SearchBar';
import { a11y } from '@/core/accessibility/labels';

interface Props {
  label?: string;
  clients: Client[];
  value: string;
  onChange: (clientId: string) => void;
  required?: boolean;
  errorMessage?: string;
}

export function ClientPickerField({ label = 'مشتری', clients, value, onChange, required, errorMessage }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = clients.find((c) => c.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [clients, query]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={styles.wrap}>
      <Text variant="labelLarge" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
        {label}{required ? ' *' : ''}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={
          selected
            ? `${label}، ${selected.fullName}${selected.companyName ? `، ${selected.companyName}` : ''}`
            : `${label}، ${a11y.action.selectClient}`
        }
        style={[
          styles.trigger,
          {
            borderColor: errorMessage
              ? theme.colors.error
              : selected
                ? theme.colors.primary
                : theme.colors.outlineVariant,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <MaterialCommunityIcons name="chevron-down" size={22} color={theme.colors.onSurfaceVariant} />
        <View style={styles.triggerBody}>
          {selected ? (
            <>
              <Text variant="bodyLarge" style={{ fontWeight: '600', textAlign: 'right' }}>{selected.fullName}</Text>
              {selected.companyName ? (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
                  {selected.companyName}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text variant="bodyLarge" style={{ fontWeight: '600', textAlign: 'right', color: theme.colors.primary }}>
                انتخاب مشتری
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
                برای انتخاب یا جستجو، اینجا بزنید
              </Text>
            </>
          )}
        </View>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '14' }]}>
          <MaterialCommunityIcons name="account-search" size={24} color={theme.colors.primary} />
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
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>انتخاب مشتری</Text>
            <Button mode="text" onPress={() => setOpen(false)}>بستن</Button>
          </View>
          <SearchBar value={query} onChangeText={setQuery} placeholder="جستجوی نام، شرکت یا تلفن..." />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginTop: 24 }}>
                مشتری‌ای یافت نشد
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => pick(item.id)}
                style={[
                  styles.clientRow,
                  {
                    borderColor: theme.colors.outlineVariant,
                    backgroundColor: item.id === value ? theme.colors.primary + '10' : theme.colors.surface,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.id === value ? 'check-circle' : 'account-outline'}
                  size={22}
                  color={item.id === value ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{item.fullName}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {[item.companyName, item.phone].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  fieldLabel: { textAlign: 'right', marginBottom: 6, writingDirection: 'rtl' },
  trigger: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    borderStyle: 'dashed',
  },
  triggerBody: { flex: 1, gap: 2 },
  iconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, padding: 16, paddingTop: 48 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clientRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
});
