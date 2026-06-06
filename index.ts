import { Platform } from 'react-native';
import { registerRootComponent } from 'expo';

import App from './App';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.setAttribute('dir', 'rtl');
  document.documentElement.setAttribute('lang', 'fa');
}

registerRootComponent(App);
