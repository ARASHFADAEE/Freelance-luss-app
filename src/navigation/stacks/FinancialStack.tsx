import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { FinancialStackParamList } from '../types';
import { createStackScreenOptions } from './createStackScreenOptions';
import { FinancialHubScreen } from '@/modules/financial/FinancialHubScreen';
import { ExpenseFormScreen } from '@/modules/expenses/ExpenseFormScreen';

const Stack = createNativeStackNavigator<FinancialStackParamList>();

export function FinancialStack() {
  const theme = useTheme();
  const options = createStackScreenOptions(theme);

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="FinancialHub" component={FinancialHubScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} options={{ title: 'هزینه' }} />
    </Stack.Navigator>
  );
}
