import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { IS_API_CONFIGURED } from '@/core/config/env';
import { FormTextInput } from '@/shared/components/FormTextInput';
import { AppLogo } from '@/shared/components/AppLogo';
import { useAuth } from '@/hooks/useAuth';
import type { AuthStackParamList } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthBackground } from '@/modules/auth/components/AuthBackground';
import { AuthGlassCard } from '@/modules/auth/components/AuthGlassCard';
import { AuthModeTabs, type AuthMode } from '@/modules/auth/components/AuthModeTabs';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { sendOtp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
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
    <AuthBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.center}>
          <AuthGlassCard style={styles.card}>
            <View style={styles.logoRow}>
              <AppLogo size={112} />
            </View>

            <AuthModeTabs mode={mode} onChange={setMode} />

            {!IS_API_CONFIGURED && (
              <View style={styles.warnBox}>
                <Text variant="bodySmall" style={styles.warnText}>
                  آدرس API تنظیم نشده است. فایل .env را بسازید.
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
              outlineColor="rgba(255, 255, 255, 0.35)"
              activeOutlineColor="#1e3a8a"
              textColor="#0f172a"
            />

            {error ? <Text variant="bodySmall" style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleContinue}
              loading={loading}
              disabled={!IS_API_CONFIGURED || !phone.trim()}
              buttonColor="#1e3a8a"
              textColor="#fff"
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {mode === 'login' ? 'دریافت کد ورود' : 'دریافت کد ثبت‌نام'}
            </Button>
          </AuthGlassCard>
        </View>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  warnBox: {
    backgroundColor: 'rgba(254, 243, 199, 0.85)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  warnText: { textAlign: 'center', lineHeight: 20, color: '#92400e' },
  input: { marginBottom: 12, backgroundColor: 'rgba(255, 255, 255, 0.55)' },
  error: { color: '#fecaca', textAlign: 'center', marginBottom: 8 },
  button: { borderRadius: 12 },
  buttonContent: { paddingVertical: 6 },
});
