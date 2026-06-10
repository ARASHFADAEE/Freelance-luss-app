import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { a11y } from '@/core/accessibility/labels';
import { settingsRepository } from '@/database';
import { AppText } from './AppText';
import { radius, spacing } from '@/core/theme/tokens';
import { formatPersianNumber } from '@/core/utils/persian';

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
    icon: 'chart-bar' as const,
    title: 'گزارش و تحلیل',
    body: 'جریان نقد، مشتریان برتر و تفکیک هزینه‌ها را در بخش مالی ببینید.',
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
  const progress = (step + 1) / STEPS.length;

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
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View
          style={[styles.card, { backgroundColor: theme.colors.surface, width: width - spacing['2xl'] }]}
          accessibilityRole="alert"
          accessibilityLabel={`راهنمای شروع، ${current.title}`}
        >
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.outlineVariant }]}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.colors.primary }]}
            />
          </View>

          <AppText variant="caption" color="muted" align="center" style={styles.stepLabel}>
            مرحله {formatPersianNumber(step + 1)} از {formatPersianNumber(STEPS.length)}
          </AppText>

          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '14' }]}>
            <MaterialCommunityIcons name={current.icon} size={40} color={theme.colors.primary} />
          </View>

          <AppText variant="h2" align="center" style={styles.title}>
            {current.title}
          </AppText>
          <AppText variant="body" color="muted" align="center" style={styles.body}>
            {current.body}
          </AppText>

          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === step ? theme.colors.primary : theme.colors.outlineVariant,
                    width: i === step ? 20 : 8,
                  },
                ]}
                accessibilityElementsHidden
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              mode="text"
              onPress={handleSkip}
              accessibilityLabel={a11y.onboarding.skip}
            >
              رد کردن
            </Button>
            <Button
              mode="contained"
              onPress={handleNext}
              accessibilityLabel={isLast ? a11y.onboarding.finish : a11y.onboarding.next}
            >
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
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepLabel: { marginBottom: spacing.md },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { marginBottom: spacing.sm },
  body: { lineHeight: 24, marginBottom: spacing.xl, maxWidth: 300 },
  dots: {
    flexDirection: 'row-reverse',
    gap: spacing.xs + 2,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  dot: { height: 8, borderRadius: 4 },
  actions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.sm,
  },
});
