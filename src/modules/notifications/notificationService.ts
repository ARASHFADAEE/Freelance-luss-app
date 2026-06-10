import { Platform } from 'react-native';
import { invoiceRepository, projectRepository } from '@/database';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;
let handlerConfigured = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web') return null;

  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
  }

  if (!handlerConfigured && notificationsModule) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }

  return notificationsModule;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'یادآوری‌ها',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleInvoiceReminders(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const invoices = await invoiceRepository.getAll();
  const now = new Date();

  for (const invoice of invoices) {
    if (!['sent', 'overdue'].includes(invoice.status)) continue;

    const dueDate = new Date(invoice.dueDate);
    if (dueDate <= now) continue;

    const triggerDate = new Date(dueDate);
    triggerDate.setDate(triggerDate.getDate() - 1);

    if (triggerDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'یادآوری سررسید فاکتور',
          body: `فاکتور ${invoice.invoiceNumber} فردا سررسید می‌شود`,
          data: { invoiceId: invoice.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
  }
}

export async function scheduleProjectReminders(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const projects = await projectRepository.getActive();
  const now = new Date();

  for (const project of projects) {
    if (project.remainingAmount <= 0) continue;

    const dueDate = new Date(project.dueDate);
    if (dueDate <= now) continue;

    const triggerDate = new Date(dueDate);
    triggerDate.setDate(triggerDate.getDate() - 3);

    if (triggerDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'یادآوری قسط پروژه',
          body: `پروژه «${project.title}» نزدیک به سررسید است`,
          data: { projectId: project.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
  }
}

export async function setupAllReminders(): Promise<{ ok: boolean; message: string }> {
  if (Platform.OS === 'web') {
    return { ok: false, message: 'یادآوری زمان‌بندی‌شده فقط روی موبایل پشتیبانی می‌شود' };
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    return { ok: false, message: 'مجوز اعلان داده نشده' };
  }

  await scheduleInvoiceReminders();
  await scheduleProjectReminders();
  return { ok: true, message: 'یادآوری‌ها تنظیم شدند' };
}

export async function sendTestNotification(): Promise<{ ok: boolean; message: string }> {
  if (Platform.OS === 'web') {
    if (typeof globalThis.Notification !== 'undefined') {
      const perm = globalThis.Notification.permission === 'granted'
        ? 'granted'
        : await globalThis.Notification.requestPermission();
      if (perm === 'granted') {
        new globalThis.Notification('تست یادآوری — فریلنس پلاس', {
          body: 'اگر این پیام را می‌بینید، اعلان مرورگر فعال است ✓',
          icon: '/favicon.ico',
        });
        return { ok: true, message: 'اعلان تست مرورگر ارسال شد' };
      }
      return { ok: false, message: 'مجوز اعلان مرورگر داده نشده' };
    }
    return { ok: false, message: 'اعلان در این مرورگر پشتیبانی نمی‌شود' };
  }

  const Notifications = await getNotifications();
  if (!Notifications) {
    return { ok: false, message: 'ماژول اعلان در دسترس نیست' };
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    return { ok: false, message: 'مجوز اعلان داده نشده — از تنظیمات گوشی فعال کنید' };
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'تست یادآوری — فریلنس پلاس',
      body: 'اگر این پیام را می‌بینید، نوتیفیکیشن فعال است ✓',
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
  });

  return { ok: true, message: 'اعلان تست تا ۲ ثانیه دیگر نمایش داده می‌شود' };
}
