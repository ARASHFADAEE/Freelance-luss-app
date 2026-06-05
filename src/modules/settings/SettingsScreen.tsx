import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, List, Switch, Text, useTheme } from 'react-native-paper';
import { confirmLogout } from '@/core/utils/confirm';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IS_API_CONFIGURED } from '@/core/config/env';
import type { MoreStackParamList } from '@/navigation/types';
import { useThemeStore } from '@/stores/themeStore';
import { useAuth } from '@/hooks/useAuth';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { StorageModeSettingsSection } from '@/modules/settings/StorageModeSettingsSection';

const listTitleStyle = { textAlign: 'right' as const, writingDirection: 'rtl' as const };
const listDescStyle = { textAlign: 'right' as const, writingDirection: 'rtl' as const };

export function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const { isDark, toggle } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    confirmLogout(() => logout());
  };

  return (
    <ScreenContainer>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16, textAlign: 'right', writingDirection: 'rtl' }}>
        تنظیمات عمومی اپلیکیشن
      </Text>
      <StorageModeSettingsSection />
      <List.Section style={styles.section}>
        <List.Item
          title="استایل فاکتور"
          description="قالب، رنگ و متن پاورقی"
          titleStyle={listTitleStyle}
          descriptionStyle={listDescStyle}
          right={() => <List.Icon icon="file-document-outline" />}
          onPress={() => navigation.navigate('InvoiceStyle')}
        />
        <List.Item
          title="حالت تاریک"
          description="فعال‌سازی تم تیره"
          titleStyle={listTitleStyle}
          descriptionStyle={listDescStyle}
          right={() => <List.Icon icon="theme-light-dark" />}
          left={() => <Switch value={isDark} onValueChange={toggle} />}
        />
        <List.Item
          title="زبان و جهت"
          description="راست به چپ (فارسی)"
          titleStyle={listTitleStyle}
          descriptionStyle={listDescStyle}
          right={() => <List.Icon icon="format-textdirection-rtl" />}
        />
        <List.Item
          title="نسخه اپلیکیشن"
          description="۱.۰.۰"
          titleStyle={listTitleStyle}
          descriptionStyle={listDescStyle}
          right={() => <List.Icon icon="information-outline" />}
        />
        {IS_API_CONFIGURED && isAuthenticated && (
          <List.Item
            title="حساب کاربری"
            description={user?.phone ?? '—'}
            titleStyle={listTitleStyle}
            descriptionStyle={listDescStyle}
            right={() => <List.Icon icon="account" />}
          />
        )}
      </List.Section>

      {isAuthenticated && (
        <Button mode="outlined" onPress={handleLogout} style={{ marginTop: 8 }}>
          خروج از حساب
        </Button>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { direction: 'rtl' },
});
