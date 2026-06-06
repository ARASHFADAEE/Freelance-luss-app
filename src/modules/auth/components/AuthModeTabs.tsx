import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export type AuthMode = 'login' | 'register';

interface Props {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

export function AuthModeTabs({ mode, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.tab, mode === 'login' && styles.tabActive]}
        onPress={() => onChange('login')}
      >
        <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>ورود</Text>
      </Pressable>
      <Pressable
        style={[styles.tab, mode === 'register' && styles.tabActive]}
        onPress={() => onChange('register')}
      >
        <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>ثبت‌نام</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  tabText: {
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#1e3a8a',
  },
});
