import { Stack } from 'expo-router';

export default function DeliveryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="delivery-catalog"
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="track-order"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
