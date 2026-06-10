import { Platform, useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const isWide = Platform.OS === 'web' && width >= 1100;
  const isCompact = width <= 360;
  const isNarrow = width < 400;
  const contentMaxWidth = isWide ? 1000 : isDesktop ? 760 : undefined;

  return { width, height, isDesktop, isWide, isCompact, isNarrow, contentMaxWidth };
}
