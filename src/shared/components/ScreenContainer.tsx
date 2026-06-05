import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { rtlLayoutStyle } from '@/core/theme/rtlLayout';

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  padded?: boolean;
}

export function ScreenContainer({ children, scrollable = true, style, padded = true }: Props) {
  const theme = useTheme();

  const content = (
    <View style={[padded && styles.padded, rtlLayoutStyle, style]}>{children}</View>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={[styles.container, rtlLayoutStyle, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, rtlLayoutStyle, { backgroundColor: theme.colors.background }, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padded: { paddingHorizontal: 16, paddingTop: 12 },
});
