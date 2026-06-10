import React from 'react';
import { I18nManager } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
export function createStackScreenOptions(theme: {
  colors: { surface: string; background: string; onSurface: string };
}): (props: { navigation: { canGoBack: () => boolean; goBack: () => void } }) => NativeStackNavigationOptions {
  return ({ navigation }) => {
    const backButton = navigation.canGoBack()
      ? React.createElement(HeaderBackButton, {
          onPress: () => navigation.goBack(),
          tintColor: theme.colors.onSurface,
          displayMode: 'minimal',
        })
      : null;

    return {
      headerStyle: { backgroundColor: theme.colors.surface },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: { fontFamily: 'IRANYekanX', fontSize: 16, fontWeight: '700' },
      headerTitleAlign: 'center',
      headerShadowVisible: false,
      animation: 'slide_from_left',
      contentStyle: { backgroundColor: theme.colors.background },
      headerBackVisible: false,
      headerLeft: () => (I18nManager.isRTL ? null : backButton),
      headerRight: () => (I18nManager.isRTL ? backButton : null),
    };
  };
}
