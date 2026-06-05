import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { ProjectsStackParamList } from '../types';
import { createStackScreenOptions } from './createStackScreenOptions';
import { ProjectsScreen } from '@/modules/projects/ProjectsScreen';
import { ProjectFormScreen } from '@/modules/projects/ProjectFormScreen';
import { ProjectDetailScreen } from '@/modules/projects/ProjectDetailScreen';
import { PaymentFormScreen } from '@/modules/payments/PaymentFormScreen';

const Stack = createNativeStackNavigator<ProjectsStackParamList>();

export function ProjectsStack() {
  const theme = useTheme();
  const options = createStackScreenOptions(theme);

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="ProjectsList" component={ProjectsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProjectForm" component={ProjectFormScreen} options={{ title: 'پروژه' }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'جزئیات پروژه' }} />
      <Stack.Screen name="PaymentForm" component={PaymentFormScreen} options={{ title: 'ثبت پرداخت' }} />
    </Stack.Navigator>
  );
}
