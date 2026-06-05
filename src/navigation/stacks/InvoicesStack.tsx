import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { InvoicesStackParamList } from '../types';
import { createStackScreenOptions } from './createStackScreenOptions';
import { InvoicesScreen } from '@/modules/invoices/InvoicesScreen';
import { InvoiceFormScreen } from '@/modules/invoices/InvoiceFormScreen';
import { InvoiceDetailScreen } from '@/modules/invoices/InvoiceDetailScreen';

const Stack = createNativeStackNavigator<InvoicesStackParamList>();

export function InvoicesStack() {
  const theme = useTheme();
  const options = createStackScreenOptions(theme);

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="InvoicesList" component={InvoicesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="InvoiceForm" component={InvoiceFormScreen} options={{ title: 'فاکتور' }} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: 'جزئیات فاکتور' }} />
    </Stack.Navigator>
  );
}
