import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useAuthStore } from '@/lib/state/auth-store';
import { seedSampleData, clearAllData } from '@/lib/seed-data';
import { useEffect, useState } from 'react';

export const unstable_settings = {
  initialRouteName: 'login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Set to true to reset all data and re-seed on next app launch
const FORCE_RESEED = false;

// Workly brand theme with charcoal/slate colors
const WorklyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#1A1D23',
    card: '#252932',
    border: '#3A404D',
    primary: '#6B8AFE',
  },
};

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Seed sample data on app start
    const initData = async () => {
      if (FORCE_RESEED) {
        await clearAllData();
      }
      await seedSampleData();
      setIsReady(true);
    };
    initData();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(tabs)';

    // List of screens accessible when authenticated
    const allowedAuthScreens = ['complete-profile', 'create-post', 'conversation', 'profile', 'write-review', 'edit-portfolio', 'rate-client', 'edit-banner', 'create-job-request', 'paywall'];

    if (!isAuthenticated && inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup && !allowedAuthScreens.includes(segments[0] as string)) {
      router.replace('/(tabs)');
    }

    SplashScreen.hideAsync();
  }, [isAuthenticated, segments, isReady]);

  return (
    <ThemeProvider value={WorklyTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="complete-profile" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create-post" options={{ presentation: 'modal' }} />
        <Stack.Screen name="conversation/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="write-review/[professionalId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-portfolio" options={{ presentation: 'modal' }} />
        <Stack.Screen name="rate-client/[clientId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-banner" options={{ presentation: 'modal' }} />
        <Stack.Screen name="create-job-request" options={{ presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}