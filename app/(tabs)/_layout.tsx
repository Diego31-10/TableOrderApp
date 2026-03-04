import { Stack } from 'expo-router';
import { Brand } from '@/constants/Colors';

// La barra de tabs ha sido eliminada.
// La navegación ahora parte desde la pantalla de inicio (home.tsx).
export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Brand.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="menu" />
    </Stack>
  );
}