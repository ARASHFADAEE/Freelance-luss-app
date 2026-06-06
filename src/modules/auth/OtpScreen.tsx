import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { maskPhone, normalizeOtpCode } from '@/services/auth/OtpService';
import { IS_PRODUCTION } from '@/core/config/env';
import { OtpCodeInput } from '@/shared/components/OtpCodeInput';
import { AppLogo } from '@/shared/components/AppLogo';
import { useAuth } from '@/hooks/useAuth';
import type { AuthStackParamList } from '@/navigation/types';
import { AuthBackground } from '@/modules/auth/components/AuthBackground';
import { AuthGlassCard } from '@/modules/auth/components/AuthGlassCard';

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
    setCode('');
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
    <AuthBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.center}>
          <AuthGlassCard style={styles.card}>
            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={12}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
            </Pressable>

            <View style={styles.logoRow}>
              <AppLogo size={64} />
            </View>

            <Text variant="titleMedium" style={styles.phoneText}>
              کد ارسال‌شده به {maskPhone(phone)}
            </Text>

            {!IS_PRODUCTION && debugCode ? (
              <Text variant="labelMedium" style={styles.debug}>کد تست: {debugCode}</Text>
            ) : null}

            <OtpCodeInput
              value={code}
              onChange={(v) => setCode(normalizeOtpCode(v))}
              error={!!error}
            />

            {error ? <Text variant="bodySmall" style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleVerify}
              loading={loading}
              disabled={code.length < 6}
              buttonColor="#1e3a8a"
              textColor="#fff"
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              تأیید
            </Button>

            <Button
              mode="text"
              onPress={handleResend}
              disabled={resendIn > 0 || loading}
              textColor="rgba(255, 255, 255, 0.85)"
            >
              {resendIn > 0 ? `ارسال مجدد (${resendIn})` : 'ارسال مجدد کد'}
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
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  phoneText: {
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  debug: { color: '#bfdbfe', textAlign: 'center', marginBottom: 12 },
  error: { color: '#fecaca', textAlign: 'center', marginBottom: 8 },
  button: { borderRadius: 12, marginBottom: 4 },
  buttonContent: { paddingVertical: 6 },
});
