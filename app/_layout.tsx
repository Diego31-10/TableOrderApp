import 'react-native-reanimated';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import Mapbox from '@rnmapbox/maps';

import { useColorScheme } from '@/components/useColorScheme';
import { preloadBeep } from '@/src/lib/core/sound/SoundService';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { useOrderHistoryStore } from '@/src/stores/useOrderHistoryStore';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_KEY ?? '';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    if (fontsError) throw fontsError;
  }, [fontsError]);

  useEffect(() => {
    initialize();
    preloadBeep();
  }, []);

  // Mantiene el splash hasta que fuentes Y sesión estén listos — sin flash
  useEffect(() => {
    if (fontsLoaded && initialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialized]);

  if (!fontsLoaded || !initialized) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const fetchOrders = useOrderHistoryStore((s) => s.fetchOrders);
  const clearHistory = useOrderHistoryStore((s) => s.clearHistory);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const seg = segments[0] as string;
    const inAuthGroup = seg === 'auth' || seg === 'register';

    if (session && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      router.replace('/auth');
    }
  }, [session, segments]);

  // ── Sincroniza historial con Supabase según sesión ────────────────────────
  useEffect(() => {
    if (session) {
      fetchOrders();
    } else {
      clearHistory();
    }
  }, [session]);

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index"      options={{ headerShown: false }} />
          <Stack.Screen name="auth"       options={{ headerShown: false }} />
          <Stack.Screen name="register"   options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
          <Stack.Screen name="(checkout)" options={{ headerShown: false }} />
          <Stack.Screen name="(delivery)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </StripeProvider>
  );
}
