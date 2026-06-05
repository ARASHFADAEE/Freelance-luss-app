import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { ClientsStackParamList } from '../types';
import { createStackScreenOptions } from './createStackScreenOptions';
import { ClientsScreen } from '@/modules/clients/ClientsScreen';
import { ClientFormScreen } from '@/modules/clients/ClientFormScreen';
import { ClientDetailScreen } from '@/modules/clients/ClientDetailScreen';

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export function ClientsStack() {
  const theme = useTheme();
  const options = createStackScreenOptions(theme);

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="ClientsList" component={ClientsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientForm" component={ClientFormScreen} options={{ title: 'مشتری' }} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'جزئیات مشتری' }} />
    </Stack.Navigator>
  );
}
