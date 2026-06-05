import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { confirmLogout } from '@/core/utils/confirm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { TrialBanner } from '@/shared/components/TrialBanner';

const MENU_ITEMS: { title: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; route: keyof MoreStackParamList; proOnly?: boolean }[] = [
  { title: 'هزینه‌ها', icon: 'cash-minus', route: 'Expenses' },
  { title: 'خدمات', icon: 'briefcase-plus', route: 'Services' },
  { title: 'محاسبه‌گر', icon: 'calculator', route: 'Calculator' },
  { title: 'یادآوری‌ها', icon: 'bell-outline', route: 'Notifications' },
  { title: 'پشتیبان‌گیری', icon: 'backup-restore', route: 'Backup', proOnly: true },
  { title: 'پروفایل', icon: 'account-circle', route: 'Profile' },
  { title: 'تنظیمات', icon: 'cog', route: 'Settings' },
  { title: 'اشتراک Pro', icon: 'crown', route: 'Subscription' },
];

export function MoreScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const plan = useSubscriptionStore((s) => s.plan);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const isInTrial = useSubscriptionStore((s) => s.isInTrial);
  const hasProFeatures = useSubscriptionStore((s) => s.hasProFeatures);
  const trialDaysRemaining = useSubscriptionStore((s) => s.getTrialDaysRemaining);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    confirmLogout(() => logout());
  };

  return (
    <ScreenContainer>
      <View style={{ paddingTop: insets.top + 4 }}>
        <Text variant="titleLarge" style={styles.title}>بیشتر</Text>

        {isInTrial() && (
          <TrialBanner
            daysRemaining={trialDaysRemaining()}
            onPress={() => navigation.navigate('Subscription')}
          />
        )}

        {!isPremium() && !isInTrial() && (
          <Pressable
            onPress={() => navigation.navigate('Subscription')}
            style={[styles.proBanner, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary }]}
          >
            <MaterialCommunityIcons name="crown" size={24} color={theme.colors.primary} />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text variant="bodyLarge" style={{ fontWeight: '600' }}>دوره آزمایشی تمام شد</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>برای گزارش‌ها و PDF اشتراک Pro بخرید</Text>
            </View>
          </Pressable>
        )}

        {isPremium() && plan === 'pro' && (
          <View style={[styles.proActive, { backgroundColor: theme.custom.success + '12', borderColor: theme.custom.success }]}>
            <MaterialCommunityIcons name="crown" size={22} color={theme.custom.success} />
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>اشتراک Pro فعال</Text>
          </View>
        )}

        {MENU_ITEMS.map((item) => (
          <Pressable key={item.title} onPress={() => navigation.navigate(item.route as 'Expenses')}>
            <View style={[styles.menuRow, { borderColor: theme.colors.outlineVariant }]}>
              <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.onSurfaceVariant} />
              <View style={styles.menuInfo}>
                <Text variant="bodyLarge">{item.title}</Text>
                {item.proOnly && !hasProFeatures() && (
                  <Text variant="labelSmall" style={{ color: theme.colors.primary }}>Pro</Text>
                )}
              </View>
              <MaterialCommunityIcons name={item.icon} size={22} color={theme.colors.onSurfaceVariant} />
            </View>
          </Pressable>
        ))}
      </View>

      {user ? (
        <View style={[styles.accountFooter, { borderColor: theme.colors.outlineVariant }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
            وارد شده با {user.phone}
          </Text>
          <Button mode="outlined" icon="logout" onPress={handleLogout} style={{ marginTop: 8 }}>
            خروج از حساب
          </Button>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 16, textAlign: 'right' },
  proBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 },
  proActive: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 14 },
  menuInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  accountFooter: { marginTop: 24, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
