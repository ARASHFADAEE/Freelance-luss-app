import { useStorageModeStore } from '@/stores/storageModeStore';

export function useStorageMode() {
  const mode = useStorageModeStore((s) => s.mode);
  const isConfirmed = useStorageModeStore((s) => s.isConfirmed);
  const isLoaded = useStorageModeStore((s) => s.isLoaded);
  const isCloud = useStorageModeStore((s) => s.isCloud);
  const needsSetup = useStorageModeStore((s) => s.needsSetup);
  const load = useStorageModeStore((s) => s.load);

  return {
    mode,
    isConfirmed,
    isLoaded,
    isCloud: isCloud(),
    isLocal: mode === 'local',
    needsSetup: needsSetup(),
    load,
  };
}
