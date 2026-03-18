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
      <Stack.Screen name="index" />
      <Stack.Screen
        name="scanner"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="map"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="menu"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="history"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}