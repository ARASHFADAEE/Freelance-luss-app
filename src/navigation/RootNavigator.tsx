import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/core/hooks/useResponsive';
import type { RootTabParamList } from './types';
import { DashboardScreen } from '@/modules/dashboard/DashboardScreen';
import { ClientsStack } from './stacks/ClientsStack';
import { ProjectsStack } from './stacks/ProjectsStack';
import { InvoicesStack } from './stacks/InvoicesStack';
import { ReportsScreen } from '@/modules/reports/ReportsScreen';
import { MoreStack } from './stacks/MoreStack';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const isWebDesktop = Platform.OS === 'web' && isDesktop;
  const tabHeight = (isWebDesktop ? 64 : 56) + (Platform.OS === 'ios' ? insets.bottom : 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          height: tabHeight,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : isWebDesktop ? 10 : 8,
          paddingTop: isWebDesktop ? 8 : 6,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
          elevation: 0,
          ...(isWebDesktop ? { maxWidth: 1000, alignSelf: 'center', width: '100%' } : {}),
        },
        tabBarLabelStyle: {
          fontFamily: 'IRANYekanX',
          fontWeight: '500',
          fontSize: isWebDesktop ? 12 : 10,
          marginBottom: 2,
        },
        tabBarItemStyle: isWebDesktop ? { paddingHorizontal: 4 } : undefined,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'داشبورد',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsStack}
        options={{
          tabBarLabel: 'مشتریان',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{
          tabBarLabel: 'پروژه‌ها',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoicesStack}
        options={{
          tabBarLabel: 'فاکتورها',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'گزارش‌ها',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarLabel: 'بیشتر',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dots-grid" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
