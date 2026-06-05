import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { invoiceRepository, projectRepository } from '@/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
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

export async function setupAllReminders(): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await scheduleInvoiceReminders();
  await scheduleProjectReminders();
}
