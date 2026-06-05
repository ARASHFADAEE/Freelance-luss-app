import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { IS_API_CONFIGURED } from '@/core/config/env';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { useAuth } from '@/hooks/useAuth';
import type { AuthStackParamList } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      navigation.navigate('Otp', { phone, expiresIn: res.expiresIn, debugCode: res.debugCode });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ارسال کد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <MaterialCommunityIcons name="shield-account" size={56} color="#1e3a8a" />
        <Text variant="headlineSmall" style={styles.title}>ورود به فریلنس پلاس</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          برای استفاده از اپ، با شماره موبایل وارد شوید یا ثبت‌نام کنید.
          {'\n'}۳ روز اول تمام امکانات Pro رایگان است.
        </Text>
      </View>

      {!IS_API_CONFIGURED && (
        <View style={styles.warnBox}>
          <Text variant="bodySmall" style={{ textAlign: 'right', lineHeight: 22 }}>
            آدرس API تنظیم نشده است.{'\n'}
            فایل <Text style={{ fontWeight: '700' }}>.env</Text> را بسازید و مقدار{' '}
            <Text style={{ fontWeight: '700' }}>EXPO_PUBLIC_API_URL</Text> را قرار دهید.
          </Text>
        </View>
      )}

      <FormTextInput
        label="شماره موبایل"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="09121234567"
        style={styles.input}
      />

      {error ? <Text variant="bodySmall" style={styles.error}>{error}</Text> : null}

      <Button mode="contained" onPress={handleContinue} loading={loading} disabled={!IS_API_CONFIGURED || !phone.trim()}>
        دریافت کد تأیید
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 10, marginBottom: 28 },
  title: { fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#6b7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  warnBox: { backgroundColor: '#fef3c7', borderRadius: 10, padding: 12, marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  error: { color: '#ef4444', textAlign: 'right', marginBottom: 8 },
});
