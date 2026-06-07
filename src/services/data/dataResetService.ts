import { clearBusinessData } from '@/database/connection';
import { IS_API_CONFIGURED } from '@/core/config/env';
import { refetchAnalyticsQueries } from '@/core/query/analyticsQueries';
import { apiRequest } from '@/services/api/ApiClient';
import { useStorageModeStore } from '@/stores/storageModeStore';
import type { QueryClient } from '@tanstack/react-query';

async function resetBusinessDataOnServer(): Promise<void> {
  if (!IS_API_CONFIGURED) return;

  const { mode, isConfirmed } = useStorageModeStore.getState();
  if (!isConfirmed || mode !== 'cloud') return;

  try {
    await apiRequest<void>('DELETE', '/api/sync/data');
  } catch {
    /* بک‌اند ممکن است هنوز پیاده نشده باشد — ریست محلی ادامه می‌یابد */
  }
}

export async function resetAllBusinessData(queryClient: QueryClient): Promise<void> {
  await resetBusinessDataOnServer();
  await clearBusinessData();
  await queryClient.invalidateQueries();
  await refetchAnalyticsQueries(queryClient);
}
