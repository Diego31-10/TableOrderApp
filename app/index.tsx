import { Redirect } from 'expo-router';

// Redirige siempre a la pantalla de auth al abrir la app.
// Expo Router usa este archivo como punto de entrada de la ruta "/".
export default function Index() {
  return <Redirect href="/auth" />;
}