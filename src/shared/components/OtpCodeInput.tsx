import React, { useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { normalizeOtpCode } from '@/services/auth/OtpService';

interface Props {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: boolean;
}

export function OtpCodeInput({ value, onChange, length = 6, error }: Props) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusAt = (index: number) => {
    inputs.current[index]?.focus();
  };

  useEffect(() => {
    focusAt(0);
  }, []);

  const updateCode = (nextDigits: string[]) => {
    onChange(nextDigits.join('').replace(/\s/g, ''));
  };

  const handleChange = (text: string, index: number) => {
    const normalized = normalizeOtpCode(text);

    if (normalized.length > 1) {
      const pasted = normalized.slice(0, length).split('');
      const nextDigits = Array.from({ length }, (_, i) => pasted[i] ?? '');
      updateCode(nextDigits);
      focusAt(Math.min(pasted.length, length - 1));
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = normalized;
    updateCode(nextDigits);

    if (normalized && index < length - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key !== 'Backspace') return;

    if (digits[index]) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      updateCode(nextDigits);
      return;
    }

    if (index > 0) {
      const nextDigits = [...digits];
      nextDigits[index - 1] = '';
      updateCode(nextDigits);
      focusAt(index - 1);
    }
  };

  return (
    <Pressable style={styles.row} onPress={() => focusAt(Math.min(value.length, length - 1))}>
      {digits.map((digit, index) => {
        const activeIndex = value.length < length ? value.length : length - 1;
        const isActive = index === activeIndex;
        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            maxLength={length}
            selectTextOnFocus
            style={[
              styles.box,
              digit ? styles.boxFilled : null,
              isActive ? styles.boxActive : null,
              error ? styles.boxError : null,
            ]}
            textAlign="center"
            {...Platform.select({
              web: { inputMode: 'numeric' as const },
              default: {},
            })}
          />
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        transition: 'border-color 0.2s, background-color 0.2s, transform 0.15s',
      },
      default: {},
    }),
  },
  boxFilled: {
    borderColor: 'rgba(30, 58, 138, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  boxActive: {
    borderColor: '#1e3a8a',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    ...Platform.select({
      web: { transform: 'scale(1.04)' },
      default: {},
    }),
  },
  boxError: {
    borderColor: '#ef4444',
  },
});
