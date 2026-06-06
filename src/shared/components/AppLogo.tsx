import React from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

interface Props {
  size?: number;
  style?: ViewStyle;
}

export function AppLogo({ size = 80, style }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.28 }, style]}>
      <Image
        source={require('../../../assets/splash-icon.png')}
        style={{ width: size * 0.72, height: size * 0.72 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
