import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { maskPhone, normalizeOtpCode } from '@/services/auth/OtpService';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { useAuth } from '@/hooks/useAuth';
import type { AuthStackParamList } from '@/navigation/types';

export function OtpScreen() {
  const route = useRoute<RouteProp<AuthStackParamList, 'Otp'>>();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { verifyOtp, sendOtp } = useAuth();
  const { phone, expiresIn, debugCode } = route.params;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(expiresIn);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      await verifyOtp(phone, code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'کد نامعتبر است');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setResendIn(res.expiresIn);
      navigation.setParams({ debugCode: res.debugCode, expiresIn: res.expiresIn });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ارسال مجدد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text variant="titleLarge" style={styles.title}>تأیید کد</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        کد ارسال‌شده به {maskPhone(phone)} را وارد کنید
      </Text>

      {__DEV__ && debugCode ? (
        <Text variant="labelMedium" style={styles.debug}>کد تست: {debugCode}</Text>
      ) : null}

      <FormTextInput
        label="کد تأیید"
        value={code}
        onChangeText={(v) => setCode(normalizeOtpCode(v))}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
      />

      {error ? <Text variant="bodySmall" style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleVerify}
        loading={loading}
        disabled={code.length < 5}
        style={{ marginBottom: 12 }}
      >
        تأیید و ورود
      </Button>

      <Button mode="text" onPress={handleResend} disabled={resendIn > 0 || loading}>
        {resendIn > 0 ? `ارسال مجدد (${resendIn})` : 'ارسال مجدد کد'}
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', textAlign: 'right', marginBottom: 8 },
  subtitle: { color: '#6b7280', textAlign: 'right', marginBottom: 20, lineHeight: 22 },
  debug: { color: '#1e3a8a', textAlign: 'center', marginBottom: 12 },
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  error: { color: '#ef4444', textAlign: 'right', marginBottom: 8 },
});
