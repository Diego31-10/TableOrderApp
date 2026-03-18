import { Redirect } from 'expo-router';

// Redirección inicial. El auth guard en _layout.tsx se encarga de
// mandarlo a /(tabs) si ya hay sesión activa.
export default function Index() {
  return <Redirect href="/auth" />;
}