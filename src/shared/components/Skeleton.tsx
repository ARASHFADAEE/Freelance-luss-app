import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';
import { radius, spacing } from '@/core/theme/tokens';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radius.sm, style }: Props) {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.65, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: theme.colors.onSurfaceVariant,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton height={14} width="55%" />
      <Skeleton height={28} width="75%" style={{ marginTop: spacing.sm }} />
    </View>
  );
}

interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
}

export function SkeletonList({ count = 5, itemHeight = 72 }: SkeletonListProps) {
  return (
    <View style={skeletonStyles.list}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          height={itemHeight}
          borderRadius={radius.md}
          style={{ marginBottom: spacing.sm }}
        />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.xs,
    flex: 1,
    minWidth: '45%',
  },
  list: {
    paddingTop: spacing.sm,
  },
});
