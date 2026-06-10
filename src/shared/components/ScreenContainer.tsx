import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { rtlLayoutStyle } from '@/core/theme/rtlLayout';
import { spacing } from '@/core/theme/tokens';

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padded?: boolean;
  header?: React.ReactNode;
  stickyFooter?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function ScreenContainer({
  children,
  scrollable = true,
  style,
  contentStyle,
  padded = true,
  header,
  stickyFooter,
  refreshing = false,
  onRefresh,
}: Props) {
  const theme = useTheme();

  const inner = (
    <View style={[padded && styles.padded, rtlLayoutStyle, contentStyle]}>
      {header}
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        <ScrollView
          style={[styles.flex, rtlLayoutStyle]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            ) : undefined
          }
        >
          {inner}
        </ScrollView>
        {stickyFooter ? (
          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.colors.background,
                borderTopColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {stickyFooter}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        rtlLayoutStyle,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      <View style={[styles.flex, padded && styles.padded, contentStyle]}>
        {header}
        {children}
      </View>
      {stickyFooter ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.outlineVariant,
            },
          ]}
        >
          {stickyFooter}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  scrollContent: { paddingBottom: spacing.xl },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
