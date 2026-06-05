import React from 'react';
import { StyleSheet } from 'react-native';
import { List, Switch, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '@/navigation/types';
import { useThemeStore } from '@/stores/themeStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const listTitleStyle = { textAlign: 'right' as const, writingDirection: 'rtl' as const };
const listDescStyle = { textAlign: 'right' as const, writingDirection: 'rtl' as const };

export function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const { isDark, toggle } = useThemeStore();

  return (
    <ScreenContainer>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16, textAlign: 'right', writingDirection: 'rtl' }}>
        تنظیمات عمومی اپلیکیشن
      </Text>
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
      </List.Section>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { direction: 'rtl' },
});
