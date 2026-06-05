import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from '@/core/theme/fonts';

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
    borderRadius: 10,
  },
});
