import React, { memo } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { radius, spacing } from '@/core/theme/tokens';
import { AppText } from './AppText';

export interface SettingsMenuItem {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  badge?: string;
  proOnly?: boolean;
  locked?: boolean;
}

interface Section {
  title: string;
  items: SettingsMenuItem[];
}

interface Props {
  sections: Section[];
  style?: ViewStyle;
}

function SettingsMenuGridComponent({ sections, style }: Props) {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrap, style]}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <AppText variant="overline" color="muted" style={styles.sectionTitle}>
            {section.title}
          </AppText>
          <View style={styles.grid}>
            {section.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={item.badge ? `${item.title}، ${item.badge}` : item.title}
                style={({ pressed }) => [
                  styles.tile,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outlineVariant,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary + '12' }]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={item.locked ? theme.colors.onSurfaceVariant : theme.colors.primary}
                  />
                </View>
                <AppText variant="bodyMedium" style={styles.tileTitle} numberOfLines={2}>
                  {item.title}
                </AppText>
                {item.badge ? (
                  <View style={[styles.badge, { backgroundColor: theme.colors.primary + '18' }]}>
                    <AppText variant="overline" style={{ color: theme.colors.primary }}>
                      {item.badge}
                    </AppText>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export const SettingsMenuGrid = memo(SettingsMenuGridComponent);

const styles = StyleSheet.create({
  wrap: { gap: spacing.xl },
  section: { gap: spacing.md },
  sectionTitle: { textAlign: 'right' },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
    minWidth: 140,
    maxWidth: '48%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 108,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  tileTitle: {
    fontWeight: '600',
    textAlign: 'right',
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
});
