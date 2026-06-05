import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export function createStackScreenOptions(theme: {
  colors: { surface: string; onSurface: string };
}): NativeStackNavigationOptions {
  return {
    headerStyle: { backgroundColor: theme.colors.surface },
    headerTintColor: theme.colors.onSurface,
    headerTitleStyle: { fontFamily: 'IRANYekanX', fontSize: 16, fontWeight: '700' },
    headerTitleAlign: 'center',
    headerShadowVisible: false,
    animation: 'slide_from_left',
    contentStyle: { backgroundColor: theme.colors.surface },
  };
}
