import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KPICard } from './KPICard';

interface Props {
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
}

/** @deprecated Use KPICard — thin wrapper for backward compatibility */
export function StatCard({ title, value, icon, color }: Props) {
  return (
    <KPICard
      title={title}
      value={value}
      icon={icon}
      accentColor={color}
      variant="compact"
    />
  );
}
