import React from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './src/store';
import { RootNavigator } from './src/navigation';
import { theme } from './src/theme';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('App render failed', error);
  }

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: theme.bg,
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
            App failed to render
          </Text>
          <Text style={{ color: theme.textDim, lineHeight: 22 }}>
            {this.state.error.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppErrorBoundary>
          <StoreProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </StoreProvider>
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
