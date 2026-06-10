import { useTheme } from 'react-native-paper';
import { lightTheme, type AppTheme } from './index';

function isAppTheme(theme: unknown): theme is AppTheme {
  return (
    typeof theme === 'object' &&
    theme !== null &&
    'custom' in theme &&
    (theme as AppTheme).custom != null &&
    'tokens' in theme
  );
}

export function useAppTheme(): AppTheme {
  const theme = useTheme();
  return isAppTheme(theme) ? theme : lightTheme;
}
