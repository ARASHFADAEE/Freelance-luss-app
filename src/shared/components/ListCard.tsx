import React, { memo } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

interface Props {
  title: string;
  subtitle?: string | null;
  onPress?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  showChevron?: boolean;
  muted?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

function ListCardComponent({
  title,
  subtitle,
  onPress,
  left,
  right,
  badge,
  footer,
  showChevron = true,
  muted = false,
  borderColor,
  backgroundColor,
  style,
  accessibilityLabel,
}: Props) {
  const theme = useAppTheme();

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: backgroundColor ?? theme.colors.surface,
          borderColor: borderColor ?? theme.colors.outlineVariant,
          opacity: muted ? 0.78 : 1,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {showChevron && onPress ? (
          <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.onSurfaceVariant} />
        ) : null}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            {badge}
            <AppText variant="bodyMedium" style={styles.titleText} numberOfLines={1}>
              {title}
            </AppText>
          </View>
          {subtitle ? (
            <AppText variant="caption" color="muted" numberOfLines={2}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right ?? left}
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    alignItems: 'flex-end',
    gap: spacing.xs / 2,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  titleText: {
    fontWeight: '600',
    flexShrink: 1,
  },
  footer: {
    marginTop: spacing.sm,
  },
});

export const ListCard = memo(ListCardComponent);
