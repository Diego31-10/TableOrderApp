import { Stack } from 'expo-router';
import { Brand } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Brand.background },
      }}
    >
      {/* Home — mode selection */}
      <Stack.Screen name="index" />

      {/* QR scanner — "En el local" flow */}
      <Stack.Screen
        name="scanner"
        options={{ animation: 'slide_from_right' }}
      />

      {/* Map + ContextSwitcher — "Delivery" flow */}
      <Stack.Screen
        name="map"
        options={{ animation: 'slide_from_right' }}
      />

      {/* Menu — shown after a valid QR scan */}
      <Stack.Screen
        name="menu"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}