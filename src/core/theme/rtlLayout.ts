import { Platform, ViewStyle } from 'react-native';

/** RN Web از `direction` در StyleSheet پشتیبانی نمی‌کند — RTL از document.dir و flex row-reverse */
export const rtlLayoutStyle: ViewStyle =
  Platform.OS === 'web' ? {} : ({ direction: 'rtl' } as ViewStyle);

export const rtlTextStyle = { writingDirection: 'rtl' as const, textAlign: 'right' as const };
