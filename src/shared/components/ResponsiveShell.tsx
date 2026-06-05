import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useResponsive } from '@/core/hooks/useResponsive';

export function ResponsiveShell({ children }: { children: React.ReactNode }) {
  const { isDesktop, contentMaxWidth } = useResponsive();

  if (Platform.OS !== 'web' || !isDesktop) {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, { maxWidth: contentMaxWidth }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    minHeight: '100vh' as unknown as number,
  },
  inner: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
});
