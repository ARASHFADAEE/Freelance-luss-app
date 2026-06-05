import type { AuthUser } from '@/services/api/types';
import { profileRepository } from '@/database';
import { useProfileStore } from '@/stores/profileStore';

export async function syncAuthUserToProfile(user: AuthUser): Promise<void> {
  const existing = await profileRepository.get();
  await profileRepository.update({
    phone: user.phone,
    fullName: user.fullName?.trim() ? user.fullName : existing.fullName,
  });
  await useProfileStore.getState().load();
}
