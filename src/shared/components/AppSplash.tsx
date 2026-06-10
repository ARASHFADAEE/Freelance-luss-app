import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { APP_NAME } from '@/core/constants';
import { AppLogo } from '@/shared/components/AppLogo';

interface Props {
  message?: string;
}

export function AppSplash({ message = 'در حال آماده‌سازی...' }: Props) {
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const pulse = useSharedValue(1);
  const dotOffset = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.4)) });
    textOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    dotOffset.value = withRepeat(withTiming(1, { duration: 1400 }), -1, false);
  }, [dotOffset, logoOpacity, logoScale, pulse, textOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value * pulse.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: (1 - textOpacity.value) * 12 }],
  }));

  const dot1 = useAnimatedStyle(() => ({ opacity: 0.3 + dotOffset.value * 0.7 }));
  const dot2 = useAnimatedStyle(() => ({
    opacity: 0.3 + (1 - Math.abs(dotOffset.value - 0.5) * 2) * 0.7,
  }));
  const dot3 = useAnimatedStyle(() => ({ opacity: 0.3 + (1 - dotOffset.value) * 0.7 }));

  return (
    <View style={styles.container}>
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <AppLogo size={120} />
      </Animated.View>

      <Animated.View style={textStyle}>
        <Text variant="headlineSmall" style={styles.title}>{APP_NAME}</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>مدیریت مالی فریلنسرها</Text>
      </Animated.View>

      <View style={styles.dots}>
        <Animated.View style={[styles.dot, dot1]} />
        <Animated.View style={[styles.dot, dot2]} />
        <Animated.View style={[styles.dot, dot3]} />
      </View>

      <Animated.Text style={[styles.message, textStyle]}>{message}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1f4a',
    padding: 32,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        minHeight: '100vh' as unknown as number,
        backgroundImage:
          'radial-gradient(ellipse at 30% 15%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 85%, rgba(14, 165, 233, 0.3) 0%, transparent 45%), linear-gradient(160deg, #0b1f4a 0%, #1e3a8a 50%, #172554 100%)',
      },
      default: {},
    }),
  },
  bgGlowTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    top: '10%',
    right: '15%',
    ...Platform.select({
      web: { filter: 'blur(60px)' },
      default: {},
    }),
  },
  bgGlowBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    bottom: '12%',
    left: '10%',
    ...Platform.select({
      web: { filter: 'blur(50px)' },
      default: {},
    }),
  },
  logoWrap: {
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: '0 12px 40px rgba(30, 58, 138, 0.45)' },
      default: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  title: { fontWeight: '800', color: '#fff', marginBottom: 6, textAlign: 'center' },
  subtitle: { color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 36,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  message: { color: 'rgba(255, 255, 255, 0.55)', marginTop: 4, fontSize: 13 },
});
