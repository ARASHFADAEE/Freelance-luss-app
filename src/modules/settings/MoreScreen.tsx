import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { confirmLogout } from '@/core/utils/confirm';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { SettingsMenuGrid, type SettingsMenuItem } from '@/shared/components/SettingsMenuGrid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { TrialBanner } from '@/shared/components/TrialBanner';
import { AppText } from '@/shared/components/AppText';
import { spacing, radius } from '@/core/theme/tokens';

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

  const sections = useMemo(() => {
    const proBadge = (proOnly?: boolean) =>
      proOnly && !hasProFeatures() ? 'Pro' : undefined;

    const tools: SettingsMenuItem[] = [
      {
        id: 'services',
        title: 'خدمات',
        icon: 'briefcase-plus',
        onPress: () => navigation.navigate('Services'),
      },
      {
        id: 'calculator',
        title: 'محاسبه‌گر',
        icon: 'calculator',
        onPress: () => navigation.navigate('Calculator'),
      },
      {
        id: 'notifications',
        title: 'یادآوری‌ها',
        icon: 'bell-outline',
        onPress: () => navigation.navigate('Notifications'),
      },
      {
        id: 'backup',
        title: 'پشتیبان‌گیری',
        icon: 'backup-restore',
        onPress: () => navigation.navigate('Backup'),
        proOnly: true,
        badge: proBadge(true),
        locked: !hasProFeatures(),
      },
    ];

    const account: SettingsMenuItem[] = [
      {
        id: 'profile',
        title: 'پروفایل',
        icon: 'account-circle',
        onPress: () => navigation.navigate('Profile'),
      },
      {
        id: 'settings',
        title: 'تنظیمات',
        icon: 'cog',
        onPress: () => navigation.navigate('Settings'),
      },
    ];

    const billing: SettingsMenuItem[] = [
      {
        id: 'subscription',
        title: 'اشتراک Pro',
        icon: 'crown',
        onPress: () => navigation.navigate('Subscription'),
        badge: isPremium() && plan === 'pro' ? 'فعال' : undefined,
      },
    ];

    return [
      { title: 'مدیریت', items: tools },
      { title: 'حساب', items: account },
      { title: 'اشتراک', items: billing },
    ];
  }, [navigation, hasProFeatures, isPremium, plan]);

  const header = (
    <PageHeader title="بیشتر" topInset={insets.top + spacing.xs}>
      {isInTrial() ? (
        <TrialBanner
          daysRemaining={trialDaysRemaining()}
          onPress={() => navigation.navigate('Subscription')}
        />
      ) : null}
      {!isPremium() && !isInTrial() ? (
        <Pressable
          onPress={() => navigation.navigate('Subscription')}
          accessibilityRole="button"
          accessibilityLabel="دوره آزمایشی تمام شد، برای اشتراک Pro لمس کنید"
          style={[styles.proBanner, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary }]}
        >
          <MaterialCommunityIcons name="crown" size={22} color={theme.colors.primary} />
          <View style={styles.proBannerText}>
            <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
              دوره آزمایشی تمام شد
            </AppText>
            <AppText variant="caption" color="muted">
              برای گزارش‌ها و PDF اشتراک Pro بخرید
            </AppText>
          </View>
        </Pressable>
      ) : null}
    </PageHeader>
  );

  return (
    <ScreenContainer header={header} contentStyle={styles.content}>
      {isPremium() && plan === 'pro' ? (
        <View style={[styles.proActive, { backgroundColor: theme.custom.success + '12', borderColor: theme.custom.success }]}>
          <AppText variant="bodyMedium" style={{ fontWeight: '600', color: theme.custom.success }}>
            اشتراک Pro فعال
          </AppText>
        </View>
      ) : null}

      <SettingsMenuGrid sections={sections} />

      {user ? (
        <View style={[styles.accountFooter, { borderColor: theme.colors.outlineVariant }]}>
          <AppText variant="caption" color="muted">
            وارد شده با {user.phone}
          </AppText>
          <Button mode="outlined" icon="logout" onPress={handleLogout} style={styles.logoutBtn}>
            خروج از حساب
          </Button>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  proBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 44,
  },
  proBannerText: { flex: 1, alignItems: 'flex-end', gap: spacing.xs / 2 },
  proActive: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
  },
  accountFooter: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  logoutBtn: { marginTop: spacing.xs },
});
