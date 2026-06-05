import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAppTheme } from '@/core/theme/useAppTheme';

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
  const { plan, upgradeToPro } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');

  const handleQuickUpgrade = async () => {
    setLoading(true);
    try {
      await upgradeToPro();
      setSnack('Pro فعال شد!');
    } catch {
      setSnack('خطا در فعال‌سازی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={{ paddingTop: insets.top + 4 }}>
        <Text variant="titleLarge" style={styles.title}>بیشتر</Text>

        {plan === 'free' && (
          <Pressable onPress={handleQuickUpgrade} disabled={loading} style={[styles.proBanner, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="crown" size={24} color={theme.colors.primary} />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{loading ? 'در حال فعال‌سازی...' : 'ارتقا به Pro'}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>نامحدود + PDF + گزارش</Text>
            </View>
          </Pressable>
        )}

        {MENU_ITEMS.map((item) => (
          <Pressable key={item.title} onPress={() => navigation.navigate(item.route as 'Expenses')}>
            <View style={[styles.menuRow, { borderColor: theme.colors.outlineVariant }]}>
              <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.onSurfaceVariant} />
              <View style={styles.menuInfo}>
                <Text variant="bodyLarge">{item.title}</Text>
                {item.proOnly && plan === 'free' && (
                  <Text variant="labelSmall" style={{ color: theme.colors.primary }}>Pro</Text>
                )}
              </View>
              <MaterialCommunityIcons name={item.icon} size={22} color={theme.colors.onSurfaceVariant} />
            </View>
          </Pressable>
        ))}
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')}>{snack}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 16, textAlign: 'right' },
  proBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 14 },
  menuInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
});
