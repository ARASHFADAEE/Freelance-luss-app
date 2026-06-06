import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AuthGlassCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        boxShadow: '0 18px 48px rgba(0, 0, 0, 0.22)',
      },
      default: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 8,
      },
    }),
  },
});
