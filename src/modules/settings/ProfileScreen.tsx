import React, { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Button, Menu } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { CURRENCY_LABELS } from '@/core/constants';
import type { Currency } from '@/core/types';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FormTextInput } from '@/shared/components/FormTextInput';

export function ProfileScreen() {
  const profile = useProfileStore((s) => s.profile);
  const update = useProfileStore((s) => s.update);
  const canUseMultiCurrency = useSubscriptionStore((s) => s.canUseMultiCurrency);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [website, setWebsite] = useState(profile?.website ?? '');
  const [taxRate, setTaxRate] = useState(String(profile?.taxRate ?? 9));
  const [currency, setCurrency] = useState<Currency>(profile?.currency ?? 'TOMAN');
  const [logo, setLogo] = useState(profile?.logo ?? null);
  const [saving, setSaving] = useState(false);

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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoSection: { alignItems: 'center', marginBottom: 20, gap: 12 },
  logo: { width: 100, height: 100, borderRadius: 50 },
  logoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e5e7eb' },
  input: { marginBottom: 8 },
  menuBtn: { alignSelf: 'stretch', marginBottom: 8 },
});
