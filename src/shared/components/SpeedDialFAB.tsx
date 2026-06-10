import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/core/theme/tokens';

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
  const insets = useSafeAreaInsets();

  return (
    <FAB.Group
      open={open}
      visible
      icon={open ? openIcon : icon}
      actions={actions.map((action) => ({
        icon: action.icon,
        label: action.label,
        onPress: () => {
          setOpen(false);
          action.onPress();
        },
        accessibilityLabel: action.accessibilityLabel ?? action.label,
        style: styles.action,
      }))}
      onStateChange={({ open: isOpen }) => setOpen(isOpen)}
      accessibilityLabel={open ? closeAccessibilityLabel : openAccessibilityLabel}
      fabStyle={[styles.fab, { marginBottom: insets.bottom + bottomOffset }]}
      style={styles.group}
    />
  );
}

const styles = StyleSheet.create({
  group: {
    position: 'absolute',
    left: spacing.lg,
    bottom: 0,
  },
  fab: {
    marginLeft: spacing.lg,
  },
  action: {
    marginBottom: spacing.xs,
  },
});
