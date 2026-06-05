import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { AuthStackParamList } from '@/navigation/types';
import { createStackScreenOptions } from '@/navigation/stacks/createStackScreenOptions';
import { LoginScreen } from '@/modules/auth/LoginScreen';
import { OtpScreen } from '@/modules/auth/OtpScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const theme = useTheme();
  const options = createStackScreenOptions(theme);

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'ورود' }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ title: 'تأیید OTP' }} />
    </Stack.Navigator>
  );
}
