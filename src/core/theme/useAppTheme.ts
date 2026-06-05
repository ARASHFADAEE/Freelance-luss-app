import { useTheme } from 'react-native-paper';
import type { AppTheme } from './index';

export function useAppTheme(): AppTheme {
  return useTheme() as AppTheme;
}
