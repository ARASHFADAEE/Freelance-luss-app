import { Alert, Platform } from 'react-native';

function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void | Promise<void>,
): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      void Promise.resolve(onConfirm());
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'انصراف', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: () => void Promise.resolve(onConfirm()) },
  ]);
}

export function confirmLogout(onConfirm: () => void | Promise<void>): void {
  confirmAction('خروج از حساب', 'آیا مطمئن هستید؟', 'خروج', onConfirm);
}

export function confirmResetData(onConfirm: () => void | Promise<void>): void {
  confirmAction(
    'پاک‌سازی همه داده‌ها',
    'همه مشتریان، پروژه‌ها، فاکتورها، پرداخت‌ها، هزینه‌ها و خدمات حذف می‌شوند.\nپروفایل، اشتراک و تنظیمات اپ حفظ می‌شوند.\nاین عمل قابل بازگشت نیست.',
    'پاک‌سازی',
    onConfirm,
  );
}
