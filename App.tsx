import { QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LanguageProvider } from './src/components/Text';
import { RootNavigator } from './src/navigation/RootNavigator';
import { queryClient } from './src/services/queryClient';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* The chosen language reaches every Text and TextInput from here. */}
        <LanguageProvider>
          <RootNavigator />
        </LanguageProvider>
        {/* Vercel Web Analytics — web only; the component touches the DOM. */}
        {Platform.OS === 'web' ? <Analytics /> : null}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
