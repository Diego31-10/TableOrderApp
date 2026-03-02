import { Stack } from 'expo-router';
import { Brand } from '@/constants/Colors';

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Brand.background },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="payment" />
    </Stack>
  );
}
