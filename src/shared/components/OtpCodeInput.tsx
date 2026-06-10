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
import { FONT_FAMILY } from '@/core/theme/fonts';
import { radius, spacing } from '@/core/theme/tokens';
import { normalizeOtpCode } from '@/services/auth/OtpService';

interface Props {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: boolean;
  onComplete?: (code: string) => void;
}

const CELL_SIZE = 52;

export function OtpCodeInput({ value, onChange, length = 6, error, onComplete }: Props) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const prevLength = useRef(0);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusAt = (index: number) => {
    inputs.current[index]?.focus();
  };

  useEffect(() => {
    const t = setTimeout(() => focusAt(0), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (value.length === length && prevLength.current < length && onComplete) {
      onComplete(value);
    }
    prevLength.current = value.length;
  }, [value, length, onComplete]);

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

  const activeIndex = value.length < length ? value.length : length - 1;

  return (
    <View style={styles.wrap} accessibilityLabel="ورود کد تأیید شش رقمی">
      <Pressable
        style={styles.row}
        onPress={() => focusAt(Math.min(value.length, length - 1))}
        accessibilityRole="none"
      >
        {digits.map((digit, index) => {
          const isActive = index === activeIndex;
          const isFilled = !!digit;

          return (
            <Pressable
              key={index}
              onPress={() => focusAt(index)}
              style={[
                styles.cell,
                isFilled && styles.cellFilled,
                isActive && styles.cellActive,
                error && styles.cellError,
              ]}
              accessibilityRole="none"
            >
              <TextInput
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                onFocus={() => focusAt(index)}
                keyboardType="number-pad"
                maxLength={length}
                selectTextOnFocus
                caretHidden
                style={styles.input}
                textAlign="center"
                textContentType="oneTimeCode"
                autoComplete={Platform.OS === 'web' ? 'one-time-code' : 'sms-otp'}
                accessibilityLabel={`رقم ${index + 1} از ${length}`}
                accessibilityState={{ selected: isActive }}
                {...Platform.select({
                  web: { inputMode: 'numeric' as const },
                  default: {},
                })}
              />
              {!digit && !isActive ? <View style={styles.placeholderDot} pointerEvents="none" /> : null}
              {isActive && !digit ? <View style={styles.caret} pointerEvents="none" /> : null}
            </Pressable>
          );
        })}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm + 2,
    direction: 'ltr',
    maxWidth: 360,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE + 4,
    borderRadius: radius.md + 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s, transform 0.15s',
      },
      default: {},
    }),
  },
  cellFilled: {
    borderColor: 'rgba(37, 99, 235, 0.65)',
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
  },
  cellActive: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.22)',
        transform: 'scale(1.05)',
      },
      ios: {
        shadowColor: '#2563EB',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cellError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(254, 226, 226, 0.45)',
    ...Platform.select({
      web: { boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.18)' },
      default: {},
    }),
  },
  input: {
    ...StyleSheet.absoluteFill,
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    textAlign: 'center',
    ...Platform.select({
      web: { lineHeight: CELL_SIZE + 4 },
      android: {
        textAlignVertical: 'center',
        includeFontPadding: false,
      },
      default: { paddingTop: 2 },
    }),
  },
  placeholderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    position: 'absolute',
  },
  caret: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: '#2563EB',
    position: 'absolute',
    opacity: 0.85,
  },
});
