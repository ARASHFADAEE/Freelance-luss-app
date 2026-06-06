import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function FloatingOrb({
  size,
  color,
  top,
  left,
  duration,
  offsetX,
  offsetY,
}: {
  size: number;
  color: string;
  top: `${number}%` | number;
  left: `${number}%` | number;
  duration: number;
  offsetX: number;
  offsetY: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [duration, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * offsetX },
      { translateY: progress.value * offsetY },
      { scale: 0.92 + progress.value * 0.16 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
        },
        style,
      ]}
    />
  );
}

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <View style={styles.gradientBase} />
      <FloatingOrb size={280} color="rgba(59, 130, 246, 0.35)" top="8%" left="55%" duration={7000} offsetX={-40} offsetY={30} />
      <FloatingOrb size={220} color="rgba(99, 102, 241, 0.3)" top="52%" left="8%" duration={9000} offsetX={35} offsetY={-25} />
      <FloatingOrb size={180} color="rgba(14, 165, 233, 0.28)" top="68%" left="62%" duration={8000} offsetX={-30} offsetY={-35} />
      <FloatingOrb size={140} color="rgba(30, 58, 138, 0.4)" top="28%" left="18%" duration={6000} offsetX={25} offsetY={20} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0b1f4a',
    ...Platform.select({
      web: { minHeight: '100vh' as unknown as number },
      default: {},
    }),
  },
  gradientBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0b1f4a',
    ...Platform.select({
      web: {
        backgroundImage:
          'radial-gradient(ellipse at 20% 20%, rgba(37, 99, 235, 0.45) 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(14, 165, 233, 0.35) 0%, transparent 50%), linear-gradient(160deg, #0b1f4a 0%, #1e3a8a 45%, #172554 100%)',
      },
      default: {},
    }),
  },
  orb: {
    position: 'absolute',
    opacity: 0.9,
    ...Platform.select({
      web: { filter: 'blur(40px)' },
      default: {},
    }),
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
