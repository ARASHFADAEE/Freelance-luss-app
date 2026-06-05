import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { MoreStackParamList } from '../types';
import { createStackScreenOptions } from './createStackScreenOptions';
import { MoreScreen } from '@/modules/settings/MoreScreen';
import { ExpensesScreen } from '@/modules/expenses/ExpensesScreen';
import { ExpenseFormScreen } from '@/modules/expenses/ExpenseFormScreen';
import { ServicesScreen } from '@/modules/services/ServicesScreen';
import { ServiceFormScreen } from '@/modules/services/ServiceFormScreen';
import { ReportsScreen } from '@/modules/reports/ReportsScreen';
import { CalculatorScreen } from '@/modules/projects/CalculatorScreen';
import { NotificationsScreen } from '@/modules/notifications/NotificationsScreen';
import { BackupScreen } from '@/modules/backup/BackupScreen';
import { ProfileScreen } from '@/modules/settings/ProfileScreen';
import { SettingsScreen } from '@/modules/settings/SettingsScreen';
import { InvoiceStyleScreen } from '@/modules/settings/InvoiceStyleScreen';
import { SubscriptionScreen } from '@/modules/subscription/SubscriptionScreen';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export function MoreStack() {
  const theme = useTheme();
  const options = createStackScreenOptions(theme);

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'هزینه‌ها' }} />
      <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} options={{ title: 'هزینه' }} />
      <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'خدمات' }} />
      <Stack.Screen name="ServiceForm" component={ServiceFormScreen} options={{ title: 'خدمت' }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'گزارش‌ها' }} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} options={{ title: 'محاسبه‌گر' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'یادآوری‌ها' }} />
      <Stack.Screen name="Backup" component={BackupScreen} options={{ title: 'پشتیبان‌گیری' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'پروفایل' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'تنظیمات' }} />
      <Stack.Screen name="InvoiceStyle" component={InvoiceStyleScreen} options={{ title: 'استایل فاکتور' }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'اشتراک Pro' }} />
    </Stack.Navigator>
  );
}
