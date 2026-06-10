import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from '@/core/theme/fonts';
import { radius } from '@/core/theme/tokens';

export const inputStyles = StyleSheet.create({
  base: {
    backgroundColor: 'transparent',
    textAlign: 'right',
  },
  content: {
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: FONT_FAMILY,
  },
  outline: {
    borderRadius: radius.md,
  },
});
