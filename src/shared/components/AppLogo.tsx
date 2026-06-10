import React from 'react';
import { Image, Platform, StyleSheet, View, type ViewStyle } from 'react-native';

interface Props {
  size?: number;
  style?: ViewStyle;
}

export function AppLogo({ size = 96, style }: Props) {
  const borderRadius = size * 0.24;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      <Image
        source={require('@assets/icon.png')}
        style={{ width: size, height: size, borderRadius }}
        resizeMode="contain"
        accessibilityLabel="لوگوی فریلنس پلاس"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 12px 40px rgba(30, 58, 138, 0.35)' },
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
});
