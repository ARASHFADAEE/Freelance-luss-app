import { Alert, Platform } from 'react-native';

export function confirmLogout(onConfirm: () => void | Promise<void>): void {
  const title = 'خروج از حساب';
  const message = 'آیا مطمئن هستید؟';

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n${message}`)) {
      void Promise.resolve(onConfirm());
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'انصراف', style: 'cancel' },
    { text: 'خروج', style: 'destructive', onPress: () => void Promise.resolve(onConfirm()) },
  ]);
}
