import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useResponsive } from '@/core/hooks/useResponsive';
import { analyticsQueryKeys, liveAnalyticsQueryOptions } from '@/core/query/analyticsQueries';
import { analyticsRepository } from '@/database';
import { toPersianDigits } from '@/core/utils/persian';
import type { RootTabParamList } from './types';
import { DashboardScreen } from '@/modules/dashboard/DashboardScreen';
import { ClientsStack } from './stacks/ClientsStack';
import { ProjectsStack } from './stacks/ProjectsStack';
import { InvoicesStack } from './stacks/InvoicesStack';
import { FinancialStack } from './stacks/FinancialStack';
import { MoreStack } from './stacks/MoreStack';
import { GlobalSpeedDial } from './GlobalSpeedDial';
import { a11y } from '@/core/accessibility/labels';

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const isWebDesktop = Platform.OS === 'web' && isDesktop;
  const tabHeight = (isWebDesktop ? 64 : 56) + (Platform.OS === 'ios' ? insets.bottom : 8);

  const { data: stats } = useQuery({
    queryKey: analyticsQueryKeys.dashboardStats,
    queryFn: () => analyticsRepository.getDashboardStats(),
    ...liveAnalyticsQueryOptions,
  });

  const unpaidBadge =
    stats && stats.unpaidInvoices > 0
      ? stats.unpaidInvoices > 9
        ? toPersianDigits('9+')
        : toPersianDigits(String(stats.unpaidInvoices))
      : undefined;

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
          fontSize: isWebDesktop ? 12 : 11,
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
          tabBarAccessibilityLabel: a11y.tab.dashboard,
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
          tabBarAccessibilityLabel: a11y.tab.clients,
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
          tabBarAccessibilityLabel: a11y.tab.projects,
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
          tabBarAccessibilityLabel: a11y.tab.invoices,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />
          ),
          tabBarBadge: unpaidBadge,
          tabBarBadgeStyle: { fontFamily: 'IRANYekanX', fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="Financial"
        component={FinancialStack}
        options={{
          tabBarLabel: 'مالی',
          tabBarAccessibilityLabel: a11y.tab.financial,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="finance" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarLabel: 'بیشتر',
          tabBarAccessibilityLabel: a11y.tab.more,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dots-grid" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <View style={styles.root}>
      <TabNavigator />
      <GlobalSpeedDial />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
