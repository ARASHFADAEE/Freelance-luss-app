import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';
import { a11y } from '@/core/accessibility/labels';
import { SpeedDialFAB, type SpeedDialAction } from '@/shared/components/SpeedDialFAB';

export function GlobalSpeedDial() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const actions: SpeedDialAction[] = [
    {
      icon: 'account-plus',
      label: 'مشتری',
      accessibilityLabel: `${a11y.action.add} مشتری`,
      onPress: () => navigation.navigate('Clients', { screen: 'ClientForm', params: {} }),
    },
    {
      icon: 'briefcase-plus-outline',
      label: 'پروژه',
      accessibilityLabel: `${a11y.action.add} پروژه`,
      onPress: () => navigation.navigate('Projects', { screen: 'ProjectForm', params: {} }),
    },
    {
      icon: 'file-document-plus-outline',
      label: 'فاکتور',
      accessibilityLabel: `${a11y.action.add} فاکتور`,
      onPress: () => navigation.navigate('Invoices', { screen: 'InvoiceForm', params: {} }),
    },
    {
      icon: 'cash-plus',
      label: 'پرداخت',
      accessibilityLabel: `${a11y.action.add} پرداخت`,
      onPress: () => navigation.navigate('Projects', { screen: 'ProjectsList' }),
    },
    {
      icon: 'cash-minus',
      label: 'هزینه',
      accessibilityLabel: `${a11y.action.add} هزینه`,
      onPress: () => navigation.navigate('Financial', { screen: 'ExpenseForm', params: {} }),
    },
  ];

  return (
    <SpeedDialFAB
      actions={actions}
      bottomOffset={72}
      openAccessibilityLabel={a11y.action.openMenu}
      closeAccessibilityLabel={a11y.action.closeMenu}
    />
  );
}
