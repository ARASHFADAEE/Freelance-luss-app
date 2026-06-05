import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { settingsRepository } from '@/database';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    icon: 'view-dashboard-outline' as const,
    title: 'به فریلنس پلاس خوش آمدید',
    body: 'ابزار مدیریت مالی فریلنسری شما. درآمد، هزینه و پروژه‌ها را یکجا ببینید.',
  },
  {
    icon: 'account-group-outline' as const,
    title: 'مشتری و پروژه',
    body: 'اول کارفرما اضافه کنید، بعد پروژه بسازید و پرداخت‌ها را قسط‌به‌قسط ثبت کنید.',
  },
  {
    icon: 'file-document-outline' as const,
    title: 'فاکتور حرفه‌ای',
    body: 'فاکتور با تقویم شمسی صادر کنید، به PDF تبدیل کنید و برای مشتری بفرستید.',
  },
  {
    icon: 'calculator-variant-outline' as const,
    title: 'محاسبه و گزارش',
    body: 'از محاسبه‌گر قیمت‌گذاری استفاده کنید و سود واقعی خود را در داشبورد ببینید.',
  },
];

interface Props {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingOverlay({ visible, onComplete }: Props) {
  const theme = useAppTheme();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await settingsRepository.update({ onboardingCompleted: true });
      onComplete();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSkip = async () => {
    await settingsRepository.update({ onboardingCompleted: true });
    onComplete();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, width: width - 40 }]}>
          <MaterialCommunityIcons name={current.icon} size={48} color={theme.colors.primary} style={styles.icon} />
          <Text variant="headlineSmall" style={styles.title}>{current.title}</Text>
          <Text variant="bodyMedium" style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
            {current.body}
          </Text>

          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === step ? theme.colors.primary : theme.colors.outlineVariant },
                ]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Button mode="text" onPress={handleSkip}>رد کردن</Button>
            <Button mode="contained" onPress={handleNext}>
              {isLast ? 'شروع کنید' : 'بعدی'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: { borderRadius: 20, padding: 28, alignItems: 'center' },
  icon: { marginBottom: 16 },
  title: { fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  body: { textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
});
