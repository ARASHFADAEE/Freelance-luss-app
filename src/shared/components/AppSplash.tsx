import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { APP_NAME } from '@/core/constants';

interface Props {
  message?: string;
}

export function AppSplash({ message = 'در حال آماده‌سازی...' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <MaterialCommunityIcons name="briefcase-account" size={48} color="#fff" />
      </View>
      <Text variant="headlineSmall" style={styles.title}>{APP_NAME}</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>مدیریت مالی فریلنسرها</Text>
      <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 32 }} />
      <Text variant="bodySmall" style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 32,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontWeight: '800', color: '#1e3a8a', marginBottom: 6 },
  subtitle: { color: '#6b7280' },
  message: { color: '#9ca3af', marginTop: 16 },
});
