import React from 'react';
import { Searchbar } from 'react-native-paper';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'جستجو...' }: Props) {
  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={{ marginBottom: 12, elevation: 0 }}
      inputStyle={{ textAlign: 'right' }}
    />
  );
}
