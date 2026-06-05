import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB as PaperFAB } from 'react-native-paper';

interface Props {
  onPress: () => void;
  icon?: string;
}

export function FAB({ onPress, icon = 'plus' }: Props) {
  return (
    <PaperFAB
      icon={icon}
      onPress={onPress}
      style={styles.fab}
      size="medium"
    />
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', left: 16, bottom: 16 },
});
