import React, { useState } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { FAB, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing } from '@/core/theme/tokens';

export interface SpeedDialAction {
  icon: string;
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

interface Props {
  actions: SpeedDialAction[];
  icon?: string;
  openIcon?: string;
  bottomOffset?: number;
  openAccessibilityLabel?: string;
  closeAccessibilityLabel?: string;
}

export function SpeedDialFAB({
  actions,
  icon = 'plus',
  openIcon = 'close',
  bottomOffset = 16,
  openAccessibilityLabel = 'باز کردن منوی اقدامات',
  closeAccessibilityLabel = 'بستن منوی اقدامات',
}: Props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = insets.bottom + bottomOffset;

  const runAction = (action: SpeedDialAction) => {
    setOpen(false);
    action.onPress();
  };

  return (
    <View style={[styles.group, { bottom }]} pointerEvents="box-none">
      {open ? (
        <Pressable
          style={backdropStyle}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="بستن منوی اقدامات"
        />
      ) : null}

      {open
        ? actions
            .slice()
            .reverse()
            .map((action) => (
              <View key={action.label} style={styles.actionRow}>
                <Pressable
                  onPress={() => runAction(action)}
                  accessibilityRole="button"
                  accessibilityLabel={action.accessibilityLabel ?? action.label}
                  style={({ pressed }) => [
                    styles.actionLabel,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.outlineVariant,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text variant="labelLarge" style={{ fontWeight: '600' }}>
                    {action.label}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => runAction(action)}
                  accessibilityRole="button"
                  accessibilityLabel={action.accessibilityLabel ?? action.label}
                  style={({ pressed }) => [
                    styles.actionIcon,
                    { backgroundColor: theme.colors.primary, opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={action.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={22}
                    color={theme.colors.onPrimary}
                  />
                </Pressable>
              </View>
            ))
        : null}

      <FAB
        icon={open ? openIcon : icon}
        onPress={() => setOpen((v) => !v)}
        accessibilityLabel={open ? closeAccessibilityLabel : openAccessibilityLabel}
        style={styles.mainFab}
      />
    </View>
  );
}

const { width: screenW, height: screenH } = Dimensions.get('window');

const backdropStyle: ViewStyle = Platform.select({
  web: {
    position: 'fixed' as ViewStyle['position'],
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    zIndex: -1,
  },
  default: {
    position: 'absolute',
    top: -screenH,
    left: -screenW,
    width: screenW * 3,
    height: screenH * 3,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    zIndex: -1,
  },
})!;

const styles = StyleSheet.create({
  group: {
    position: 'absolute',
    left: spacing.lg,
    alignItems: 'flex-start',
    zIndex: 50,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 40,
    justifyContent: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainFab: {
    marginLeft: spacing.lg,
  },
});
