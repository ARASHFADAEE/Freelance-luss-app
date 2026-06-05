import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Button, Menu, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuth } from '@/hooks/useAuth';
import { CURRENCY_LABELS } from '@/core/constants';
import type { Currency } from '@/core/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { confirmLogout } from '@/core/utils/confirm';

export function ProfileScreen() {
  const theme = useAppTheme();
  const profile = useProfileStore((s) => s.profile);
  const update = useProfileStore((s) => s.update);
  const { user, logout } = useAuth();
  const canUseMultiCurrency = useSubscriptionStore((s) => s.canUseMultiCurrency);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [taxRate, setTaxRate] = useState('9');
  const [currency, setCurrency] = useState<Currency>('TOMAN');
  const [logo, setLogo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName || user?.fullName || '');
    setPhone(profile.phone || user?.phone || '');
    setEmail(profile.email ?? '');
    setAddress(profile.address ?? '');
    setWebsite(profile.website ?? '');
    setTaxRate(String(profile.taxRate ?? 9));
    setCurrency(profile.currency ?? 'TOMAN');
    setLogo(profile.logo ?? null);
  }, [profile, user]);

  const handleLogout = () => {
    confirmLogout(() => logout());
  };

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLogo(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await update({
        fullName, phone, email, address, website,
        logo, taxRate: parseFloat(taxRate) || 9,
        currency: canUseMultiCurrency() ? currency : 'TOMAN',
      });
      Alert.alert('موفق', 'پروفایل ذخیره شد');
    } catch {
      Alert.alert('خطا', 'خطا در ذخیره پروفایل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      {user ? (
        <View style={[styles.accountBox, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '40' }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>حساب متصل</Text>
          <Text variant="titleMedium" style={{ fontWeight: '700', textAlign: 'right' }}>{user.phone}</Text>
          {user.fullName ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>{user.fullName}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.logoSection}>
        {logo ? <Image source={{ uri: logo }} style={styles.logo} /> : <View style={styles.logoPlaceholder} />}
        <Button mode="outlined" onPress={pickLogo}>انتخاب لوگو</Button>
      </View>

      <FormTextInput label="نام و نام خانوادگی" value={fullName} onChangeText={setFullName} style={styles.input} />
      <FormTextInput label="شماره تماس" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
      <FormTextInput label="ایمیل" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <FormTextInput label="آدرس" value={address} onChangeText={setAddress} style={styles.input} />
      <FormTextInput label="وب‌سایت" value={website} onChangeText={setWebsite} autoCapitalize="none" style={styles.input} />
      <FormTextInput label="نرخ مالیات (%)" value={taxRate} onChangeText={setTaxRate} keyboardType="numeric" style={styles.input} />

      {canUseMultiCurrency() ? (
        <Menu visible={currencyMenuVisible} onDismiss={() => setCurrencyMenuVisible(false)} anchor={
          <Button mode="outlined" onPress={() => setCurrencyMenuVisible(true)} style={styles.menuBtn}>
            واحد پول: {CURRENCY_LABELS[currency]}
          </Button>
        }>
          {(Object.keys(CURRENCY_LABELS) as Currency[]).map((c) => (
            <Menu.Item key={c} title={CURRENCY_LABELS[c]} onPress={() => { setCurrency(c); setCurrencyMenuVisible(false); }} />
          ))}
        </Menu>
      ) : null}

      <Button mode="contained" onPress={handleSave} loading={saving} style={{ marginTop: 16 }}>
        ذخیره پروفایل
      </Button>

      <Button mode="outlined" onPress={handleLogout} icon="logout" style={{ marginTop: 12 }} textColor={theme.custom.danger}>
        خروج از حساب
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  accountBox: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16, gap: 4 },
  logoSection: { alignItems: 'center', marginBottom: 20, gap: 12 },
  logo: { width: 100, height: 100, borderRadius: 50 },
  logoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e5e7eb' },
  input: { marginBottom: 8 },
  menuBtn: { alignSelf: 'stretch', marginBottom: 8 },
});
